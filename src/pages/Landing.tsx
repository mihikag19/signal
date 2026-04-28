import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";

/* ─── Noise ──────────────────────────────────────────── */
function createNoise() {
  const perm = new Uint8Array(512);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function lerp(a: number, b: number, t: number) { return a + t * (b - a); }
  function grad(hash: number, x: number, y: number, z: number) {
    const h = hash & 15, u = h < 8 ? x : y, v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
  }
  return function (x: number, y: number, z: number) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
    x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
    const u = fade(x), v = fade(y), w = fade(z);
    const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z;
    const B = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z;
    return lerp(
      lerp(lerp(grad(perm[AA], x, y, z), grad(perm[BA], x - 1, y, z), u),
        lerp(grad(perm[AB], x, y - 1, z), grad(perm[BB], x - 1, y - 1, z), u), v),
      lerp(lerp(grad(perm[AA + 1], x, y, z - 1), grad(perm[BA + 1], x - 1, y, z - 1), u),
        lerp(grad(perm[AB + 1], x, y - 1, z - 1), grad(perm[BB + 1], x - 1, y - 1, z - 1), u), v), w);
  };
}

/* ─── Three.js Scene ─────────────────────────────────── */
function useThreeScene(containerRef: React.RefObject<HTMLDivElement>, scrollProg: React.MutableRefObject<number>) {
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const noise = createNoise();
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    cam.position.z = 7;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const colorSets = [
      [0x6366f1, 0x8b5cf6, 0xa78bfa],
      [0x0d9488, 0x10b981, 0x34d399],
      [0xf97316, 0xfb923c, 0xfbbf24],
      [0xf43f5e, 0xe11d48, 0xec4899],
      [0x3b82f6, 0x6366f1, 0x8b5cf6],
    ];

    const blobs: any[] = [];
    const configs = [
      { r: 2.0, detail: 4, pos: [-0.5, 0.3, 0] as [number, number, number], speed: 0.25, nScale: 0.7, nAmp: 0.4, opacity: 0.18 },
      { r: 1.3, detail: 4, pos: [2.8, -0.5, -1] as [number, number, number], speed: 0.3, nScale: 0.85, nAmp: 0.3, opacity: 0.14 },
      { r: 0.9, detail: 3, pos: [-2.5, 1.2, -0.5] as [number, number, number], speed: 0.35, nScale: 1.0, nAmp: 0.25, opacity: 0.12 },
    ];

    configs.forEach((cfg, idx) => {
      const geo = new THREE.IcosahedronGeometry(cfg.r, cfg.detail);
      const origPos = new Float32Array(geo.attributes.position.array);
      const mat = new THREE.MeshPhysicalMaterial({
        color: colorSets[0][idx] || 0x6366f1,
        transparent: true, opacity: cfg.opacity,
        roughness: 0.2, metalness: 0.0, side: THREE.DoubleSide, depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...cfg.pos);
      scene.add(mesh);
      blobs.push({ mesh, geo, origPos, mat, ...cfg });
    });

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const pl1 = new THREE.PointLight(0x6366f1, 1.0, 20); pl1.position.set(4, 3, 3); scene.add(pl1);
    const pl2 = new THREE.PointLight(0xf97316, 0.7, 20); pl2.position.set(-3, -2, 2); scene.add(pl2);
    const pl3 = new THREE.PointLight(0x0d9488, 0.5, 20); pl3.position.set(0, 2, -3); scene.add(pl3);

    let animId: number;
    const clock = new THREE.Clock();

    function animate() {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const scroll = scrollProg.current || 0;
      const sectionIdx = Math.min(Math.floor(scroll * 5), 4);
      const sectionFrac = (scroll * 5) - sectionIdx;

      const curColors = colorSets[sectionIdx];
      const nextColors = colorSets[Math.min(sectionIdx + 1, 4)];
      blobs.forEach((blob, bi) => {
        const cIdx = bi % 3;
        const c1 = new THREE.Color(curColors[cIdx]);
        const c2 = new THREE.Color(nextColors[cIdx]);
        c1.lerp(c2, sectionFrac);
        blob.mat.color = c1;
      });
      pl1.color.set(curColors[0]);
      pl2.color.set(curColors[1] || curColors[0]);

      blobs.forEach((blob: any) => {
        const positions = blob.geo.attributes.position.array;
        const orig = blob.origPos;
        for (let i = 0; i < positions.length; i += 3) {
          const ox = orig[i], oy = orig[i + 1], oz = orig[i + 2];
          const len = Math.sqrt(ox * ox + oy * oy + oz * oz) || 1;
          const nx = ox / len, ny = oy / len, nz = oz / len;
          const n = noise(nx * blob.nScale + t * blob.speed * 0.4, ny * blob.nScale + t * blob.speed * 0.3, nz * blob.nScale + t * blob.speed * 0.2);
          const d = n * blob.nAmp * (1 + scroll * 0.3);
          positions[i] = ox + nx * d; positions[i + 1] = oy + ny * d; positions[i + 2] = oz + nz * d;
        }
        blob.geo.attributes.position.needsUpdate = true;
        blob.geo.computeVertexNormals();
        blob.mesh.rotation.x = t * 0.06 + scroll * 0.4;
        blob.mesh.rotation.y = t * 0.04 + scroll * 0.2;
      });

      cam.position.y = -scroll * 3.5;
      cam.position.z = 7 - scroll * 1.2;
      blobs[0].mesh.position.y = 0.3 - scroll * 3;
      blobs[0].mesh.scale.setScalar(1 + scroll * 0.25);
      blobs[1].mesh.position.x = 2.8 - scroll * 2;
      blobs[1].mesh.position.y = -0.5 - scroll * 3.5;
      blobs[2].mesh.position.x = -2.5 + scroll * 1.5;
      blobs[2].mesh.position.y = 1.2 - scroll * 3;

      renderer.render(scene, cam);
    }
    animate();

    const onResize = () => { cam.aspect = window.innerWidth / window.innerHeight; cam.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); renderer.dispose(); if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement); };
  }, [containerRef]);
}

