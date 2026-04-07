import { useEffect, useRef } from 'react';

const NODES = [
  { x: 200, y: 180, label: 'MFR-01', type: 'manufacturer' },
  { x: 350, y: 100, label: 'MFR-02', type: 'manufacturer' },
  { x: 500, y: 180, label: 'DIST-01', type: 'distributor' },
  { x: 460, y: 310, label: 'DIST-02', type: 'distributor' },
  { x: 280, y: 320, label: 'PHR-01', type: 'pharmacy' },
  { x: 140, y: 300, label: 'PHR-02', type: 'pharmacy' },
  { x: 620, y: 250, label: 'PHR-03', type: 'pharmacy' },
  { x: 350, y: 220, label: 'CHAIN', type: 'core' },
];

const EDGES = [
  [0,7],[1,7],[7,2],[7,3],[7,4],[7,5],[2,6],[3,4],
];

const NODE_COLORS = {
  manufacturer: '#14b8a6',
  distributor:  '#3b82f6',
  pharmacy:     '#a855f7',
  core:         '#f59e0b',
};

export default function NetworkSection() {
  const svgRef = useRef(null);

  useEffect(() => {
    const pulses = svgRef.current?.querySelectorAll('.pulse-circle');
    if (!pulses) return;
    pulses.forEach((circle, i) => {
      circle.style.animationDelay = `${i * 0.4}s`;
    });
  }, []);

  return (
    <section id="network" className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold text-teal-400 uppercase tracking-widest mb-3">
            Decentralized Network
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Every node, one source of truth
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Manufacturers, distributors, and pharmacies communicate through smart contracts — no central server to hack, no single point of failure.
          </p>
        </div>

        {/* Network map */}
        <div className="relative bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <svg ref={svgRef} viewBox="0 80 760 280" className="w-full"
            aria-label="Network node map showing connected supply chain participants">
            {/* Edges */}
            {EDGES.map(([a, b], i) => {
              const na = NODES[a], nb = NODES[b];
              return (
                <line key={i}
                  x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                  stroke="#334155" strokeWidth="1.5" strokeDasharray="4 3"
                  opacity="0.6"
                />
              );
            })}
            {/* Nodes */}
            {NODES.map((node) => {
              const color = NODE_COLORS[node.type];
              return (
                <g key={node.label}>
                  {/* Pulse ring */}
                  <circle className="pulse-circle" cx={node.x} cy={node.y}
                    r={node.type === 'core' ? 28 : 22}
                    fill={color} fillOpacity="0.08"
                    style={{ animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite' }}
                  />
                  {/* Node circle */}
                  <circle cx={node.x} cy={node.y}
                    r={node.type === 'core' ? 18 : 14}
                    fill={color} fillOpacity="0.15"
                    stroke={color} strokeWidth="1.5"
                  />
                  {/* Label */}
                  <text x={node.x} y={node.y + 30}
                    textAnchor="middle" fill="#94a3b8"
                    fontSize="9" fontFamily="monospace">
                    {node.label}
                  </text>
                  {/* Dot */}
                  <circle cx={node.x} cy={node.y} r="4" fill={color} />
                </g>
              );
            })}
          </svg>

          <style>{`
            @keyframes ping {
              0%   { transform: scale(1); opacity: 0.6; }
              75%  { transform: scale(2); opacity: 0; }
              100% { transform: scale(2); opacity: 0; }
            }
            .pulse-circle { transform-origin: center; transform-box: fill-box; }
          `}</style>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-6 justify-center mt-8">
          {Object.entries(NODE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2 text-sm text-slate-400">
              <span className="w-3 h-3 rounded-full" style={{ background: color }} />
              <span className="capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}