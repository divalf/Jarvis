import { signIn } from "@/lib/auth";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Entrar</h1>
        <p className="mt-2 text-sm text-slate-600">
          Faça login para acessar seu Dashboard.
        </p>

        <form
          className="mt-6"
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/app" });
          }}
        >
          <button
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            type="submit"
          >
            Continuar com Google
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-500">
          (MVP) Outras opções de login entram depois.
        </p>
      </div>
    </main>
  );
}