/* ─── Helpers ────────────────────────────────────────── */
function useInView(ref: React.RefObject<HTMLElement>, threshold = 0.3) {
  const [v, setV] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold });
    o.observe(ref.current); return () => o.disconnect();
  }, [ref, threshold]);
  return v;
}

function FadeIn({ children, delay = 0, y = 24, visible, style = {} }: { children: React.ReactNode; delay?: number; y?: number; visible: boolean; style?: React.CSSProperties }) {
  return (
    <div style={{ transform: visible ? "translateY(0)" : `translateY(${y}px)`, opacity: visible ? 1 : 0, transition: `all 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`, ...style }}>
      {children}
    </div>
  );
}

function ScoreRing({ score, visible }: { score: number; visible: boolean }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let s: number | null = null;
    function step(ts: number) {
      if (!s) s = ts;
      const p = Math.min((ts - s) / 1600, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 4)) * score));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [visible, score]);
  const r = 72, c = 2 * Math.PI * r, off = c - (val / 100) * c;
  return (
    <div style={{ position: "relative", width: 180, height: 180 }}>
      <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="4" />
        <circle cx="90" cy="90" r={r} fill="none" stroke="url(#sg)" strokeWidth="4" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'DM Mono', 'SF Mono', monospace", fontSize: 48, fontWeight: 600, background: "linear-gradient(135deg, #6366f1, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{val}</span>
      </div>
    </div>
  );
}

