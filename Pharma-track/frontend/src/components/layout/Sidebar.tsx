import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Truck, ShieldCheck,
  FileCode2, Lock, LifeBuoy, PlusCircle, PackagePlus, PackageCheck
} from 'lucide-react';

interface SidebarProps {
  role: 'manufacturer' | 'distributor' | 'pharmacy';
}

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '' },
  { label: 'Inventory', icon: Package, path: '/inventory' },
  { label: 'Logistics', icon: Truck, path: '/logistics' },
  { label: 'Verification', icon: ShieldCheck, path: '/verification' },
  { label: 'Smart Contracts', icon: FileCode2, path: '/smart-contracts' },
  { label: 'Security', icon: Lock, path: '/security' },
];

const ROLE_LABELS: Record<string, string> = {
  manufacturer: 'VERIFIED MANUFACTURER',
  distributor: 'VERIFIED DISTRIBUTOR',
  pharmacy: 'VERIFIED PHARMACY',
};

const ACTION_BUTTON: Record<string, { label: string; path: string; icon: typeof PlusCircle }> = {
  manufacturer: { label: 'DEPLOY NEW BATCH', path: '/register-batch', icon: PlusCircle },
  distributor: { label: 'RECEIVE BATCH', path: '/logistics', icon: PackagePlus },
  pharmacy: { label: 'SELL MEDICINE', path: '/sell', icon: PackageCheck },
};

export default function Sidebar({ role }: SidebarProps) {
  const location = useLocation();
  const basePath = `/${role}`;
  const action = ACTION_BUTTON[role];

  const isActive = (itemPath: string) => {
    const fullPath = basePath + itemPath;
    if (itemPath === '') {
      return location.pathname === basePath || location.pathname === basePath + '/';
    }
    return location.pathname.startsWith(fullPath);
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-[200px] bg-[#0b1120] border-r border-white/5 flex flex-col z-50">
      <Link to="/" className="px-4 py-5 flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-black" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        </div>
        <div className="leading-tight">
          <div className="text-[11px] font-bold text-white tracking-wide">PHARMA_LEDGER</div>
          <div className="text-[9px] text-gray-500 tracking-wider">{ROLE_LABELS[role]}</div>
        </div>
      </Link>

      <nav className="flex-1 px-3 py-2 space-y-1">
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
          const active = isActive(path);
          return (
            <Link
              key={label}
              to={basePath + path}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 relative
                ${active
                  ? 'bg-cyan-500/10 text-cyan-400'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-cyan-400 rounded-r-full" />
              )}
              <Icon size={18} strokeWidth={active ? 2 : 1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <Link
          to={basePath + action.path}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl text-[13px] font-semibold hover:bg-cyan-500/20 transition-colors"
        >
          <action.icon size={16} />
          {action.label}
        </Link>
      </div>

      <div className="px-3 pb-4">
        <Link to="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-400 text-[13px] transition-colors">
          <LifeBuoy size={16} />
          Support
        </Link>
      </div>
    </aside>
  );
}
