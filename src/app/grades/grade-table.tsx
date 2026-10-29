"use client";
import { orderAssignments } from "@/modules/classroom/domain/assignment-order.policy";
import { useState } from "react";
import type { Assignment, GradeBook, Submission } from "@/modules/classroom/domain/grade.value";
export function GradeTable({ book }: { readonly book: GradeBook }) {
  const [query, setQuery] = useState("");
  const [studentQuery, setStudentQuery] = useState("");
  const assignments = orderAssignments(book.assignments).filter((assignment) => assignment.title.toLowerCase().includes(query.toLowerCase()));
  const students = book.students.filter((student) => `${student.name} ${student.email}`.toLowerCase().includes(studentQuery.toLowerCase()));
  const submissions = new Map(book.submissions.map((submission) => [`${submission.userId}:${submission.assignmentId}`, submission]));
  return <div className="grade-card"><div className="grade-filters"><label>Завдання<input className="block rounded-lg border p-3" placeholder="Назва лабораторної…" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label>Студент<input className="block rounded-lg border p-3" placeholder="Ім’я або email…" value={studentQuery} onChange={(event) => setStudentQuery(event.target.value)} /></label></div>
    <div className="grade-summary"><span><strong>{students.length}</strong> студентів <span aria-hidden="true"> / </span> <strong>{assignments.length}</strong> завдань</span><span>Дата здачі: від ранніх до пізніх ↗</span></div>
    {assignments.length === 0 && <p>Завдань не знайдено. Спробуйте змінити пошук або перевірте завдання в Classroom.</p>}
    {students.length === 0 && <p>Студентів не знайдено.</p>}
    <div className="student-table-scroll grade-scroll" tabIndex={0} role="region" aria-label="Таблиця оцінок із прокручуванням"><table className="grade-table"><caption className="sr-only">Оцінки та статуси здачі за завданнями</caption><thead><tr><th scope="col">Студент</th>{assignments.map((assignment) => <th scope="col" key={assignment.id}><AssignmentHeading assignment={assignment} /></th>)}</tr></thead>
      <tbody>{students.map((student) => <tr key={student.id}><th scope="row"><span className="block">{student.name}</span><span className="text-sm font-normal">{student.email}</span></th>{assignments.map((assignment) => <td key={assignment.id}><SubmissionCell submission={submissions.get(`${student.id}:${assignment.id}`)} /></td>)}</tr>)}</tbody></table></div>
  </div>;
}
function AssignmentHeading({ assignment }: { readonly assignment: Assignment }) {
  return <div className="grade-assignment"><ClassroomLink url={assignment.url} label={assignment.title} /><p className="text-xs font-normal">Максимум: {assignment.maxPoints ?? "Без оцінки"}</p><p className="text-xs font-normal">{assignment.deadline ? `Дедлайн: ${new Date(assignment.deadline).toLocaleString("uk-UA")}` : "Без дедлайну"}</p>{assignment.description && <details className="text-xs font-normal"><summary>Опис</summary><p className="whitespace-pre-wrap">{assignment.description}</p></details>}</div>;
}
function SubmissionCell({ submission }: { readonly submission: Submission | undefined }) {
  if (!submission) return <span className="text-zinc-500">Немає даних</span>;
  return <div className="grade-submission"><GradeValue submission={submission} /><span className={`grade-status grade-status-${submission.state.toLowerCase()}`}>{submissionLabel(submission.state)}</span>{submission.isLate && <span className="grade-late">Із запізненням</span>}{submission.url && <ClassroomLink url={submission.url} label="Відкрити роботу ↗" />}</div>;
}
function ClassroomLink({ url, label }: { readonly url: string; readonly label: string }) {
  return url.startsWith("https://") ? <a className="grade-link" href={url} target="_blank" rel="noopener noreferrer">{label}</a> : <span>{label}</span>;
}
const submissionLabels: Readonly<Record<string, string>> = { NEW: "Не розпочато", CREATED: "Не здано", TURNED_IN: "Здано", RETURNED: "Повернуто викладачем", RECLAIMED_BY_STUDENT: "Здачу скасовано студентом" };

function GradeValue({ submission }: { readonly submission: Submission }) {
  return <><strong className="grade-score">{submission.grade ?? "—"}</strong><span className="sr-only">{submission.grade === null ? "Не оцінено" : "балів"}</span>{submission.draftGrade !== null && <span className="text-xs">Чернетка: {submission.draftGrade}</span>}</>;
}
function submissionLabel(state: string) { return submissionLabels[state] ?? "Невідомий статус"; }
