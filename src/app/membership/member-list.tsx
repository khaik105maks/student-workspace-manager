"use client";

import { useEffect, useState } from "react";

import { courseResponseSchema } from "@/modules/classroom/adapters/driving/http/course.schema";
import type { CourseView } from "@/modules/classroom/adapters/driving/http/course.type";
import { studentResponseSchema } from "@/modules/classroom/adapters/driving/http/student.schema";
import type { StudentView } from "@/modules/classroom/adapters/driving/http/student.type";
import { listMemberResponseSchema } from "@/modules/membership/adapters/driving/http/list.schema";
import type { MemberView } from "@/modules/membership/adapters/driving/http/list.type";

import { RosterPanel } from "./roster-panel";

import type { MemberRowView } from "./member-row.type";

export function MemberList() {
  const memberList = useMemberList();
  return (
    <section className="grid gap-4 rounded-2xl border border-zinc-200 p-6">
      <MemberListHeader courseId={memberList.courseId} courses={memberList.courses} isLoading={memberList.isLoading} loadMembers={memberList.loadMembers} setCourseId={memberList.setCourseId} />
      {memberList.courseId && <RosterPanel key={memberList.courseId} courseId={memberList.courseId} />}
      {memberList.failureMessage && <p role="alert" className="text-sm text-red-700">{memberList.failureMessage}</p>}
      {memberList.members.length > 0 && <MemberTable members={memberList.members} />}
    </section>
  );
}

function useMemberList() {
  const [courses, setCourses] = useState<ReadonlyArray<CourseView>>([]);
  const [courseId, setCourseId] = useState("");
  const [members, setMembers] = useState<ReadonlyArray<MemberRowView>>([]);
  const [failureMessage, setFailureMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCourses().then(setCourses).catch((failure: unknown) => setFailureMessage(failureMessageOf(failure)));
  }, []);

  async function loadMembers() {
    setIsLoading(true);
    setFailureMessage("");
    try {
      setMembers(await fetchEnrichedMembers(courseId));
    } catch (failure: unknown) {
      setFailureMessage(failureMessageOf(failure));
    } finally {
      setIsLoading(false);
    }
  }

  return { courses, courseId, members, failureMessage, isLoading, loadMembers, setCourseId };
}

function MemberListHeader(props: MemberListHeaderProps) {
  return (
    <header className="grid gap-4">
      <div><h2 className="text-xl font-semibold">Учасники Google Chat</h2><p className="text-sm text-zinc-600">Email та ім’я беруться з обраного Classroom-курсу.</p></div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <select aria-label="Курс Classroom" disabled={props.isLoading} className="min-w-0 flex-1 rounded-lg border p-2" onChange={(event) => props.setCourseId(event.target.value)} value={props.courseId}>
          <option value="">Оберіть Classroom-курс</option>
          {props.courses.map((course) => <option key={course.id} value={course.id}>{course.name}{course.section ? ` — ${course.section}` : ""}</option>)}
        </select>
        <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50" disabled={props.isLoading || !props.courseId} onClick={props.loadMembers} type="button">
          {props.isLoading ? "Завантажуємо…" : "Показати всіх"}
        </button>
      </div>
    </header>
  );
}

function MemberTable({ members }: MemberTableProps) {
  return (
    <div className="overflow-x-auto"><p className="mb-3 text-sm font-medium">Усього в Chat: {members.length}</p>
      <table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-2">Ім’я</th><th>Email</th><th>User ID</th><th>Роль</th><th>Стан</th></tr></thead>
        <tbody>{members.map((member) => <MemberRow key={member.identity} member={member} />)}</tbody>
      </table>
    </div>
  );
}

function MemberRow({ member }: { readonly member: MemberRowView }) {
  return <tr className="border-b border-zinc-100"><td className="py-2">{member.name || "—"}</td><td>{member.email || "—"}</td><td className="font-mono">{memberId(member.identity)}</td><td>{member.role}</td><td>{member.status}</td></tr>;
}

async function fetchEnrichedMembers(courseId: string): Promise<ReadonlyArray<MemberRowView>> {
  const [members, students] = await Promise.all([fetchMembers(), fetchStudents(courseId)]);
  const studentsById = new Map(students.map((student) => [student.id, student]));
  return members.map((member) => enrichMember(member, studentsById.get(memberId(member.identity))));
}

function enrichMember(member: MemberView, student?: StudentView): MemberRowView {
  return { ...member, email: student?.email ?? "", name: student?.name ?? "" };
}

async function fetchMembers(): Promise<ReadonlyArray<MemberView>> {
  const payload = await fetchPayload("/api/membership/list");
  return listMemberResponseSchema.parse(payload).members;
}

async function fetchStudents(courseId: string): Promise<ReadonlyArray<StudentView>> {
  const payload = await fetchPayload(`/api/classroom/student?courseId=${encodeURIComponent(courseId)}`);
  return studentResponseSchema.parse(payload).students;
}

async function fetchCourses(): Promise<ReadonlyArray<CourseView>> {
  const payload = await fetchPayload("/api/classroom/course");
  return courseResponseSchema.parse(payload).courses;
}

async function fetchPayload(path: string): Promise<unknown> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Запит завершився з кодом ${response.status}`);
  return response.json();
}

function memberId(identity: string): string { return identity.replace(/^users\//, ""); }
function failureMessageOf(failure: unknown): string { return failure instanceof Error ? failure.message : "Не вдалося отримати список"; }

interface MemberListHeaderProps {
  readonly courseId: string;
  readonly courses: ReadonlyArray<CourseView>;
  readonly isLoading: boolean;
  readonly loadMembers: () => Promise<void>;
  readonly setCourseId: (courseId: string) => void;
}

interface MemberTableProps { readonly members: ReadonlyArray<MemberRowView>; }
