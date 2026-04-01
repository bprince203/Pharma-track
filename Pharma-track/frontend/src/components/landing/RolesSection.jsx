import { Link } from 'react-router-dom';
import { Factory, Truck, FlaskConical, ArrowRight } from 'lucide-react';

const ROLES = [
  {
    icon: Factory,
    title: 'Manufacturer',
    color: 'teal',
    description: 'Register drug batches on-chain with tamper-proof metadata — lot number, expiry, composition hash — and generate verifiable QR codes instantly.',
    features: ['Batch registration', 'QR code generation', 'Chain-of-custody init'],
    href: '/manufacturer',
    accent: 'border-teal-500/30 hover:border-teal-400/60 bg-teal-500/5',
    iconBg: 'bg-teal-500/10 text-teal-400',
  },
  {
    icon: Truck,
    title: 'Distributor',
    color: 'blue',
    description: 'Receive verified batches from manufacturers, confirm transfers on the blockchain, and hand off to pharmacies with a full audit trail preserved.',
    features: ['Batch receipt confirmation', 'Transfer logging', 'Cold-chain metadata'],
    href: '/distributor',
    accent: 'border-blue-500/30 hover:border-blue-400/60 bg-blue-500/5',
    iconBg: 'bg-blue-500/10 text-blue-400',
  },
  {
    icon: FlaskConical,
    title: 'Pharmacy',
    color: 'purple',
    description: 'Verify each unit before dispensing, manage live inventory with blockchain-backed provenance, and sell with confidence knowing every tablet is authentic.',
    features: ['Real-time verification', 'Inventory management', 'Dispense recording'],
    href: '/pharmacy',
    accent: 'border-purple-500/30 hover:border-purple-400/60 bg-purple-500/5',
    iconBg: 'bg-purple-500/10 text-purple-400',
  },
];

export default function RolesSection() {
  return (
    <section id="roles" className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-semibold text-teal-400 uppercase tracking-widest mb-3">
            Role-Based Access
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Every actor in the chain has a seat
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Permissioned smart contract roles ensure only the right wallets can register, receive, or dispense — no centralized gatekeeper.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {ROLES.map(({ icon: Icon, title, description, features, href, accent, iconBg }) => (
            <div key={title}
              className={`group relative p-6 rounded-2xl border transition-all duration-200 cursor-pointer ${accent}`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${iconBg}`}>
                <Icon size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-5">{description}</p>
              <ul className="space-y-2 mb-6">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="w-1 h-1 rounded-full bg-slate-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to={href}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                Open dashboard <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}