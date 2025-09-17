"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import LoadingScreen from "../loading/LoadingScreen";
import { useLoaderSeen } from "@/components/providers/LoaderSeenProvider";

const HomeScene = dynamic(() => import("./HomeScene"), { ssr: false });

/** Exact timing requirements */
const RAMP1_TO_PERCENT = 95; // 0 → 95%
const RAMP1_MS = 500;
const RAMP2_MS = 1000;
const TOTAL_MS = RAMP1_MS + RAMP2_MS;

export default function HomePage() {
  const { ready, seen, markSeen } = useLoaderSeen();

  const [progress, setProgress] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [showLoader, setShowLoader] = useState(false);

  const rafRef = useRef(null);
  const startRef = useRef(0);

  // show loader only on first visit this tab
  useEffect(() => {
    if (!ready) return;
    if (!seen) setShowLoader(true);
  }, [ready, seen]);

  // drive the exact 0→95% (0.2s) then 95→100% (0.1s) animation
  useEffect(() => {
    if (!showLoader) return;

    startRef.current = performance.now();

    const tick = () => {
      const now = performance.now();
      const elapsed = now - startRef.current;
      setElapsedMs(elapsed);

      let p = 0;
      if (elapsed <= RAMP1_MS) {
        // 0 → 95% in RAMP1_MS
        p = (elapsed / RAMP1_MS) * RAMP1_TO_PERCENT;
      } else if (elapsed <= TOTAL_MS) {
        // 95% → 100% in RAMP2_MS
        const e2 = elapsed - RAMP1_MS;
        p = RAMP1_TO_PERCENT + (e2 / RAMP2_MS) * (100 - RAMP1_TO_PERCENT);
      } else {
        // done
        p = 100;
      }

      setProgress(Math.min(100, Math.floor(p)));

      if (elapsed < TOTAL_MS) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // reached 100% exactly on schedule → hide loader, show Home
        markSeen();
        setShowLoader(false);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [showLoader, markSeen]);

  // We ignore real scene progress to keep the strict timing you asked for.
  // (HomeScene can still load in parallel.)
  const handleSceneProgress = () => {};
  const handleSceneReady = () => {};

  return (
    <div className="page-root">
      {showLoader && (
        <LoadingScreen progress={progress} elapsedMs={elapsedMs} />
      )}
      <HomeScene onProgress={handleSceneProgress} onReady={handleSceneReady} />
    </div>
  );
}
