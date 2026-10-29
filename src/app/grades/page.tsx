import Link from "next/link";
import { auth } from "@/bootstrap/auth.factory";
import { AuthButton } from "../auth-button";
import { GradePanel } from "./grade-panel";
export default async function GradesPage() {
  const session = await auth();
  return <div className="app-shell"><header className="app-header"><Link className="brand" href="/">← Список студентів</Link><AuthButton isAuthenticated={session !== null} /></header>
    <main className="app-main grade-main"><div className="mx-auto max-w-7xl"><header className="page-heading"><p className="eyebrow">GOOGLE CLASSROOM</p><h1>Лабораторні та оцінки</h1><p>Завдання курсу, оцінки й статуси здачі студентів.</p></header>
      {session ? <GradePanel /> : <p>Увійдіть університетським обліковим записом, щоб переглянути оцінки.</p>}
    </div></main></div>;
}
