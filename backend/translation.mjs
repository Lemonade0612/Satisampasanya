export const translationEnabled=()=>!!process.env.NLLB_URL;
export async function translateText(text,source,target,fetcher=fetch){
 if(!translationEnabled())throw Object.assign(new Error('Start the local AI launcher to enable NLLB-200 translation.'),{status:503});
 let response;
 try{response=await fetcher(process.env.NLLB_URL.replace(/\/$/,'')+'/translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,source,target}),signal:AbortSignal.timeout(180000)});}
 catch{throw Object.assign(new Error('NLLB-200 is not ready. Start the AI service and wait for the initial model download.'),{status:503});}
 if(!response.ok)throw Object.assign(new Error('NLLB-200 could not translate this post. Retry or enter both languages.'),{status:502});
 const value=await response.json();if(typeof value.text!=='string'||!value.text.trim()||value.text.length>2000)throw Object.assign(new Error('The translation response was invalid.'),{status:502});return value.text;
}
export async function localScreen(text,fetcher=fetch){
 const response=await fetcher(process.env.NLLB_URL.replace(/\/$/,'')+'/screen',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text}),signal:AbortSignal.timeout(90000)});
 if(!response.ok)throw new Error('Local AI screening failed.');
 const value=await response.json();if(!['none','low','medium','high','severe'].includes(value.severity)||!Array.isArray(value.flags)||value.flags.some(flag=>typeof flag!=='string'))throw new Error('Invalid screening response.');return value;
}
