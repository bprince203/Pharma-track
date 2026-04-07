import { useEffect, useRef, useState } from 'react';
import { Activity } from 'lucide-react';

function useCountUp(target, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return value;
}

function StatCard({ value, label, suffix = '', prefix = '', duration = 1800, started }) {
  const count = useCountUp(value, duration, started);
  return (
    <div className="flex-1 p-6 bg-slate-900 rounded-2xl border border-slate-800 text-center min-w-[160px]">
      <p className="text-3xl font-extrabold text-white tabular-nums">
        {prefix}{count.toLocaleString()}{suffix}
      </p>
      <p className="text-sm text-slate-400 mt-2">{label}</p>
    </div>
  );
}

const STATS = [
  { value: 1200000, suffix: '+', label: 'Batches Registered', duration: 2000 },
  { value: 99.9,   suffix: '%', label: 'Chain Uptime', duration: 1200, isFloat: true },
  { value: 4812,   suffix: '',  label: 'Active Nodes', duration: 1600 },
];

export default function StatsSection() {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-16 bg-slate-950 border-y border-slate-800/60">
      {/* Live block banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3 mb-10 px-4 py-2.5 bg-teal-500/5 border border-teal-500/20 rounded-full w-fit mx-auto">
          <Activity size={14} className="text-teal-400 animate-pulse" />
          <span className="text-xs text-teal-400 font-medium">Live blockchain data · Block #18,294,401</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {STATS.map((stat) => (
            <StatCard key={stat.label} {...stat} started={started} />
          ))}
        </div>
      </div>
    </section>
  );
}