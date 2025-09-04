import React, { useState } from "react";
import { HU } from "../types";
export function HUForm({ onAdd }: { onAdd: (hu: HU) => void }) {
  const [form, setForm] = useState({ length_cm: "", width_cm: "", height_cm: "", weight_kg: "", stackable: true, deliveryDate: "", place: "" });
  const parse = (s: string) => { const n = Number(s); return isNaN(n) ? 0 : n; };
  const addHU = () => {
    const id = `HU-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const hu: HU = { id, length_cm: parse(form.length_cm), width_cm: parse(form.width_cm), height_cm: parse(form.height_cm), weight_kg: parse(form.weight_kg), stackable: form.stackable, deliveryDate: form.deliveryDate || new Date().toISOString().slice(0,10), place: form.place || "" };
    onAdd(hu);
    setForm({ length_cm: "", width_cm: "", height_cm: "", weight_kg: "", stackable: true, deliveryDate: "", place: "" });
  };
  return (
    <div className="card">
      <div className="card-title">Add a Handling Unit</div>
      <div className="grid2">
        <div><label className="label">Length (cm)</label><input className="input" value={form.length_cm} onChange={(e)=>setForm({...form,length_cm:e.target.value})} placeholder="240" /></div>
        <div><label className="label">Width (cm)</label><input className="input" value={form.width_cm} onChange={(e)=>setForm({...form,width_cm:e.target.value})} placeholder="100" /></div>
        <div><label className="label">Height (cm)</label><input className="input" value={form.height_cm} onChange={(e)=>setForm({...form,height_cm:e.target.value})} placeholder="110" /></div>
        <div><label className="label">Weight (kg)</label><input className="input" value={form.weight_kg} onChange={(e)=>setForm({...form,weight_kg:e.target.value})} placeholder="480" /></div>
        <div className="row"><label className="label">Stackable</label><button className={`toggle ${form.stackable?"on":""}`} onClick={()=>setForm({...form,stackable:!form.stackable})}>{form.stackable?"Yes":"No"}</button></div>
        <div><label className="label">Delivery date</label><input type="date" className="input" value={form.deliveryDate} onChange={(e)=>setForm({...form,deliveryDate:e.target.value})} /></div>
        <div className="col2"><label className="label">Place of delivery</label><input className="input" value={form.place} onChange={(e)=>setForm({...form,place:e.target.value})} placeholder="City / plant" /></div>
      </div>
      <div className="row gap"><button className="btn primary" onClick={addHU}>Add HU</button></div>
    </div>
  );
}