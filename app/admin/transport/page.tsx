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

export default function AdminTransportPage() {
  const supabase = createClient();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newRoute, setNewRoute] = useState({
    destination: "",
    park_name: "",
    price: "",
  });

  useEffect(() => {
    loadRoutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadRoutes() {
    setLoading(true);
    const { data } = await supabase
      .from("transport_routes")
      .select("id, origin, destination, park_name, price")
      .order("destination", { ascending: true });
    setRoutes(data ?? []);
    setLoading(false);
  }

  function updateLocal(id: string, patch: Partial<Route>) {
    setRoutes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  }

  async function saveRoute(route: Route) {
    setSavingId(route.id);
    setError(null);
    const { error: updateError } = await supabase
      .from("transport_routes")
      .update({
        destination: route.destination,
        park_name: route.park_name,
        price: route.price,
        updated_at: new Date().toISOString(),
      })
      .eq("id", route.id);
    setSavingId(null);
    if (updateError) setError(updateError.message);
  }

  async function deleteRoute(id: string) {
    setSavingId(id);
    setError(null);
    const { error: deleteError } = await supabase
      .from("transport_routes")
      .delete()
      .eq("id", id);
    setSavingId(null);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setRoutes((prev) => prev.filter((r) => r.id !== id));
  }

  async function addRoute() {
    if (!newRoute.destination || !newRoute.price) return;
    setError(null);
    const { data, error: insertError } = await supabase
      .from("transport_routes")
      .insert({
        destination: newRoute.destination,
        park_name: newRoute.park_name || null,
        price: Number(newRoute.price),
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      return;
    }
    setRoutes((prev) => [...prev, data as Route]);
    setNewRoute({ destination: "", park_name: "", price: "" });
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Transport prices</h1>
      <p className="mt-2 text-sm text-ink/60">
        Edit a row and click Save, or add a new route below. Changes appear
        on the student side immediately.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-line">
        {loading ? (
          <p className="px-4 py-6 text-sm text-ink/50">Loading…</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-paper text-left text-ink/60">
              <tr>
                <th className="px-4 py-2 font-medium">Destination</th>
                <th className="px-4 py-2 font-medium">Park</th>
                <th className="px-4 py-2 font-medium">Price (₦)</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <td className="px-4 py-2">
                    <input
                      value={r.destination}
                      onChange={(e) =>
                        updateLocal(r.id, { destination: e.target.value })
                      }
                      className="w-full rounded-md border border-line px-2 py-1.5 outline-none focus:border-forest"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      value={r.park_name ?? ""}
                      onChange={(e) =>
                        updateLocal(r.id, { park_name: e.target.value })
                      }
                      className="w-full rounded-md border border-line px-2 py-1.5 outline-none focus:border-forest"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={r.price}
                      onChange={(e) =>
                        updateLocal(r.id, { price: Number(e.target.value) })
                      }
                      className="w-28 rounded-md border border-line px-2 py-1.5 outline-none focus:border-forest"
                    />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-2 text-xs">
                      <button
                        disabled={savingId === r.id}
                        onClick={() => saveRoute(r)}
                        className="rounded bg-ink px-2 py-1 text-paper hover:bg-forest disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        disabled={savingId === r.id}
                        onClick={() => deleteRoute(r.id)}
                        className="rounded border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-8 rounded-lg border border-line bg-panel p-5">
        <h3 className="font-medium text-forest">Add a new route</h3>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <input
            value={newRoute.destination}
            onChange={(e) =>
              setNewRoute((n) => ({ ...n, destination: e.target.value }))
            }
            placeholder="Destination, e.g. Akure"
            className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-forest"
          />
          <input
            value={newRoute.park_name}
            onChange={(e) =>
              setNewRoute((n) => ({ ...n, park_name: e.target.value }))
            }
            placeholder="Park name (optional)"
            className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-forest"
          />
          <input
            type="number"
            value={newRoute.price}
            onChange={(e) =>
              setNewRoute((n) => ({ ...n, price: e.target.value }))
            }
            placeholder="Price"
            className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-forest"
          />
        </div>
        <button
          onClick={addRoute}
          className="mt-3 rounded-md bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-forest"
        >
          Add route
        </button>
      </div>
    </div>
  );
}
