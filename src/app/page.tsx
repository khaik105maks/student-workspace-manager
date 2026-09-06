const capabilities: ReadonlyArray<string> = [
  "Перевірка складу Google Chat",
  "Безпечне додавання після підтвердження",
  "Журнал зовнішніх змін",
];

function CapabilityList() {
  return (
    <ul className="grid gap-3 text-sm text-zinc-700">
      {capabilities.map((capability) => (
        <li className="rounded-xl border border-zinc-200 p-4" key={capability}>
          {capability}
        </li>
      ))}
    </ul>
  );
}

export default function HomePage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-3xl content-center gap-8 p-8">
      <header className="grid gap-3">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">ХАІ</p>
        <h1 className="text-4xl font-semibold tracking-tight">Student Workspace Manager</h1>
        <p className="text-zinc-600">Керування складом навчальних просторів.</p>
      </header>
      <CapabilityList />
    </main>
  );
}
