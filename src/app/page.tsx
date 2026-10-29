import Link from "next/link";

import { auth } from "@/bootstrap/auth.factory";

import { AuthButton } from "./auth-button";
import { Workspace } from "./workspace";

export default async function HomePage() {
  const session = await auth();
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">Перейти до вмісту</a>
      <header className="app-header">
        <Link className="brand" href="/"><span className="brand-mark">ХАІ</span><span>Навчальні простори<small>Student Workspace Manager</small></span></Link>
        {session !== null && <AuthButton isAuthenticated />}
      </header>
      <main id="main" className="app-main">
        {session === null ? <Welcome /> : <Workspace />}
      </main>
    </div>
  );
}

function Welcome() {
  return (
    <section className="welcome">
      <p className="eyebrow">GOOGLE CHAT · CLASSROOM</p>
      <h1>Навчальні групи.<br />Усе під контролем.</h1>
      <p className="welcome-description">Переглядайте учасників Chat, перевіряйте списки студентів і запрошуйте їх до Classroom в одному місці.</p>
      <AuthButton isAuthenticated={false} />
      <p className="text-sm text-zinc-500">Увійдіть університетським обліковим записом Google.</p>
      <ol className="welcome-steps"><li><span>01</span>Оберіть курс</li><li><span>02</span>Перевірте список</li><li><span>03</span>Підтвердьте запрошення</li></ol>
    </section>
  );
}
