"use client";
import { useState } from "react";
import type { StudentMatch, WorkspaceState } from "@/modules/workspace/domain/sync.value";
import { matchStudents } from "@/modules/workspace/domain/match.policy";
import { RenewInvite } from "./renew-invite";

export function StudentComparison(props: ComparisonProps) {
  const [query, setQuery] = useState("");
  const rows = comparisonRows(props).filter((row) => row.email.toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="grid gap-4">
    <div className="student-toolbar"><label className="student-search"><span className="sr-only">Знайти студента за email</span><input type="search" placeholder="Знайти за email…" value={query} onChange={(event) => setQuery(event.target.value)} /></label><span>{rows.length} з {props.emails.length}</span></div>
    <div className="student-table-scroll"><table className="student-table"><caption className="sr-only">Студенти та їхній статус у Classroom і Chat</caption><thead><tr><th scope="col">Студент</th><th scope="col">Classroom</th><th scope="col">Chat</th><th scope="col"><span className="sr-only">Дії</span></th></tr></thead><tbody>{rows.map((row) => <StudentRow key={`${props.workspace.courseId}:${row.email}:${props.workspace.snapshot?.savedAt}`} row={row} controls={props} />)}</tbody></table></div>
    {rows.length === 0 && <p className="py-6 text-center text-sm text-zinc-500">За цією адресою нікого не знайдено.</p>}
  </div>;
}

function StudentRow({ row, controls }: { readonly row: StudentMatch; readonly controls: ComparisonProps }) {
  const [outcome, setOutcome] = useState("");
  const classroom = outcome || row.classroom;
  function completed(status: "invited" | "already-member") { setOutcome(status === "invited" ? "Запрошено" : "Є"); void controls.onRefresh(); }
  return <tr>
    <td><span className="student-email">{row.email}</span><details className="student-identity"><summary>Google ID</summary><span>{row.userId || "Ще не визначено"}</span></details></td>
    <td><StatusBadge status={classroom} /></td><td><StatusBadge status={row.chat} /></td>
    <td className="student-action-cell">{canInvite(classroom, controls.workspace.courseId) && <RenewInvite courseId={controls.workspace.courseId} email={row.email} isPending={classroom === "Запрошено"} disabled={controls.isBusy} onSuccess={completed} />}</td>
  </tr>;
}

function StatusBadge({ status }: { readonly status: string }) {
  const labels: Readonly<Record<string, string>> = { "Є": "Приєднався", "Не вдалося зіставити": "Не визначено", "Не вдалося визначити": "Не визначено" };
  const tones: Readonly<Record<string, string>> = { "Є": "joined", "Запрошено": "pending", "Немає": "absent" };
  return <span className={`status-badge status-${tones[status] ?? "unknown"}`} title={status}><span aria-hidden="true" />{labels[status] ?? status}</span>;
}

function canInvite(status: string, courseId: string) { return Boolean(courseId) && (status === "Запрошено" || status === "Немає"); }
function comparisonRows(props: ComparisonProps): ReadonlyArray<StudentMatch> {
  if (props.workspace.snapshot) return matchStudents(props.emails, props.workspace.snapshot);
  return props.emails.map((email) => ({ email, userId: "", classroom: "Не синхронізовано", chat: "Не синхронізовано" }));
}
interface ComparisonProps {
  readonly emails: ReadonlyArray<string>;
  readonly workspace: WorkspaceState;
  readonly isBusy: boolean;
  readonly onRefresh: () => Promise<void>;
}
