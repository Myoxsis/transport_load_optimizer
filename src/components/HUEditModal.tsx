import React, { useState } from "react";
import { HU } from "../types";

export function HUEditModal({ hu, onSave, onCancel }: { hu: HU; onSave: (hu: HU) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    length_cm: String(hu.length_cm),
    width_cm: String(hu.width_cm),
    height_cm: String(hu.height_cm),
    weight_kg: String(hu.weight_kg),
    stackable: hu.stackable,
    deliveryDate: hu.deliveryDate,
    place: hu.place,
  });

  const parse = (s: string, fallback: number) => {
    const n = Number(s);
    return isNaN(n) ? fallback : n;
  };

  const save = () => {
    const updated: HU = {
      ...hu,
      length_cm: parse(form.length_cm, hu.length_cm),
      width_cm: parse(form.width_cm, hu.width_cm),
      height_cm: parse(form.height_cm, hu.height_cm),
      weight_kg: parse(form.weight_kg, hu.weight_kg),
      stackable: form.stackable,
      deliveryDate: form.deliveryDate,
      place: form.place,
    };
    onSave(updated);
  };

  return (
    <div className="modal-overlay">
      <div className="card modal">
        <div className="card-title">Edit {hu.id}</div>
        <div className="grid2">
          <div><label className="label">Length (cm)</label><input className="input" value={form.length_cm} onChange={(e)=>setForm({...form,length_cm:e.target.value})} /></div>
          <div><label className="label">Width (cm)</label><input className="input" value={form.width_cm} onChange={(e)=>setForm({...form,width_cm:e.target.value})} /></div>
          <div><label className="label">Height (cm)</label><input className="input" value={form.height_cm} onChange={(e)=>setForm({...form,height_cm:e.target.value})} /></div>
          <div><label className="label">Weight (kg)</label><input className="input" value={form.weight_kg} onChange={(e)=>setForm({...form,weight_kg:e.target.value})} /></div>
          <div className="row"><label className="label">Stackable</label><button className={`toggle ${form.stackable?"on":""}`} onClick={()=>setForm({...form,stackable:!form.stackable})}>{form.stackable?"Yes":"No"}</button></div>
          <div><label className="label">Delivery date</label><input type="date" className="input" value={form.deliveryDate} onChange={(e)=>setForm({...form,deliveryDate:e.target.value})} /></div>
          <div className="col2"><label className="label">Place of delivery</label><input className="input" value={form.place} onChange={(e)=>setForm({...form,place:e.target.value})} /></div>
        </div>
        <div className="row gap">
          <button className="btn primary" onClick={save}>Save</button>
          <button className="btn" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
