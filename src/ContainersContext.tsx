import React, { createContext, useContext, useEffect, useState } from "react";
import { ManagedContainer } from "./types";

type ContainersContextValue = {
  containers: ManagedContainer[];
  setContainers: React.Dispatch<React.SetStateAction<ManagedContainer[]>>;
};

const ContainersContext = createContext<ContainersContextValue | undefined>(undefined);

export function ContainersProvider({ children }: { children: React.ReactNode }) {
  const [containers, setContainers] = useState<ManagedContainer[]>(() => {
    const stored = localStorage.getItem("containers");
    if (stored) {
      try {
        return JSON.parse(stored) as ManagedContainer[];
      } catch {
        /* ignore */
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("containers", JSON.stringify(containers));
  }, [containers]);

  return (
    <ContainersContext.Provider value={{ containers, setContainers }}>
      {children}
    </ContainersContext.Provider>
  );
}

export function useContainers() {
  const ctx = useContext(ContainersContext);
  if (!ctx) throw new Error("useContainers must be used within ContainersProvider");
  return ctx;
}
