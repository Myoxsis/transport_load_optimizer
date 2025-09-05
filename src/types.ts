export type HU = {
  id: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  weight_kg: number;
  stackable: boolean;
  deliveryDate: string; // YYYY-MM-DD
  place: string;
};

export type Placement = {
  huId: string;
  l: number; // cm
  w: number; // cm
  h: number; // cm
  x: number; // cm
  y: number; // cm
  z: number; // cm
  rotatedLW: boolean;
  stopKey: string;
};

export type ContainerTypeKey = "20GP" | "40GP";

export type ContainerDims = {
  name: string;
  L: number;
  W: number;
  H: number;
  maxPayloadKg: number;
};

export type ContainerPlan = {
  type: ContainerTypeKey;
  dims: ContainerDims;
  placements: Placement[];
  totalWeight: number;
  usedVolumeCm3: number;
  hasNonStackable: boolean;
};
export type ManagedContainer = {
  id: string;
  type: ContainerTypeKey;
  properties: ContainerDims;
  huIds: string[];
};
