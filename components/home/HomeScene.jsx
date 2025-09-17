"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  ScrollControls,
  Scroll,
  useScroll,
  useProgress,
} from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import Pond from "./Pond";
import Boat from "./Boat";
import School from "./School";
// Birds removed

/* helpers */
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const easeInOut = (t) => t * t * (3 - 2 * t);
function lerp3(a, b, t, out = new THREE.Vector3()) {
  return out.set(
    THREE.MathUtils.lerp(a.x, b.x, t),
    THREE.MathUtils.lerp(a.y, b.y, t),
    THREE.MathUtils.lerp(a.z, b.z, t)
  );
}

/* bridges */
function ProgressBridge({ onProgress }) {
  const { progress } = useProgress();
  useEffect(() => onProgress?.(progress), [progress, onProgress]);
  return null;
}
function ReadyBridge({ onReady }) {
  const { active, progress, loaded, total } = useProgress();
  const fired = useRef(false);
  useEffect(() => {
    const done =
      active === 0 || progress >= 99 || (total > 0 && loaded >= total);
    if (!fired.current && done) {
      fired.current = true;
      const id = setTimeout(() => onReady?.(), 50);
      return () => clearTimeout(id);
    }
  }, [active, progress, loaded, total, onReady]);
  return null;
}

/* camera rig */
function CameraRig() {
  const { camera } = useThree();
  const scroll = useScroll();

  const posKF = useMemo(
    () => [
      new THREE.Vector3(0, 1.4, 5.5), // Step 1
      new THREE.Vector3(0, 1.1, 3.6), // Step 2
      new THREE.Vector3(1.2, 1.2, 3.0), // Step 3
      new THREE.Vector3(2.2, 1.3, 2.1), // Step 4
      new THREE.Vector3(2.0, 4.0, 2.6), // Step 5
    ],
    []
  );
  const lookKF = useMemo(
    () => [
      new THREE.Vector3(0, 0.0, 0),
      new THREE.Vector3(0, 0.0, 0.2),
      new THREE.Vector3(1.1, 0.0, -0.2),
      new THREE.Vector3(2.2, 0.0, 0.1),
      new THREE.Vector3(2.0, 0.0, 0.3),
    ],
    []
  );

  const tmpP = new THREE.Vector3();
  const tmpT = new THREE.Vector3();

  useFrame(() => {
    const t = clamp01(scroll.offset);
    const seg = (posKF.length - 1) * t;
    const i = Math.floor(seg);
    const f = easeInOut(clamp01(seg - i));
    const p = lerp3(posKF[i], posKF[Math.min(i + 1, posKF.length - 1)], f, tmpP);
    const l = lerp3(lookKF[i], lookKF[Math.min(i + 1, lookKF.length - 1)], f, tmpT);
    camera.position.lerp(p, 0.12);
    camera.lookAt(l);
  });

  return null;
}

/* boat follows a spline */
function BoatFollower({ waterY = 0 }) {
  const group = useRef();
  const scroll = useScroll();

  const curve = useMemo(() => {
    const y = waterY;
    return new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0.0, y, 0.0),
        new THREE.Vector3(0.3, y, -0.4),
        new THREE.Vector3(1.0, y, -1.2),
        new THREE.Vector3(1.8, y, -0.8),
        new THREE.Vector3(2.4, y, 0.1),
      ],
      false,
      "catmullrom",
      0.4
    );
  }, [waterY]);

  const pos = new THREE.Vector3();
  const tan = new THREE.Vector3();
  const quat = new THREE.Quaternion();

  useFrame(({ clock }) => {
    if (!group.current) return;
    const u = clamp01(scroll.offset);
    curve.getPointAt(u, pos);
    curve.getTangentAt(Math.max(0.0001, Math.min(0.9999, u)), tan);
    quat.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan.clone().normalize());
    const bob = Math.sin(clock.getElapsedTime() * 1.1) * 0.015;
    group.current.position.set(pos.x, pos.y + bob, pos.z);
    group.current.quaternion.slerp(quat, 0.2);
  });

  return (
    <group ref={group}>
      <Boat waterY={waterY} heading={0} />
    </group>
  );
}

/* lights warm up over the scroll */
function WorldLights() {
  const scroll = useScroll();
  const amb = useRef();
  const dir = useRef();

  useFrame(() => {
    const t = clamp01(scroll.offset);
    const warm = easeInOut(t);
    if (amb.current) amb.current.intensity = THREE.MathUtils.lerp(0.5, 0.8, warm);
    if (dir.current) dir.current.intensity = THREE.MathUtils.lerp(0.9, 1.2, warm);
  });

  return (
    <>
      <ambientLight ref={amb} intensity={0.6} />
      <directionalLight ref={dir} position={[4, 6, 3]} intensity={1} />
    </>
  );
}

export default function HomeScene({ onProgress, onReady }) {
  const [waterY, setWaterY] = useState(null);

  return (
    <div className="home-wrap fade-in">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 1.4, 5.5], fov: 42 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <color attach="background" args={["#f8fafc"]} />

        <Suspense fallback={null}>
          <ProgressBridge onProgress={onProgress} />
          <ReadyBridge onReady={onReady} />

          <ScrollControls pages={5} damping={0.18}>
            <Scroll>
              <WorldLights />
              <Pond
                url="/assets/models/pond.glb"
                position={[0, -0.4, 0]}
                rotation={[0, 0, 0]}
                fitWidth={0.95}
                onWaterLevel={setWaterY}
              />
              {waterY !== null && <BoatFollower waterY={waterY + 0.02} />}
              <School waterY={waterY ?? 0} />
              {/* Birds removed */}
              <CameraRig />
            </Scroll>

            {/* overlay text (scroll button removed) */}
            <Scroll html>
              <div className="story-overlay">
                <section className="story-step" data-step="1">
                  <h1 className="story-h1">The Hope Of Tomorrow</h1>
                  <p className="story-p">
                    Every child deserves a home filled with love, laughter, and learning.
                  </p>
                </section>

                <section className="story-step" data-step="2">
                  <h2 className="story-h2">Dreams in Little Hands</h2>
                  <p className="story-p">
                    A small act of kindness becomes a ripple of change, carrying their hopes toward a brighter tomorrow.
                  </p>
                </section>

                <section className="story-step" data-step="3">
                  <h2 className="story-h2">The Journey of Growth</h2>
                  <p className="story-p">
                    Through life’s storms and calm waters, hope carries forward. We are more than just a shelter. We are a family, a sanctuary where children can dream again.
                  </p>
                </section>

                <section className="story-step" data-step="4">
                  <h2 className="story-h2">Where Hope Finds a Home</h2>
                  <p className="story-p">
                    The paper boat reaches the shore and unfolds into a bright, welcoming school.
                  </p>
                </section>

                <section className="story-step" data-step="5">
                  <h2 className="story-h2">Together We Build Futures</h2>
                  <p className="story-p">
                    Children learning, playing, smiling — where hope takes flight.
                  </p>
                </section>
              </div>
            </Scroll>
          </ScrollControls>
        </Suspense>

        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
    </div>
  );
}
