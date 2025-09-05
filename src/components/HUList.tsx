import React from "react";
import { HU } from "../types";
export function HUList({ items, onRemove, onFocus, onEdit, onAssign, selectedId }: { items: HU[]; onRemove: (id: string)=>void; onFocus: (id: string)=>void; onEdit: (hu: HU)=>void; onAssign?: (id: string)=>void; selectedId: string|null }) {
  return (
    <div className="card">
      <div className="card-title">Handling Units</div>
      <div className="list">
        {items.map((h)=> (
          <div key={h.id} className={`list-item ${selectedId===h.id?"active":""}`}>
            <div>
              <div className="list-title">{h.id}</div>
              <div className="muted">{h.length_cm}×{h.width_cm}×{h.height_cm} cm · {h.weight_kg} kg · {h.stackable?"Stackable":"No stack"}</div>
              <div className="muted">{h.deliveryDate} — {h.place}</div>
            </div>
            <div className="row gap">
              {onAssign && <button className="btn" onClick={()=>onAssign(h.id)}>Assign</button>}
              <button className="btn" onClick={()=>onFocus(h.id)}>Focus</button>
              <button className="btn" onClick={()=>onEdit(h)}>Edit</button>
              <button className="btn danger" onClick={()=>onRemove(h.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}