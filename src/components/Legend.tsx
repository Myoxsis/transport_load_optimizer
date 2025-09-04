import React from "react";
export function Legend({ stops }: { stops: string[] }) {
  return (
    <div className="card">
      <div className="card-title">Legend (Stops)</div>
      <div className="legend">
        {stops.map((s, i) => (
          <div key={s} className="legend-item">
            <span className="legend-dot" style={{ background: getColor(i) }} />
            <span>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function getColor(i:number){ const palette=["#2563eb","#059669","#f59e0b","#ef4444","#8b5cf6","#10b981","#e11d48","#0ea5e9","#84cc16","#f97316"]; return palette[i%palette.length]; }