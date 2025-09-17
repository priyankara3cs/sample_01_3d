"use client";
import React from "react";

export default function CandyCssBar({
  progress = 0,
  width = 450, // px
  height = 42, // px
}) {
  const p = Math.max(0, Math.min(100, progress));

  return (
    <div
      className="candy-wrap"
      style={{ "--w": `${width}px`, "--h": `${height}px` }}
    >
      <div className="candy-pill">
        {/* inner slot wrapper (clips + isolates blending) */}
        <div className="candy-slot">
          <div className="candy-fill" style={{ width: `${p}%` }}>
            <div className="candy-stripes" />
          </div>
        </div>
      </div>

      <style jsx>{`
        .candy-wrap {
          width: var(--w);
          height: var(--h);
          margin: 0 auto;
          box-sizing: border-box;
        }

        /* Purple bezel (outer) */
        .candy-pill {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          background: linear-gradient(180deg, #b79bff 0%, #5b21b6 100%);
          box-shadow: 0 12px 30px rgba(80, 35, 180, 0.15),
            0 2px 6px rgba(0, 0, 0, 0.1) inset;
        }

        /* Slot wrapper: exact inset, clips children, isolates blend */
        .candy-slot {
          --pad: calc(var(--h) * 0.16); /* bezel thickness */
          position: absolute;
          left: var(--pad);
          right: var(--pad);
          top: var(--pad);
          bottom: var(--pad);
          border-radius: 9999px;
          overflow: hidden; /* ⟵ hard clip for fill/stripes */
          isolation: isolate; /* ⟵ keep blend effects inside */
          background: linear-gradient(180deg, #6b46c1 0%, #4c1d95 100%);
          box-shadow: 0 1px 0 rgba(255, 255, 255, 0.35) inset,
            0 -2px 6px rgba(0, 0, 0, 0.25) inset;
        }

        /* Fill measured against the SLOT (not bezel) */
        .candy-fill {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          min-width: var(--h); /* keeps a rounded cap when very small */
          border-radius: inherit;
          overflow: hidden; /* ⟵ stripes stay inside cap shape */
          background: linear-gradient(90deg, #ffd24a 0%, #ffb000 100%);
          box-shadow: 0 1px 0 rgba(255, 255, 255, 0.45) inset,
            0 -2px 6px rgba(0, 0, 0, 0.15) inset;
          transition: width 280ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: width;
        }

        /* Animated diagonal white stripes */
        .candy-stripes {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            -45deg,
            rgba(255, 255, 255, 0.85) 0 14px,
            rgba(255, 255, 255, 0) 14px 28px
          );
          /* Blend only within the slot (thanks to isolation above) */
          mix-blend-mode: screen;
          animation: slide 1.1s linear infinite;
          opacity: 0.75;

          /* Softly hide stripes right at the rounded caps to avoid wedges */
          -webkit-mask-image: linear-gradient(
            90deg,
            transparent 0,
            #000 calc(var(--h) * 0.5),
            #000 calc(100% - var(--h) * 0.5),
            transparent 100%
          );
          mask-image: linear-gradient(
            90deg,
            transparent 0,
            #000 calc(var(--h) * 0.5),
            #000 calc(100% - var(--h) * 0.5),
            transparent 100%
          );
        }

        @keyframes slide {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 56px 0;
          }
        }
      `}</style>
    </div>
  );
}
