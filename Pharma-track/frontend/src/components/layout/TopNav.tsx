import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Copy, Settings, Search, LogOut, User, Wallet } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface TopNavProps {
  searchPlaceholder?: string;
}

export default function TopNav({ searchPlaceholder = 'Search hash, batch, or destination...' }: TopNavProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { actorName, walletAddress, role } = useAppStore();
  const { signOut } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const truncatedWallet = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : '';

  const initials = actorName
    ? actorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const copyWallet = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast.success('Wallet address copied');
    }
  };

  return (
    <header className="h-[60px] bg-[#0b1120]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-[15px] font-bold text-white tracking-wider font-mono hover:text-cyan-300 transition-colors">PHARMA_LEDGER</Link>
        <div className="relative hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-[320px] h-9 pl-9 pr-4 bg-white/5 border border-white/10 rounded-lg text-[13px] text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={copyWallet} title="Copy wallet address" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-white/10 transition-colors">
          <Copy size={16} />
        </button>
        <button className="relative w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-white/10 transition-colors">
          <Bell size={16} />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-white/10 transition-colors"
          >
            <Settings size={16} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-12 w-64 bg-[#111827] border border-white/10 rounded-xl shadow-2xl shadow-black/50 py-2 z-50">
              <div className="px-4 py-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white font-bold text-sm">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{actorName || 'Unknown'}</p>
                    <p className="text-[10px] text-gray-500 font-mono">{truncatedWallet}</p>
                  </div>
                </div>
              </div>

              <div className="px-2 py-1">
                <div className="flex items-center gap-3 px-3 py-2 text-[13px] text-gray-400">
                  <User size={14} />
                  <span>Role: <span className="text-cyan-400 font-semibold">{role}</span></span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 text-[13px] text-gray-400">
                  <Wallet size={14} />
                  <span className="font-mono text-[11px]">{truncatedWallet}</span>
                </div>
              </div>

              <div className="border-t border-white/5 px-2 py-1">
                <button
                  onClick={() => { signOut(); setShowDropdown(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 ml-2 pl-3 border-l border-white/10">
          <div className="text-right hidden lg:block">
            <div className="text-[13px] font-medium text-white">{actorName || 'User'}</div>
            <div className="text-[10px] text-cyan-400 font-semibold tracking-wider">{role || 'GUEST'}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white font-bold text-sm">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
