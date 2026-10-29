"use client";

import { useEffect, useState } from "react";

import { rosterResponseSchema } from "@/modules/classroom/adapters/driving/http/roster.schema";

export function RosterPanel({ courseId }: { readonly courseId: string }) {
  const [message, setMessage] = useState("Завантажуємо локальний список…");
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    loadRoster(courseId, controller.signal).then(setMessage).catch(() => { if (!controller.signal.aborted) setMessage("Не вдалося прочитати локальний список."); });
    return () => controller.abort();
  }, [courseId]);
  async function save() {
    setIsSaving(true);
    try { setMessage(await saveRoster(courseId)); }
    catch { setMessage("Збереження не вдалося. Спробуйте ще раз; попередній список залишився в базі."); }
    finally { setIsSaving(false); }
  }
  return (
    <div className="grid gap-3 rounded-xl bg-slate-50 p-4">
      <h3 className="text-sm font-semibold">Локальна база email</h3>
      <p className="text-sm text-zinc-600">Зберегти всі доступні email студентів цього Classroom-курсу на цьому комп’ютері. Повторне збереження замінить попередній список.</p>
      <p aria-live="polite" className="text-sm">{message}</p>
      <button className="justify-self-start rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm disabled:opacity-50" disabled={isSaving} onClick={save} type="button">{isSaving ? "Зберігаємо…" : "Зберегти email локально"}</button>
    </div>
  );
}

async function loadRoster(courseId: string, signal: AbortSignal) {
  const response = await fetch(`/api/classroom/roster?courseId=${encodeURIComponent(courseId)}`, { signal });
  return rosterMessage(response);
}

async function saveRoster(courseId: string) {
  const response = await fetch("/api/classroom/roster", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId, isHumanConfirmed: true }) });
  return rosterMessage(response);
}

async function rosterMessage(response: Response) {
  if (!response.ok) throw new Error("Roster request failed");
  const payload: unknown = await response.json();
  const { roster } = rosterResponseSchema.parse(payload);
  if (roster === null) return "Email цього курсу ще не збережені.";
  return `Збережено адрес: ${roster.emails.length}. Оновлено: ${new Date(roster.savedAt).toLocaleString("uk-UA")}.`;
}
