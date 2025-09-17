"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useScroll } from "@react-three/drei";

export default function School({ waterY = 0 }) {
  const scroll = useScroll();
  const group = useRef();

  // Optional external model
  let gltf;
  try {
    gltf = useGLTF("/assets/models/school.glb"); // if you add one later
  } catch {
    gltf = null;
  }

  // placeholder geometry (cute blocky school)
  const placeholder = useMemo(() => {
    const g = new THREE.Group();

    // body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.35, 0.5),
      new THREE.MeshStandardMaterial({ color: "#ffd38d" })
    );
    body.position.set(2.4, waterY + 0.2, 0.1);
    g.add(body);

    // roof
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(0.56, 0.25, 4),
      new THREE.MeshStandardMaterial({ color: "#e4572e" })
    );
    roof.rotation.y = Math.PI / 4;
    roof.position.set(2.4, waterY + 0.47, 0.1);
    g.add(roof);

    // door
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.18, 0.04),
      new THREE.MeshStandardMaterial({ color: "#6b4f4f" })
    );
    door.position.set(2.4, waterY + 0.12, 0.33);
    g.add(door);

    return g;
  }, [waterY]);

  useEffect(() => {
    if (!group.current) return;
    if (gltf?.scene) group.current.add(gltf.scene);
    else group.current.add(placeholder);

    return () => {
      if (!group.current) return;
      if (gltf?.scene) group.current.remove(gltf.scene);
      else group.current.remove(placeholder);
    };
  }, [gltf, placeholder]);

  useFrame(() => {
    if (!group.current) return;

    // Show during Step 4 (roughly scroll 0.6→0.85). Scale up smoothly.
    const t = THREE.MathUtils.clamp((scroll.offset - 0.62) / 0.18, 0, 1);
    const s = THREE.MathUtils.lerp(0.001, 1, t * t * (3 - 2 * t));
    group.current.scale.setScalar(s);
    group.current.visible = s > 0.01;
  });

  return <group ref={group} />;
}

useGLTF.preload("/assets/models/school.glb");
