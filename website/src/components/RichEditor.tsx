import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Icon, { type IconName } from "./Icon";
import styles from "./RichEditor.module.css";

interface Labels { bold: string; italic: string; underline: string; bullets: string; numbers: string; link: string; linkPrompt: string; placeholder: string; label: string }

export const MAX_CHARS = 2000;

export default function RichEditor({ labels, onChange, invalid }: { labels: Labels; onChange: (html: string, text: string) => void; invalid?: boolean }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, codeBlock: false, blockquote: false, code: false, strike: false, horizontalRule: false }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" } }),
    ],
    content: "",
    editorProps: { attributes: { id: "msg", role: "textbox", "aria-multiline": "true", "aria-label": labels.label, ...(invalid ? { "aria-invalid": "true" } : {}) } },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? "" : e.getHTML(), e.getText()),
  });
  if (!editor) return <div className={styles.wrap} style={{ minHeight: 220 }} />;

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(labels.linkPrompt, prev ?? "https://");
    if (url === null) return;
    if (url.trim() === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    const safe = /^(https?:|mailto:)/i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href: safe }).run();
  };

  const btn = (name: IconName, label: string, active: boolean, run: () => void) => (
    <button type="button" aria-label={label} title={label} aria-pressed={active} className={active ? styles.on : ""} onClick={run}>
      <Icon name={name} size={16} strokeWidth={2.4} />
    </button>
  );
  const len = editor.getText().length;

  return (
    <div className={`${styles.wrap} ${invalid ? styles.bad : ""}`}>
      <div className={styles.bar} role="toolbar" aria-label={labels.label}>
        <button type="button" aria-label={labels.bold} title={labels.bold} aria-pressed={editor.isActive("bold")} className={editor.isActive("bold") ? styles.on : ""} onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></button>
        <button type="button" aria-label={labels.italic} title={labels.italic} aria-pressed={editor.isActive("italic")} className={editor.isActive("italic") ? styles.on : ""} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></button>
        <button type="button" aria-label={labels.underline} title={labels.underline} aria-pressed={editor.isActive("underline")} className={editor.isActive("underline") ? styles.on : ""} onClick={() => editor.chain().focus().toggleUnderline().run()}><u>U</u></button>
        <span className={styles.sep} />
        {btn("list", labels.bullets, editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run())}
        <button type="button" aria-label={labels.numbers} title={labels.numbers} aria-pressed={editor.isActive("orderedList")} className={editor.isActive("orderedList") ? styles.on : ""} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1.</button>
        {btn("link", labels.link, editor.isActive("link"), setLink)}
      </div>
      <div className={styles.area}>
        {editor.isEmpty && <span className={styles.ph} aria-hidden="true">{labels.placeholder}</span>}
        <EditorContent editor={editor} />
      </div>
      <div className={`${styles.count} ${len > MAX_CHARS ? styles.over : ""}`} aria-live="polite">{len} / {MAX_CHARS}</div>
    </div>
  );
}
