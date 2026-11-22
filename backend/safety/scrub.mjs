// Strips personal data from a REAL user post before it is sent to an external AI provider. Test data is not scrubbed.
// Replaces emails, phone numbers, long ID-like numbers, @handles, and names introduced by a title or "my name is".
const NAME = "[A-Z][a-z]{1,20}(?: [A-Z][a-z]{1,20}){0,2}";
export function scrubPii(text) {
  return String(text)
    .replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, '[email]')
    .replace(/\+?\d[\d\s().-]{6,}\d/g, m => (m.replace(/\D/g, '').length >= 7 ? '[phone]' : m))
    .replace(/(?<![\w])@[A-Za-z0-9_.]{4,}/g, '[handle]')
    .replace(new RegExp(`\\b(Mr|Mrs|Ms|Miss|Dr|Officer|Captain|Sir|Madam|Mister)\\.? ${NAME}`, 'g'), '$1 [name]')
    .replace(new RegExp(`\\b(my name is|i am called|i'm called|this is|name:) ${NAME}`, 'gi'), (m, p) => `${p} [name]`);
}
