import React, { useEffect, useMemo, useState } from "react";
import { HU, ContainerPlan, ContainerTypeKey, Placement } from "../types";
import { CONTAINERS, packHUsIntoContainers, volCm3 } from "../packing";
import { HUForm } from "../components/HUForm";
import { HUList } from "../components/HUList";
import { Legend } from "../components/Legend";
import { Viewer3D } from "../components/Viewer3D";
import { StatsBar } from "../components/StatsBar";
import { HUEditModal } from "../components/HUEditModal";
import { useHUs } from "../HUsContext";
import { useContainers } from "../ContainersContext";

export default function OptiContainer(){
  const [containerType, setContainerType] = useState<ContainerTypeKey>("20GP");
  const dims = CONTAINERS[containerType];
  const { hus, setHUs } = useHUs();
  const [selectedHUId, setSelectedHUId] = useState<string|null>(null);
  const [currentContainerIdx, setCurrentContainerIdx] = useState(0);
  const [repackVersion, setRepackVersion] = useState(0);
  const { containers, setContainers } = useContainers();

  const plans: ContainerPlan[] = useMemo(()=>packHUsIntoContainers(hus, containerType), [hus, containerType, repackVersion]);
  const plan = plans[currentContainerIdx] || plans[0];
  const [placements, setPlacements] = useState<Placement[]>(plan?.placements || []);

  useEffect(()=>{ setPlacements(plan?.placements || []); }, [plan]);

  useEffect(() => {
    const managed = plans.map((p, idx) => ({
      id: `C-${idx + 1}`,
      type: p.type,
      properties: p.dims,
      huIds: p.placements.map((pl) => pl.huId),
    }));
    setContainers(managed);
  }, [plans, setContainers]);

  const currentContainer = containers[currentContainerIdx];

  const containerVolume = volCm3(dims.L, dims.W, dims.H);
  const utilization = plan ? Math.min(100, (plan.usedVolumeCm3 / containerVolume) * 100) : 0;
  const stops = useMemo(()=>{ const s = new Set<string>(); for (const p of placements) s.add(p.stopKey); return Array.from(s); }, [placements]);

  const removeHU = (id: string) => { setHUs((prev)=>prev.filter((x)=>x.id!==id)); if (selectedHUId===id) setSelectedHUId(null); };
  const [editingHU, setEditingHU] = useState<HU|null>(null);
  const editHU = (hu: HU) => { setEditingHU(hu); };
  const handleSaveHU = (hu: HU) => {
    setHUs((prev) => prev.map((x) => (x.id === hu.id ? hu : x)));
    setCurrentContainerIdx(0);
    setEditingHU(null);
  };

  return (
    <>
      <div className="layout">
        <header className="header">
        <h1>Container Optimizer — MVP</h1>
        <div className="segmented">
          <button className={`seg ${containerType==="20GP"?"active":""}`} onClick={()=>{ setContainerType("20GP"); setCurrentContainerIdx(0); }}>20′ Standard</button>
          <button className={`seg ${containerType==="40GP"?"active":""}`} onClick={()=>{ setContainerType("40GP"); setCurrentContainerIdx(0); }}>40′ Standard</button>
        </div>
      </header>

      <div className="card" style={{marginTop: 0}}>
        <div className="card-title">What is a “Handling Unit (HU)”?</div>
        <div className="muted">An HU is any package moved as one piece: a pallet, crate, skid or large part. Enter its <strong>Length × Width × Height (cm)</strong>, <strong>Weight (kg)</strong>, whether it is <strong>Stackable</strong>, and its <strong>delivery date & place</strong>. The optimizer groups by stop (date+place) and plans loading so earlier deliveries are near the door.</div>
      </div>

      <StatsBar items={[
        { label: "Containers", value: plans.length },
        { label: "Current payload (kg)", value: plan ? Math.round(plan.totalWeight) : 0 },
        { label: "Max payload (kg)", value: dims.maxPayloadKg },
        { label: "Vol. utilization (%)", value: `${plan ? utilization.toFixed(1) : 0}%` },
      ]} />

      <div className="content">
        <div className="left">
          <HUForm onAdd={(hu)=>{ setHUs((p)=>[...p, hu]); setCurrentContainerIdx(0); }} />
          <HUList items={hus} onRemove={removeHU} onFocus={setSelectedHUId} onEdit={editHU} selectedId={selectedHUId} />
          <Legend stops={stops} />
        </div>

        <div className="right">
          <div className="toolbar">
            <div className="muted">Viewing container <strong>{currentContainerIdx+1}</strong> / {plans.length} — {dims.name}</div>
            <div className="row gap">
              <button className="btn" onClick={()=>{ setRepackVersion((v)=>v+1); setCurrentContainerIdx(0); }}>Re-run allocation</button>
              <button className="btn" disabled={currentContainerIdx===0} onClick={()=>setCurrentContainerIdx((i)=>Math.max(0, i-1))}>◀ Prev</button>
              <button className="btn" disabled={currentContainerIdx>=plans.length-1} onClick={()=>setCurrentContainerIdx((i)=>Math.min(plans.length-1, i+1))}>Next ▶</button>
            </div>
          </div>
          <Viewer3D dims={dims} placements={placements} stops={stops} selectedHUId={selectedHUId} onSelect={setSelectedHUId} onUpdatePlacement={(id,pl)=>setPlacements((prev)=>prev.map(p=>p.huId===id?pl:p))} />

          <div className="card">
            <div className="card-title">Container properties</div>
            <ul>
              <li><strong>Type:</strong> {currentContainer?.type}</li>
              <li><strong>L×W×H (cm):</strong> {currentContainer?.properties.L}×{currentContainer?.properties.W}×{currentContainer?.properties.H}</li>
              <li><strong>Max payload (kg):</strong> {currentContainer?.properties.maxPayloadKg}</li>
              <li><strong>Allocated HUs:</strong> {currentContainer?.huIds.length || 0}</li>
            </ul>
            {currentContainer?.huIds.length ? (
              <ul>
                {currentContainer.huIds.map((id) => (
                  <li key={id} className="mono">{id}</li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="card">
            <div className="card-title">Placements in current container</div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Handling Unit</th><th>Stop</th><th>L×W×H (cm)</th><th>Pos (x,y,z cm)</th><th>Rot</th></tr>
                </thead>
                <tbody>
                  {placements.map((p,i)=> (
                    <tr key={i} className={selectedHUId===p.huId?"active":""}>
                      <td className="mono">{p.huId}</td>
                      <td>{p.stopKey}</td>
                      <td>{p.l}×{p.w}×{p.h}</td>
                      <td>{Math.round(p.x)} , {Math.round(p.y)} , {Math.round(p.z)}</td>
                      <td>{p.rotatedLW?"L↔W":"—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="note">Note: LIFO by delivery (latest placed at the far end). Non-stackable HUs disable upper levels in that container (MVP rule).</div>
          </div>
        </div>
      </div>

      <footer className="footer">MVP heuristic — add door aperture checks, center-of-gravity and stackability rules before production.</footer>
    </div>
      {editingHU && <HUEditModal hu={editingHU} onSave={handleSaveHU} onCancel={()=>setEditingHU(null)} />}
    </>
  );
}
