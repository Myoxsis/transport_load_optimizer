import React from "react";
import { useHUs } from "../HUsContext";
import { volCm3, CONTAINERS } from "../packing";
import type { HU } from "../types";

export default function OptiPlan() {
  const { hus } = useHUs();

  const groups = React.useMemo(() => {
    const map = new Map<string, { date: string; place: string; items: HU[]; volume: number }>();
    for (const hu of hus) {
      const key = `${hu.deliveryDate}|${hu.place.trim()}`;
      const v = volCm3(hu.length_cm, hu.width_cm, hu.height_cm);
      const g = map.get(key);
      if (g) {
        g.items.push(hu);
        g.volume += v;
      } else {
        map.set(key, { date: hu.deliveryDate, place: hu.place.trim(), items: [hu], volume: v });
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => a.date.localeCompare(b.date) || a.place.localeCompare(b.place)
    );
  }, [hus]);

  const containerVol = volCm3(
    CONTAINERS["20GP"].L,
    CONTAINERS["20GP"].W,
    CONTAINERS["20GP"].H
  );

  return (
    <div className="layout">
      <h1>OptiPlan</h1>
      <p>
        Transport Planning Optimisation, based on overall volume and delivery date and place to detect possible consolidation.
      </p>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Destination</th>
              <th>HUs</th>
              <th>Volume (m³)</th>
              <th>Fill Rate</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => {
              const fill = g.volume / containerVol;
              return (
                <tr key={`${g.date}-${g.place}`}>
                  <td>{g.date}</td>
                  <td>{g.place}</td>
                  <td>{g.items.length}</td>
                  <td>{(g.volume / 1e6).toFixed(2)}</td>
                  <td>{(fill * 100).toFixed(1)}%</td>
                  <td>
                    {fill < 0.8 ? "Retain to improve fill rate" : "Ship"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
