import { workspaceStateSchema } from "@/modules/workspace/adapters/driving/http/workspace.schema";

export async function readWorkspace() {
  return parseWorkspace(await fetch("/api/workspace"));
}

export async function writeWorkspace(action: "select" | "sync", courseId?: string) {
  return parseWorkspace(await fetch("/api/workspace", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, courseId, isHumanConfirmed: true }),
  }));
}

async function parseWorkspace(response: Response) {
  if (!response.ok) throw new Error("Не вдалося оновити дані. Перевірте доступ до Google та спробуйте ще раз. Попередній знімок збережено.");
  const payload: unknown = await response.json();
  return workspaceStateSchema.parse(payload);
}
