import { signIn, signOut } from "../bootstrap/auth.factory";

interface AuthButtonProps {
  readonly isAuthenticated: boolean;
}

export function AuthButton({ isAuthenticated }: AuthButtonProps) {
  return isAuthenticated ? <SignOutButton /> : <SignInButton />;
}

function SignInButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google");
      }}
    >
      <button className="rounded-lg bg-blue-700 px-5 py-3 font-medium text-white" type="submit">
        Увійти через Google
      </button>
    </form>
  );
}

function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <button className="rounded-lg border border-zinc-300 px-5 py-3 font-medium" type="submit">
        Вийти
      </button>
    </form>
  );
}
