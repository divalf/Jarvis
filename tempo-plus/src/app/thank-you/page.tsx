import Link from "next/link";

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Você está na lista.
        </h1>
        <p className="mt-4 text-slate-600">
          Quando abrirmos o beta, você recebe primeiro. Até lá: um passo por vez.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Voltar para a Landing
        </Link>
      </div>
    </main>
  );
}
