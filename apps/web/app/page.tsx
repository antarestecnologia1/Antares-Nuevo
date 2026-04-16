"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";

export default function HomePage() {
  const { session, isAuthenticated, isLoading, login, logout, message, clearMessage } =
    useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    clearMessage();
    try {
      await login(email, password);
      setPassword("");
    } catch (err) {
      const text = err instanceof Error ? err.message : "No fue posible iniciar sesión.";
      setError(text);
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-brand-light">
        <p className="rounded-md bg-white px-4 py-2 text-sm text-slate-700">
          Cargando sesión...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-light">
      <section className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-20">
        <span className="w-fit rounded-full bg-white px-4 py-1 text-sm font-semibold text-brand-dark">
          Next.js 14 + TypeScript + Tailwind + shadcn/ui
        </span>
        <h1 className="max-w-3xl text-4xl font-extrabold text-brand-dark md:text-5xl">
          Plataforma logística de transporte de flores
        </h1>
        <p className="max-w-2xl text-base text-slate-700 md:text-lg">
          La autenticación incluye renovación automática del token y cierre de
          sesión por 30 minutos de inactividad.
        </p>

        {!isAuthenticated ? (
          <form
            onSubmit={handleLogin}
            className="max-w-md rounded-xl border border-sky-100 bg-white p-5 shadow-sm"
          >
            <h2 className="mb-3 text-xl font-bold text-brand-dark">Iniciar sesión</h2>
            <div className="mb-3 space-y-1">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">
                Correo
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="mb-4 space-y-1">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="password"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {message ? (
              <p className="mb-3 rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-900">
                {message}
              </p>
            ) : null}
            {error ? (
              <p className="mb-3 rounded-md bg-rose-100 px-3 py-2 text-sm text-rose-900">
                {error}
              </p>
            ) : null}
            <Button size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
        ) : (
          <article className="max-w-2xl rounded-xl border border-sky-100 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-2xl font-bold text-brand-dark">
              Sesión activa
            </h2>
            <p className="text-slate-700">
              Usuario: <strong>{session?.email}</strong>
            </p>
            <p className="text-slate-700">
              Rol: <strong>{session?.role}</strong>
            </p>
            <p className="mt-3 text-sm text-slate-600">
              Si no hay interacción en la página durante 30 minutos, el sistema
              cerrará sesión automáticamente.
            </p>
            <div className="mt-4">
              <Button variant="outline" size="lg" onClick={() => logout()}>
                Cerrar sesión
              </Button>
            </div>
          </article>
        )}
      </section>
    </main>
  );
}
