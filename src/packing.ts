import { HU, ContainerTypeKey, ContainerDims, ContainerPlan, Placement } from "./types";

export const CONTAINERS: Record<ContainerTypeKey, ContainerDims> = {
  "20GP": { name: "20' Standard (20GP)", L: 589, W: 235, H: 239, maxPayloadKg: 28200 },
  "40GP": { name: "40' Standard (40GP)", L: 1203, W: 235, H: 239, maxPayloadKg: 26700 },
};

export const volCm3 = (l: number, w: number, h: number) => l * w * h;
export const cmToM = (v: number) => v / 100.0;
export const mToCm = (v: number) => v * 100.0;
export const stopKey = (date: string, place: string) => `${date} | ${place.trim()}`;

type Row = { yStart: number; depth: number; xCursor: number; };
type Level = { zStart: number; height: number; rows: Row[] };
type WorkingContainer = { dims: ContainerDims; levels: Level[]; placements: Placement[]; hasNonStackable: boolean; weightSum: number };
const newWorkingContainer = (dims: ContainerDims): WorkingContainer => ({ dims, levels: [{ zStart: 0, height: 0, rows: [] }], placements: [], hasNonStackable: false, weightSum: 0 });

function tryPlaceInRow(hu: HU, level: Level, row: Row, dims: ContainerDims, groupKey: string): Placement | null {
  const tryOrientations: Array<[number, number, boolean]> = [ [hu.length_cm, hu.width_cm, false], [hu.width_cm, hu.length_cm, true] ];
  for (const [l, w, rotatedLW] of tryOrientations) {
    const h = hu.height_cm;
    if ((level.height === 0 ? h : h <= level.height) && w <= row.depth) {
      if (row.xCursor - l >= 0) {
        const x = row.xCursor - l; const y = row.yStart; const z = level.zStart;
        return { huId: hu.id, l, w, h, x, y, z, rotatedLW, stopKey: groupKey };
      }
    }
  }
  return null;
}

export function packHUsIntoContainers(inputHUs: HU[], containerType: ContainerTypeKey): ContainerPlan[] {
  const dims = CONTAINERS[containerType];
  const groupsMap = new Map<string, HU[]>();
  for (const hu of inputHUs) { const key = stopKey(hu.deliveryDate, hu.place); if (!groupsMap.has(key)) groupsMap.set(key, []); groupsMap.get(key)!.push(hu); }
  const groups = Array.from(groupsMap.entries()).map(([key, items]) => ({ key, date: new Date(items[0].deliveryDate), items }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  for (const g of groups) { g.items.sort((a, b) => b.height_cm - a.height_cm || (b.length_cm*b.width_cm - a.length_cm*a.width_cm)); }

  const containers: WorkingContainer[] = [newWorkingContainer(dims)];
  let current = containers[0];
  const stopsInPlacementOrder = [...groups].reverse();

  for (const g of stopsInPlacementOrder) {
    for (const hu of g.items) {
      const fitsBase = ((hu.length_cm <= dims.L && hu.width_cm <= dims.W && hu.height_cm <= dims.H) || (hu.width_cm <= dims.L && hu.length_cm <= dims.W && hu.height_cm <= dims.H));
      if (!fitsBase) { console.warn(`HU ${hu.id} oversized for ${dims.name}`); continue; }
      let placed: Placement | null = null;
      for (let attempt = 0; attempt < 2 && !placed; attempt++) {
        let level = current.levels[current.levels.length - 1];
        for (const row of level.rows) { const p = tryPlaceInRow(hu, level, row, dims, g.key); if (p) { placed = p; if (level.height === 0) level.height = p.h; row.xCursor = p.x; break; } }
        if (!placed) {
          const usedWidth = level.rows.reduce((s, r) => s + r.depth, 0);
            const options: [number, number, boolean][] = [[hu.width_cm, hu.length_cm, false],[hu.length_cm, hu.width_cm, true]];
            options.sort((a,b)=>a[0]-b[0]);
            for (const [rowDepth, otherLen, rotatedOther] of options) {
            const h = hu.height_cm; const canLevel = level.height === 0 || h <= level.height;
            if (canLevel && usedWidth + rowDepth <= dims.W && otherLen <= dims.L) {
              const newRow: Row = { yStart: usedWidth, depth: rowDepth, xCursor: dims.L };
              level.rows.push(newRow);
              const l = rotatedOther ? hu.width_cm : hu.length_cm; const w = rotatedOther ? hu.length_cm : hu.width_cm; const x = newRow.xCursor - l;
              placed = { huId: hu.id, l, w, h, x, y: newRow.yStart, z: level.zStart, rotatedLW: rotatedOther, stopKey: g.key };
              if (level.height === 0) level.height = h; newRow.xCursor = x; break;
            }
          }
        }
        if (!placed) {
          const cannotStack = current.hasNonStackable; const nextZ = level.zStart + (level.height || 0); const h = hu.height_cm;
          if (!cannotStack && nextZ + h <= dims.H) {
            const newLevel: Level = { zStart: nextZ, height: 0, rows: [] }; current.levels.push(newLevel); level = newLevel;
              const options: [number, number, boolean][] = [[hu.width_cm, hu.length_cm, false],[hu.length_cm, hu.width_cm, true]];
              options.sort((a,b)=>a[0]-b[0]);
              const [rowDepth, otherLen, rotatedOther] = options[0];
            if (rowDepth <= dims.W && otherLen <= dims.L) {
              const newRow: Row = { yStart: 0, depth: rowDepth, xCursor: dims.L }; level.rows.push(newRow);
              const l = rotatedOther ? hu.width_cm : hu.length_cm; const w = rotatedOther ? hu.length_cm : hu.width_cm; const x = newRow.xCursor - l;
              placed = { huId: hu.id, l, w, h, x, y: newRow.yStart, z: level.zStart, rotatedLW: rotatedOther, stopKey: g.key };
              level.height = h; newRow.xCursor = x;
            }
          }
        }
        if (!placed) { const next = newWorkingContainer(dims); containers.push(next); current = next; }
      }
      if (placed) { current.placements.push(placed); current.weightSum += hu.weight_kg; if (!hu.stackable) current.hasNonStackable = true; }
    }
  }

  return containers.map((c) => ({ type: containerType, dims: c.dims, placements: c.placements, totalWeight: c.weightSum, usedVolumeCm3: c.placements.reduce((s,p)=>s+volCm3(p.l,p.w,p.h),0), hasNonStackable: c.hasNonStackable }));
}