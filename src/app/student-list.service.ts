import { z } from "zod";

import { rosterResponseSchema } from "@/modules/classroom/adapters/driving/http/roster.schema";
import { courseResponseSchema } from "@/modules/classroom/adapters/driving/http/course.schema";
import { studentResponseSchema } from "@/modules/classroom/adapters/driving/http/student.schema";
import { checkMemberResponseSchema } from "@/modules/membership/adapters/driving/http/check.schema";

export async function readStudentList() {
  const response = await fetch("/api/student-list");
  return rosterResponseSchema.parse(await responsePayload(response)).roster?.emails ?? [];
}

export async function saveStudentList(rawEmails: string) {
  const emails = rawEmails.split(/[\s,;]+/).filter(Boolean);
  const response = await fetch("/api/student-list", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ emails, isHumanConfirmed: true }) });
  return rosterResponseSchema.parse(await responsePayload(response)).roster?.emails ?? [];
}

export async function readCourses() {
  return courseResponseSchema.parse(await responsePayload(await fetch("/api/classroom/course"))).courses;
}

export async function checkClassroom(courseId: string, emails: ReadonlyArray<string>) {
  const response = await fetch(`/api/classroom/student?courseId=${encodeURIComponent(courseId)}`);
  const students = studentResponseSchema.parse(await responsePayload(response)).students;
  const joined = new Set(students.map((student) => student.email.toLowerCase()));
  return Object.fromEntries(emails.map((email) => [email, joined.has(email) ? "Є" : "Немає"]));
}

export async function checkChat(emails: ReadonlyArray<string>) {
  const response = await fetch("/api/membership/check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ emails }) });
  if (!response.ok) throw new Error(await chatFailureMessage(response));
  const { memberships } = checkMemberResponseSchema.parse(await responsePayload(response));
  const labels = { joined: "Є", invited: "Запрошено", "not-member": "Немає", unknown: "Не вдалося визначити" };
  return Object.fromEntries(memberships.map((member) => [member.email, labels[member.status]]));
}

async function responsePayload(response: Response): Promise<unknown> {
  if (response.status === 400) throw new Error("Перевірте адреси: потрібно від 1 до 500 коректних email.");
  if (!response.ok) throw new Error("Не вдалося виконати запит. Спробуйте ще раз.");
  return response.json();
}

async function chatFailureMessage(response: Response): Promise<string> {
  if (response.status === 401) return "Сесія завершилася. Увійдіть повторно.";
  const payload: unknown = await response.json();
  const failure = z.object({ message: z.string() }).safeParse(payload);
  return failure.success ? failure.data.message : "Не вдалося перевірити Chat.";
}
