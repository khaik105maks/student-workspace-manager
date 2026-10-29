"use client";

import { useEffect, useState } from "react";

import { readStudentList, saveStudentList } from "./student-list.service";
import { StudentTable } from "./student-table";

export function StudentList() {
  const [emails, setEmails] = useState<ReadonlyArray<string> | null>(null);
  const [failure, setFailure] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  async function load() {
    try { setEmails(await readStudentList()); setFailure(""); }
    catch { setFailure("Не вдалося прочитати збережений список."); }
  }
  useEffect(() => { readStudentList().then(setEmails).catch(() => setFailure("Не вдалося прочитати збережений список.")); }, []);
  if (emails === null) return <ListLoading failure={failure} onRetry={load} />;
  if (emails.length === 0 || isEditing) return <EmailEntry emails={emails} onCancel={() => setIsEditing(false)} onSaved={(saved) => { setEmails(saved); setIsEditing(false); }} />;
  return <StudentTable emails={emails} onEdit={() => setIsEditing(true)} />;
}

function EmailEntry(props: EmailEntryProps) {
  const [failure, setFailure] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  async function save(form: FormData) {
    setIsSaving(true); setFailure("");
    try { props.onSaved(await saveStudentList(String(form.get("emails") ?? ""))); }
    catch (error: unknown) { setFailure(error instanceof Error ? error.message : "Збереження не вдалося."); }
    finally { setIsSaving(false); }
  }
  return (
    <section className="grid gap-5 rounded-2xl border p-6">
      <header><p className="eyebrow">ПОЧНІМО ЗІ СПИСКУ</p><h2 className="mt-2 text-2xl font-semibold">Додайте email студентів</h2><p className="mt-2 text-sm text-zinc-600">Це ваш основний список. Після збереження перевіримо, хто є в Classroom і Chat.</p></header>
      <form action={save} className="grid gap-4">
        <label className="grid gap-2 text-sm font-medium">Email студентів<textarea className="min-h-56 rounded-lg border p-3" defaultValue={props.emails.join("\n")} disabled={isSaving} name="emails" placeholder="student@student.khai.edu" required /><span className="text-xs text-zinc-500">До 500 адрес. Кожна з нового рядка, через кому або пробіл. Дублікати приберемо.</span></label>
        {failure && <p role="alert" className="text-sm text-red-700">{failure}</p>}
        <button className="rounded-lg bg-blue-700 px-5 py-3 text-white disabled:opacity-50" disabled={isSaving} type="submit">{isSaving ? "Зберігаємо…" : "Зберегти список і продовжити"}</button>
        {props.emails.length > 0 && <button disabled={isSaving} onClick={props.onCancel} type="button">Скасувати зміни</button>}
      </form>
    </section>
  );
}

interface EmailEntryProps {
  readonly emails: ReadonlyArray<string>;
  readonly onSaved: (emails: ReadonlyArray<string>) => void;
  readonly onCancel: () => void;
}

function ListLoading({ failure, onRetry }: { readonly failure: string; readonly onRetry: () => Promise<void> }) {
  return <section className="rounded-2xl border p-6"><p role="status">{failure || "Завантажуємо список…"}</p>{failure && <button onClick={onRetry} type="button">Спробувати ще раз</button>}</section>;
}
