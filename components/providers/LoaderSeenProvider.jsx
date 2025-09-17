"use client";

import { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext(null);
const KEY = "cl_loader_seen"; // stored per-tab

export function LoaderSeenProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    try {
      // Detect hard reload and clear the flag so loader shows again
      const nav = performance.getEntriesByType("navigation")[0];
      const isReload =
        (nav && nav.type === "reload") ||
        // legacy fallback
        (performance &&
          performance.navigation &&
          performance.navigation.type === 1);

      if (isReload) {
        sessionStorage.removeItem(KEY);
      }

      setSeen(sessionStorage.getItem(KEY) === "1");
    } catch {
      // ignore
    } finally {
      setReady(true);
    }
  }, []);

  const markSeen = () => {
    setSeen(true);
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
  };

  return (
    <Ctx.Provider value={{ ready, seen, markSeen }}>{children}</Ctx.Provider>
  );
}

export const useLoaderSeen = () => {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useLoaderSeen must be used within LoaderSeenProvider");
  return ctx;
};
