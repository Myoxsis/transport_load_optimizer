import React, { useState } from "react";
import { HU } from "../types";
import { useHUs } from "../HUsContext";

export default function Settings() {
  const { hus, setHUs } = useHUs();
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const lines = text.trim().split(/\r?\n/);
      const [header, ...rows] = lines;
      const cols = header.split(",").map((c) => c.trim());
      const imported: HU[] = rows.filter(r=>r.trim().length>0).map((line) => {
        const parts = line.split(",");
        const obj: Record<string, string> = {};
        cols.forEach((c, i) => {
          obj[c] = parts[i]?.trim() || "";
        });
        const id = `HU-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
        return {
          id,
          length_cm: Number(obj.length_cm) || 0,
          width_cm: Number(obj.width_cm) || 0,
          height_cm: Number(obj.height_cm) || 0,
          weight_kg: Number(obj.weight_kg) || 0,
          stackable: /^true|1|yes$/i.test(obj.stackable),
          deliveryDate: obj.deliveryDate || new Date().toISOString().slice(0, 10),
          place: obj.place || "",
        } as HU;
      });
      setHUs((prev) => [...prev, ...imported]);
      setError(null);
    } catch (err) {
      setError("Failed to parse CSV");
    }
    e.target.value = "";
  };

  const removeHU = (id: string) => setHUs((p) => p.filter((h) => h.id !== id));

  return (
    <div className="layout">
      <h1>Settings</h1>
      <div className="card">
        <div className="card-title">Import Handling Units from CSV</div>
        <div className="muted">
          CSV columns: length_cm,width_cm,height_cm,weight_kg,stackable,deliveryDate,place. <a href="/hu_template.csv" download>Download template</a>
        </div>
        <input type="file" accept=".csv" onChange={handleFile} />
        {error && <div className="error">{error}</div>}
      </div>

      <div className="card">
        <div className="card-title">Loaded Handling Units</div>
        <div className="list">
          {hus.map((h) => (
            <div key={h.id} className="list-item">
              <div>
                <div className="list-title">{h.id}</div>
                <div className="muted">{h.length_cm}×{h.width_cm}×{h.height_cm} cm · {h.weight_kg} kg · {h.stackable ? "Stackable" : "No stack"}</div>
                <div className="muted">{h.deliveryDate} — {h.place}</div>
              </div>
              <div className="row gap">
                <button className="btn danger" onClick={() => removeHU(h.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
