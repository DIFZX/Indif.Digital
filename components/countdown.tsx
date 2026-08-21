"use client";

import { useEffect, useMemo, useState } from "react";

type Remaining = { days: number; hours: number; minutes: number; seconds: number };

function getRemaining(target: number): Remaining {
  const distance = Math.max(0, target - Date.now());
  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance / 3_600_000) % 24),
    minutes: Math.floor((distance / 60_000) % 60),
    seconds: Math.floor((distance / 1_000) % 60),
  };
}

export function Countdown({ eventDate }: { eventDate: string }) {
  const target = useMemo(() => new Date(`${eventDate}T08:00:00+07:00`).getTime(), [eventDate]);
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(getRemaining(target)), 1_000);
    return () => window.clearInterval(timer);
  }, [target]);

  return (
    <div className="countdown" aria-label="Hitung mundur acara">
      {Object.entries(remaining ?? { days: 0, hours: 0, minutes: 0, seconds: 0 }).map(([unit, value]) => (
        <span key={unit}><strong>{String(value).padStart(2, "0")}</strong><small>{unit}</small></span>
      ))}
    </div>
  );
}
