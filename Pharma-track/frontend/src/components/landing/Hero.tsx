import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';

function MoleculeSVG() {
  return (
    <svg viewBox="0 0 400 400" className="w-full h-full opacity-20" aria-hidden="true">
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Bonds */}
      {[
        [200,200, 200,100], [200,200, 300,150], [200,200, 300,250],
        [200,200, 200,300], [200,200, 100,250], [200,200, 100,150],
        [200,100, 300,150], [300,150, 300,250], [300,250, 200,300],
        [200,300, 100,250], [100,250, 100,150], [100,150, 200,100],
      ].map(([x1,y1,x2,y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#14b8a6" strokeWidth="1.5" strokeOpacity="0.4" />
      ))}
      {/* Nodes */}
      {[
        [200,200,'C',20], [200,100,'N',14], [300,150,'O',14],
        [300,250,'C',14], [200,300,'H',12], [100,250,'N',14], [100,150,'O',14],
      ].map(([cx,cy,label,r], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={r} fill="url(#glow)" stroke="#14b8a6" strokeWidth="1.5" />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
            fill="#14b8a6" fontSize="10" fontWeight="700">{label}</text>
        </g>
      ))}
    </svg>
  );
}

export default function Hero() {
  const hashRef = useRef(null);
  const { role, jwtToken } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    const chars = '0123456789abcdef';
    let id;
    const tick = () => {
      if (hashRef.current) {
        hashRef.current.textContent = '0x' + Array.from({ length: 40 },
          () => chars[Math.floor(Math.random() * 16)]).join('');
      }
      id = setTimeout(tick, 80);
    };
    id = setTimeout(tick, 80);
    return () => clearTimeout(id);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden bg-slate-950">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:48px_48px]" aria-hidden="true" />

      {/* Radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-teal-500/5 blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-16 items-center">

        {/* Left — copy */}
        <div>
          {/* Protocol badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border border-teal-500/30 bg-teal-500/5 text-xs text-teal-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            PharmaLedger Protocol v2 · Live on Sepolia
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
            Verify Every{' '}
            <span className="text-teal-400">Medicine</span>{' '}
            on Chain
          </h1>

          <p className="text-lg text-slate-400 max-w-xl mb-10 leading-relaxed">
            End-to-end pharmaceutical supply chain transparency. From manufacturer to patient —
            every batch immutably recorded, every transfer cryptographically verified.
          </p>

          {/* Live hash */}
          <div className="flex items-center gap-2 mb-10 p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs overflow-hidden">
            <Zap size={13} className="text-teal-400 flex-shrink-0" />
            <span className="text-slate-500 flex-shrink-0">Latest tx:</span>
            <span ref={hashRef} className="text-teal-400 truncate">0x...</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => jwtToken && role ? navigate(`/${role.toLowerCase()}`) : navigate('/onboarding')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl transition-colors shadow-lg shadow-teal-900/40 group">
              {jwtToken && role ? 'Go to Dashboard' : 'Launch App'}
              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <Link to="/verify"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-medium text-slate-200 border border-slate-700 hover:border-teal-500/50 hover:bg-teal-500/5 rounded-xl transition-all duration-150">
              <ShieldCheck size={18} className="text-teal-400" />
              Scan & Verify
            </Link>
          </div>
        </div>

        {/* Right — molecule */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="relative w-[380px] h-[380px]">
            <div className="absolute inset-0 rounded-full bg-teal-500/5 border border-teal-500/10 animate-pulse" />
            <div className="absolute inset-8 rounded-full bg-teal-500/5 border border-teal-500/10" />
            <MoleculeSVG />
            {/* Floating info chips */}
            <div className="absolute top-8 right-0 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-teal-400 font-mono shadow-lg">
              SHA-256 ✓
            </div>
            <div className="absolute bottom-8 left-0 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-teal-400 font-mono shadow-lg">
              ERC-721 NFT
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}