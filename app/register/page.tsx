"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    matricNumber: "",
    jambRegNumber: "",
    level: "100 Level",
    faculty: "",
    department: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          matric_number: form.matricNumber,
          jamb_reg_number: form.jambRegNumber,
          level: form.level,
          faculty: form.faculty,
          department: form.department,
          phone: form.phone,
        },
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <p className="text-sm tracking-wide text-forest">
                        EKSU Student Hub
          </p>
          <h1 className="mt-2 font-display text-3xl text-ink">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-ink/60">
            Sign up to use the GPA calculator and live transport prices.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border border-line bg-panel p-6"
        >
          <div>
            <label className="text-xs font-medium text-ink/70">
              Full name
            </label>
            <input
              required
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-forest"
              placeholder="e.g. Adeola Grace Funmi"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink/70">Email</label>
                       <input
              required
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-ink/70">
                Matric number
              </label>
              <input
                value={form.matricNumber}
                onChange={(e) => update("matricNumber", e.target.value)}
                className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-forest"
                placeholder="e.g. 210102001"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink/70">
                JAMB reg. number
              </label>
              <input
                value={form.jambRegNumber}
                onChange={(e) => update("jambRegNumber", e.target.value)}
                className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-forest"
                placeholder="If you don't have a matric number yet"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-ink/70">Level</label>
            <select
              value={form.level}
              onChange={(e) => update("level", e.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-forest"
            >
              {["100 Level", "200 Level", "300 Level", "400 Level", "500 Level"].map(
                (lvl) => (
                  <option key={lvl}>{lvl}</option>
                )
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-ink/70">
                Faculty
              </label>
              <input
                value={form.faculty}
                onChange={(e) => update("faculty", e.target.value)}
                className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-forest"
                placeholder="e.g. Engineering"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink/70">
                Department
              </label>
              <input
                value={form.department}
                onChange={(e) => update("department", e.target.value)}
                className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-forest"
                placeholder="e.g. Computer Engineering"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-ink/70">
              Phone number
            </label>
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-forest"
              placeholder="08012345678"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-ink/70">
                Password
              </label>
                           <input
                required
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-forest"
                placeholder="Min. 8 characters"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink/70">
                Confirm password
              </label>
                           <input
                required
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-forest"
                placeholder="Re-enter password"
              />
            </div>
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
            {loading ? "Creating account…" : "Complete registration"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          Already have an account?{" "}
          <Link href="/login" className="text-forest underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
