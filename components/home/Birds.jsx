"use client";

import { useGLTF, useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export default function Birds() {
  const { scene } = useGLTF("/assets/models/butterflies.glb");
  const scroll = useScroll();
  const group = useRef();

  const clones = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 10; i++) {
      const g = scene.clone(true);
      g.position.set(
        2.0 + Math.random() * 0.7,
        0.2 + Math.random() * 0.2,
        -0.1 + Math.random() * 0.6
      );
      g.rotation.y = Math.random() * Math.PI * 2;
      const s = 0.15 + Math.random() * 0.12;
      g.scale.setScalar(s);
      g.userData.baseY = g.position.y;
      arr.push(g);
    }
    return arr;
  }, [scene]);

  useFrame(({ clock }) => {
    if (!group.current) return;

    const t = THREE.MathUtils.clamp((scroll.offset - 0.86) / 0.12, 0, 1);
    group.current.visible = t > 0.001;

    const lift = t * 2.4;
    let i = 0;
    for (const child of group.current.children) {
      const wobble = Math.sin(clock.getElapsedTime() * (1.2 + i * 0.13)) * 0.04;
      child.position.y = child.userData.baseY + lift + wobble;
      child.rotation.y += 0.01 + i * 0.0008;
      i++;
    }
  });

  return (
    <group ref={group} visible={false}>
      {clones.map((c, i) => (
        <primitive key={i} object={c} />
      ))}
    </group>
  );
}

useGLTF.preload("/assets/models/butterflies.glb");
