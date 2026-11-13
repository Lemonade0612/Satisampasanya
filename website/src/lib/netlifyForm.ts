/** POST a form to Netlify Forms (works on the deployed site; see public/__forms.html). */
export async function submitNetlify(formName: string, fields: Record<string, string>, files: File[] = []): Promise<void> {
  const body = new FormData();
  body.append("form-name", formName);
  Object.entries(fields).forEach(([k, v]) => body.append(k, v));
  files.slice(0, 5).forEach((f, i) => body.append(`file${i + 1}`, f));
  const res = await fetch("/", { method: "POST", body });
  if (!res.ok) throw new Error(`Form submit failed (${res.status})`);
}
