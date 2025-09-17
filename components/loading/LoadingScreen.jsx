"use client";
import NewProgressBar from "./CandyCssBar";

export default function LoadingScreen({
  progress = 0,
  elapsedMs = 0,
  logoSrc = "/assets/images/logo.png",
}) {
  const secs = (elapsedMs / 1000).toFixed(1);

  return (
    <div className="loader-overlay">
      <div className="loader-card">
        <img
          src={logoSrc}
          alt="Chitralane"
          className="logo"
          draggable="false"
        />
        <div style={{ width: "100%", height: 40 }}>
          <NewProgressBar progress={progress} />
        </div>
        <div className="progress-text" style={{ marginTop: 10 }}>
          {Math.round(progress)}%{/* • {secs}s */}
        </div>
      </div>
    </div>
  );
}
