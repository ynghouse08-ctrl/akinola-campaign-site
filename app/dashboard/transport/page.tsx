"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Route = {
  id: string;
  origin: string;
  destination: string;
  park_name: string | null;
  price: number;
};

export default function TransportPage() {
  const supabase = createClient();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  const [suggestion, setSuggestion] = useState("");
  const [note, setNote] = useState("");
  const [suggestMsg, setSuggestMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("transport_routes")
        .select("id, origin, destination, park_name, price")
        .order("destination", { ascending: true });
      setRoutes(data ?? []);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitSuggestion(e: React.FormEvent) {
    e.preventDefault();
    if (!suggestion.trim()) return;
    setSubmitting(true);
    setSuggestMsg(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("transport_suggestions").insert({
      destination: suggestion.trim(),
      note: note.trim() || null,
      submitted_by: user?.id ?? null,
    });

    setSubmitting(false);
    if (error) {
      setSuggestMsg("Something went wrong — try again.");
      return;
    }
    setSuggestion("");
    setNote("");
    setSuggestMsg("Thanks! We'll review it and add it soon.");
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl text-ink">Transport prices</h1>
      <p className="mt-2 text-sm text-ink/60">
        Current fares from Ado-Ekiti. Kept up to date by the campaign team.
      </p>

      <div className="mt-6 overflow-hidden rounded-lg border border-line">
        {loading ? (
          <p className="px-4 py-6 text-sm text-ink/50">Loading…</p>
        ) : routes.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink/50">
            No routes added yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-paper text-left text-ink/60">
              <tr>
                <th className="px-4 py-2 font-medium">Route</th>
                <th className="px-4 py-2 font-medium">Park</th>
                <th className="px-4 py-2 font-medium text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <td className="px-4 py-2 font-medium text-ink">
                    {r.origin} → {r.destination}
                  </td>
                  <td className="px-4 py-2 text-ink/60">
                    {r.park_name || "—"}
                  </td>
                  <td className="px-4 py-2 text-right font-medium text-forest">
                    ₦{Number(r.price).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-4 text-xs text-ink/40">
        Prices are sample figures pending confirmation.
      </p>

      <div className="mt-8 rounded-lg border border-line bg-panel p-6">
        <h3 className="font-display text-lg text-forest">
          Don&apos;t see your destination?
        </h3>
        <p className="mt-1 text-sm text-ink/60">
          Let us know where you&apos;re headed and we&apos;ll add it once we
          confirm the fare.
        </p>
        <form onSubmit={submitSuggestion} className="mt-4 space-y-3">
          <input
            required
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="Destination, e.g. Osogbo"
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-forest"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any extra detail (optional) — park name, price you paid, etc."
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-forest"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-forest disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit suggestion"}
          </button>
          {suggestMsg && <p className="text-sm text-ink/60">{suggestMsg}</p>}
        </form>
      </div>
    </div>
  );
}
