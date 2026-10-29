"use client";

import Link from "next/link";

import { StudentList } from "./student-list";

export function Workspace() {
  return (
    <div className="workspace-content mx-auto max-w-5xl">
      <header className="page-heading"><p className="eyebrow">КЕРУВАННЯ СТУДЕНТАМИ</p><h1>Список студентів</h1><p>Ваші email — основа роботи з Classroom і Google Chat.</p></header>
      <Link className="mb-6 inline-block rounded-lg border px-5 py-3 text-blue-700" href="/grades">Лабораторні та оцінки →</Link>
      <StudentList />
    </div>
  );
}
