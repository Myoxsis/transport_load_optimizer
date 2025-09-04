import React from "react";
export function StatsBar({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <div className="stats">
      {items.map((it) => (
        <div key={it.label} className="stat">
          <div className="stat-label">{it.label}</div>
          <div className="stat-value">{it.value}</div>
        </div>
      ))}
    </div>
  );
}