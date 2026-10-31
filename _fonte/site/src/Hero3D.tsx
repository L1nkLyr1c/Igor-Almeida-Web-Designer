import { useEffect, useRef } from "react";
import {
  AdditiveBlending, DoubleSide, Group, MathUtils, Mesh, PerspectiveCamera, PlaneGeometry,
  SRGBColorSpace, Scene, ShaderMaterial, Texture, TextureLoader, Vector2, WebGLRenderer,
} from "three";
import { TELAS, TELAS_CELULAR, heroScroll, vigia } from "./lib";

/*
  "Telas infinitas": uma espiral de telas dos projetos do Igor que sobe sem fim.
  A rolagem da capa gira a espiral e aproxima a câmera.
  Three.js puro, importando só as peças usadas (metade do peso do React Three Fiber).
  Regras das skills de Three.js: nada é criado dentro do loop, pixel ratio limitado,
  render pausado fora da tela e tudo liberado (dispose) ao sair.
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

function montarSlots(mobile: boolean): Slot[] {
  const desk = TELAS.slice(0, mobile ? 9 : 14).map((url) => ({ url, w: 1.6, h: 1.0, bar: 1 }));
  const cel = TELAS_CELULAR.map((url) => ({ url, w: 0.55, h: 1.19, bar: 0 }));
  const out: Slot[] = [];
  desk.forEach((s, i) => {
    out.push(s);
    if (i % 4 === 1 && cel[(i / 4) | 0]) out.push(cel[(i / 4) | 0]);
  });
  return out;
}

const carregar = (loader: TextureLoader, url: string) =>
  new Promise<Texture>((ok, erro) => loader.load(url, ok, undefined, erro));

export default function Hero3D({ onReady, onSlow }: { onReady: () => void; onSlow: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  // guarda os callbacks em ref para o efeito rodar uma vez só (o pai re-renderiza ao trocar de modo)
  const cb = useRef({ onReady, onSlow });
  cb.current = { onReady, onSlow };

  useEffect(() => {
    const onReady = () => cb.current.onReady();
    const onSlow = () => cb.current.onSlow();
    const el = wrap.current!;
    const mobile = window.innerWidth < 768;
    let vivo = true;
    let raf = 0;
    let visivel = true;

    const renderer = new WebGLRenderer({ antialias: !mobile, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.6));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = SRGBColorSpace;
    el.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 9);
    const group = new Group();
    scene.add(group);

    const glowMat = new ShaderMaterial({ vertexShader: VERT, fragmentShader: GLOW_FRAG, transparent: true, depthWrite: false, blending: AdditiveBlending });
    const glowGeo = new PlaneGeometry(1, 1);
    const glow = new Mesh(glowGeo, glowMat);
    glow.position.z = -1.2;
    glow.scale.set(9, 9, 1);
    group.add(glow);

    const slots = montarSlots(mobile);
    const meshes: Mesh[] = [];
    const materiais: ShaderMaterial[] = [];
    const geos: PlaneGeometry[] = [];
    const texturas: Texture[] = [];

    const R = mobile ? 2.1 : 2.7;
    const STEP_A = 0.62;
    const STEP_Y = mobile ? 0.62 : 0.56;
    const H = slots.length * STEP_Y;

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const io = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      if (visivel && !raf && vivo) raf = requestAnimationFrame(loop);
    });
    io.observe(el);

    const pointer = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX / window.innerWidth - 0.5;
      pointer.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let tempo = 0, ultimo = 0, quadros = 0, medido = 0, avisou = false, checou = false;

    function loop(t: number) {
      raf = 0;
      if (!vivo || !visivel) return;
      const delta = ultimo ? (t - ultimo) / 1000 : 0.016;
      ultimo = t;
      const dt = Math.min(delta, 0.05);

      // vigia de desempenho: abaixo de 28 fps nos primeiros 2s, troca pela versão leve
      if (!checou) {
        quadros++;
        medido += delta;
        if (medido > 2) {
          checou = true;
          vigia.fps = Math.round(quadros / medido);
          if (quadros / medido < 28 && !(window as Window & { __forcar3d?: boolean }).__forcar3d) return onSlow();
        }
      }

      const p = heroScroll.progress;
      tempo += dt * (0.16 + p * 0.25);
      const offset = tempo + p * 3.2;

      for (let i = 0; i < meshes.length; i++) {
        const m = meshes[i];
        const raw = ((i * STEP_Y + offset) % H + H) % H;
        const y = raw - H / 2;
        const theta = i * STEP_A + offset * (STEP_A / STEP_Y);
        m.position.set(Math.sin(theta) * R, y, Math.cos(theta) * R);
        // todas as telas viram para a frente (só uma leve inclinação), para nunca aparecerem de costas
        m.rotation.set(0, Math.sin(theta) * 0.55, 0);
        const fade = 1 - Math.pow(Math.abs(y) / (H / 2), 6);
        const u = materiais[i].uniforms.uOpacity;
        u.value = MathUtils.damp(u.value, fade, 3, dt);
      }

      const centro = MathUtils.smoothstep(p, 0.35, 1);
      const baseX = mobile ? 0.2 : 2.35;
      const baseY = mobile ? 2.3 : 0;
      group.position.x = MathUtils.damp(group.position.x, baseX * (1 - centro * 0.9), 4, dt);
      group.position.y = MathUtils.damp(group.position.y, baseY * (1 - centro * 0.8), 4, dt);
      group.rotation.z = MathUtils.damp(group.rotation.z, 0.16 - pointer.x * 0.12, 3, dt);
      group.rotation.x = MathUtils.damp(group.rotation.x, 0.12 + pointer.y * 0.1, 3, dt);
      camera.position.z = MathUtils.damp(camera.position.z, (mobile ? 10.5 : 8.6) - p * 4.2, 4, dt);
      camera.position.y = MathUtils.damp(camera.position.y, -p * 0.6, 4, dt);

      renderer.render(scene, camera);
      if (!avisou) {
        avisou = true;
        onReady();
      }
      raf = requestAnimationFrame(loop);
    }

    const loader = new TextureLoader();
    Promise.all(slots.map((s) => carregar(loader, s.url)))
      .then((texs) => {
        if (!vivo) return texs.forEach((t) => t.dispose());
        const aniso = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        texs.forEach((tex, i) => {
          const s = slots[i];
          tex.colorSpace = SRGBColorSpace;
          tex.anisotropy = aniso;
          const mat = new ShaderMaterial({
            vertexShader: VERT, fragmentShader: FRAG, transparent: true, side: DoubleSide, depthWrite: false,
            uniforms: { uMap: { value: tex }, uOpacity: { value: 0 }, uSize: { value: new Vector2(s.w, s.h) }, uBar: { value: s.bar } },
          });
          const geo = new PlaneGeometry(s.w, s.h);
          const mesh = new Mesh(geo, mat);
          mesh.renderOrder = i;
          group.add(mesh);
          meshes.push(mesh); materiais.push(mat); geos.push(geo); texturas.push(tex);
        });
        raf = requestAnimationFrame(loop);
      })
      .catch(() => vivo && onSlow());

    return () => {
      vivo = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      materiais.forEach((m) => m.dispose());
      geos.forEach((g) => g.dispose());
      texturas.forEach((t) => t.dispose());
      glowMat.dispose();
      glowGeo.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={wrap} className="hero-canvas" aria-hidden="true" />;
}