/* ─── Landing Page ───────────────────────────────────── */
const Landing = () => {
  const navigate = useNavigate();
  const threeRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollProg = useRef(0);

  const s1 = useRef<HTMLElement>(null), s2 = useRef<HTMLElement>(null), s3 = useRef<HTMLElement>(null), s4 = useRef<HTMLElement>(null), s5 = useRef<HTMLElement>(null);
  const v1 = useInView(s1, 0.4), v2 = useInView(s2, 0.4), v3 = useInView(s3, 0.3), v4 = useInView(s4, 0.3), v5 = useInView(s5, 0.3);

  useThreeScene(threeRef, scrollProg);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const fn = () => { const mx = el.scrollHeight - el.clientHeight; scrollProg.current = mx > 0 ? el.scrollTop / mx : 0; };
    el.addEventListener("scroll", fn, { passive: true });
    return () => el.removeEventListener("scroll", fn);
  }, []);

  const font = "'DM Sans', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";
  const sec: React.CSSProperties = { height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", scrollSnapAlign: "start", position: "relative", zIndex: 2, padding: "0 24px" };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden", background: "#faf9f7", fontFamily: font }}>
      <div ref={threeRef} style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }} />
      {/* Grain */}
      <div style={{ position: "fixed", inset: 0, zIndex: 3, pointerEvents: "none", opacity: 0.025, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "128px" }} />

      <div ref={scrollRef} style={{ position: "relative", zIndex: 4, height: "100vh", overflowY: "scroll", scrollSnapType: "y mandatory" }}>

        {/* Hero */}
        <section ref={s1} style={sec}>
          <FadeIn visible={v1} delay={0.1}>
            <h1 style={{ fontSize: "clamp(5rem, 13vw, 11rem)", fontWeight: 700, color: "#141414", letterSpacing: "-0.05em", lineHeight: 0.9, margin: 0, textAlign: "center" }}>Signal</h1>
          </FadeIn>
          <FadeIn visible={v1} delay={0.3}>
            <p style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)", color: "rgba(20,20,20,0.55)", fontWeight: 400, marginTop: 16, textAlign: "center", letterSpacing: "-0.01em" }}>Find the signal. Prove the demand.</p>
          </FadeIn>
          <FadeIn visible={v1} delay={0.5}>
            <button
              onClick={() => navigate("/app")}
              style={{ marginTop: 32, padding: "13px 34px", fontSize: 14, fontWeight: 500, fontFamily: font, color: "#fff", background: "#141414", border: "none", borderRadius: 10, cursor: "pointer", letterSpacing: "-0.01em" }}
            >
              Explore Platform →
            </button>
          </FadeIn>
          <FadeIn visible={v1} delay={0.75} style={{ position: "absolute", bottom: 36 }}>
            <div style={{ width: 1, height: 36, background: "linear-gradient(to bottom, rgba(20,20,20,0.15), transparent)" }} />
          </FadeIn>
        </section>

        {/* What It Does */}
        <section ref={s2} style={sec}>
          <FadeIn visible={v2} delay={0}>
            <p style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.3rem)", color: "#141414", fontWeight: 500, textAlign: "center", letterSpacing: "-0.02em", lineHeight: 1.3, maxWidth: 640, margin: 0 }}>
              AI-powered validation using{"\n"}real community data.
            </p>
          </FadeIn>
          <FadeIn visible={v2} delay={0.25}>
            <div style={{ display: "flex", gap: 8, marginTop: 28, flexWrap: "wrap", justifyContent: "center" }}>
              {["Reddit", "Hacker News", "Real quotes", "Demand scoring"].map((t, i) => (
                <span key={t} style={{ padding: "5px 14px", fontSize: 12, fontWeight: 500, color: "rgba(20,20,20,0.4)", border: "1px solid rgba(20,20,20,0.1)", borderRadius: 99, opacity: v2 ? 1 : 0, transform: v2 ? "translateY(0)" : "translateY(8px)", transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${0.35 + i * 0.1}s` }}>{t}</span>
              ))}
            </div>
          </FadeIn>
        </section>

        {/* How It Works */}
        <section ref={s3} style={sec}>
          {["Describe your idea", "We scan thousands of real conversations", "Get a demand score with proof"].map((txt, i) => (
            <FadeIn key={i} visible={v3} delay={i * 0.18} y={16}>
              <p style={{ fontSize: i === 1 ? "clamp(1.3rem, 3vw, 2rem)" : "clamp(1.05rem, 2.2vw, 1.4rem)", color: i === 1 ? "#141414" : "rgba(20,20,20,0.3)", fontWeight: i === 1 ? 500 : 400, textAlign: "center", letterSpacing: "-0.015em", lineHeight: 1.5, margin: 0, padding: "2px 0" }}>{txt}</p>
            </FadeIn>
          ))}
          <FadeIn visible={v3} delay={0.6}>
            <div style={{ marginTop: 32, display: "flex", gap: 28, fontFamily: "'DM Mono', monospace", fontSize: 12, color: "rgba(20,20,20,0.15)", letterSpacing: "0.06em" }}>
              <span>01 INPUT</span><span style={{ color: "rgba(20,20,20,0.3)" }}>02 SCAN</span><span>03 REPORT</span>
            </div>
          </FadeIn>
        </section>

        {/* Score */}
        <section ref={s4} style={sec}>
          <FadeIn visible={v4} delay={0}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <ScoreRing score={93} visible={v4} />
              <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(20,20,20,0.3)", marginTop: 14 }}>Demand Score</p>
            </div>
          </FadeIn>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 32, maxWidth: 440, width: "100%" }}>
            {[
              "I wish there was a tool that could tell me if people actually want what I'm building.",
              "The validation step is where 90% of founders fail.",
              "I'd pay good money for a tool that tells me if a market is real.",
            ].map((q, i) => (
              <div key={i} style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid rgba(20,20,20,0.06)", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)", opacity: v4 ? 1 : 0, transform: v4 ? "translateY(0)" : "translateY(12px)", transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${0.3 + i * 0.18}s` }}>
                <p style={{ fontSize: 13, color: "rgba(20,20,20,0.45)", lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>"{q}"</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section ref={s5} style={sec}>
          <FadeIn visible={v5} delay={0}>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 600, color: "#141414", textAlign: "center", letterSpacing: "-0.03em", lineHeight: 1.15, margin: 0 }}>
              Stop guessing.<br />Start validating.
            </h2>
          </FadeIn>
          <FadeIn visible={v5} delay={0.2}>
            <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
              <button onClick={() => navigate("/app")} style={{ padding: "13px 30px", fontSize: 14, fontWeight: 500, fontFamily: font, color: "#fff", background: "#141414", border: "none", borderRadius: 10, cursor: "pointer" }}>
                Try Signal Free →
              </button>
              <button onClick={() => { scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ padding: "13px 30px", fontSize: 14, fontWeight: 500, fontFamily: font, color: "#141414", background: "transparent", border: "1px solid rgba(20,20,20,0.15)", borderRadius: 10, cursor: "pointer" }}>
                See How It Works
              </button>
            </div>
          </FadeIn>
          <FadeIn visible={v5} delay={0.4} style={{ position: "absolute", bottom: 28 }}>
            <p style={{ fontSize: 12, color: "rgba(20,20,20,0.25)", margin: 0 }}>Built by three USC founders.</p>
          </FadeIn>
        </section>
      </div>

      <style>{`
        .landing-root ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default Landing;
