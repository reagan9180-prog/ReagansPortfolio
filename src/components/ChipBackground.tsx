import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

function Chip() {
  const group = useRef<THREE.Group>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrame((_, delta) => {
    if (!group.current) return;
    const max = Math.max(document.body.scrollHeight - window.innerHeight, 1);
    const p = Math.min(scrollY / max, 1);
    // target rotation driven by scroll
    const targetX = -0.35 + p * 1.4;
    const targetY = 0.4 + p * Math.PI * 1.6;
    const targetZ = p * 0.4;
    group.current.rotation.x += (targetX - group.current.rotation.x) * Math.min(delta * 4, 1);
    group.current.rotation.y += (targetY - group.current.rotation.y) * Math.min(delta * 4, 1);
    group.current.rotation.z += (targetZ - group.current.rotation.z) * Math.min(delta * 4, 1);
    group.current.position.y = -p * 0.6;
    // gentle idle wobble
    group.current.rotation.y += delta * 0.04;
  });

  // generate pin positions on 4 sides
  const pinCount = 10;
  const pins: { pos: [number, number, number]; rot: [number, number, number] }[] = [];
  for (let i = 0; i < pinCount; i++) {
    const t = (i + 0.5) / pinCount;
    const x = -1 + t * 2;
    pins.push({ pos: [x, 0, 1.05], rot: [0, 0, 0] });
    pins.push({ pos: [x, 0, -1.05], rot: [0, 0, 0] });
    pins.push({ pos: [1.05, 0, x], rot: [0, Math.PI / 2, 0] });
    pins.push({ pos: [-1.05, 0, x], rot: [0, Math.PI / 2, 0] });
  }

  const accent = new THREE.Color("#22d3ee");

  return (
    <group ref={group}>
      {/* main chip body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.22, 2.2]} />
        <meshStandardMaterial color="#0b1220" metalness={0.85} roughness={0.35} />
      </mesh>
      {/* etched top surface */}
      <mesh position={[0, 0.115, 0]}>
        <boxGeometry args={[1.95, 0.01, 1.95]} />
        <meshStandardMaterial color="#0f1830" metalness={0.6} roughness={0.5} />
      </mesh>
      {/* circuit trace lines (emissive) */}
      {[-0.7, -0.3, 0.1, 0.5].map((z) => (
        <mesh key={`tx-${z}`} position={[0, 0.121, z]}>
          <boxGeometry args={[1.8, 0.005, 0.02]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      ))}
      {[-0.6, 0.0, 0.6].map((x) => (
        <mesh key={`tz-${x}`} position={[x, 0.121, 0]}>
          <boxGeometry args={[0.02, 0.005, 1.8]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      ))}
      {/* center die */}
      <mesh position={[0, 0.14, 0]}>
        <boxGeometry args={[0.7, 0.04, 0.7]} />
        <meshStandardMaterial color="#1a2540" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.165, 0]}>
        <boxGeometry args={[0.55, 0.001, 0.55]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2} toneMapped={false} />
      </mesh>
      {/* pins */}
      {pins.map((p, i) => (
        <mesh key={i} position={p.pos} rotation={p.rot}>
          <boxGeometry args={[0.12, 0.06, 0.14]} />
          <meshStandardMaterial color="#cbd5e1" metalness={1} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
}

export function ChipBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_85%)]"
    >
      <Canvas
        camera={{ position: [0, 1.6, 4.2], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#0a0f1e"]} />
        <fog attach="fog" args={["#0a0f1e", 5, 10]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 4, 2]} intensity={1.1} color="#a5f3fc" />
        <pointLight position={[-3, 2, -2]} intensity={1.2} color="#22d3ee" />
        <Chip />
      </Canvas>
    </div>
  );
}
