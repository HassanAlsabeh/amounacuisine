"use client";

import { createContext, useContext, useMemo, useState } from "react";

export const ALL = "all";

const MenuFilterContext = createContext<{ active: string; pick: (id: string, jump?: boolean) => void } | null>(null);

/** Which compartment of the menu is showing; the category tiles at the top can switch it too. */
export function MenuFilterProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(ALL);
  const value = useMemo(
    () => ({
      active,
      pick: (id: string, jump = false) => {
        setActive(id);
        if (jump) document.getElementById("menu")?.scrollIntoView();
      },
    }),
    [active],
  );
  return <MenuFilterContext.Provider value={value}>{children}</MenuFilterContext.Provider>;
}

export function useMenuFilter() {
  const ctx = useContext(MenuFilterContext);
  if (!ctx) throw new Error("useMenuFilter must be used inside MenuFilterProvider");
  return ctx;
}
