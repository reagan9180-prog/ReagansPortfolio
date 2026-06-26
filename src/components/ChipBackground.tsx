import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  SSAO,
  ChromaticAberration,
  Vignette,
  Noise,
  DepthOfField,
  BrightnessContrast,
  HueSaturation,
  ToneMapping,
} from "@react-three/postprocessing";
import { BlendFunction, KernelSize, ToneMappingMode } from "postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/* ---------------- Reusable rounded / beveled box ---------------- */
function useBeveledBox(w: number, h: number, d: number, bevel = 0.02) {
  return useMemo(() => {
    const shape = new THREE.Shape();
    const x = w / 2;
    const z = d / 2;
    const r = Math.min(bevel * 2, x * 0.9, z * 0.9);
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
      bevelSegments: 3,
      curveSegments: 6,
    });
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, -bevel, 0);
    return geo;
  }, [w, h, d, bevel]);
}

/* ---------------- Materials ---------------- */
const PCB_GREEN = "#0e3b2a";
const PCB_DARK = "#082015";
const SOLDER = "#d8e0ea";
const GOLD = "#d4a85a";
const SILICON = "#0a0d18";
const ACCENT = "#22d3ee";

/* ---------------- A QFP IC chip ---------------- */
function QFPChip({
  position,
  size = 0.7,
  label,
  glow = false,
}: {
  position: [number, number, number];
  size?: number;
  label?: string;
  glow?: boolean;
}) {
  const body = useBeveledBox(size, 0.09, size, 0.015);
  const dieRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((_, dt) => {
    if (glow && dieRef.current) {
      dieRef.current.emissiveIntensity =
        1.2 + Math.sin(performance.now() * 0.002) * 0.6;
    }
  });
  const pinsPerSide = 10;
  const sideLen = size * 0.78;
  const step = sideLen / pinsPerSide;
  const half = size / 2 + 0.005;
  const pins: { p: [number, number, number]; r: [number, number, number] }[] = [];
  for (let i = 0; i < pinsPerSide; i++) {
    const o = -sideLen / 2 + step / 2 + i * step;
    pins.push({ p: [half, -0.005, o], r: [0, 0, 0] });
    pins.push({ p: [-half, -0.005, o], r: [0, Math.PI, 0] });
    pins.push({ p: [o, -0.005, half], r: [0, -Math.PI / 2, 0] });
    pins.push({ p: [o, -0.005, -half], r: [0, Math.PI / 2, 0] });
  }
  return (
    <group position={position}>
      <mesh geometry={body} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={SILICON}
          metalness={0.55}
          roughness={0.45}
          clearcoat={0.6}
          clearcoatRoughness={0.25}
          reflectivity={0.5}
        />
      </mesh>
      {/* top etched surface */}
      <mesh position={[0, 0.046, 0]}>
        <boxGeometry args={[size * 0.92, 0.004, size * 0.92]} />
        <meshPhysicalMaterial
          color="#141a2a"
          metalness={0.4}
          roughness={0.6}
          clearcoat={0.4}
          clearcoatRoughness={0.4}
        />
      </mesh>
      {/* pin-1 dot */}
      <mesh position={[-size * 0.38, 0.05, -size * 0.38]}>
        <cylinderGeometry args={[size * 0.03, size * 0.03, 0.003, 20]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.5} />
      </mesh>
      {/* label silkscreen line */}
      {label && (
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[size * 0.5, 0.002, size * 0.08]} />
          <meshStandardMaterial color="#c4cad6" roughness={0.95} />
        </mesh>
      )}
      {/* optional glowing die */}
      {glow && (
        <mesh position={[0, 0.053, 0]}>
          <boxGeometry args={[size * 0.32, 0.001, size * 0.32]} />
          <meshStandardMaterial
            ref={dieRef}
            color={ACCENT}
            emissive={ACCENT}
            emissiveIntensity={1.4}
            toneMapped={false}
          />
        </mesh>
      )}
      {/* pins */}
      {pins.map((pn, i) => (
        <group key={i} position={pn.p} rotation={pn.r}>
          <mesh position={[0.035, 0, 0]} castShadow>
            <boxGeometry args={[0.07, 0.012, size * 0.05]} />
            <meshPhysicalMaterial color={SOLDER} metalness={1} roughness={0.18} clearcoat={1} clearcoatRoughness={0.1} />
          </mesh>
          <mesh position={[0.078, -0.02, 0]} castShadow>
            <boxGeometry args={[0.015, 0.045, size * 0.05]} />
            <meshPhysicalMaterial color={SOLDER} metalness={1} roughness={0.2} clearcoat={1} clearcoatRoughness={0.12} />
          </mesh>
          <mesh position={[0.105, -0.045, 0]} castShadow>
            <boxGeometry args={[0.06, 0.01, size * 0.05]} />
            <meshPhysicalMaterial color="#cbd5e1" metalness={1} roughness={0.28} clearcoat={0.8} clearcoatRoughness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ---------------- Cylindrical capacitor ---------------- */
function Capacitor({
  position,
  height = 0.32,
  radius = 0.09,
  color = "#1a1f3a",
}: {
  position: [number, number, number];
  height?: number;
  radius?: number;
  color?: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[radius, radius, height, 28]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.85}
          roughness={0.28}
          clearcoat={0.7}
          clearcoatRoughness={0.25}
        />
      </mesh>
      {/* top cross indent */}
      <mesh position={[0, height + 0.002, 0]}>
        <cylinderGeometry args={[radius * 0.95, radius * 0.95, 0.005, 28]} />
        <meshStandardMaterial color="#0a0d18" roughness={0.6} />
      </mesh>
      <mesh position={[0, height + 0.004, 0]}>
        <boxGeometry args={[radius * 1.7, 0.003, 0.01]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[0, height + 0.004, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[radius * 1.7, 0.003, 0.01]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      {/* white stripe */}
      <mesh position={[0, height * 0.65, 0]}>
        <cylinderGeometry args={[radius + 0.001, radius + 0.001, height * 0.12, 28, 1, true]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ---------------- SMD resistor ---------------- */
function Resistor({
  position,
  rotationY = 0,
  color = "#0a0d18",
}: {
  position: [number, number, number];
  rotationY?: number;
  color?: string;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.018, 0]} castShadow>
        <boxGeometry args={[0.14, 0.035, 0.07]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[-0.072, 0.018, 0]} castShadow>
        <boxGeometry args={[0.022, 0.04, 0.075]} />
        <meshStandardMaterial color={SOLDER} metalness={1} roughness={0.3} />
      </mesh>
      <mesh position={[0.072, 0.018, 0]} castShadow>
        <boxGeometry args={[0.022, 0.04, 0.075]} />
        <meshStandardMaterial color={SOLDER} metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ---------------- LED ---------------- */
function LED({
  position,
  color = "#22d3ee",
}: {
  position: [number, number, number];
  color?: string;
}) {
  const ref = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    if (ref.current) {
      ref.current.emissiveIntensity = 1.5 + Math.sin(performance.now() * 0.004) * 0.8;
    }
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.015, 0]} castShadow>
        <boxGeometry args={[0.08, 0.03, 0.05]} />
        <meshStandardMaterial color="#0a0d18" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.034, 0]}>
        <boxGeometry args={[0.05, 0.008, 0.035]} />
        <meshStandardMaterial
          ref={ref}
          color={color}
          emissive={color}
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* ---------------- DIMM / RAM slot with stick ---------------- */
function RAMStick({ position }: { position: [number, number, number] }) {
  const pcb = useBeveledBox(1.6, 0.04, 0.32, 0.008);
  return (
    <group position={position}>
      <mesh geometry={pcb} castShadow receiveShadow>
        <meshStandardMaterial color="#0a2a1d" metalness={0.3} roughness={0.7} />
      </mesh>
      {/* chips on RAM */}
      {[-0.6, -0.3, 0, 0.3, 0.6].map((x) => (
        <mesh key={x} position={[x, 0.045, 0]} castShadow>
          <boxGeometry args={[0.22, 0.04, 0.16]} />
          <meshStandardMaterial color="#101522" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
      {/* gold pins along bottom */}
      <mesh position={[0, -0.005, 0.13]}>
        <boxGeometry args={[1.5, 0.008, 0.02]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.005, -0.13]}>
        <boxGeometry args={[1.5, 0.008, 0.02]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ---------------- PCB traces (emissive lines) ---------------- */
function Traces() {
  const segs = useMemo(() => {
    const arr: { p: [number, number, number]; s: [number, number, number] }[] = [];
    // horizontal traces
    for (let i = 0; i < 14; i++) {
      const z = -1.3 + i * 0.18 + (i % 2 === 0 ? 0.02 : 0);
      arr.push({ p: [0, 0.026, z], s: [2.6 + (i % 3) * 0.2 - 0.4, 0.002, 0.012] });
    }
    // vertical short stubs
    for (let i = 0; i < 10; i++) {
      const x = -1.2 + i * 0.26;
      arr.push({ p: [x, 0.026, 0], s: [0.012, 0.002, 0.6 + (i % 4) * 0.1] });
    }
    return arr;
  }, []);
  return (
    <group>
      {segs.map((t, i) => (
        <mesh key={i} position={t.p}>
          <boxGeometry args={t.s} />
          <meshStandardMaterial
            color={ACCENT}
            emissive={ACCENT}
            emissiveIntensity={0.6}
            toneMapped={false}
            opacity={0.75}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------- Motherboard scene ---------------- */
function Motherboard() {
  const group = useRef<THREE.Group>(null);
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const on = () => setScrollY(window.scrollY);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const t = useRef(0);
  useFrame((_, delta) => {
    t.current += delta;
    if (!group.current) return;
    const max = Math.max(document.body.scrollHeight - window.innerHeight, 1);
    const p = Math.min(scrollY / max, 1);
    const targetX = -0.55 + p * 1.4;
    const targetY = 0.4 + p * Math.PI * 1.5;
    const targetZ = -0.05 + p * 0.3;
    const g = group.current;
    g.rotation.x += (targetX - g.rotation.x) * Math.min(delta * 3.5, 1);
    g.rotation.y += (targetY - g.rotation.y) * Math.min(delta * 3.5, 1);
    g.rotation.z += (targetZ - g.rotation.z) * Math.min(delta * 3.5, 1);
    g.position.y = -p * 0.5 + Math.sin(t.current * 0.6) * 0.04;
    g.rotation.y += delta * 0.04;
  });

  const board = useBeveledBox(3.4, 0.05, 2.4, 0.04);

  // mounting holes (cylinders cutout simulated by darker dots + screws)
  const mounts: [number, number, number][] = [
    [-1.55, 0.028, -1.05],
    [1.55, 0.028, -1.05],
    [-1.55, 0.028, 1.05],
    [1.55, 0.028, 1.05],
  ];

  // QR/silkscreen squares
  const silks: [number, number, number, number][] = [
    [-1.3, 0.027, 0.95, 0.16],
    [1.3, 0.027, -0.9, 0.12],
  ];

  return (
    <group ref={group}>
      {/* PCB substrate with solder-mask sheen */}
      <mesh geometry={board} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={PCB_GREEN}
          metalness={0.15}
          roughness={0.55}
          clearcoat={1}
          clearcoatRoughness={0.35}
          sheen={0.4}
          sheenColor={"#0a5a3a"}
          sheenRoughness={0.6}
        />
      </mesh>
      {/* darker inner layer for depth */}
      <mesh position={[0, 0.024, 0]}>
        <boxGeometry args={[3.32, 0.002, 2.32]} />
        <meshPhysicalMaterial color={PCB_DARK} roughness={0.85} clearcoat={0.5} clearcoatRoughness={0.5} />
      </mesh>

      <Traces />

      {/* Main CPU — large QFP, glowing */}
      <QFPChip position={[-0.3, 0.025, -0.1]} size={1.0} glow label="CPU" />

      {/* secondary IC */}
      <QFPChip position={[0.9, 0.025, 0.55]} size={0.55} label="NIC" />
      <QFPChip position={[1.05, 0.025, -0.55]} size={0.45} />

      {/* RAM stick standing-ish flat */}
      <RAMStick position={[0.6, 0.045, -0.95]} />

      {/* Capacitors cluster */}
      <Capacitor position={[-1.25, 0.025, -0.2]} height={0.36} radius={0.1} color="#1e2754" />
      <Capacitor position={[-1.25, 0.025, 0.1]} height={0.28} radius={0.085} color="#1e2754" />
      <Capacitor position={[-1.25, 0.025, 0.4]} height={0.24} radius={0.075} color="#3a1414" />
      <Capacitor position={[-0.95, 0.025, 0.6]} height={0.3} radius={0.085} color="#1e2754" />

      {/* SMD resistors scattered */}
      {[
        [0.2, 0, 0.85, 0],
        [0.35, 0, 0.85, 0],
        [0.5, 0, 0.85, 0],
        [-0.6, 0, -0.9, Math.PI / 2],
        [-0.45, 0, -0.9, Math.PI / 2],
        [1.4, 0, 0.2, Math.PI / 2],
        [1.4, 0, 0.0, Math.PI / 2],
        [1.4, 0, -0.2, Math.PI / 2],
      ].map((r, i) => (
        <Resistor
          key={i}
          position={[r[0], 0.025, r[2]] as [number, number, number]}
          rotationY={r[3]}
          color={i % 3 === 0 ? "#3a2a0a" : "#0a0d18"}
        />
      ))}

      {/* LEDs */}
      <LED position={[-1.5, 0.025, 0.85]} color="#22d3ee" />
      <LED position={[-1.4, 0.025, 0.85]} color="#86efac" />
      <LED position={[-1.3, 0.025, 0.85]} color="#fca5a5" />

      {/* USB / port block */}
      <mesh position={[1.55, 0.12, 0.7]} castShadow>
        <boxGeometry args={[0.22, 0.2, 0.45]} />
        <meshStandardMaterial color="#cbd5e1" metalness={1} roughness={0.3} />
      </mesh>
      <mesh position={[1.46, 0.12, 0.7]}>
        <boxGeometry args={[0.04, 0.08, 0.3]} />
        <meshStandardMaterial color="#0a0d18" roughness={0.8} />
      </mesh>

      {/* Heatsink fins over CPU area — brushed anisotropic aluminum */}
      <group position={[-0.3, 0.07, -0.1]}>
        {[-0.36, -0.24, -0.12, 0, 0.12, 0.24, 0.36].map((x) => (
          <mesh key={x} position={[x, 0.06, 0]} castShadow>
            <boxGeometry args={[0.04, 0.12, 0.9]} />
            <meshPhysicalMaterial
              color="#b6c1cf"
              metalness={1}
              roughness={0.28}
              anisotropy={0.8}
              anisotropyRotation={Math.PI / 2}
              clearcoat={0.4}
              clearcoatRoughness={0.3}
            />
          </mesh>
        ))}
        <mesh position={[0, 0.005, 0]}>
          <boxGeometry args={[0.95, 0.01, 0.95]} />
          <meshPhysicalMaterial color="#d7dde6" metalness={1} roughness={0.22} clearcoat={0.6} clearcoatRoughness={0.2} />
        </mesh>
      </group>

      {/* mounting screws */}
      {mounts.map((m, i) => (
        <group key={i} position={m}>
          <mesh>
            <cylinderGeometry args={[0.06, 0.06, 0.012, 20]} />
            <meshStandardMaterial color="#94a3b8" metalness={1} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.008, 0]}>
            <boxGeometry args={[0.09, 0.003, 0.012]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
        </group>
      ))}

      {/* silkscreen labels */}
      {silks.map((s, i) => (
        <mesh key={i} position={[s[0], s[1], s[2]]}>
          <boxGeometry args={[s[3], 0.001, s[3]]} />
          <meshStandardMaterial color="#e5e7eb" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------- Floating data particles ---------------- */
function Particles() {
  const ref = useRef<THREE.Points>(null);
  const { positions, count } = useMemo(() => {
    const c = 140;
    const pos = new Float32Array(c * 3);
    for (let i = 0; i < c; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = Math.random() * 3 - 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return { positions: pos, count: c };
  }, []);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.02;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color={ACCENT}
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* ---------------- Background ---------------- */
export function ChipBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 opacity-90 [mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_90%)]"
    >
      <Canvas
        camera={{ position: [0.4, 2.1, 5.0], fov: 36 }}
        dpr={[1, 2]}
        shadows
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <color attach="background" args={["#050810"]} />
        <fog attach="fog" args={["#050810", 6, 13]} />
        <ambientLight intensity={0.22} />
        <directionalLight
          position={[4, 6, 3]}
          intensity={1.6}
          color="#e0f7ff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0002}
          shadow-normalBias={0.02}
        />
        <pointLight position={[-3.5, 2, -2]} intensity={1.8} color="#22d3ee" distance={9} decay={2} />
        <pointLight position={[2.5, 1.2, 2]} intensity={1.1} color="#7dd3fc" distance={8} decay={2} />
        <pointLight position={[0, 1.8, 0]} intensity={0.6} color="#a5f3fc" distance={4} decay={2} />
        <Environment preset="warehouse" environmentIntensity={0.65} />
        <Motherboard />
        <Particles />
        <ContactShadows
          position={[0, -0.65, 0]}
          opacity={0.7}
          scale={10}
          blur={2.8}
          far={3.5}
          resolution={1024}
          color="#000000"
        />
        <EffectComposer multisampling={0} enableNormalPass>
          <SSAO
            blendFunction={BlendFunction.MULTIPLY}
            samples={16}
            radius={0.08}
            intensity={22}
            luminanceInfluence={0.6}
            worldDistanceThreshold={1}
            worldDistanceFalloff={1}
            worldProximityThreshold={1}
            worldProximityFalloff={1}
          />
          <Bloom
            intensity={0.85}
            luminanceThreshold={0.55}
            luminanceSmoothing={0.25}
            mipmapBlur
            kernelSize={KernelSize.LARGE}
          />
          <DepthOfField focusDistance={0.018} focalLength={0.045} bokehScale={2.2} />
          <ChromaticAberration offset={[0.0006, 0.0009]} radialModulation modulationOffset={0.4} />
          <HueSaturation saturation={0.08} />
          <BrightnessContrast brightness={-0.02} contrast={0.12} />
          <Vignette eskil={false} offset={0.25} darkness={0.85} />
          <Noise opacity={0.035} premultiply blendFunction={BlendFunction.SCREEN} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
