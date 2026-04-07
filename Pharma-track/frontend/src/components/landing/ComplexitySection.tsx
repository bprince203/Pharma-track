import { useEffect, useRef, useState } from 'react';

function HashVisualizer() {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    const chars = '0123456789abcdef';
    const randomHex = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * 16)]).join('');
    const PREFIXES = ['Block:', 'Tx:   ', 'Batch:', 'Hash: ', 'Sign: ', 'Addr: '];

    const spawn = () => {
      setLines((prev) => {
        const next = [...prev.slice(-8), {
          id: Date.now(),
          prefix: PREFIXES[Math.floor(Math.random() * PREFIXES.length)],
          value: randomHex(40),
        }];
        return next;
      });
    };

    spawn();
    const id = setInterval(spawn, 600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="font-mono text-xs leading-6 overflow-hidden h-64 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900 z-10 pointer-events-none" />
      {lines.map((line) => (
        <div key={line.id} className="flex gap-3 animate-[fadeIn_0.3s_ease]">
          <span className="text-slate-500 select-none flex-shrink-0">{line.prefix}</span>
          <span className="text-teal-400 truncate">{line.value}</span>
        </div>
      ))}
    </div>
  );
}

const PAIN_POINTS = [
  { before: 'Paper records forged easily', after: 'Immutable on-chain registration' },
  { before: 'No visibility between stages', after: 'Full end-to-end traceability' },
  { before: 'Counterfeit drugs reach patients', after: 'QR verification at every step' },
];

export default function ComplexitySection() {
  return (
    <section className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div>
            <p className="text-xs font-semibold text-teal-400 uppercase tracking-widest mb-3">
              The Problem
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-6">
              Eliminate Complexity.<br />Eliminate Counterfeits.
            </h2>
            <p className="text-slate-400 text-base leading-relaxed mb-10">
              Traditional pharma supply chains rely on paper, trust, and centralized databases.
              PharmaLedger replaces all three with cryptographic proofs on a public ledger.
            </p>

            <div className="space-y-4">
              {PAIN_POINTS.map(({ before, after }) => (
                <div key={before} className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 px-4 py-3 bg-red-500/5 border border-red-500/20 rounded-xl text-xs text-red-400">
                    <span className="text-red-500 font-bold text-base leading-none flex-shrink-0">✗</span>
                    {before}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-3 bg-teal-500/5 border border-teal-500/20 rounded-xl text-xs text-teal-400">
                    <span className="text-teal-400 font-bold text-base leading-none flex-shrink-0">✓</span>
                    {after}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — live hash panel */}
          <div className="relative p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl shadow-black/40">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="ml-auto text-xs text-slate-500 font-mono">pharma-ledger · live feed</span>
            </div>
            <HashVisualizer />
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-slate-500">Connected to Sepolia · ~12s block time</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}