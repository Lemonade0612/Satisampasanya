import { CONTACT_EMAIL } from "../data/links";

/**
 * Sends a form to the team's inbox through FormSubmit (https://formsubmit.co).
 * No server of our own. The first submission asks the inbox owner to confirm the address once.
 * Attachments are sent as multipart files (FormSubmit limits their total size, about 5 MB on the free plan).
 */
export async function submitForm(formName: string, fields: Record<string, string>, files: File[] = []): Promise<void> {
  const body = new FormData();
  body.append("_subject", `Sati website: ${formName}`);
  body.append("_template", "table");
  body.append("_captcha", "false");
  body.append("_honey", ""); // spam trap: bots fill it, people never see it
  Object.entries(fields).forEach(([k, v]) => body.append(k, v));
  files.slice(0, 5).forEach((f) => body.append("attachment", f));
  const res = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, { method: "POST", body, headers: { Accept: "application/json" } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === "false" || data.success === false) throw new Error(data.message || `Form submit failed (${res.status})`);
}
