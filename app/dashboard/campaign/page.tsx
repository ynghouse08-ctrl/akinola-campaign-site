import Countdown from "@/components/Countdown";
import { CAMPAIGN } from "@/lib/config";

export default function CampaignPage() {
  return (
    <div className="max-w-3xl">
      <div className="rounded-lg bg-forest px-8 py-10 text-paper">
        <p className="text-sm text-goldsoft">
          {CAMPAIGN.union} · {CAMPAIGN.level}
        </p>
        <h1 className="mt-4 font-display text-3xl leading-tight">
          {CAMPAIGN.name}
          <span className="block text-gold">for {CAMPAIGN.position}</span>
        </h1>
        <p className="mt-4 text-paper/85">{CAMPAIGN.tagline}</p>
        <div className="mt-6">
          <Countdown />
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {CAMPAIGN.pillars.map((pillar) => (
          <div
            key={pillar.title}
            className="rounded-lg border border-line bg-panel p-5"
          >
            <h3 className="font-display text-lg text-forest">
              {pillar.title}
            </h3>
            <p className="mt-2 text-sm text-ink/75">{pillar.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-line bg-panel p-6">
        <h2 className="font-display text-xl text-ink">
          Declaration of intent
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink/80">
          {CAMPAIGN.declaration}
        </p>
        <p className="mt-4 font-display text-forest">— {CAMPAIGN.name}</p>
      </div>
    </div>
  );
}
