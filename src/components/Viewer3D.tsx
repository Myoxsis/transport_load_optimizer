import React, { useMemo, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Html, Edges, DragControls } from "@react-three/drei";
import { ContainerDims, Placement } from "../types";
import { cmToM, mToCm } from "../packing";
import * as THREE from "three";

const HUBox = React.forwardRef<THREE.Mesh, { placement: Placement; color: string; selected: boolean; onClick:()=>void; onDoubleClick: (e: any)=>void }>(({ placement, color, selected, onClick, onDoubleClick }, ref) => {
  const { l,w,h } = placement;
  const [hovered, setHovered] = useState(false);
  const size:[number,number,number]=[cmToM(l), cmToM(h), cmToM(w)];
  const opacity = selected ? 0.95 : hovered ? 0.85 : 0.75;
  return (
    <mesh ref={ref} onClick={onClick} onDoubleClick={onDoubleClick} onPointerOver={()=>setHovered(true)} onPointerOut={()=>setHovered(false)}>
      <boxGeometry args={size} />
      <meshStandardMaterial transparent opacity={opacity} color={color} />
      <Edges threshold={15} />
    </mesh>
  );
});

function ContainerWire({ dims }:{ dims: ContainerDims }){
  const size:[number,number,number]=[cmToM(dims.L), cmToM(dims.H), cmToM(dims.W)];
  const pos:[number,number,number]=[cmToM(dims.L/2), cmToM(dims.H/2), cmToM(dims.W/2)];
  return (
    <mesh position={pos}>
      <boxGeometry args={size} />
      <meshBasicMaterial wireframe transparent opacity={0.5} />
    </mesh>
  );
}

function DraggableHU({ placement, color, selected, onSelect, onUpdate }:{ placement: Placement; color: string; selected: boolean; onSelect:()=>void; onUpdate:(pl:Placement)=>void }){
  const group = useRef<THREE.Group>(null);
  const center:[number,number,number]=[cmToM(placement.x + placement.l/2), cmToM(placement.z + placement.h/2), cmToM(placement.y + placement.w/2)];
  const dragProps:any = { position: center, rotation:[0, placement.rotatedLW ? Math.PI/2 : 0, 0], matrixAutoUpdate: true };
  return (
    <DragControls ref={group} {...dragProps} onDragEnd={()=>{
      const g = group.current!;
      g.updateMatrixWorld();
      const pos = g.position; const rotY = g.rotation.y;
      const rotated = Math.round(rotY / (Math.PI/2)) % 2 === 1;
      const l = rotated ? placement.w : placement.l;
      const w = rotated ? placement.l : placement.w;
      const x = mToCm(pos.x) - l/2;
      const y = mToCm(pos.z) - w/2;
      const z = mToCm(pos.y) - placement.h/2;
      onUpdate({ ...placement, l, w, x, y, z, rotatedLW: rotated });
    }}>
      <HUBox placement={placement} color={color} selected={selected} onClick={onSelect} onDoubleClick={(e)=>{ e.stopPropagation(); const g=group.current!; g.rotation.y += Math.PI/2; g.updateMatrixWorld(); const rotated=!placement.rotatedLW; const l=rotated?placement.w:placement.l; const w=rotated?placement.l:placement.w; const pos=g.position; const x=mToCm(pos.x)-l/2; const y=mToCm(pos.z)-w/2; const z=mToCm(pos.y)-placement.h/2; onUpdate({ ...placement, l, w, x, y, z, rotatedLW: rotated }); }} />
    </DragControls>
  );
}

export function Viewer3D({ dims, placements, stops, selectedHUId, onSelect, onUpdatePlacement }:{ dims: ContainerDims; placements: Placement[]; stops: string[]; selectedHUId: string|null; onSelect: (id:string)=>void; onUpdatePlacement:(id:string, placement:Placement)=>void }){
  const cameraPos = useMemo(()=>[cmToM(dims.L*0.8), cmToM(dims.H*1.2), cmToM(dims.W*1.6)], [dims]);
  const isInside = (p: Placement) =>
    p.x >= 0 && p.y >= 0 && p.z >= 0 &&
    p.x + p.l <= dims.L && p.y + p.w <= dims.W && p.z + p.h <= dims.H;
  const invalidIds = placements.filter(p => !isInside(p)).map(p => p.huId);
  return (
    <div className="viewer">
      <Canvas camera={{ position: cameraPos as any, fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5,10,5]} intensity={0.9} />
        <ContainerWire dims={dims} />
        <Grid position={[cmToM(dims.L/2), 0.001, cmToM(dims.W/2)]} args={[cmToM(dims.L), cmToM(dims.W)]} cellSize={0.25} sectionThickness={1} infiniteGrid={false} />
        {placements.map((p, idx)=>{
          const invalid = invalidIds.includes(p.huId);
          const color = invalid ? "#ff0000" : getColor(stops.indexOf(p.stopKey));
          return (
            <DraggableHU
              key={`${p.huId}-${idx}`}
              placement={p}
              color={color}
              selected={selectedHUId===p.huId}
              onSelect={()=>onSelect(p.huId)}
              onUpdate={(pl)=>onUpdatePlacement(p.huId, pl)}
            />
          );
        })}
        <OrbitControls makeDefault target={[cmToM(dims.L/2), cmToM(dims.H/2), cmToM(dims.W/2)] as any} />
        <Html position={[0, cmToM(5), cmToM(dims.W)/2]}>
          <div className="door-label">Door side (x=0)</div>
        </Html>
      </Canvas>
      {invalidIds.length>0 && <div className="viewer-error error">HU outside container bounds</div>}
    </div>
  );
}
function getColor(i:number){ const palette=["#2563eb","#059669","#f59e0b","#ef4444","#8b5cf6","#10b981","#e11d48","#0ea5e9","#84cc16","#f97316"]; return palette[(i<0?0:i)%palette.length]; }