"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Route = {
  id: string;
  origin: string;
  destination: string;
  park_name: string | null;
  price: number;
  updated_at: string;
};

export default function TransportPage() {
  const supabase = createClient();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("transport_routes")
        .select("id, origin, destination, park_name, price, updated_at")
        .order("destination", { ascending: true });
      setRoutes(data ?? []);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return routes;
    return routes.filter(
      (r) =>
        r.destination.toLowerCase().includes(q) ||
        r.park_name?.toLowerCase().includes(q)
    );
  }, [routes, query]);

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl text-ink">Transport prices</h1>
      <p className="mt-2 text-sm text-ink/60">
        Current fares from Ado-Ekiti. Kept up to date by the campaign team.
      </p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a destination, e.g. Lagos"
        className="mt-6 w-full rounded-md border border-line bg-panel px-4 py-3 text-sm outline-none focus:border-forest"
      />

      <div className="mt-6 overflow-hidden rounded-lg border border-line">
        {loading ? (
          <p className="px-4 py-6 text-sm text-ink/50">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink/50">
            No routes match &quot;{query}&quot;.
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
              {filtered.map((r) => (
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
        Prices are sample figures pending confirmation — update them in the
        Supabase table (admin panel coming soon).
      </p>
    </div>
  );
}
