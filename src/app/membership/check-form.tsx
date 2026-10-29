"use client";

import { useState } from "react";

import { checkMemberResponseSchema } from "@/modules/membership/adapters/driving/http/check.schema";
import type { MembershipView } from "@/modules/membership/adapters/driving/http/check.type";

import { MembershipTable } from "./membership-table";

export function CheckForm() {
  const [memberships, setMemberships] = useState<ReadonlyArray<MembershipView>>([]);
  const [failureMessage, setFailureMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(form: FormData) {
    setIsLoading(true);
    setFailureMessage("");
    try {
      setMemberships(await checkMemberships(form));
    } catch (failure: unknown) {
      setFailureMessage(failure instanceof Error ? failure.message : "Не вдалося виконати перевірку");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="grid gap-6 rounded-2xl border border-zinc-200 p-6">
      <CheckFields action={submit} isLoading={isLoading} />
      {failureMessage && <p role="alert" className="text-sm text-red-700">{failureMessage}</p>}
      <MembershipTable memberships={memberships} />
    </section>
  );
}

function CheckFields({ action, isLoading }: CheckFieldsProps) {
  return (
    <form action={action} className="grid gap-4">
      <label className="grid gap-2 text-sm font-medium">
        Email студентів — кожен з нового рядка
        <textarea disabled={isLoading} placeholder="student@student.khai.edu" className="min-h-48 rounded-lg border p-3 font-mono text-sm" name="emails" required />
      </label>
      <button className="rounded-lg bg-blue-700 px-5 py-3 font-medium text-white disabled:opacity-50" disabled={isLoading} type="submit">
        {isLoading ? "Перевіряємо…" : "Перевірити склад"}
      </button>
    </form>
  );
}

async function checkMemberships(form: FormData): Promise<ReadonlyArray<MembershipView>> {
  const response = await fetch("/api/membership/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emails: emailLines(form) }),
  });
  if (!response.ok) throw new Error(`Перевірка завершилася з кодом ${response.status}`);
  const payload: unknown = await response.json();
  return checkMemberResponseSchema.parse(payload).memberships;
}

function emailLines(form: FormData): ReadonlyArray<string> {
  return String(form.get("emails") ?? "").split(/\r?\n/).filter(Boolean);
}

interface CheckFieldsProps {
  readonly action: (form: FormData) => Promise<void>;
  readonly isLoading: boolean;
}
