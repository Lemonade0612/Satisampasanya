# Local translation and text screening

Translation uses `facebook/nllb-200-distilled-600M` with `eng_Latn` / `lao_Laoo`.
Text screening uses `cross-encoder/nli-deberta-v3-small`, independently of the
translation model; the original keyword policy remains active as well.
Images are attached and displayed but image contents are not analysed.

Open Prepare AI.command once, then Start AI.command. The backend uses NLLB_URL
from private configuration. Model files are cached in `translation/cache/` and
excluded from Git and Docker build context. Prepared models load from the cache
without network requests. Short token chunks prevent silent
truncation of long posts. Supplied bilingual text is preserved. Translation
failures retain the original post; screening failures fall back to labelled
keyword checks. Flagged posts stay available for human review.

NLLB's model card lists CC-BY-NC-4.0 and research use, not commercial production.
See https://huggingface.co/facebook/nllb-200-distilled-600M . This local/demo
integration does not establish commercial usage rights or certify translations.

Docker Compose runs the same service on its internal network with a persistent
model volume. The first request downloads model weights and may take longer;
prepare/cache the models before a demo or live rollout.
