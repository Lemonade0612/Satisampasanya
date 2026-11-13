/**
 * Submit a form to Netlify Forms. The form must also be declared in
 * public/__forms.html so Netlify detects it at deploy time.
 * Note: this only works on Netlify (or `netlify dev`) — plain `npm run dev`
 * has nothing to receive the POST, so the form shows its error message.
 */
export async function submitNetlifyForm(formName: string, fields: Record<string, string>): Promise<void> {
  const body = new URLSearchParams({ "form-name": formName, ...fields }).toString();
  const res = await fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`Form submit failed (${res.status})`);
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
