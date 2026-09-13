"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data: email, error: lookupError } = await supabase.rpc(
      "email_for_username",
      { p_username: username.trim() }
    );

    if (lookupError || !email) {
      setLoading(false);
      setError("We couldn't find an account with that number.");
      return;
    }

    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setLoading(false);
      setError("Incorrect password. Please try again.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", signInData.user.id)
      .single();

    setLoading(false);

    const next =
      searchParams.get("next") ||
      (profile?.role === "admin" ? "/admin" : "/dashboard");
    router.push(next);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm tracking-wide text-forest">
            Akinola for Financial Secretary
          </p>
          <h1 className="mt-2 font-display text-3xl text-ink">Sign in</h1>
        </div>

        <div className="mb-6 rounded-lg border border-gold/40 bg-goldsoft/40 p-4 text-sm text-ink/80">
          <p className="font-medium text-forest">Login notice</p>
          <p className="mt-2">
            <span className="font-medium">For students:</span> Username =
            your JAMB Registration Number or Matric Number · Password = the
            password you created at registration.
          </p>
          <p className="mt-2">
            <span className="font-medium">For admin:</span> Username = your
            Matric Number · Password = your assigned admin password.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border border-line bg-panel p-6"
        >
          <div>
            <label className="text-xs font-medium text-ink/70">
              JAMB reg. number or matric number
            </label>
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-forest"
              placeholder="e.g. 210102001"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ink/70">
              Password
            </label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-forest"
              placeholder="Your password"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-ink py-3 text-sm font-medium text-paper transition hover:bg-forest disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-forest underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
