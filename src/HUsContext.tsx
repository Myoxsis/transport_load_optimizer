import React, { createContext, useContext, useEffect, useState } from "react";
import { HU } from "./types";

type HUsContextValue = {
  hus: HU[];
  setHUs: React.Dispatch<React.SetStateAction<HU[]>>;
};

const HUsContext = createContext<HUsContextValue | undefined>(undefined);

const SAMPLE_HUS: HU[] = [
  { id: "HU-001", length_cm: 240, width_cm: 100, height_cm: 110, weight_kg: 480, stackable: false, deliveryDate: "2025-09-20", place: "Lyon" },
  { id: "HU-002", length_cm: 120, width_cm: 80, height_cm: 75, weight_kg: 220, stackable: true, deliveryDate: "2025-09-18", place: "Lyon" },
  { id: "HU-003", length_cm: 310, width_cm: 90, height_cm: 100, weight_kg: 600, stackable: true, deliveryDate: "2025-09-25", place: "Bordeaux" },
  { id: "HU-004", length_cm: 200, width_cm: 120, height_cm: 150, weight_kg: 350, stackable: true, deliveryDate: "2025-09-18", place: "Lyon" },
];

export function HUsProvider({ children }: { children: React.ReactNode }) {
  const [hus, setHUs] = useState<HU[]>(() => {
    const stored = localStorage.getItem("hus");
    if (stored) {
      try {
        return JSON.parse(stored) as HU[];
      } catch {
        /* ignore */
      }
    }
    return SAMPLE_HUS;
  });

  useEffect(() => {
    localStorage.setItem("hus", JSON.stringify(hus));
  }, [hus]);

  return <HUsContext.Provider value={{ hus, setHUs }}>{children}</HUsContext.Provider>;
}

export function useHUs() {
  const ctx = useContext(HUsContext);
  if (!ctx) throw new Error("useHUs must be used within HUsProvider");
  return ctx;
}
