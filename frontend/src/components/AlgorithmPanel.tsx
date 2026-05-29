import React from 'react';
import type { AlgorithmType } from '../types';

interface AlgorithmPanelProps {
  selectedAlgo: AlgorithmType;
  onSelectAlgo: (a: AlgorithmType) => void;
  nodeCount: number;
  onSolve: () => void;
  onCompare: () => void;
  onClear: () => void;
  onReset: () => void;
  isLoading: boolean;
  isAnimating: boolean;
}

const ALGOS = [
  {
    id: 'brute_force' as AlgorithmType,
    icon: '⚙',
    name: 'Brute Force',
    badge: 'Exact',
    desc: 'Evaluates every permutation to guarantee the optimal Hamiltonian Cycle.',
    complexity: 'O(n!)',
    limit: '≤ 10 nodes',
    accent: '#F59E0B',
    accentDim: 'rgba(245,158,11,0.13)',
    maxNodes: 10,
  },
  {
    id: 'nearest_neighbor' as AlgorithmType,
    icon: '⚡',
    name: 'Nearest Neighbor',
    badge: 'Greedy',
    desc: 'A greedy heuristic that always visits the closest unvisited city next.',
    complexity: 'O(n²)',
    limit: 'Any size',
    accent: '#10B981',
    accentDim: 'rgba(16,185,129,0.13)',
    maxNodes: Infinity,
  },
  {
    id: 'held_karp' as AlgorithmType,
    icon: '🧠',
    name: 'Held-Karp DP',
    badge: 'Optimal',
    desc: 'Bitmask dynamic programming — the best known exact TSP algorithm.',
    complexity: 'O(n²·2ⁿ)',
    limit: '≤ 20 nodes',
    accent: '#60A5FA',
    accentDim: 'rgba(96,165,250,0.13)',
    maxNodes: 20,
  },
];

const AlgorithmPanel: React.FC<AlgorithmPanelProps> = ({
  selectedAlgo, onSelectAlgo, nodeCount, onSolve, onCompare, onClear, onReset, isLoading, isAnimating,
}) => {
  const busy = isLoading || isAnimating;

  return (
    <div className="algo-panel">
      {/* Title */}
      <div>
        <div className="panel-section-label">Route Optimization</div>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
          Select Algorithm
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-sub)', lineHeight: 1.5 }}>
          Solving the <em>Travelling Salesman Problem</em> — find the shortest round-trip visiting all cities exactly once.
        </div>
      </div>

      {/* Algorithms */}
      <div className="algo-list">
        <div className="panel-section-label">Algorithms</div>
        {ALGOS.map(algo => {
          const sel = selectedAlgo === algo.id;
          const disabled = nodeCount > algo.maxNodes;
          return (
            <button
              key={algo.id}
              className={`algo-card${sel ? ' algo-card--selected' : ''}${disabled ? ' algo-card--disabled' : ''}`}
              style={{
                '--card-accent': algo.accent,
                '--card-accent-dim': algo.accentDim,
              } as React.CSSProperties}
              onClick={() => !disabled && !busy && onSelectAlgo(algo.id)}
              disabled={disabled || busy}
            >
              <div className="algo-card-top">
                <span className="algo-icon-wrap" style={{ fontSize: '15px' }}>{algo.icon}</span>
                <span className="algo-name">{algo.name}</span>
                <span
                  className="algo-badge"
                  style={{ background: algo.accentDim, color: algo.accent }}
                >
                  {algo.badge}
                </span>
              </div>
              <p className="algo-desc">{algo.desc}</p>
              <div className="algo-meta">
                <span className="algo-complexity" style={{ background: algo.accentDim, color: algo.accent }}>
                  {algo.complexity}
                </span>
                <span className="algo-limit">
                  {disabled ? '⚠ ' : ''}{algo.limit}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Node counter */}
      <div className="node-counter">
        <span className="node-counter__icon">📍</span>
        <span className="node-counter__text">
          {nodeCount === 0 ? 'No cities placed' : `Cities on map`}
        </span>
        <span className="node-counter__num">{nodeCount}</span>
      </div>

      {/* Loading bar when busy */}
      {busy && (
        <div className="loading-bar">
          <div className="loading-bar__fill" />
        </div>
      )}

      {/* Action buttons */}
      <div className="action-buttons">
        <div className="panel-section-label">Actions</div>
        <button className="btn btn-solve" onClick={onSolve} disabled={busy || nodeCount < 2}>
          {isLoading ? '⟳ Solving…' : isAnimating ? '✦ Drawing Route…' : '▶ Solve TSP'}
        </button>
        <button className="btn btn-compare" onClick={onCompare} disabled={busy || nodeCount < 2}>
          ⊞ Compare All Algorithms
        </button>
        <div className="btn-row">
          <button className="btn btn-ghost" onClick={onReset} disabled={busy}>
            ↺ Reset
          </button>
          <button className="btn btn-danger" onClick={onClear} disabled={busy}>
            ✕ Clear
          </button>
        </div>
      </div>

      {/* Hint box */}
      <div className="hint-box">
        <div className="panel-section-label" style={{ marginBottom: 6 }}>How to use</div>
        <p><kbd>Left click</kbd> canvas — add a city</p>
        <p><kbd>Right click</kbd> city — remove it</p>
        <p style={{ marginTop: 4, color: 'var(--text-faint)', fontSize: '10.5px' }}>
          Minimum 2 cities required to compute the TSP route
        </p>
      </div>
    </div>
  );
};

export default AlgorithmPanel;
