"use client";
import { useEffect, useState } from "react";
import type { GradeBook } from "@/modules/classroom/domain/grade.value";
import { readGradeBook } from "./grade.service";
import { GradeTable } from "./grade-table";
export function GradeReport({ courseId }: { readonly courseId: string }) {
  const [book, setBook] = useState<GradeBook | null>(null);
  const [failure, setFailure] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const [updatedAt, setUpdatedAt] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    readGradeBook(courseId, controller.signal).then((loaded) => { setBook(loaded); setUpdatedAt(new Date().toLocaleString("uk-UA")); }).catch((error: unknown) => { if (!controller.signal.aborted) setFailure(error instanceof Error ? error.message : "Помилка завантаження."); }).finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  }, [courseId, revision]);
  function refresh() { setIsLoading(true); setFailure(""); setRevision((previous) => previous + 1); }
  return <div className="grid gap-4"><div className="grade-refresh"><button className="grade-refresh-button" type="button" disabled={isLoading} onClick={refresh}>{isLoading ? "Завантажуємо…" : "Оновити оцінки"}</button>{updatedAt && <p className="text-sm text-zinc-500">Оновлено: {updatedAt}</p>}</div>
    {failure && <p role="alert" className="text-red-700">{failure} Дані не оновлено.</p>}
    {book && <GradeTable book={book} />}
    <p className="grade-footnote">Оцінки з Google Classroom · Натисніть «Відкрити роботу», щоб переглянути здачу. Позначка «Чернетка» означає попередню оцінку.</p>
  </div>;
}
