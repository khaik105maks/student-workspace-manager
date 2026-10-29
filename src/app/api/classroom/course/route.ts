import { ClassroomFactory } from "@/bootstrap/classroom.factory";
import { createCredentialService } from "@/bootstrap/credential.factory";
import { serverEnv } from "@/bootstrap/server-env.schema";
import { CourseResolver } from "@/modules/classroom/adapters/driving/http/course.resolver";

export async function GET(request: Request): Promise<Response> {
  try {
    const environment = serverEnv();
    const credential = await requireCredential(request, environment);
    const factory = new ClassroomFactory({ accessToken: credential.accessToken, auditPath: environment.auditPath });
    const courses = await new CourseResolver(factory.createListCourseCase()).resolve();
    return Response.json({ courses });
  } catch (failure: unknown) {
    return classroomFailureResponse(failure);
  }
}

async function requireCredential(request: Request, environment: ReturnType<typeof serverEnv>) {
  const credential = await createCredentialService(environment).read(request);
  if (credential === null) throw new UnauthorizedError();
  return credential;
}

function classroomFailureResponse(failure: unknown): Response {
  if (failure instanceof UnauthorizedError) return Response.json({ message: "Unauthorized" }, { status: 401 });
  return Response.json({ message: "Classroom course list failed" }, { status: 502 });
}

class UnauthorizedError extends Error {}
