import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { DeliveryNode, AlgorithmType, AlgorithmResult } from './types';
import { solveRoute, compareRoutes, healthCheck } from './api';
import MapCanvas from './components/MapCanvas';
import AlgorithmPanel from './components/AlgorithmPanel';
import StatsPanel from './components/StatsPanel';
import { AlertCircle } from 'lucide-react';
import './index.css';

let nodeIdCounter = 1;
const CITY_NAMES = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T',
];

/* ── Particle background ───────────────────────────── */
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    let w = 0, h = 0;

    type Particle = { x: number; y: number; vx: number; vy: number; r: number; a: number };
    const particles: Particle[] = [];
    const N = 55;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < N; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.6 + 0.5,
        a: Math.random() * Math.PI * 2,
      });
    }

    const colours = ['rgba(245,158,11,', 'rgba(16,185,129,', 'rgba(252,211,77,'];

    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      // update & draw
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        const col = colours[Math.floor(p.r * 2) % colours.length];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = col + '0.55)';
        ctx.fill();
      }

      // draw connections
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.12;
            ctx.strokeStyle = `rgba(245,158,11,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" />;
}

/* ── TSP Logo SVG ──────────────────────────────────── */
function TspLogo() {
  return (
    <svg className="tsp-logo" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Route path */}
      <path
        d="M10 30 L22 8 L34 20 L18 36 Z"
        stroke="url(#logoGrad)"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
        opacity="0.7"
      />
      {/* Nodes */}
      <circle cx="10" cy="30" r="4" fill="#F59E0B" />
      <circle cx="22" cy="8"  r="4" fill="#10B981" />
      <circle cx="34" cy="20" r="4" fill="#F59E0B" />
      <circle cx="18" cy="36" r="3.5" fill="#34D399" />
      {/* Labels */}
      <text x="10" y="30.5" textAnchor="middle" dominantBaseline="central" fontSize="5" fontWeight="bold" fill="#0C0E0B">A</text>
      <text x="22" y="8.5"  textAnchor="middle" dominantBaseline="central" fontSize="5" fontWeight="bold" fill="#0C0E0B">B</text>
      <text x="34" y="20.5" textAnchor="middle" dominantBaseline="central" fontSize="5" fontWeight="bold" fill="#0C0E0B">C</text>
      <text x="18" y="36.5" textAnchor="middle" dominantBaseline="central" fontSize="4.5" fontWeight="bold" fill="#0C0E0B">D</text>
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" />
          <stop offset="1" stopColor="#10B981" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const App: React.FC = () => {
  const [nodes, setNodes] = useState<DeliveryNode[]>([]);
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmType>('nearest_neighbor');
  const [result, setResult] = useState<AlgorithmResult | null>(null);
  const [compareResults, setCompareResults] = useState<AlgorithmResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(1);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const statsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    healthCheck().then(setApiOnline);
    const iv = setInterval(() => healthCheck().then(setApiOnline), 10000);
    return () => clearInterval(iv);
  }, []);

  const animateRoute = useCallback((duration = 1800) => {
    setIsAnimating(true);
    setAnimationProgress(0);
    const start = performance.now();
    const frame = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimationProgress(eased);
      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(frame);
      } else {
        setIsAnimating(false);
      }
    };
    animFrameRef.current = requestAnimationFrame(frame);
  }, []);

  useEffect(() => () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); }, []);

  const handleAddNode = useCallback((x: number, y: number) => {
    setNodes(prev => {
      const id = nodeIdCounter++;
      const label = CITY_NAMES[(id - 1) % CITY_NAMES.length];
      return [...prev, { id, x, y, label }];
    });
    setResult(null); setCompareResults(null); setError(null);
  }, []);

  const handleRemoveNode = useCallback((id: number) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setResult(null); setCompareResults(null); setError(null);
  }, []);

  const handleSolve = useCallback(async () => {
    if (nodes.length < 2) return;
    setIsLoading(true); setError(null); setCompareResults(null); setResult(null); setAnimationProgress(0);
    try {
      const res = await solveRoute(nodes, selectedAlgo);
      setResult(res);
      animateRoute(nodes.length > 8 ? 2400 : 1600);
      setTimeout(() => statsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
    } catch (e: unknown) {
      const rawMsg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        ?? (e instanceof Error ? e.message : 'Unknown error');
      setError(rawMsg);
    } finally { setIsLoading(false); }
  }, [nodes, selectedAlgo, animateRoute]);

  const handleCompare = useCallback(async () => {
    if (nodes.length < 2) return;
    setIsLoading(true); setError(null); setResult(null); setCompareResults(null); setAnimationProgress(0);
    try {
      const res = await compareRoutes(nodes);
      setCompareResults(res.results);
      const best = res.results.filter(r => r.total_distance > 0).sort((a, b) => a.total_distance - b.total_distance)[0];
      if (best) { setResult(best); animateRoute(1800); }
      setTimeout(() => statsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
    } catch (e: unknown) {
      const rawMsg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        ?? (e instanceof Error ? e.message : 'Unknown error');
      setError(rawMsg);
    } finally { setIsLoading(false); }
  }, [nodes, animateRoute]);

  const handleReset = useCallback(() => {
    setResult(null); setCompareResults(null); setError(null); setAnimationProgress(1);
  }, []);

  const handleClear = useCallback(() => {
    setNodes([]); setResult(null); setCompareResults(null); setError(null); setAnimationProgress(1);
    nodeIdCounter = 1;
  }, []);

  const handleSelectResult = useCallback((r: AlgorithmResult) => {
    setResult(r);
    animateRoute(1400);
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [animateRoute]);

  const hasResults = !!(result || compareResults);

  return (
    <div className="app">
      <ParticleBackground />

      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-brand">
          <TspLogo />
          <div className="brand-text">
            <span className="brand-title">TSP Solver</span>
            <span className="brand-subtitle">Travelling Salesman Problem Visualizer</span>
          </div>
        </div>

        <div className="header-center">
          <div className="np-chip np-chip--hard" title="Travelling Salesman Problem is NP-Hard">NP-Hard</div>
          <div className="np-chip np-chip--cycle" title="Finds the shortest Hamiltonian Cycle">Hamiltonian Cycle</div>
        </div>

        <div className="header-right">
          <div className={`api-status api-status--${apiOnline === null ? 'checking' : apiOnline ? 'online' : 'offline'}`}>
            <span className="api-status__dot" />
            <span>{apiOnline === null ? 'Connecting…' : apiOnline ? 'Backend Online' : 'Backend Offline'}</span>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="app-body">
        <aside className="sidebar">
          <AlgorithmPanel
            selectedAlgo={selectedAlgo}
            onSelectAlgo={setSelectedAlgo}
            nodeCount={nodes.length}
            onSolve={handleSolve}
            onCompare={handleCompare}
            onClear={handleClear}
            onReset={handleReset}
            isLoading={isLoading}
            isAnimating={isAnimating}
          />
        </aside>

        <main className="main-content" ref={mainRef}>
          {error && (
            <div className="error-banner">
              <AlertCircle size={15} />
              <span>{error}</span>
              <button onClick={() => setError(null)}>✕</button>
            </div>
          )}

          <MapCanvas
            nodes={nodes}
            result={result}
            animationProgress={animationProgress}
            onAddNode={handleAddNode}
            onRemoveNode={handleRemoveNode}
            isAnimating={isAnimating}
            hasResults={hasResults}
          />

          {hasResults && (
            <div ref={statsRef}>
              <StatsPanel
                result={result}
                compareResults={compareResults}
                nodes={nodes}
                onSelectResult={handleSelectResult}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
