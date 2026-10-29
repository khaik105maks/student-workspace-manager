"use client";

import { useEffect, useState } from "react";

import { courseResponseSchema } from "@/modules/classroom/adapters/driving/http/course.schema";
import type { CourseView } from "@/modules/classroom/adapters/driving/http/course.type";
import { inviteResponseSchema } from "@/modules/classroom/adapters/driving/http/invite.schema";
import type { InviteView } from "@/modules/classroom/adapters/driving/http/invite.type";

export function InviteForm() {
  const form = useInviteForm();
  return (
    <section className="grid gap-4 rounded-2xl border border-zinc-200 p-6">
      <header><h2 className="text-xl font-semibold">Запросити в Classroom</h2><p className="text-sm text-zinc-600">Оберіть курс і додайте адреси. Перед надсиланням ви побачите результат перевірки.</p></header>
      <label className="grid gap-2 text-sm font-medium">Курс Classroom<select disabled={form.isLoading} className="rounded-lg border p-2" onChange={(event) => form.setCourseId(event.target.value)} value={form.courseId}><option value="">Оберіть курс</option>{form.courses.map(courseOption)}</select></label>
      <label className="grid gap-2 text-sm font-medium">Email студентів<textarea disabled={form.isLoading} className="min-h-40 rounded-lg border p-3 font-mono text-sm" onChange={(event) => form.setRawEmails(event.target.value)} placeholder="student@student.khai.edu" value={form.rawEmails} /><span className="text-xs font-normal text-zinc-500">Кожна адреса з нового рядка або через кому.</span></label>
      <button className="rounded-lg border px-4 py-2 disabled:opacity-50" disabled={isPreviewDisabled(form)} onClick={form.preview} type="button">{form.isLoading ? "Обробляємо…" : "Перевірити список"}</button>
      <InvitePreview invitations={form.invitations} />
      {hasReady(form.invitations) && <label className="flex gap-2 text-sm"><input checked={form.isConfirmed} onChange={(event) => form.setIsConfirmed(event.target.checked)} type="checkbox" />Я підтверджую надсилання запрошень</label>}
      {hasReady(form.invitations) && <button className="rounded-lg bg-blue-700 px-4 py-2 text-white disabled:opacity-50" disabled={isExecuteDisabled(form)} onClick={form.execute} type="button">Надіслати запрошення</button>}
      <FailureMessage message={form.failureMessage} />
    </section>
  );
}

function useInviteForm() {
  const [courseId, setCourseId] = useState("");
  const [rawEmails, setRawEmails] = useState("");
  const [invitations, setInvitations] = useState<ReadonlyArray<InviteView>>([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [failureMessage, setFailureMessage] = useState("");
  const courses = useCourses(setFailureMessage);
  const preview = () => submitInvite({ action: "preview", courseId, rawEmails, isHumanConfirmed: false }, setFormState(setInvitations, setFailureMessage, setIsLoading));
  const execute = () => submitInvite({ action: "execute", courseId, rawEmails, isHumanConfirmed: true }, setFormState(setInvitations, setFailureMessage, setIsLoading));
  return { courses, courseId, rawEmails, invitations, isConfirmed, isLoading, failureMessage, setCourseId: (course: string) => { setCourseId(course); setInvitations([]); setIsConfirmed(false); }, setRawEmails: (emails: string) => { setRawEmails(emails); setInvitations([]); setIsConfirmed(false); }, setIsConfirmed, preview, execute };
}

function InvitePreview({ invitations }: { readonly invitations: ReadonlyArray<InviteView> }) {
  if (invitations.length === 0) return null;
  return <ul className="grid gap-1 text-sm">{invitations.map((invite) => <li className="flex justify-between border-b py-1" key={invite.email}><span>{invite.email}</span><span>{statusLabel(invite.status)}</span></li>)}</ul>;
}

async function submitInvite(request: InviteSubmission, state: FormState) {
  state.setIsLoading(true); state.setFailureMessage("");
  try {
    const payload = await fetchPayload(`/api/classroom/invite/${request.action}`, { courseId: request.courseId, emails: emailLines(request.rawEmails), isHumanConfirmed: request.isHumanConfirmed });
    state.setInvitations(inviteResponseSchema.parse(payload).invitations);
  } catch (failure: unknown) { state.setFailureMessage(failureMessageOf(failure)); }
  finally { state.setIsLoading(false); }
}

function useCourses(setFailureMessage: (message: string) => void) {
  const [courses, setCourses] = useState<ReadonlyArray<CourseView>>([]);
  useEffect(() => { fetchCourses().then(setCourses).catch(setFailure(setFailureMessage)); }, [setFailureMessage]);
  return courses;
}

async function fetchPayload(path: string, body: unknown): Promise<unknown> {
  const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`Запит завершився з кодом ${response.status}`);
  return response.json();
}

async function fetchCourses(): Promise<ReadonlyArray<CourseView>> {
  const response = await fetch("/api/classroom/course");
  if (!response.ok) throw new Error(`Курси недоступні: ${response.status}`);
  const payload: unknown = await response.json();
  return courseResponseSchema.parse(payload).courses;
}

function courseOption(course: CourseView) { return <option key={course.id} value={course.id}>{course.name}</option>; }
function emailLines(rawEmails: string) { return rawEmails.split(/\r?\n|,|;/).map((email) => email.trim()).filter(Boolean); }
function hasReady(invitations: ReadonlyArray<InviteView>) { return invitations.some((invite) => invite.status === "ready"); }
function isPreviewDisabled(form: ReturnType<typeof useInviteForm>) { return form.isLoading || !form.courseId || !form.rawEmails; }
function isExecuteDisabled(form: ReturnType<typeof useInviteForm>) { return form.isLoading || !form.isConfirmed || !hasReady(form.invitations); }
function failureMessageOf(failure: unknown) { return failure instanceof Error ? failure.message : "Не вдалося виконати запит"; }
function setFailure(setMessage: (message: string) => void) { return (failure: unknown) => setMessage(failureMessageOf(failure)); }
function setFormState(setInvitations: FormState["setInvitations"], setFailureMessage: FormState["setFailureMessage"], setIsLoading: FormState["setIsLoading"]): FormState { return { setInvitations, setFailureMessage, setIsLoading }; }
function FailureMessage({ message }: { readonly message: string }) { return message ? <p role="alert" className="text-sm text-red-700">{message}</p> : null; }

function statusLabel(status: InviteView["status"]): string {
  return { ready: "можна запросити", "already-member": "вже студент", invited: "запрошено", "already-invited": "вже запрошений", failed: "помилка" }[status];
}

interface FormState {
  readonly setInvitations: (invitations: ReadonlyArray<InviteView>) => void;
  readonly setFailureMessage: (message: string) => void;
  readonly setIsLoading: (isLoading: boolean) => void;
}

interface InviteSubmission {
  readonly action: string;
  readonly courseId: string;
  readonly rawEmails: string;
  readonly isHumanConfirmed: boolean;
}
