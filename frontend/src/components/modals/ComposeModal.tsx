import {CheckProgress,type CheckStage} from '../safety/CheckProgress';
import { request } from '../../lib/api';
import { useState } from 'react';
import { X, ImagePlus, Loader2, Sparkles, PenLine, Tag, Link2 } from 'lucide-react';
import { SectionTitle } from '../shared/SectionTitle';
import { TOPIC_LABELS, TOPIC_ORDER, TOPIC_SHORT_LO } from '../../lib/constants';
import { readPhoto } from '../../lib/images';
import type { Lang, PostDraft } from '../../types';

const MAX_TAGS = 3, MAX_LEN = 2000, WARN_LEN = 1800;
const isHttpUrl = (value: string) => { try { const u = new URL(value.trim()); return u.protocol === 'http:' || u.protocol === 'https:'; } catch { return false; } };

export function ComposeModal({lang,remaining,onClose,onPost}: {lang:Lang;userName?:string;remaining:number;onClose:()=>void;onPost:(post:PostDraft,onProgress?:(stage:CheckStage,done?:boolean)=>void)=>Promise<void>}) {
  const label=(en:string,lo:string)=>lang==='lo'?lo:en;
  const [english,setEnglish]=useState(''),[lao,setLao]=useState('');
  const [editLang,setEditLang]=useState<'lo'|'en'>(lang==='en'?'en':'lo');
  const [tags,setTags]=useState<string[]>([]),[source,setSource]=useState('');
  const [news,setNews]=useState(false),[photo,setPhoto]=useState<string>();
  const [busy,setBusy]=useState(false),[reading,setReading]=useState(false),[error,setError]=useState('');
  const [translating,setTranslating]=useState(false);
  const [stage,setStage]=useState<CheckStage|null>(null),[done,setDone]=useState(false);
  const text=editLang==='lo'?lao:english, setText=editLang==='lo'?setLao:setEnglish;
  const toggleTag=(tag:string)=>setTags(prev=>prev.includes(tag)?prev.filter(t=>t!==tag):prev.length>=MAX_TAGS?prev:[...prev,tag]);
  // Translate the visible field into the other language, then show the result.
  const translate=async()=>{const target=editLang==='lo'?'en':'lo';if(!text.trim())return;setTranslating(true);setError('');try{const result=await request<{text:string}>('/translate','POST',{text,target});if(target==='lo')setLao(result.text);else setEnglish(result.text);setEditLang(target);}catch(e){setError((e as Error).message);}finally{setTranslating(false);}};
  const hasText=!!(english.trim()||lao.trim());
  const sourceOk=!news||isHttpUrl(source);
  const canPost=hasText&&sourceOk&&remaining>0;
  const hint=!hasText?'ຂຽນຂໍ້ຄວາມກ່ອນ':!sourceOk?'ໃສ່ລິ້ງກ່ອນ':remaining<=0?'ໂພສຄົບ 5 ຄັ້ງມື້ນີ້ແລ້ວ':'ພ້ອມໂພສ';
  const submit=async()=>{
    if(!canPost||busy||reading||translating)return;
    setBusy(true);setError('');setStage(null);setDone(false);
    try {await onPost({content:english.trim(),contentLo:lao.trim()||undefined,tags,link:news?source.trim():undefined,image:photo,isNews:news,contentLanguage:editLang==='lo'&&lao.trim()?'lo':english.trim()?'en':'lo'},(stage,done)=>{setStage(stage);setDone(!!done);});onClose();}
    catch(e){setStage(null);setError((e as Error).message);}finally{setBusy(false);}
  };
  const chips=[...TOPIC_ORDER];
  const box='w-full rounded-[14px] border border-border-strong bg-background text-text';
  const pill='min-h-10 h-10 px-4 inline-flex items-center justify-center gap-2 rounded-full border border-border-strong bg-background text-sm font-bold text-text disabled:opacity-50';
  const card='rounded-2xl border border-border bg-background p-3.5 space-y-2.5';
  return <section role="dialog" aria-modal="true" aria-label="ສ້າງໂພສໃໝ່" className="phone-modal fixed inset-0 z-50 flex flex-col bg-background text-text text-base">
    <header className="grid grid-cols-[1fr_auto_1fr] items-center h-14 px-4 border-b border-border bg-background shrink-0">
      <button type="button" disabled={busy} onClick={onClose} className="justify-self-start min-h-11 flex items-center gap-1 text-sm text-text-2 font-bold"><X size={20} aria-hidden/>ຍົກເລີກ</button>
      <h2 className="font-bold text-base">ສ້າງໂພສໃໝ່</h2>
      <span className="justify-self-end text-[13px] text-text-muted">ເຫຼືອ {Math.max(0,remaining)}/5</span>
    </header>
    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pt-3 pb-3 space-y-3">
      <section className={card}>
        <SectionTitle icon={PenLine} tint="purple" aside={
          <div role="radiogroup" aria-label={label('Language','ພາສາ')} className="inline-flex p-0.5 rounded-full bg-surface-2">
            {(['lo','en'] as const).map(l=><button key={l} type="button" role="radio" aria-checked={editLang===l} onClick={()=>setEditLang(l)} className={`min-h-10 px-3.5 rounded-full text-[13px] ${editLang===l?'bg-background border border-border-strong text-text font-bold':'text-text-muted font-bold'}`}>{l==='lo'?'ລາວ':'English'}</button>)}
          </div>}>ຂໍ້ຄວາມ</SectionTitle>
        <label htmlFor="post-text" className="sr-only">{editLang==='lo'?'ຂໍ້ຄວາມພາສາລາວ':'English text'}</label>
        <textarea id="post-text" lang={editLang} value={text} onChange={e=>setText(e.target.value)} maxLength={MAX_LEN}
          placeholder={editLang==='lo'?'ທ່ານຢາກແບ່ງປັນຫຍັງ?':'What do you want to share?'}
          className={`${box} min-h-[120px] resize-none p-3 text-base placeholder:text-text-muted focus:outline-none focus:border-primary`}/>
        {text.length>WARN_LEN&&<p className="text-xs text-danger text-right" aria-live="polite">{text.length}/{MAX_LEN}</p>}
        <div className="flex flex-wrap gap-2">
          <label className={`${pill} ${busy||reading?'opacity-50':'cursor-pointer'}`}>
            {reading?<Loader2 size={18} className="animate-spin" aria-hidden/>:<ImagePlus size={18} aria-hidden className="text-tint-green-fg"/>}ເພີ່ມຮູບ
            <input type="file" accept="image/*" disabled={busy||reading} className="sr-only" onChange={async e=>{const f=e.target.files?.[0];if(!f)return;setReading(true);setError('');try{setPhoto(await readPhoto(f));}catch(err){setError((err as Error).message);}finally{setReading(false);e.target.value='';}}}/>
          </label>
          <button type="button" onClick={()=>void translate()} disabled={!text.trim()||busy||translating} className={pill}>
            {translating?<Loader2 size={18} className="animate-spin" aria-hidden/>:<Sparkles size={18} aria-hidden className="text-tint-purple-fg"/>}ແປດ້ວຍ AI
          </button>
        </div>
        {photo&&<div className="relative"><img src={photo} alt={label('Attachment preview','ຮູບທີ່ແນບ')} className="w-full max-h-40 object-contain rounded-xl bg-background"/><button type="button" aria-label={label('Remove photo','ລຶບຮູບ')} className="absolute right-1 top-1 w-11 h-11 flex items-center justify-center rounded-full bg-text text-background" onClick={()=>setPhoto(undefined)}><X size={20} aria-hidden/></button></div>}
      </section>

      <section className={card}>
        <SectionTitle icon={Tag} tint="blue" aside={<span className="text-[13px] text-text-muted shrink-0">ເລືອກໄດ້ {tags.length}/{MAX_TAGS}</span>}>ຫົວຂໍ້</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {chips.map(tag=>{const on=tags.includes(tag);return <button key={tag} type="button" aria-pressed={on} disabled={!on&&tags.length>=MAX_TAGS} onClick={()=>toggleTag(tag)} className={`h-[38px] px-3.5 rounded-full text-sm border disabled:opacity-50 ${on?'bg-primary border-primary text-primary-foreground font-bold':'bg-background border-border-strong text-text'}`}>{TOPIC_SHORT_LO[tag]||TOPIC_LABELS[tag]?.lo||tag}</button>;})}
        </div>
      </section>

      <section className={card}>
        <label className="flex items-center gap-3 min-h-11 cursor-pointer">
          <input type="checkbox" checked={news} onChange={e=>setNews(e.target.checked)} className="w-[22px] h-[22px] shrink-0 accent-primary"/>
          <span aria-hidden className="w-7 h-7 shrink-0 rounded-lg bg-tint-orange-bg text-tint-orange-fg flex items-center justify-center"><Link2 size={16}/></span>
          <span className="flex-1 min-w-0 text-base">ນີ້ແມ່ນລາຍງານຂ່າວ</span>
          <span className="text-[13px] text-text-muted shrink-0">ຕ້ອງມີລິ້ງ</span>
        </label>
        {news&&<div><label htmlFor="post-source" className="sr-only">ລິ້ງແຫຼ່ງຂ່າວ</label><input id="post-source" type="url" inputMode="url" required aria-invalid={!!source&&!sourceOk} value={source} onChange={e=>setSource(e.target.value)} placeholder="https:// ລິ້ງແຫຼ່ງຂ່າວ" className={`${box} min-h-11 px-3 text-base placeholder:text-text-muted focus:outline-none focus:border-primary`}/></div>}
      </section>

      {stage&&<CheckProgress stage={stage} done={done} lang={lang}/>}
      {error&&<p role="alert" className="text-sm text-danger">{error}</p>}
    </div>
    <footer className="shrink-0 border-t border-border bg-background px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
      <button type="button" onClick={submit} disabled={!canPost||busy||reading||translating} aria-describedby="post-hint"
        className="w-full h-[52px] rounded-full font-bold text-base flex items-center justify-center bg-primary text-primary-foreground disabled:bg-surface-2 disabled:text-text-muted">
        {busy?<Loader2 className="animate-spin" size={20} aria-label={label('Posting','ກຳລັງໂພສ')}/>:'ໂພສເລີຍ'}
      </button>
      <p id="post-hint" aria-live="polite" className="text-center text-xs text-text-muted mt-2">{hint} · ໂພສຊຸມຊົນບໍ່ໄດ້ຮັບການຢືນຢັນໂດຍຜູ້ຊ່ຽວຊານອັດຕະໂນມັດ</p>
    </footer>
  </section>;
}
