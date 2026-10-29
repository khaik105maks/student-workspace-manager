# Student Workspace Manager

Internal KhAI tool for reconciling student rosters with Google Chat and Google
Classroom. The application uses TypeScript, Next.js, and Ports and Adapters.

## Requirements

- Node.js 24
- npm 11+

## Start locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Google OAuth

Copy `.env.example` to `.env.local` and set `AUTH_SECRET`, `AUTH_GOOGLE_ID`, and
`AUTH_GOOGLE_SECRET`. Set `GOOGLE_CHAT_SPACE_ID` to the single managed Chat
space resource name, for example `spaces/AAAA...`. Use a Google OAuth client of type **Web application** with
this local redirect URI:

```text
http://localhost:3000/api/auth/callback/google
```

Only root `@khai.edu` accounts are accepted. Authentication requests the
read-only Google Chat membership scope; access tokens stay in the encrypted
server session and are never exposed in the public session payload.

Authenticated users can check up to 500 addresses with:

```text
POST /api/membership/check
```

The route reads the OAuth token only from the encrypted Auth.js session cookie,
revalidates the account domain, refreshes expired Google access tokens on the
server, and returns only email/status membership views.

## Architecture

Read these contracts before changing production code:

- [`docs/architecture.md`](docs/architecture.md)
- [`docs/clean-code.md`](docs/clean-code.md)
- [`docs/naming.md`](docs/naming.md)
- [`AGENTS.md`](AGENTS.md)

Business capabilities live under `src/modules`. Next.js is a delivery adapter;
Google APIs, persistence, and AI are driven adapters.

## Quality gate

```bash
npm run check
```

The command runs ESLint, strict TypeScript, dependency rules, unit tests, and a
production build. GitHub Actions runs the same command for every pull request
and push to `main`.

## Security

Never commit OAuth client secrets, tokens, roster imports, or generated reports.
External writes require explicit human confirmation and an audit record.
Operational logs are structured JSON produced by Pino and exclude member email
addresses. Authorization headers and access-token fields are redacted. Audit
records remain in the configured JSONL repository and must be access-controlled.

### Локальна база email

Після входу застосунок читає ваш основний список із SQLite. Якщо список порожній,
показує форму введення email. Вставте до 500 адрес (нові рядки, пробіли, коми або
крапки з комою) і натисніть «Зберегти список і продовжити». Адреси нормалізуються,
дублікати видаляються. Некоректний список не замінює збережений.

Після введення списку окремий блок «Поточний курс» дозволяє обрати Classroom-курс.
Вибір зберігається в SQLite для облікового запису й налаштованого Chat-простору
та відновлюється після перезавантаження. Кнопка **Sync** завантажує всі сторінки
переліку курсів, студентів обраного курсу та учасників Chat. Новий знімок
зберігається лише після успіху всіх запитів; помилка залишає попередній знімок.

Таблиця зіставляє Google user ID учасників Chat зі студентами Classroom,
потім email — з локальним списком. Для email без доступного Google ID статус Chat
«Не вдалося зіставити», а не «Немає». Знімки ізольовані за викладачем, курсом і
Chat-простором та зберігають повні списки й час синхронізації. Після оновлення
сторінки таблиця будується з локального знімка. Sync не додає учасників у Google.
Вибір курсу й запис знімка супроводжуються транзакційним журналом `workspace_audit`.
Модуль `workspace` володіє синхронізацією і зіставленням; `src/bootstrap` підключає
наявні Classroom і Chat use cases до його портів.

Файл `data/classroom.sqlite` виключений із Git. Використовується вбудований
`node:sqlite` у Node.js 24, окремий сервер не потрібен. Основний список ізольований
за обліковим записом викладача; ключ `local:student-list` відокремлює його від
раніше імпортованих Classroom-курсів. Імпортовані раніше списки не видаляються
і не підставляються автоматично. Запис списку та журналу `roster_audit` виконується
однією транзакцією.

`GET /api/student-list` читає основний список після авторизації.
`POST /api/student-list` приймає `{ emails, isHumanConfirmed: true }`.

### Повторне запрошення в Classroom

Sync також завантажує всі сторінки запрошень студентів і визначає їх email через
Google Classroom userProfiles. У таблиці з’являється статус «Запрошено».
Старі локальні знімки залишаються сумісними; для нових статусів виконайте Sync.

«Запросити / повторити» відкриває підтвердження для конкретної адреси й курсу.
Сервер повторно перевіряє участь студента, знаходить чинне запрошення й за потреби
видаляє його перед створенням нового. Операції та часткові помилки записуються
в audit.jsonl. Видалення й створення в Google не є однією транзакцією: якщо
створення не вдалося, старого запрошення вже може не бути. UI показує це окремо.
Після успішного запрошення таблиця автоматично запускає Sync. Якщо оновлення
не вдалося, показується повідомлення; Sync можна повторити вручну.
Створення запрошення не гарантує доставку email.

### Лабораторні та оцінки

Сторінка `/grades` доступна через «Лабораторні та оцінки» на головній сторінці.
Вона підставляє збережений курс і дозволяє обрати інший для перегляду.
Показує всі опубліковані завдання Classroom, опис, дедлайн, максимальний бал,
оцінки (окремо чернетки), статуси здачі та посилання на роботи. Є пошук за назвою
завдання та ім’ям/email студента. Відсутня оцінка відрізняється від нуля.
Таблиця містить поточних студентів Classroom, а не лише локальний список email.

Потрібно повторно увійти з Google та надати новий дозвіл
`classroom.coursework.students.readonly`. Перегляд усіх здач потребує прав
викладача відповідного курсу. `GET /api/classroom/grade?courseId=...` читає всі
сторінки завдань і здач із Google; відповідь не кешується. Кнопка «Оновити оцінки»
повторює читання. При помилці попередня таблиця залишається з повідомленням.
Оцінки поки не зберігаються в SQLite; файли відкриваються в Classroom.
Виставлення чи зміна оцінок не виконується.
