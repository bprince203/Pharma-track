import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Lock, Zap } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'Audited Contracts' },
  { icon: Lock,        label: 'Non-Custodial' },
  { icon: Zap,         label: 'Sub-second Verify' },
];

export default function CTASection() {
  const { role, jwtToken } = useAppStore();
  const navigate = useNavigate();

  const handleLaunchApp = () => {
    if (jwtToken && role) {
      navigate(`/${role.toLowerCase()}`);
    } else {
      navigate('/onboarding');
    }
  };

  return (
    <section className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-950 via-slate-900 to-slate-950 border border-teal-500/20 px-8 py-20 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

          <div className="relative max-w-2xl mx-auto">
            <p className="text-xs font-semibold text-teal-400 uppercase tracking-widest mb-5">
              Get Started Today
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-5">
              Secure Your Supply Chain.<br />No Middlemen.
            </h2>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              Connect your wallet, choose your role, and start registering or verifying medicines on the blockchain in under two minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button onClick={handleLaunchApp}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl transition-colors shadow-lg shadow-teal-900/50 group">
                {jwtToken && role ? 'Go to Dashboard' : 'Launch App'}
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
              <Link to="/verify"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-medium text-slate-200 border border-slate-700 hover:border-teal-500/50 hover:bg-teal-500/5 rounded-xl transition-all duration-150">
                <ShieldCheck size={18} className="text-teal-400" />
                Verify a Batch
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 justify-center">
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-slate-500">
                  <Icon size={14} className="text-teal-500" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}