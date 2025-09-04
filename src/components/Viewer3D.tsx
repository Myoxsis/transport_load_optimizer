import React, { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Html, Edges } from "@react-three/drei";
import { ContainerDims, Placement } from "../types";
import { cmToM } from "../packing";

function HUBox({ placement, color, selected, onClick }:{ placement: Placement; color: string; selected: boolean; onClick:()=>void }){
  const { l,w,h,x,y,z } = placement;
  const [hovered, setHovered] = useState(false);
  const pos:[number,number,number]=[cmToM(x + l/2), cmToM(z + h/2), cmToM(y + w/2)];
  const size:[number,number,number]=[cmToM(l), cmToM(h), cmToM(w)];
  const opacity = selected ? 0.95 : hovered ? 0.85 : 0.75;
  return (
    <mesh position={pos} onClick={onClick} onPointerOver={()=>setHovered(true)} onPointerOut={()=>setHovered(false)}>
      <boxGeometry args={size} />
      <meshStandardMaterial transparent opacity={opacity} color={color} />
      <Edges threshold={15} />
    </mesh>
  );
}

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

export function Viewer3D({ dims, placements, stops, selectedHUId, onSelect }:{ dims: ContainerDims; placements: Placement[]; stops: string[]; selectedHUId: string|null; onSelect: (id:string)=>void }){
  const cameraPos = useMemo(()=>[cmToM(dims.L*0.8), cmToM(dims.H*1.2), cmToM(dims.W*1.6)], [dims]);
  return (
    <div className="viewer">
      <Canvas camera={{ position: cameraPos as any, fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5,10,5]} intensity={0.9} />
        <ContainerWire dims={dims} />
        <Grid position={[cmToM(dims.L/2), 0.001, cmToM(dims.W/2)]} args={[cmToM(dims.L), cmToM(dims.W)]} cellSize={0.25} sectionThickness={1} infiniteGrid={false} />
        {placements.map((p, idx)=>{
          const color = getColor(stops.indexOf(p.stopKey));
          return <HUBox key={`${p.huId}-${idx}`} placement={p} color={color} selected={selectedHUId===p.huId} onClick={()=>onSelect(p.huId)} />;
        })}
        <OrbitControls makeDefault target={[cmToM(dims.L/2), cmToM(dims.H/2), cmToM(dims.W/2)] as any} />
        <Html position={[0, cmToM(5), cmToM(dims.W)/2]}>
          <div className="door-label">Door side (x=0)</div>
        </Html>
      </Canvas>
    </div>
  );
}
function getColor(i:number){ const palette=["#2563eb","#059669","#f59e0b","#ef4444","#8b5cf6","#10b981","#e11d48","#0ea5e9","#84cc16","#f97316"]; return palette[(i<0?0:i)%palette.length]; }