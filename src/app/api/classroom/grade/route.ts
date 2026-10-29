import { ZodError } from "zod";
import { ClassroomFactory } from "@/bootstrap/classroom.factory";
import { createCredentialService } from "@/bootstrap/credential.factory";
import { serverEnv } from "@/bootstrap/server-env.schema";
import { GradeRequestError } from "@/modules/classroom/adapters/driven/google/grade.service";
export async function GET(request: Request): Promise<Response> {
  try {
    const environment = serverEnv();
    const credential = await requireCredential(request, environment);
    const factory = new ClassroomFactory({ accessToken: credential.accessToken, auditPath: environment.auditPath });
    return reply(await factory.createGradeResolver().resolve({ courseId: new URL(request.url).searchParams.get("courseId") }), 200);
  } catch (failure: unknown) { return failureResponse(failure); }
}
function failureResponse(failure: unknown) {
  if (failure instanceof UnauthorizedError) return reply({ message: "Сесія завершилася. Увійдіть повторно." }, 401);
  if (failure instanceof ZodError) return reply({ message: "Некоректні дані курсу або відповідь Classroom." }, 400);
  if (failure instanceof GradeRequestError && failure.statusCode === 403) return reply({ message: "Немає доступу до оцінок. Вийдіть і увійдіть знову, надавши дозвіл на читання робіт. Потрібен доступ викладача до курсу." }, 403);
  return reply({ message: "Не вдалося завантажити оцінки. Спробуйте ще раз." }, 502);
}
function reply(payload: unknown, status: number) { return Response.json(payload, { status, headers: { "Cache-Control": "no-store" } }); }

async function requireCredential(request: Request, environment: ReturnType<typeof serverEnv>) {
  const credential = await createCredentialService(environment).read(request);
  if (!credential) throw new UnauthorizedError();
  return credential;
}
class UnauthorizedError extends Error {}
