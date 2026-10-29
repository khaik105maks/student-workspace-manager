import { ClassroomFactory } from "@/bootstrap/classroom.factory";
import { createCredentialService } from "@/bootstrap/credential.factory";
import { serverEnv } from "@/bootstrap/server-env.schema";
import { PreviewInviteResolver } from "@/modules/classroom/adapters/driving/http/preview-invite.resolver";

export async function POST(request: Request): Promise<Response> {
  try {
    const environment = serverEnv();
    const credential = await requireCredential(request, environment);
    const factory = new ClassroomFactory({ accessToken: credential.accessToken, auditPath: environment.auditPath });
    const payload: unknown = await request.json();
    const invitations = await new PreviewInviteResolver(factory.createPreviewInviteCase()).resolve(payload);
    return Response.json({ invitations });
  } catch (failure: unknown) {
    return failureResponse(failure);
  }
}

async function requireCredential(request: Request, environment: ReturnType<typeof serverEnv>) {
  const credential = await createCredentialService(environment).read(request);
  if (credential === null) throw new UnauthorizedError();
  return credential;
}

function failureResponse(failure: unknown): Response {
  if (failure instanceof UnauthorizedError) return Response.json({ message: "Unauthorized" }, { status: 401 });
  return Response.json({ message: "Invitation preview failed" }, { status: 400 });
}

class UnauthorizedError extends Error {}
