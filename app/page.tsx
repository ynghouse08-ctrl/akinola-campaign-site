import Link from "next/link";
import Countdown from "@/components/Countdown";
import { CAMPAIGN } from "@/lib/config";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-paper">
      {/* Hero */}
      <section className="bg-forest text-paper">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
          <p className="text-sm tracking-wide text-goldsoft">
            {CAMPAIGN.union} · {CAMPAIGN.level}
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight sm:text-6xl">
            {CAMPAIGN.name}
            <span className="block text-gold">for {CAMPAIGN.position}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-paper/85">
            {CAMPAIGN.tagline} A platform built for EKSU students — calculate
            your GPA and CGPA, check live transport prices, and follow the
            campaign.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="rounded-md bg-gold px-6 py-3 font-medium text-ink transition hover:bg-goldsoft"
            >
              Create your account
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-paper/30 px-6 py-3 font-medium text-paper transition hover:border-paper/60"
            >
              Sign in
            </Link>
          </div>

          <div className="mt-12">
            <Countdown />
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="font-display text-3xl text-ink">
          What this campaign stands for
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {CAMPAIGN.pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-lg border border-line bg-panel p-6"
            >
              <h3 className="font-display text-lg text-forest">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/75">
                {pillar.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* What the platform does */}
      <section className="border-y border-line bg-panel">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="font-display text-3xl text-ink">
            Built for students, not just for votes
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="font-medium text-forest">
                GPA &amp; CGPA calculator
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/75">
                Work out your semester GPA or your running CGPA in seconds,
                and keep a saved history so you can track your progress
                across semesters.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-forest">
                Live transport prices
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/75">
                Search current fares from Ado-Ekiti to major destinations —
                kept accurate and up to date, not a one-time flier.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Declaration excerpt */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="font-display text-2xl text-ink">Declaration of intent</h2>
        <p className="mt-4 text-base leading-relaxed text-ink/80">
          {CAMPAIGN.declaration}
        </p>
        <p className="mt-6 font-display text-lg text-forest">
          — {CAMPAIGN.name}
        </p>
      </section>

      <footer className="bg-ink py-8 text-center text-sm text-paper/60">
        {CAMPAIGN.hashtag} · {CAMPAIGN.name} for {CAMPAIGN.position}
      </footer>
    </main>
  );
}
