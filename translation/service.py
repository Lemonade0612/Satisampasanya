"""Local NLLB translation and independent text-risk classification."""
import os
import sys
import faulthandler
import signal
import threading
from pathlib import Path
os.environ.setdefault('HF_HOME', str(Path(__file__).parent / 'cache'))
os.environ.setdefault('HF_HUB_DISABLE_TELEMETRY', '1')
os.environ.setdefault('HF_HUB_DISABLE_XET', '1')
os.environ.setdefault('USE_TF', '0')
os.environ.setdefault('USE_FLAX', '0')
os.environ.setdefault('USE_TORCH', '1')
os.environ.setdefault('OMP_NUM_THREADS', '2')
os.environ.setdefault('MKL_NUM_THREADS', '2')
os.environ.setdefault('OPENBLAS_NUM_THREADS', '2')
os.environ.setdefault('TOKENIZERS_PARALLELISM', 'false')
if hasattr(signal, 'SIGUSR1'):
    faulthandler.register(signal.SIGUSR1, all_threads=True)
import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, AutoModelForSequenceClassification

torch.set_num_threads(2)

app = FastAPI(title='Sati local AI')
lock = threading.Lock()
translator = None
screening = None
CODES = {'en': 'eng_Latn', 'lo': 'lao_Laoo'}

class Translation(BaseModel):
    text: str = Field(min_length=1, max_length=2000)
    source: str
    target: str

class Screening(BaseModel):
    text: str = Field(min_length=1, max_length=4000)


def cached(name, filename):
    snapshots = Path(os.environ['HF_HOME']) / 'hub' / ('models--' + name.replace('/', '--')) / 'snapshots'
    return any(p.exists() for p in snapshots.glob('*/' + filename))


def translation_models():
    global translator
    if translator is None:
        name = os.getenv('NLLB_MODEL', 'facebook/nllb-200-distilled-600M')
        print('Loading NLLB translation model…', flush=True)
        offline = cached(name, 'pytorch_model.bin')
        translator = (AutoTokenizer.from_pretrained(name, local_files_only=offline), AutoModelForSeq2SeqLM.from_pretrained(name, local_files_only=offline, use_safetensors=False, torch_dtype=torch.float16).eval())
        print('NLLB translation model ready.', flush=True)
    return translator


def screening_models():
    global screening
    if screening is None:
        name = os.getenv('SCREENING_MODEL', 'cross-encoder/nli-deberta-v3-small')
        print('Loading text screening model…', flush=True)
        offline = cached(name, 'model.safetensors')
        screening = (AutoTokenizer.from_pretrained(name, local_files_only=offline), AutoModelForSequenceClassification.from_pretrained(name, local_files_only=offline).eval())
        print('Text screening model ready.', flush=True)
    return screening


@app.get('/health')
def health():
    return {'ok': True, 'translationReady': translator is not None, 'screeningReady': screening is not None}


@app.post('/translate')
def translate(data: Translation):
    if data.source not in CODES or data.target not in CODES or data.source == data.target:
        raise HTTPException(400, 'Choose English to Lao or Lao to English.')
    with lock:
        torch.set_num_threads(2)
        tokenizer, model = translation_models()
        tokenizer.src_lang = CODES[data.source]
        ids = tokenizer(data.text, add_special_tokens=False).input_ids
        chunks = [ids[i:i + 384] for i in range(0, len(ids), 384)]
        output = []
        for chunk in chunks:
            value = tokenizer(tokenizer.decode(chunk, skip_special_tokens=True), return_tensors='pt')
            with torch.inference_mode():
                result = model.generate(**value, forced_bos_token_id=tokenizer.convert_tokens_to_ids(CODES[data.target]), max_new_tokens=512)
            output.append(tokenizer.batch_decode(result, skip_special_tokens=True)[0])
        text = ' '.join(output).strip()
        if not text or len(text) > 2000:
            raise HTTPException(422, 'Translation is empty or exceeds the post length limit.')
        return {'text': text, 'model': 'NLLB-200'}


@app.post('/screen')
def screen(data: Screening):
    labels = ['a warning or educational report about online safety', 'a scam promotion asking for money or credentials', 'targeted harassment or hate', 'instructions facilitating exploitation or trafficking', 'community safety advice or public interest news', 'an unrelated personal hobby update or entertainment promotion']
    with lock:
        torch.set_num_threads(2)
        tokenizer, model = screening_models()
        hypotheses = ['The reader is warned to protect passwords, money or personal information.', 'The reader is asked to send money or reveal a password to claim a prize.', 'Someone is insulted or threatened.', 'Someone is recruited for exploitation or trafficking.', 'The writer discusses public services, scam prevention or personal safety.', 'The writer promotes food, fashion, travel or entertainment.']
        inputs = tokenizer([data.text] * len(labels), hypotheses, padding=True, truncation=True, max_length=512, return_tensors='pt')
        with torch.inference_mode():
            logits = model(**inputs).logits
            # This model's documented order: contradiction, entailment, neutral.
            scores = torch.softmax(logits[:, [0, 1]], dim=1)[:, 1].tolist()
        flags = [labels[i] for i in range(1, 4) if scores[i] >= .8 and scores[i] > scores[0] + .15]
        if scores[5] >= .8 and scores[5] > max(scores[0], scores[4]) + .15:
            flags.append('Off-topic content detected — not community safety or public-interest news')
        return {'severity': 'high' if flags else 'none', 'flags': flags, 'scores': dict(zip(labels, scores)), 'note': 'AI text screening and keyword checks; flagged content requires human review.', 'noteLo': 'ກວດຂໍ້ຄວາມດ້ວຍໂມເດວ AI. ເນື້ອຫາທີ່ຖືກໝາຍຕ້ອງໃຫ້ຄົນກວດຄືນ.'}


if __name__ == '__main__':
    import sys
    if '--download' in sys.argv:
        from huggingface_hub import snapshot_download
        for name in [os.getenv('NLLB_MODEL', 'facebook/nllb-200-distilled-600M'), os.getenv('SCREENING_MODEL', 'cross-encoder/nli-deberta-v3-small')]:
            print('Downloading ' + name, flush=True)
            snapshot_download(name, allow_patterns=['*.json', 'pytorch_model.bin' if 'nllb' in name else 'model.safetensors', 'tokenizer.model', 'sentencepiece.bpe.model', 'spm.model', '*.txt'])
        print('Translation and screening models are cached locally.', flush=True)
    else:
        import uvicorn
        uvicorn.run(app, host=os.getenv('AI_HOST', '127.0.0.1'), port=int(os.getenv('AI_PORT', '3002')))
