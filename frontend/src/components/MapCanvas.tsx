import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { DeliveryNode, AlgorithmResult } from '../types';

interface MapCanvasProps {
  nodes: DeliveryNode[];
  result: AlgorithmResult | null;
  animationProgress: number;
  onAddNode: (x: number, y: number) => void;
  onRemoveNode: (id: number) => void;
  isAnimating: boolean;
  hasResults: boolean;
}

// Amber-to-emerald palette for city nodes
const NODE_COLORS = [
  '#F59E0B', '#10B981', '#FBBF24', '#34D399', '#F97316',
  '#A78BFA', '#60A5FA', '#F472B6', '#2DD4BF', '#FB923C',
];

const MapCanvas: React.FC<MapCanvasProps> = ({
  nodes, result, animationProgress, onAddNode, onRemoveNode, isAnimating, hasResults,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [size, setSize] = useState({ w: 800, h: 560 });

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      for (const e of entries) setSize({ w: e.contentRect.width, h: e.contentRect.height });
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const { w, h } = size;
    ctx.clearRect(0, 0, w, h);

    // ── Subtle dot grid ──
    ctx.fillStyle = 'rgba(255,255,255,0.028)';
    for (let x = 0; x < w; x += 36) {
      for (let y = 0; y < h; y += 36) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ── Empty state ──
    if (nodes.length === 0) {
      // Centre decoration ring
      const cx = w / 2, cy = h / 2;
      ctx.strokeStyle = 'rgba(245,158,11,0.06)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 10]);
      ctx.beginPath();
      ctx.arc(cx, cy, 90, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 150, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(245,158,11,0.7)';
      ctx.font = 'bold 28px Space Grotesk, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📍', cx, cy - 22);

      ctx.fillStyle = 'rgba(232,234,227,0.55)';
      ctx.font = '500 15px Space Grotesk, sans-serif';
      ctx.fillText('Click anywhere to place cities', cx, cy + 16);

      ctx.fillStyle = 'rgba(139,144,128,0.4)';
      ctx.font = '13px Space Grotesk, sans-serif';
      ctx.fillText('Right-click a city to remove it', cx, cy + 42);
      return;
    }

    // ── Route drawing ──
    if (result && result.route.length > 1) {
      const routeNodes = result.route
        .map(id => nodes.find(n => n.id === id))
        .filter(Boolean) as DeliveryNode[];

      const totalEdges = routeNodes.length - 1;
      const visibleEdges = Math.floor(totalEdges * animationProgress);

      // Dimmed ghost path
      ctx.strokeStyle = 'rgba(139,144,128,0.13)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 8]);
      ctx.beginPath();
      routeNodes.forEach((n, i) => { if (i === 0) ctx.moveTo(n.x, n.y); else ctx.lineTo(n.x, n.y); });
      ctx.stroke();
      ctx.setLineDash([]);

      // Animated glowing path
      if (visibleEdges > 0) {
        // glow layer
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 18;
        ctx.strokeStyle = 'rgba(245,158,11,0.25)';
        ctx.lineWidth = 7;
        ctx.beginPath();
        for (let i = 0; i <= visibleEdges && i < routeNodes.length; i++) {
          const n = routeNodes[i];
          if (i === 0) ctx.moveTo(n.x, n.y); else ctx.lineTo(n.x, n.y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // main path with gradient
        const endIdx = Math.min(visibleEdges, routeNodes.length - 1);
        const grad = ctx.createLinearGradient(
          routeNodes[0].x, routeNodes[0].y,
          routeNodes[endIdx].x, routeNodes[endIdx].y,
        );
        grad.addColorStop(0, '#F59E0B');
        grad.addColorStop(0.5, '#FCD34D');
        grad.addColorStop(1, '#10B981');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        for (let i = 0; i <= visibleEdges && i < routeNodes.length; i++) {
          const n = routeNodes[i];
          if (i === 0) ctx.moveTo(n.x, n.y); else ctx.lineTo(n.x, n.y);
        }
        ctx.stroke();

        // Arrow heads on midpoints
        for (let i = 1; i <= visibleEdges && i < routeNodes.length; i++) {
          const from = routeNodes[i - 1];
          const to = routeNodes[i];
          const angle = Math.atan2(to.y - from.y, to.x - from.x);
          const mx = (from.x + to.x) / 2;
          const my = (from.y + to.y) / 2;
          const len = 9;
          ctx.fillStyle = '#FCD34D';
          ctx.shadowColor = '#F59E0B';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.moveTo(mx + Math.cos(angle) * len, my + Math.sin(angle) * len);
          ctx.lineTo(mx + Math.cos(angle + 2.5) * len * 0.5, my + Math.sin(angle + 2.5) * len * 0.5);
          ctx.lineTo(mx + Math.cos(angle - 2.5) * len * 0.5, my + Math.sin(angle - 2.5) * len * 0.5);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }

    // ── Draw nodes ──
    nodes.forEach((node, idx) => {
      const isHovered = node.id === hoveredNode;
      const isStart = result && result.route[0] === node.id;
      const r = isHovered ? 19 : 15;
      const color = NODE_COLORS[idx % NODE_COLORS.length];

      // Outer glow ring
      if (isHovered || isStart) {
        ctx.shadowColor = color;
        ctx.shadowBlur = isHovered ? 28 : 16;
        ctx.strokeStyle = color + '88';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r + 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Node fill — radial gradient
      ctx.shadowColor = color;
      ctx.shadowBlur = isHovered ? 20 : 10;
      const grad = ctx.createRadialGradient(node.x - 4, node.y - 4, 2, node.x, node.y, r);
      grad.addColorStop(0, '#fff');
      grad.addColorStop(0.35, color);
      grad.addColorStop(1, color + 'BB');
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Label
      ctx.fillStyle = '#0C0E0B';
      ctx.font = `bold ${isHovered ? 12 : 10}px JetBrains Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);

      // Depot star
      if (isStart) {
        ctx.fillStyle = '#FCD34D';
        ctx.font = '13px sans-serif';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText('★', node.x + r, node.y - r + 2);
        ctx.textBaseline = 'middle';
      }
    });

    // ── Visit order numbers (after full animation) ──
    if (result && result.route.length > 1 && animationProgress > 0.97) {
      result.route.forEach((id, pos) => {
        const node = nodes.find(n => n.id === id);
        if (!node || pos === result.route.length - 1) return;
        ctx.fillStyle = '#FCD34D';
        ctx.font = 'bold 9px Space Grotesk, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(`${pos + 1}`, node.x, node.y - 24);
      });
    }
  }, [nodes, result, animationProgress, hoveredNode, size]);

  useEffect(() => { draw(); }, [draw]);

  const getNodeAt = (x: number, y: number): DeliveryNode | null => {
    for (const node of nodes) {
      const dist = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
      if (dist <= 20) return node;
    }
    return null;
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isAnimating) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    if (!getNodeAt(x, y)) onAddNode(x, y);
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (isAnimating) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const hit = getNodeAt(e.clientX - rect.left, e.clientY - rect.top);
    if (hit) onRemoveNode(hit.id);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const hit = getNodeAt(e.clientX - rect.left, e.clientY - rect.top);
    setHoveredNode(hit ? hit.id : null);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = hit
        ? (isAnimating ? 'not-allowed' : 'pointer')
        : 'crosshair';
    }
  };

  const handleMouseLeave = () => setHoveredNode(null);

  return (
    <div ref={containerRef} className="map-canvas-container">
      <canvas
        ref={canvasRef}
        width={size.w}
        height={size.h}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="map-canvas"
      />
      {hasResults && (
        <div className="scroll-hint">
          ↓ Scroll for results &amp; breakdown
        </div>
      )}
    </div>
  );
};

export default MapCanvas;
