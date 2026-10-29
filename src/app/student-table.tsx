"use client";

import { useEffect, useState } from "react";

import type { WorkspaceState } from "@/modules/workspace/domain/sync.value";


import { readWorkspace, writeWorkspace } from "./workspace.service";
import { StudentComparison } from "./student-comparison";
import { CurrentCourse } from "./current-course";

export function StudentTable({ emails, onEdit }: StudentTableProps) {
  const [workspace, setWorkspace] = useState<WorkspaceState | null>(null);
  const [failure, setFailure] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  useEffect(() => { readWorkspace().then(setWorkspace).catch(() => setFailure("Не вдалося прочитати локальні дані.")); }, []);
  async function update(action: "select" | "sync", courseId?: string) {
    setIsBusy(true); setFailure("");
    try { setWorkspace(await writeWorkspace(action, courseId)); }
    catch (error: unknown) { setFailure(error instanceof Error ? error.message : "Оновлення не вдалося."); }
    finally { setIsBusy(false); }
  }
  if (!workspace) return <section className="rounded-2xl border p-6"><p role="status">{failure || "Завантажуємо робочий простір…"}</p><button onClick={() => readWorkspace().then(setWorkspace).catch(() => setFailure("Повторне читання не вдалося."))} type="button">Повторити читання</button></section>;
  return (
    <div className="grid gap-6">
      <CurrentCourse workspace={workspace} isBusy={isBusy} onSelect={(courseId) => update("select", courseId)} onSync={() => update("sync")} />
      {failure && <p role="alert" className="text-sm text-red-700">{failure}</p>}
      <section className="grid gap-5 rounded-2xl border p-6"><header className="flex justify-between gap-3"><h2 className="text-xl font-semibold">Студенти · {emails.length}</h2><button disabled={isBusy} onClick={onEdit} type="button">Редагувати список</button></header><StudentComparison emails={emails} workspace={workspace} isBusy={isBusy} onRefresh={() => update("sync")} /></section>
    </div>
  );
}

interface StudentTableProps { readonly emails: ReadonlyArray<string>; readonly onEdit: () => void; }
