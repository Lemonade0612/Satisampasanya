/** Compress selected photos before sending them to the small SQLite backend. */
export async function readPhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.');
  if (file.size > 20 * 1024 * 1024) throw new Error('Choose a photo smaller than 20 MB.');
  const url=URL.createObjectURL(file);
  try {
    const img=new Image();img.src=url;await img.decode();
    const scale=Math.min(1,1200/Math.max(img.naturalWidth,img.naturalHeight));
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
    const context=canvas.getContext('2d');if(!context)throw new Error('Image processing unavailable.');
    context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(img,0,0,canvas.width,canvas.height);
    const photo=canvas.toDataURL('image/jpeg',0.75);
    if(photo.length>1600000)throw new Error('This photo is too large. Choose a smaller one.');
    return photo;
  } finally {URL.revokeObjectURL(url);}
}
