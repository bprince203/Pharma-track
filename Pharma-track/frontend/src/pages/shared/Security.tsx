import DashboardLayout from '../../components/layout/DashboardLayout';
import { Lock, Shield, Key, Copy, LogOut, Wallet } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface SecurityProps {
  role: 'manufacturer' | 'distributor' | 'pharmacy';
}

export default function Security({ role }: SecurityProps) {
  const { walletAddress, actorName, role: actorRole, jwtToken } = useAppStore();
  const { signOut } = useAuth();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const tokenPreview = jwtToken ? `${jwtToken.slice(0, 20)}...${jwtToken.slice(-10)}` : 'N/A';

  return (
    <DashboardLayout role={role}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Security</h1>
        <p className="text-sm text-gray-500 mt-1">Wallet, session, and access management.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Shield size={22} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Auth Status</p>
            <p className="text-sm font-bold text-emerald-400">Authenticated</p>
          </div>
        </div>

        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <Lock size={22} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Encryption</p>
            <p className="text-sm font-bold text-white">ECDSA + JWT</p>
          </div>
        </div>

        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Key size={22} className="text-purple-400" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Role</p>
            <p className="text-sm font-bold text-white">{actorRole}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-6 mb-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Wallet size={16} className="text-cyan-400" /> Wallet Information
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Connected Wallet</p>
            <div className="flex items-center gap-3">
              <code className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-cyan-400 font-mono">
                {walletAddress || 'Not connected'}
              </code>
              {walletAddress && (
                <button
                  onClick={() => copyToClipboard(walletAddress, 'Wallet address')}
                  className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
                >
                  <Copy size={16} />
                </button>
              )}
            </div>
          </div>

          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Display Name</p>
            <p className="text-sm text-white">{actorName || 'Unknown'}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-6 mb-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Key size={16} className="text-purple-400" /> Session Token
        </h3>
        <div className="flex items-center gap-3">
          <code className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[11px] text-gray-400 font-mono overflow-hidden">
            {tokenPreview}
          </code>
          {jwtToken && (
            <button
              onClick={() => copyToClipboard(jwtToken, 'JWT token')}
              className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
            >
              <Copy size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-red-400 mb-2">Danger Zone</h3>
        <p className="text-[12px] text-gray-400 mb-4">Sign out from this session. You'll need to re-authenticate with MetaMask.</p>
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-[13px] font-semibold hover:bg-red-500/20 transition-colors"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </DashboardLayout>
  );
}
