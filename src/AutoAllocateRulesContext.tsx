import React, { createContext, useContext, useEffect, useState } from "react";

export type AutoAllocateRules = {
  lifoByDelivery: boolean;
  respectStackable: boolean;
};

type AutoAllocateRulesContextValue = {
  rules: AutoAllocateRules;
  setRules: React.Dispatch<React.SetStateAction<AutoAllocateRules>>;
};

const defaultRules: AutoAllocateRules = {
  lifoByDelivery: true,
  respectStackable: true,
};

const AutoAllocateRulesContext = createContext<AutoAllocateRulesContextValue | undefined>(undefined);

export function AutoAllocateRulesProvider({ children }: { children: React.ReactNode }) {
  const [rules, setRules] = useState<AutoAllocateRules>(() => {
    const stored = localStorage.getItem("autoAllocateRules");
    if (stored) {
      try {
        return { ...defaultRules, ...JSON.parse(stored) } as AutoAllocateRules;
      } catch {
        /* ignore */
      }
    }
    return defaultRules;
  });

  useEffect(() => {
    localStorage.setItem("autoAllocateRules", JSON.stringify(rules));
  }, [rules]);

  return (
    <AutoAllocateRulesContext.Provider value={{ rules, setRules }}>
      {children}
    </AutoAllocateRulesContext.Provider>
  );
}

export function useAutoAllocateRules() {
  const ctx = useContext(AutoAllocateRulesContext);
  if (!ctx) throw new Error("useAutoAllocateRules must be used within AutoAllocateRulesProvider");
  return ctx;
}

