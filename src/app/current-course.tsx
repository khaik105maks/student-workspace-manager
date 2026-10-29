"use client";

import { useEffect, useState } from "react";

import type { Course, WorkspaceState } from "@/modules/workspace/domain/sync.value";

import { readCourses } from "./student-list.service";

export function CurrentCourse(props: CurrentCourseProps) {
  const [courses, setCourses] = useState<ReadonlyArray<Course>>(cachedCourses(props.workspace));
  const [failure, setFailure] = useState("");
  useEffect(() => { readCourses().then(setCourses).catch(() => setFailure("Не вдалося оновити перелік курсів.")); }, []);
  return (
    <section className="grid gap-4 rounded-2xl border p-6">
      <p className="eyebrow">ПОТОЧНИЙ КУРС</p>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end">
        <CourseSelect courses={courses} controls={props} />
        <button className="rounded-lg bg-blue-700 px-6 py-3 text-white disabled:opacity-50" disabled={props.isBusy || !props.workspace.courseId} onClick={props.onSync} type="button">{props.isBusy ? "Оновлюємо…" : "Sync"}</button>
      </div>
      <SyncSummary workspace={props.workspace} />
      {failure && <p role="alert" className="text-sm text-red-700">{failure} <button onClick={() => readCourses().then(setCourses).then(() => setFailure("")).catch(() => setFailure("Курси недоступні."))} type="button">Повторити</button></p>}
    </section>
  );
}

function SyncSummary({ workspace }: { readonly workspace: WorkspaceState }) {
  if (!workspace.snapshot) return <p className="text-sm text-zinc-500">Sync прочитає всіх студентів курсу й учасників налаштованого Chat та збереже їх локально.</p>;
  const snapshot = workspace.snapshot;
  return <p role="status" className="text-sm text-zinc-500">Остання синхронізація: {new Date(snapshot.savedAt).toLocaleString("uk-UA")}. Classroom: {snapshot.students.length}, Chat: {snapshot.members.length}. Простір: {snapshot.spaceId}.</p>;
}

interface CurrentCourseProps {
  readonly workspace: WorkspaceState;
  readonly isBusy: boolean;
  readonly onSelect: (courseId: string) => Promise<void>;
  readonly onSync: () => Promise<void>;
}

function CourseSelect({ courses, controls }: { readonly courses: ReadonlyArray<Course>; readonly controls: CurrentCourseProps }) {
  const hasCourse = courses.some((course) => course.id === controls.workspace.courseId);
  return <label className="grid w-full gap-2 text-sm">Classroom<select className="rounded-lg border p-3" disabled={controls.isBusy} onChange={(event) => controls.onSelect(event.target.value)} value={controls.workspace.courseId}><option disabled value="">Оберіть курс</option>{!hasCourse && controls.workspace.courseId && <option value={controls.workspace.courseId}>Збережений курс · {controls.workspace.courseId}</option>}{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label>;
}

function cachedCourses(workspace: WorkspaceState) { return workspace.snapshot?.courses ?? []; }
