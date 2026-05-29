import React, { useState } from 'react';
import type { AlgorithmResult, DeliveryNode } from '../types';

const ALGO_LABELS: Record<string, string> = {
  brute_force: 'Brute Force',
  nearest_neighbor: 'Nearest Neighbor',
  held_karp: 'Held-Karp DP',
};

const ALGO_COLORS: Record<string, string> = {
  brute_force: '#F59E0B',
  nearest_neighbor: '#10B981',
  held_karp: '#60A5FA',
};

const ALGO_ICONS: Record<string, string> = {
  brute_force: '⚙',
  nearest_neighbor: '⚡',
  held_karp: '🧠',
};

function euclidean(a: DeliveryNode, b: DeliveryNode) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

interface StatsPanelProps {
  result: AlgorithmResult | null;
  compareResults: AlgorithmResult[] | null;
  nodes: DeliveryNode[];
  onSelectResult?: (r: AlgorithmResult) => void;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ result, compareResults, nodes, onSelectResult }) => {
  const [expandedAlgo, setExpandedAlgo] = useState<string | null>(null);

  if (!result && !compareResults) return null;

  // ── Compare Mode ──────────────────────────────────────────
  if (compareResults && compareResults.length > 0) {
    const valid = compareResults.filter(r => r.total_distance > 0);
    const best = valid.length > 0
      ? valid.reduce((b, r) => r.total_distance < b.total_distance ? r : b, valid[0])
      : null;
    const activeAlgo = result?.algorithm;

    const handleCard = (r: AlgorithmResult) => {
      if (r.total_distance <= 0) return;
      onSelectResult?.(r);
      setExpandedAlgo(prev => prev === r.algorithm ? null : r.algorithm);
    };

    return (
      <div className="stats-panel anim-slide-up">
        <div className="stats-section-header">
          <div className="stats-section-icon">⊞</div>
          <div>
            <div className="stats-section-title">Algorithm Comparison</div>
            <div className="stats-section-sub">Travelling Salesman Problem — NP-Hard optimization</div>
          </div>
          <div className="stats-section-sub" style={{ marginLeft: 'auto' }}>
            Click a card to visualize its route
          </div>
        </div>

        <div className="compare-grid">
          {compareResults.map(r => {
            const color = ALGO_COLORS[r.algorithm] || '#fff';
            const isBest = best && r.algorithm === best.algorithm;
            const isActive = r.algorithm === activeAlgo;
            const failed = r.total_distance <= 0;
            const isExpanded = expandedAlgo === r.algorithm;

            return (
              <div key={r.algorithm} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  className={`compare-card${isBest ? ' compare-card--best' : ''}${isActive ? ' compare-card--active' : ''}${failed ? ' compare-card--disabled' : ''}`}
                  style={{ borderColor: isActive ? color : isBest ? color + '66' : 'transparent' }}
                  onClick={() => handleCard(r)}
                  disabled={failed}
                >
                  <div className="compare-card-header" style={{ color }}>
                    <span style={{ fontSize: 17 }}>{ALGO_ICONS[r.algorithm] || '◈'}</span>
                    {isBest && <span className="badge-best">🏆 Best Route</span>}
                    {isActive && !isBest && (
                      <span className="badge-active" style={{ background: color + '22', color }}>● Active</span>
                    )}
                    <span style={{ marginLeft: 'auto' }}>{ALGO_LABELS[r.algorithm]}</span>
                  </div>

                  <div className="compare-stat-row">
                    <span style={{ fontSize: 13 }}>🛣</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--text)' }}>
                      {failed ? 'N/A' : r.total_distance.toFixed(2)}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-sub)' }}>px distance</span>
                  </div>

                  <div className="compare-stat-row">
                    <span style={{ fontSize: 13 }}>⏱</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--text)' }}>
                      {r.computation_time_ms.toFixed(3)}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-sub)' }}>ms compute</span>
                  </div>

                  <div className="compare-stat-row">
                    <span style={{ fontSize: 13 }}>📍</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--text)' }}>
                      {r.route.length}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-sub)' }}>stops in route</span>
                  </div>

                  {!failed && (
                    <div className="compare-view-hint" style={{ color }}>
                      {isActive ? (isExpanded ? '↑ Collapse breakdown' : '↓ Expand leg-by-leg') : '→ View on map'}
                    </div>
                  )}
                </button>

                {isExpanded && isActive && !failed && (
                  <div className="compare-breakdown">
                    <RouteBreakdown result={r} nodes={nodes} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {best && (
          <div className="compare-winner">
            <span style={{ fontSize: 20 }}>🏆</span>
            <span>
              <strong>{ALGO_LABELS[best.algorithm]}</strong> finds the shortest Hamiltonian Cycle —{' '}
              <strong style={{ fontFamily: 'JetBrains Mono, monospace' }}>{best.total_distance.toFixed(2)} px</strong>{' '}
              in <strong style={{ fontFamily: 'JetBrains Mono, monospace' }}>{best.computation_time_ms.toFixed(3)} ms</strong>
            </span>
          </div>
        )}
      </div>
    );
  }

  // ── Single Solve Mode ─────────────────────────────────────
  if (!result) return null;
  const color = ALGO_COLORS[result.algorithm] || '#F59E0B';

  return (
    <div className="stats-panel anim-slide-up">
      <div className="stats-section-header">
        <div className="stats-section-icon" style={{ background: color + '22' }}>
          {ALGO_ICONS[result.algorithm] || '◈'}
        </div>
        <div>
          <div className="stats-section-title">
            {ALGO_LABELS[result.algorithm]} — TSP Result
          </div>
          <div className="stats-section-sub">
            Optimal Hamiltonian Cycle · Route Optimization
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="kpi-row">
        <div className="kpi-card kpi-card--amber">
          <div className="kpi-label">Total Distance</div>
          <div className="kpi-value">{result.total_distance.toFixed(1)}</div>
          <div className="kpi-unit">pixels (Euclidean)</div>
        </div>
        <div className="kpi-card kpi-card--emerald">
          <div className="kpi-label">Compute Time</div>
          <div className="kpi-value">{result.computation_time_ms.toFixed(3)}</div>
          <div className="kpi-unit">milliseconds</div>
        </div>
        <div className="kpi-card kpi-card--sky">
          <div className="kpi-label">Cities in Route</div>
          <div className="kpi-value">{result.route.length - 1}</div>
          <div className="kpi-unit">+ return to depot</div>
        </div>
      </div>

      {/* Route sequence */}
      <div className="route-seq-wrap">
        <span className="route-seq-label">Route:</span>
        <div className="route-seq-nodes">
          {result.route.map((id, i) => {
            const node = nodes.find(n => n.id === id);
            return (
              <React.Fragment key={i}>
                {i > 0 && <span className="route-seq-arrow">→</span>}
                <span className="route-seq-node">{node?.label ?? id}</span>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <RouteBreakdown result={result} nodes={nodes} />
    </div>
  );
};

/* ── Route Breakdown sub-component ──────────────────── */
const RouteBreakdown: React.FC<{ result: AlgorithmResult; nodes: DeliveryNode[] }> = ({ result, nodes }) => {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const route = result.route;

  const legs: Array<{ from: DeliveryNode; to: DeliveryNode; dist: number }> = [];
  for (let i = 0; i < route.length - 1; i++) {
    const from = nodeMap.get(route[i]);
    const to = nodeMap.get(route[i + 1]);
    if (from && to) legs.push({ from, to, dist: euclidean(from, to) });
  }

  if (legs.length === 0) return null;

  const maxDist = Math.max(...legs.map(l => l.dist));

  return (
    <div className="breakdown-wrap">
      <div className="breakdown-header-row">
        <span style={{ fontSize: 14 }}>🗺</span>
        <span className="breakdown-title">Step-by-Step Leg Breakdown</span>
      </div>
      <div className="breakdown-table">
        <div className="breakdown-th">
          <span>Leg</span>
          <span>From</span>
          <span></span>
          <span>To</span>
          <span>Distance</span>
          <span style={{ textAlign: 'right' }}>Cumulative</span>
        </div>
        {legs.map((leg, i) => {
          const cumulative = legs.slice(0, i + 1).reduce((s, l) => s + l.dist, 0);
          const pct = (leg.dist / maxDist) * 100;
          return (
            <div className="breakdown-tr" key={i}>
              <span className="leg-num">#{i + 1}</span>
              <span className="leg-node leg-from">{leg.from.label}</span>
              <span className="leg-arrow" style={{ color: 'var(--text-faint)', display: 'flex', justifyContent: 'center', fontSize: 11 }}>→</span>
              <span className="leg-node leg-to">{leg.to.label}</span>
              <span className="leg-dist-cell">
                <span className="leg-dist-value">{leg.dist.toFixed(1)}</span>
                <span className="leg-dist-unit">px</span>
                <span className="leg-bar-bg">
                  <span className="leg-bar-fill" style={{ width: `${pct}%` }} />
                </span>
              </span>
              <span className="leg-cumulative">{cumulative.toFixed(1)} px</span>
            </div>
          );
        })}
        <div className="breakdown-total-row">
          <span className="total-label">Total Route Distance</span>
          <span className="total-value">{result.total_distance.toFixed(2)} px</span>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
