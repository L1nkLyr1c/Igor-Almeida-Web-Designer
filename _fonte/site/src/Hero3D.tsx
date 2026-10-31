import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { TELAS, TELAS_CELULAR, heroScroll } from "./lib";

/*
  "Telas infinitas": uma espiral de telas dos projetos do Igor que sobe sem fim.
  A rolagem da capa gira a espiral e aproxima a câmera.
  Regras que seguimos (skills threejs): nada é criado dentro do useFrame,
  materiais e geometrias ficam em useMemo, pixel ratio limitado e render pausado fora da tela.
*/

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;
  uniform vec2 uSize;
  uniform float uBar;
  varying vec2 vUv;

  float sdRound(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 p = (vUv - 0.5) * uSize;
    float d = sdRound(p, uSize * 0.5, 0.07);
    float alpha = 1.0 - smoothstep(-0.006, 0.0, d);
    float edge = 1.0 - smoothstep(0.0, 0.025, abs(d + 0.01));

    // Barra do navegador nas telas de computador
    float barH = 0.085;
    float onBar = uBar * step(1.0 - barH, vUv.y);
    vec2 uvTex = vec2(vUv.x, vUv.y * (1.0 - barH * uBar));
    vec3 col = texture2D(uMap, uvTex).rgb;
    vec3 bar = vec3(0.075, 0.058, 0.11);
    float dotY = 1.0 - barH * 0.5;
    float dots = 0.0;
    for (int i = 0; i < 3; i++) {
      vec2 c = vec2(0.035 + float(i) * 0.03, dotY);
      dots += 1.0 - smoothstep(0.008, 0.011, length((vUv - c) * vec2(uSize.x / uSize.y, 1.0)));
    }
    col = mix(col, bar, onBar);
    col = mix(col, vec3(0.62, 0.36, 1.0), onBar * dots * 0.9);

    if (!gl_FrontFacing) col = vec3(0.07, 0.05, 0.12);
    col = mix(col, vec3(0.75, 0.52, 0.99), edge * 0.85);

    gl_FragColor = vec4(col, alpha * uOpacity);
    #include <colorspace_fragment>
  }
`;

const GLOW_FRAG = /* glsl */ `
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float a = pow(max(0.0, 1.0 - d), 2.2) * 0.55;
    gl_FragColor = vec4(0.42, 0.22, 0.85, a);
    #include <colorspace_fragment>
  }
