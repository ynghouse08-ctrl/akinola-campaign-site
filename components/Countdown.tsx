"use client";

import { useEffect, useState } from "react";
import { ELECTION_DATE } from "@/lib/config";

function getTimeLeft() {
  const diff = new Date(ELECTION_DATE).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
  };
}

export default function Countdown() {
  const [time, setTime] = useState<ReturnType<typeof getTimeLeft>>(null);

  useEffect(() => {
    setTime(getTimeLeft());
    const id = setInterval(() => setTime(getTimeLeft()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;

  return (
    <div className="flex items-center gap-4 text-paper/90">
      {[
        { value: time.days, label: "days" },
        { value: time.hours, label: "hrs" },
        { value: time.minutes, label: "min" },
      ].map((unit) => (
        <div key={unit.label} className="text-center">
          <div className="font-display text-2xl tabular-nums text-gold">
            {String(unit.value).padStart(2, "0")}
          </div>
          <div className="text-xs">{unit.label}</div>
        </div>
      ))}
      <span className="text-sm">to election day</span>
    </div>
  );
}
