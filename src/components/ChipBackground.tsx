import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/* ---------- Reusable geometries / materials ---------- */

function useBeveledBox(w: number, h: number, d: number, bevel = 0.04) {
  return useMemo(() => {
    const shape = new THREE.Shape();
    const x = w / 2;
    const z = d / 2;
    const r = Math.min(bevel * 2, x, z);
    shape.moveTo(-x + r, -z);
    shape.lineTo(x - r, -z);
    shape.quadraticCurveTo(x, -z, x, -z + r);
    shape.lineTo(x, z - r);
    shape.quadraticCurveTo(x, z, x - r, z);
    shape.lineTo(-x + r, z);
    shape.quadraticCurveTo(-x, z, -x, z - r);
    shape.lineTo(-x, -z + r);
    shape.quadraticCurveTo(-x, -z, -x + r, -z);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: h,
      bevelEnabled: true,
      bevelSize: bevel,
      bevelThickness: bevel,
      bevelSegments: 4,
      curveSegments: 8,
    });
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, -bevel, 0);
    return geo;
  }, [w, h, d, bevel]);
}

/* ---------- A single QFP-style leg (gull-wing) ---------- */
function Leg({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* horizontal exit from chip body */}
      <mesh position={[0.05, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 0.02, 0.07]} />
        <meshStandardMaterial color="#e2e8f0" metalness={1} roughness={0.22} />
      </mesh>
      {/* downward bend */}
      <mesh position={[0.11, -0.04, 0]} castShadow>
        <boxGeometry args={[0.025, 0.1, 0.07]} />
        <meshStandardMaterial color="#e2e8f0" metalness={1} roughness={0.22} />
      </mesh>
      {/* foot pad */}
      <mesh position={[0.16, -0.085, 0]} castShadow>
        <boxGeometry args={[0.13, 0.018, 0.07]} />
        <meshStandardMaterial color="#cbd5e1" metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ---------- The chip ---------- */
function Chip() {
  const group = useRef<THREE.Group>(null);
  const dieGlow = useRef<THREE.MeshStandardMaterial>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const t = useRef(0);
  useFrame((_, delta) => {
    t.current += delta;
    if (!group.current) return;
    const max = Math.max(document.body.scrollHeight - window.innerHeight, 1);
    const p = Math.min(scrollY / max, 1);
    const targetX = -0.45 + p * 1.5;
    const targetY = 0.5 + p * Math.PI * 1.6;
    const targetZ = p * 0.35;
    const g = group.current;
    g.rotation.x += (targetX - g.rotation.x) * Math.min(delta * 4, 1);
    g.rotation.y += (targetY - g.rotation.y) * Math.min(delta * 4, 1);
    g.rotation.z += (targetZ - g.rotation.z) * Math.min(delta * 4, 1);
    g.position.y = -p * 0.6 + Math.sin(t.current * 0.6) * 0.04;
    g.rotation.y += delta * 0.05;
    if (dieGlow.current) {
      dieGlow.current.emissiveIntensity = 1.6 + Math.sin(t.current * 2.2) * 0.5;
    }
  });

  const bodyGeo = useBeveledBox(2.4, 0.26, 2.4, 0.05);
  const accent = useMemo(() => new THREE.Color("#22d3ee"), []);
  const gold = useMemo(() => new THREE.Color("#d4a85a"), []);

  /* pins around the 4 sides */
  const pinsPerSide = 14;
  const sideLen = 2.0;
  const step = sideLen / pinsPerSide;
  const half = 1.2; // body half + a bit
  const legs: { pos: [number, number, number]; rot: [number, number, number] }[] = [];
  for (let i = 0; i < pinsPerSide; i++) {
    const o = -sideLen / 2 + step / 2 + i * step;
    legs.push({ pos: [half, -0.02, o], rot: [0, 0, 0] });
    legs.push({ pos: [-half, -0.02, o], rot: [0, Math.PI, 0] });
    legs.push({ pos: [o, -0.02, half], rot: [0, -Math.PI / 2, 0] });
    legs.push({ pos: [o, -0.02, -half], rot: [0, Math.PI / 2, 0] });
  }

  /* surface traces — radial pattern from die */
  const traces = useMemo(() => {
    const arr: { pos: [number, number, number]; len: number; rot: number }[] = [];
    const rings = 10;
    for (let i = 0; i < rings; i++) {
      const a = (i / rings) * Math.PI * 2;
      const len = 0.35 + (i % 3) * 0.12;
      const r = 0.4;
      arr.push({
        pos: [Math.cos(a) * (r + len / 2), 0.141, Math.sin(a) * (r + len / 2)],
        len,
        rot: a + Math.PI / 2,
      });
    }
    return arr;
  }, []);

  /* tiny SMD passives scattered on the surface */
  const passives = useMemo(
    () => [
      { p: [-0.85, 0.135, -0.85], c: "#1a1a1a" },
      { p: [0.85, 0.135, -0.85], c: "#b45309" },
      { p: [0.85, 0.135, 0.85], c: "#1a1a1a" },
      { p: [-0.85, 0.135, 0.85], c: "#b45309" },
    ] as const,
    [],
  );

  return (
    <group ref={group}>
      {/* chip body */}
      <mesh geometry={bodyGeo} castShadow receiveShadow>
        <meshStandardMaterial color="#0a0d18" metalness={0.55} roughness={0.55} />
      </mesh>

      {/* top recessed surface (slightly inset, lighter) */}
      <mesh position={[0, 0.135, 0]} receiveShadow>
        <boxGeometry args={[2.18, 0.012, 2.18]} />
        <meshStandardMaterial color="#101830" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* pin-1 indicator dot */}
      <mesh position={[-0.95, 0.143, -0.95]}>
        <cylinderGeometry args={[0.05, 0.05, 0.004, 24]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* silkscreen text bar (label area) */}
      <mesh position={[0, 0.142, -0.78]}>
        <boxGeometry args={[1.2, 0.003, 0.18]} />
        <meshStandardMaterial color="#1c2440" metalness={0.2} roughness={0.7} />
      </mesh>
      {/* faux text dashes */}
      {[-0.45, -0.25, -0.05, 0.15, 0.35].map((x) => (
        <mesh key={x} position={[x, 0.146, -0.78]}>
          <boxGeometry args={[0.12, 0.002, 0.025]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.1} roughness={0.8} />
        </mesh>
      ))}

      {/* radial PCB-like emissive traces */}
      {traces.map((t, i) => (
        <mesh key={i} position={t.pos} rotation={[0, t.rot, 0]}>
          <boxGeometry args={[t.len, 0.003, 0.018]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={1.6}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* gold bond-wire ring around die */}
      <mesh position={[0, 0.155, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.36, 0.4, 48]} />
        <meshStandardMaterial color={gold} metalness={1} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* die cavity (dark silicon well) */}
      <mesh position={[0, 0.148, 0]}>
        <boxGeometry args={[0.72, 0.006, 0.72]} />
        <meshStandardMaterial color="#070912" metalness={0.2} roughness={0.9} />
      </mesh>
      {/* silicon die */}
      <mesh position={[0, 0.16, 0]} castShadow>
        <boxGeometry args={[0.58, 0.02, 0.58]} />
        <meshStandardMaterial color="#1d2a4d" metalness={0.6} roughness={0.35} />
      </mesh>
      {/* die surface — emissive grid */}
      <mesh position={[0, 0.172, 0]}>
        <boxGeometry args={[0.5, 0.001, 0.5]} />
        <meshStandardMaterial
          ref={dieGlow}
          color={accent}
          emissive={accent}
          emissiveIntensity={1.8}
          toneMapped={false}
        />
      </mesh>
      {/* die crosshatch grid (subtle) */}
      {[-0.18, -0.06, 0.06, 0.18].map((v) => (
        <group key={v}>
          <mesh position={[v, 0.1735, 0]}>
            <boxGeometry args={[0.006, 0.001, 0.5]} />
            <meshStandardMaterial color="#0a0f1e" />
          </mesh>
          <mesh position={[0, 0.1735, v]}>
            <boxGeometry args={[0.5, 0.001, 0.006]} />
            <meshStandardMaterial color="#0a0f1e" />
          </mesh>
        </group>
      ))}

      {/* SMD passive components on corners */}
      {passives.map((c, i) => (
        <mesh key={i} position={c.p as [number, number, number]} castShadow>
          <boxGeometry args={[0.12, 0.04, 0.06]} />
          <meshStandardMaterial color={c.c} metalness={0.4} roughness={0.5} />
        </mesh>
      ))}

      {/* legs */}
      {legs.map((l, i) => (
        <Leg key={i} position={l.pos} rotation={l.rot} />
      ))}

      {/* PCB shadow plane underneath for grounding */}
      <mesh position={[0, -0.13, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.2, 48]} />
        <meshStandardMaterial
          color="#0a3d2e"
          metalness={0.2}
          roughness={0.85}
          transparent
          opacity={0.55}
        />
      </mesh>
    </group>
  );
}

export function ChipBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 opacity-80 [mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_88%)]"
    >
      <Canvas
        camera={{ position: [0, 1.8, 4.6], fov: 38 }}
        dpr={[1, 2]}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#070b16"]} />
        <fog attach="fog" args={["#070b16", 5.5, 11]} />
        <ambientLight intensity={0.25} />
        <directionalLight
          position={[3.5, 5, 2]}
          intensity={1.4}
          color="#cffafe"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-3, 2, -2]} intensity={1.4} color="#22d3ee" />
        <pointLight position={[0, 0.5, 0]} intensity={0.6} color="#22d3ee" distance={3} />
        <Environment preset="city" />
        <Chip />
      </Canvas>
    </div>
  );
}
