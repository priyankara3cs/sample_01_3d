"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

/**
 * Paper boat that floats on a given water level, or relative to its parent.
 * If `relative` is true, the boat bobs around y=0 and you position its parent.
 */
export default function Boat({
  url = "/assets/models/paper_boat_yellow_color.glb",
  waterY = 0, // world Y of water surface (ignored when relative=true)
  relative = false, // <-- NEW: bob around parent origin
  x = 0,
  z = 0,
  scale = 0.12,
  bob = 0.05,
  speed = 0.7,
  tilt = 0.07,
  heading = Math.PI * 0.06,
  ...props
}) {
  const ref = useRef();
  const { scene } = useGLTF(url);

  useMemo(() => {
    scene.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
  }, [scene]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * speed;
    const baseY = relative ? 0 : waterY; // <-- key line
    ref.current.position.set(x, baseY + Math.sin(t) * bob, z);
    ref.current.rotation.set(
      Math.cos(t * 0.9) * tilt * 0.5,
      heading,
      Math.sin(t * 1.1) * tilt * 0.7
    );
  });

  return (
    <group ref={ref} scale={scale} {...props}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/assets/models/paper_boat_yellow_color.glb");
