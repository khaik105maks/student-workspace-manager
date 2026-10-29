import type { ChatMember, Student, StudentMatch, SyncSnapshot } from "./sync.value";

export function matchStudents(emails: ReadonlyArray<string>, snapshot: SyncSnapshot): ReadonlyArray<StudentMatch> {
  const students = new Map(snapshot.students.map((student) => [student.email.toLowerCase(), student]));
  const members = new Map(snapshot.members.filter((member) => member.kind === "human").map((member) => [member.identity.replace(/^users\//, ""), member]));
  return emails.map((email) => {
    const student = students.get(email.toLowerCase());
    const member = members.get(student?.id ?? "") ?? members.get(email.toLowerCase());
    return invitationMatch(studentMatch(email, student, member), snapshot);
  });
}

function chatStatus(member: ChatMember | undefined, hasIdentity: boolean): string {
  if (member === undefined) return hasIdentity ? "Немає" : "Не вдалося зіставити";
  const labels: Readonly<Record<string, string>> = { joined: "Є", invited: "Запрошено", "not-member": "Немає" };
  return labels[member.status] ?? "Не вдалося визначити";
}

function studentMatch(email: string, student: Student | undefined, member: ChatMember | undefined): StudentMatch {
  return { email, userId: student?.id ?? "", classroom: student ? "Є" : "Немає", chat: chatStatus(member, student !== undefined) };
}

function invitationMatch(match: StudentMatch, snapshot: SyncSnapshot): StudentMatch {
  if (match.classroom === "Є") return match;
  const invitation = snapshot.invitations?.find((pending) => pending.email.toLowerCase() === match.email.toLowerCase());
  if (!invitation) return match;
  const member = snapshot.members.find((candidate) => candidate.identity === `users/${invitation.userId}` && candidate.kind === "human");
  return { ...match, classroom: "Запрошено", userId: invitation.userId, chat: chatStatus(member, true) };
}
