import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function ribbonGeometry(phase: number, width: number) {
  const segments = 180;
  const across = 14;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments * Math.PI * 2;
    for (let j = 0; j <= across; j++) {
      const v = (j / across - 0.5) * width;
      const twist = t * 1.5 + phase;
      const radius = 1.65 + v * Math.cos(twist);
      positions.push(radius * Math.cos(t), radius * Math.sin(t), v * Math.sin(twist) + 0.24 * Math.sin(t * 3 + phase));
      uvs.push(i / segments * 4, j / across);
      if (i < segments && j < across) {
        const a = i * (across + 1) + j;
        indices.push(a, a + across + 1, a + 1, a + 1, a + across + 1, a + across + 2);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function grainTexture(woven: boolean) {
  const size = 128;
  const data = new Uint8Array(size * size * 4);
  let seed = 42;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const value = woven ? 100 + (x % 8 < 4 ? 55 : 0) + (y % 8 < 4 ? 55 : 0) : 80 + (seed % 140);
      const offset = (y * size + x) * 4;
      data[offset] = data[offset + 1] = data[offset + 2] = value;
      data[offset + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(woven ? 12 : 6, woven ? 4 : 2);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

function Sculpture({ running, offset }: { running: boolean; offset: number }) {
  const group = useRef<THREE.Group>(null);
  const invalidate = useThree(state => state.invalidate);
  const geometries = useMemo(() => [ribbonGeometry(0, 0.85), ribbonGeometry(2.1, 0.68), ribbonGeometry(4.2, 0.7)], []);
  const textures = useMemo(() => [grainTexture(false), grainTexture(true)], []);
  useEffect(() => () => { geometries.forEach(item => item.dispose()); textures.forEach(item => item.dispose()); }, [geometries, textures]);
  useEffect(() => { invalidate(); }, [running, offset, invalidate]);
  useFrame((state, delta) => {
    if (!group.current || !running) return;
    group.current.rotation.y += Math.min(delta, 0.05) * 0.12;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.55) * 0.06;
    invalidate();
  });
  return <group rotation={[0.2, offset, -0.2]}><group ref={group}>
    {geometries.map((geometry, index) => <mesh key={index} geometry={geometry} rotation={[index * 0.22, index * 0.35, index * 1.05]}>
      <meshStandardMaterial color={["#A45126", "#D6C3A0", "#526044"][index]} side={THREE.DoubleSide} roughness={index === 0 ? 0.48 : 0.92} bumpMap={textures[index === 1 ? 1 : 0]} bumpScale={index === 1 ? 0.045 : 0.025} />
    </mesh>)}
    {Array.from({ length: 10 }, (_, index) => <mesh key={`scrap-${index}`} position={[Math.cos(index * 2.4) * 2.35, Math.sin(index * 2.4) * 1.9, Math.sin(index) * 0.7]} rotation={[index * 0.7, index, index * 0.45]}><boxGeometry args={[0.12 + index % 3 * 0.05, 0.2, 0.025]} /><meshStandardMaterial color={["#A45126", "#D6C3A0", "#526044"][index % 3]} roughness={0.9} /></mesh>)}
  </group></group>;
}

export default function SculptureCanvas({ running }: { running: boolean }) {
  const [offset, setOffset] = useState(0);
  return <div className="home-canvas-focus" tabIndex={0} role="group" aria-label="Escultura 3D de materiais. Arraste ou use as setas para girar; tecla Home restaura a posição." onKeyDown={event => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home"].includes(event.key)) {
      event.preventDefault();
      setOffset(value => event.key === "Home" ? 0 : value + (["ArrowLeft", "ArrowDown"].includes(event.key) ? -0.2 : 0.2));
    }
  }}>
    <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: [0, 0, 6.8], fov: 45 }} gl={{ antialias: true, alpha: true, powerPreference: "low-power" }} fallback={<p className="home-scene-status">Seu navegador não oferece suporte à cena 3D. Volte à composição ilustrada.</p>}>
      <ambientLight intensity={1.6} />
      <directionalLight position={[4, 5, 6]} intensity={3} color="#fff0dc" />
      <directionalLight position={[-4, 0, 2]} intensity={1.1} color="#e4ebdd" />
      <Sculpture running={running} offset={offset} />
      <OrbitControls enableZoom={false} enablePan={false} enableDamping={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI * 2 / 3} />
    </Canvas>
  </div>;
}
