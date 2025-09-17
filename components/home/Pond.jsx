"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";

/**
 * Loads /public/assets/models/pond.glb, fits to viewport width,
 * and reports the **water surface Y** via onWaterLevel (box.max.y).
 */
export default function Pond({
  url = "/assets/models/pond.glb",
  position = [0, -1, 0],
  rotation = [0, 0, 0],
  baseScale = 1,
  fitWidth = 0.95,
  onWaterLevel,
  waterLevelBias = 0, // fine tune ± a few millimeters if needed
  ...props
}) {
  const group = useRef();
  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, group);
  const { camera, viewport } = useThree();

  useEffect(() => {
    Object.values(actions || {}).forEach((a) => a?.reset().fadeIn(0.2).play());
    return () => Object.values(actions || {}).forEach((a) => a?.fadeOut(0.2));
  }, [actions]);

  useMemo(() => {
    scene.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = false;
        o.receiveShadow = true;
        if (o.material) o.material.envMapIntensity = 0.9;
      }
    });
  }, [scene]);

  // compute world-space water surface (top of the water mesh)
  const computeWaterSurfaceY = () => {
    // try to find a mesh with "water" in its name/material
    let water = null;
    scene.traverse((o) => {
      if (o.isMesh) {
        const label = `${o.name} ${o.material?.name || ""}`.toLowerCase();
        if (!water && (label.includes("water") || label.includes("pond"))) {
          water = o;
        }
      }
    });

    if (!water) {
      // fallback: group's world Y
      const p = new THREE.Vector3();
      group.current.getWorldPosition(p);
      return p.y + waterLevelBias;
    }

    water.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(water);
    return box.max.y + waterLevelBias; // <-- TOP surface!
  };

  // auto-fit and then report water level after scale applied
  useEffect(() => {
    if (!group.current) return;

    const fit = () => {
      // 1) model native width in its own space
      const nativeBox = new THREE.Box3().setFromObject(scene);
      const nativeWidth = nativeBox.getSize(new THREE.Vector3()).x || 1;

      // 2) viewport width at pond depth
      const worldPos = new THREE.Vector3();
      group.current.getWorldPosition(worldPos);
      const { width: vpWidth } = viewport.getCurrentViewport(camera, worldPos);

      // 3) scale to fit
      const target = vpWidth * THREE.MathUtils.clamp(fitWidth, 0.1, 1);
      const s = (target / nativeWidth) * baseScale;
      group.current.scale.setScalar(s);

      // 4) report water surface after scale applied
      if (onWaterLevel) {
        const y = computeWaterSurfaceY();
        if (typeof y === "number") onWaterLevel(y);
      }
    };

    fit();
    const raf = requestAnimationFrame(fit);
    const tid = setTimeout(fit, 60);
    window.addEventListener("resize", fit);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(tid);
      window.removeEventListener("resize", fit);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, baseScale, fitWidth, waterLevelBias]);

  return (
    <group ref={group} position={position} rotation={rotation} {...props}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/assets/models/pond.glb");