`;

interface Slot { url: string; w: number; h: number; bar: number }

function useSlots(mobile: boolean): Slot[] {
  return useMemo(() => {
    const desk = TELAS.slice(0, mobile ? 9 : 14).map((url) => ({ url, w: 1.6, h: 1.0, bar: 1 }));
    const cel = TELAS_CELULAR.map((url) => ({ url, w: 0.55, h: 1.19, bar: 0 }));
    // intercala celulares entre as telas de computador
    const out: Slot[] = [];
    desk.forEach((s, i) => {
      out.push(s);
      if (i % 4 === 1 && cel[(i / 4) | 0]) out.push(cel[(i / 4) | 0]);
    });
    return out;
  }, [mobile]);
}

function Spiral({ mobile, onReady, onSlow }: { mobile: boolean; onReady: () => void; onSlow: () => void }) {
  const slots = useSlots(mobile);
  const textures = useLoader(THREE.TextureLoader, slots.map((s) => s.url));
  const gl = useThree((s) => s.gl);
  const group = useRef<THREE.Group>(null);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const time = useRef(0);
  const frames = useRef({ n: 0, t: 0, done: false, ready: false });

  const R = mobile ? 2.1 : 2.7;
  const STEP_A = 0.62;
  const STEP_Y = mobile ? 0.62 : 0.56;
  const H = slots.length * STEP_Y;

  const materials = useMemo(
    () =>
      slots.map((s, i) => {
        const t = textures[i];
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy());
        return new THREE.ShaderMaterial({
          vertexShader: VERT,
          fragmentShader: FRAG,
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false,
          uniforms: {
            uMap: { value: t },
            uOpacity: { value: 0 },
            uSize: { value: new THREE.Vector2(s.w, s.h) },
            uBar: { value: s.bar },
          },
        });
      }),
    [slots, textures, gl],
  );
  const geometries = useMemo(() => slots.map((s) => new THREE.PlaneGeometry(s.w, s.h)), [slots]);
  const glowMat = useMemo(
    () => new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: GLOW_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
    [],
  );

  useEffect(() => () => {
    materials.forEach((m) => m.dispose());
    geometries.forEach((g) => g.dispose());
    glowMat.dispose();
  }, [materials, geometries, glowMat]);

  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const on = (e: PointerEvent) => {
      pointer.current.x = e.clientX / window.innerWidth - 0.5;
      pointer.current.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const f = frames.current;
    if (!f.ready) {
      f.ready = true;
      onReady();
    }
    // Vigia de desempenho: se os primeiros ~2s rodarem abaixo de 28 fps, troca pela versão leve.
    if (!f.done) {
      f.n++;
      f.t += delta;
      if (f.t > 2) {
        f.done = true;
        if (f.n / f.t < 28 && !(window as Window & { __forcar3d?: boolean }).__forcar3d) onSlow();
      }
    }

    const p = heroScroll.progress;
    time.current += dt * (0.16 + p * 0.25);
    const offset = time.current + p * 3.2;

    slots.forEach((_, i) => {
      const m = meshes.current[i];
      if (!m) return;
      const raw = ((i * STEP_Y + offset) % H + H) % H;
      const y = raw - H / 2;
      const theta = i * STEP_A + offset * (STEP_A / STEP_Y);
      m.position.set(Math.sin(theta) * R, y, Math.cos(theta) * R);
      // todas as telas viram para a frente (só uma leve inclinação), para nunca aparecerem de costas
      m.rotation.set(0, Math.sin(theta) * 0.55, 0);
      const edgeFade = 1 - Math.pow(Math.abs(y) / (H / 2), 6);
      const mat = materials[i];
      mat.uniforms.uOpacity.value = THREE.MathUtils.damp(mat.uniforms.uOpacity.value, edgeFade, 3, dt);
    });

    const g = group.current!;
    const baseX = mobile ? 0.2 : 2.35;
    const baseY = mobile ? 2.3 : 0;
    const centro = THREE.MathUtils.smoothstep(p, 0.35, 1);
    g.position.x = THREE.MathUtils.damp(g.position.x, baseX * (1 - centro * 0.9), 4, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, baseY * (1 - centro * 0.8), 4, dt);
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, 0.16 - pointer.current.x * 0.12, 3, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0.12 + pointer.current.y * 0.1, 3, dt);

    const cam = state.camera;
    cam.position.z = THREE.MathUtils.damp(cam.position.z, (mobile ? 10.5 : 8.6) - p * 4.2, 4, dt);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, -p * 0.6, 4, dt);
  });

  return (
    <group ref={group}>
      <mesh position={[0, 0, -1.2]} scale={[9, 9, 1]} material={glowMat}>
        <planeGeometry />
      </mesh>
      {slots.map((s, i) => (
        <mesh key={s.url} ref={(el) => { meshes.current[i] = el; }} geometry={geometries[i]} material={materials[i]} renderOrder={i} />
      ))}
    </group>
  );
}

export default function Hero3D({ onReady, onSlow }: { onReady: () => void; onSlow: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const setLoop = useRef<((v: "always" | "never") => void) | null>(null);
  const mobile = typeof window !== "undefined" && window.innerWidth < 768;

  // pausa o loop de render quando a capa sai da tela
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setLoop.current?.(e.isIntersecting ? "always" : "never"));
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="hero-canvas" aria-hidden="true">
      <Canvas
        dpr={mobile ? [1, 1.25] : [1, 1.6]}
        camera={{ fov: 38, position: [0, 0, 9] }}
        gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance" }}
        frameloop="always"
        onCreated={({ gl, setFrameloop }) => {
          gl.setClearColor(0x000000, 0);
          setLoop.current = setFrameloop;
        }}
      >
        <Spiral mobile={mobile} onReady={onReady} onSlow={onSlow} />
      </Canvas>
    </div>
  );
}
