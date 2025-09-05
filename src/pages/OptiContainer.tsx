import React, { useMemo, useState } from "react";
import { HU, ContainerTypeKey, Placement, ManagedContainer } from "../types";
import { CONTAINERS, packHUsIntoContainers, volCm3, stopKey } from "../packing";
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
  const { hus, setHUs } = useHUs();
  const { containers, setContainers } = useContainers();
  const [selectedHUId, setSelectedHUId] = useState<string|null>(null);
  const [currentContainerIdx, setCurrentContainerIdx] = useState<number>(-1);
  const [placementsMap, setPlacementsMap] = useState<Record<number, Placement[]>>({});

  const currentContainer = containers[currentContainerIdx];
  const placements = placementsMap[currentContainerIdx] || [];

  const unassignedHUs = hus.filter(h => !containers.some(c => c.huIds.includes(h.id)));

  const currentHUs = currentContainer ? currentContainer.huIds.map(id => hus.find(h=>h.id===id)!).filter(Boolean) : [];
  const currentWeight = currentHUs.reduce((s,h)=>s+h.weight_kg,0);
  const usedVolumeCm3 = placements.reduce((s,p)=>s+volCm3(p.l,p.w,p.h),0);
  const containerVolume = currentContainer ? volCm3(currentContainer.properties.L, currentContainer.properties.W, currentContainer.properties.H) : 0;
  const utilization = containerVolume ? Math.min(100, (usedVolumeCm3 / containerVolume) * 100) : 0;
  const stops = useMemo(()=>{ const s = new Set<string>(); for (const p of placements) s.add(p.stopKey); return Array.from(s); }, [placements]);

  const removeHU = (id: string) => {
    setHUs(prev=>prev.filter(x=>x.id!==id));
    setContainers(prev=>prev.map(c=>({ ...c, huIds: c.huIds.filter(hid=>hid!==id) })));
    setPlacementsMap(prev=>{ const m:Record<number,Placement[]>={}; Object.entries(prev).forEach(([k,v])=>{ m[Number(k)]=v.filter(p=>p.huId!==id); }); return m; });
    if (selectedHUId===id) setSelectedHUId(null);
  };

  const assignToCurrent = (id: string) => {
    if (currentContainerIdx<0) return;
    const hu = hus.find(h => h.id === id);
    if (!hu) return;
    if (currentContainer?.huIds.includes(id)) return;
    const newPlacement: Placement = {
      huId: id,
      l: hu.length_cm,
      w: hu.width_cm,
      h: hu.height_cm,
      x: 0,
      y: 0,
      z: 0,
      rotatedLW: false,
      stopKey: stopKey(hu.deliveryDate, hu.place),
    };
    setPlacementsMap(prev=>({ ...prev, [currentContainerIdx]: [...(prev[currentContainerIdx]||[]), newPlacement] }));
    setContainers(prev=>prev.map((c,i)=>i===currentContainerIdx?{ ...c, huIds:[...c.huIds,id] }:c));
  };

  const addContainer = () => {
    const dims = CONTAINERS[containerType];
    const newContainer: ManagedContainer = { id:`C-${containers.length+1}`, type: containerType, properties: dims, huIds:[] };
    setContainers(prev=>[...prev, newContainer]);
    setPlacementsMap(prev=>({ ...prev, [containers.length]: [] }));
    setCurrentContainerIdx(containers.length);
  };

  const autoAllocate = () => {
    const plans = packHUsIntoContainers(hus, containerType);
    const managed: ManagedContainer[] = plans.map((p,i)=>({ id:`C-${i+1}`, type:p.type, properties:p.dims, huIds:p.placements.map(pl=>pl.huId) }));
    const map: Record<number, Placement[]> = {};
    plans.forEach((p,i)=>{ map[i]=p.placements; });
    setContainers(managed);
    setPlacementsMap(map);
    setCurrentContainerIdx(plans.length?0:-1);
  };

  const [editingHU, setEditingHU] = useState<HU|null>(null);
  const editHU = (hu: HU) => { setEditingHU(hu); };
  const handleSaveHU = (hu: HU) => {
    setHUs(prev => prev.map(x => x.id===hu.id ? hu : x));
    setPlacementsMap(prev=>{
      const m:Record<number,Placement[]>={};
      Object.entries(prev).forEach(([k,arr])=>{
        m[Number(k)] = arr.map(p=>p.huId===hu.id?{ ...p, l:hu.length_cm, w:hu.width_cm, h:hu.height_cm, stopKey:stopKey(hu.deliveryDate, hu.place) }:p);
      });
      return m;
    });
    setEditingHU(null);
  };

  return (
    <>
      <div className="layout">
        <header className="header">
        <h1>Container Optimizer — MVP</h1>
        <div className="segmented">
          <button className={`seg ${containerType==="20GP"?"active":""}`} onClick={()=>{ setContainerType("20GP"); setCurrentContainerIdx(containers.length?0:-1); }}>20′ Standard</button>
          <button className={`seg ${containerType==="40GP"?"active":""}`} onClick={()=>{ setContainerType("40GP"); setCurrentContainerIdx(containers.length?0:-1); }}>40′ Standard</button>
        </div>
      </header>

      <div className="card" style={{marginTop: 0}}>
        <div className="card-title">What is a “Handling Unit (HU)”?</div>
        <div className="muted">An HU is any package moved as one piece: a pallet, crate, skid or large part. Enter its <strong>Length × Width × Height (cm)</strong>, <strong>Weight (kg)</strong>, whether it is <strong>Stackable</strong>, and its <strong>delivery date & place</strong>. The optimizer groups by stop (date+place) and plans loading so earlier deliveries are near the door.</div>
      </div>

      <StatsBar items={[
        { label: "Containers", value: containers.length },
        { label: "Current payload (kg)", value: Math.round(currentWeight) },
        { label: "Max payload (kg)", value: currentContainer ? currentContainer.properties.maxPayloadKg : 0 },
        { label: "Vol. utilization (%)", value: `${utilization.toFixed(1)}%` },
      ]} />

      <div className="content">
        <div className="left">
          <HUForm onAdd={(hu)=>{ setHUs(p=>[...p, hu]); }} />
          <HUList items={unassignedHUs} onRemove={removeHU} onFocus={setSelectedHUId} onEdit={editHU} onAssign={currentContainer?assignToCurrent:undefined} selectedId={selectedHUId} />
          <Legend stops={stops} />
        </div>

        <div className="right">
          <div className="toolbar">
            <div className="muted">{currentContainer ? <>Viewing container <strong>{currentContainerIdx+1}</strong> / {containers.length} — {currentContainer.properties.name}</> : "No container selected"}</div>
            <div className="row gap">
              <button className="btn" onClick={autoAllocate}>Auto allocate</button>
              <button className="btn" onClick={addContainer}>Add Container</button>
              <button className="btn" disabled={currentContainerIdx<=0} onClick={()=>setCurrentContainerIdx(i=>Math.max(0, i-1))}>◀ Prev</button>
              <button className="btn" disabled={currentContainerIdx<0 || currentContainerIdx>=containers.length-1} onClick={()=>setCurrentContainerIdx(i=>Math.min(containers.length-1, i+1))}>Next ▶</button>
            </div>
          </div>
          {currentContainer ? (
            <>
              <Viewer3D dims={currentContainer.properties} placements={placements} stops={stops} selectedHUId={selectedHUId} onSelect={setSelectedHUId} onUpdatePlacement={(id,pl)=>setPlacementsMap(prev=>({ ...prev, [currentContainerIdx]: (prev[currentContainerIdx]||[]).map(p=>p.huId===id?pl:p) }))} />

              <div className="card">
                <div className="card-title">Container properties</div>
                <ul>
                  <li><strong>Type:</strong> {currentContainer.type}</li>
                  <li><strong>L×W×H (cm):</strong> {currentContainer.properties.L}×{currentContainer.properties.W}×{currentContainer.properties.H}</li>
                  <li><strong>Max payload (kg):</strong> {currentContainer.properties.maxPayloadKg}</li>
                  <li><strong>Allocated HUs:</strong> {currentContainer.huIds.length}</li>
                </ul>
                {currentContainer.huIds.length ? (
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
            </>
          ) : (
            <div className="card">
              <div className="card-title">No container</div>
              <div className="muted">Add a container or run Auto allocate.</div>
            </div>
          )}
        </div>
      </div>

      <footer className="footer">MVP heuristic — add door aperture checks, center-of-gravity and stackability rules before production.</footer>
    </div>
      {editingHU && <HUEditModal hu={editingHU} onSave={handleSaveHU} onCancel={()=>setEditingHU(null)} />}
    </>
  );
}
