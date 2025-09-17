"use client";
import React, { createContext, useContext, useRef, useState } from "react";

const MusicContext = createContext();

export function useMusic() {
  return useContext(MusicContext);
}

export function MusicProvider({ children }) {
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  // This now controls all audio muting on the site!
  const toggleMute = () => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      if (audioRef.current) {
        audioRef.current.muted = newMuted;
        if (!newMuted) {
          audioRef.current.play().catch(() => {});
        }
      }
      return newMuted;
    });
  };

  return (
    <MusicContext.Provider value={{ isMuted, toggleMute }}>
      {/* The main background music */}
      <audio
        ref={audioRef}
        src="/assets/sounds/soundtrack.mp3"
        loop
        muted={isMuted}
        preload="auto"
      />
      {children}
    </MusicContext.Provider>
  );
}
