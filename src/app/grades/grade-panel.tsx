"use client";
import { useEffect, useState } from "react";
import { readCourses } from "../student-list.service";
import { readWorkspace } from "../workspace.service";
import type { Course } from "@/modules/classroom/domain/course.value";
import { GradeReport } from "./grade-report";
export function GradePanel() {
  const [courses, setCourses] = useState<ReadonlyArray<Course>>([]);
  const [courseId, setCourseId] = useState("");
  const [failure, setFailure] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const lifecycle = { isActive: true };
    Promise.all([readCourses(), readWorkspace()]).then(([available, workspace]) => {
      if (!lifecycle.isActive) return;
      setCourses(available); setCourseId(workspace.courseId); setIsLoading(false);
    }).catch(() => { if (lifecycle.isActive) { setFailure("Не вдалося завантажити курси. Перевірте вхід і повторіть спробу."); setIsLoading(false); } });
    return () => { lifecycle.isActive = false; };
  }, [revision]);
  function load() { setFailure(""); setIsLoading(true); setRevision((previous) => previous + 1); }
  return <section className="grid gap-6">
    <label className="grade-course"><span className="eyebrow">ПОТОЧНИЙ КУРС</span><select className="rounded-lg border p-3" value={courseId} disabled={isLoading} onChange={(event) => setCourseId(event.target.value)}><option value="">Оберіть курс</option>{savedCourseOption(courses, courseId)}{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label>
    {isLoading && <p role="status">Завантажуємо курси…</p>}
    {failure && <p role="alert">{failure} <button type="button" onClick={load}>Повторити</button></p>}

    {courseId && <GradeReport key={courseId} courseId={courseId} />}
  </section>;
}

function savedCourseOption(courses: ReadonlyArray<Course>, courseId: string) {
  if (!courseId || courses.some((course) => course.id === courseId)) return null;
  return <option value={courseId}>Збережений курс · {courseId}</option>;
}
