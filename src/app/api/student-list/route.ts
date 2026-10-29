import type { AuthCredential } from "@/modules/auth/adapters/driving/next-auth/credential.type";

import { ZodError } from "zod";

import { ClassroomFactory } from "@/bootstrap/classroom.factory";
import { createCredentialService } from "@/bootstrap/credential.factory";
import { serverEnv } from "@/bootstrap/server-env.schema";

export async function GET(request: Request): Promise<Response> {
  return respond(request, false);
}

export async function POST(request: Request): Promise<Response> {
  if (request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ message: "Forbidden" }, { status: 403 });
  return respond(request, true);
}

async function respond(request: Request, isWrite: boolean): Promise<Response> {
  try {
    const environment = serverEnv();
    const credential = requireIdentity(await createCredentialService(environment).read(request));
    const resolver = new ClassroomFactory({ accessToken: credential.accessToken, auditPath: environment.auditPath }).createImportRosterResolver();
    const roster = isWrite ? await resolver.save(await request.json(), credential.email) : await resolver.read(credential.email);
    return Response.json({ roster }, { headers: { "Cache-Control": "no-store" } });
  } catch (failure: unknown) {
    const status = failureStatus(failure);
    return Response.json({ message: "Не вдалося прочитати або зберегти список курсу." }, { status });
  }
}

function requireIdentity(credential: AuthCredential | null): AuthCredential {
  if (credential === null) throw new UnauthorizedError();
  return credential;
}

function failureStatus(failure: unknown): number {
  if (failure instanceof UnauthorizedError) return 401;
  return failure instanceof ZodError ? 400 : 502;
}

class UnauthorizedError extends Error {}
