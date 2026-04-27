import DashboardLayout from '../../components/layout/DashboardLayout';
import { FileCode2, ExternalLink, ShieldCheck, Zap, Users } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface SmartContractsProps {
  role: 'manufacturer' | 'distributor' | 'pharmacy';
}

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const ROLE_PERMISSIONS: Record<string, string[]> = {
  MANUFACTURER: ['Register Batches', 'Register Strips', 'Transfer to Distributor', 'View All Own Batches'],
  DISTRIBUTOR: ['Receive Batches', 'Transfer to Pharmacy', 'Confirm Receipt', 'View Incoming Batches'],
  PHARMACY: ['Receive Batches', 'Sell Medicine (Generate Token)', 'View Strip Inventory', 'Generate Sale QR'],
};

export default function SmartContracts({ role }: SmartContractsProps) {
  const { walletAddress, role: actorRole } = useAppStore();

  const permissions = actorRole ? ROLE_PERMISSIONS[actorRole] || [] : [];

  return (
    <DashboardLayout role={role}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Smart Contracts</h1>
        <p className="text-sm text-gray-500 mt-1">Contract deployment info and role permissions.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <FileCode2 size={22} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Contract</p>
            <p className="text-sm font-bold text-white">PharmaTrack.sol</p>
          </div>
        </div>

        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Zap size={22} className="text-purple-400" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Network</p>
            <p className="text-sm font-bold text-white">Polygon Amoy</p>
          </div>
        </div>

        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <ShieldCheck size={22} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Standard</p>
            <p className="text-sm font-bold text-white">AccessControl + Pausable</p>
          </div>
        </div>
      </div>

      <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-6 mb-6">
        <h3 className="text-sm font-bold text-white mb-4">Contract Address</h3>
        <div className="flex items-center gap-3">
          <code className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-cyan-400 font-mono">
            {CONTRACT_ADDRESS}
          </code>
          <a
            href={`https://amoy.polygonscan.com/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ExternalLink size={14} /> Explorer
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users size={18} className="text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Your Permissions ({actorRole})</h3>
          </div>
          <div className="space-y-2">
            {permissions.map((perm) => (
              <div key={perm} className="flex items-center gap-3 px-3 py-2 bg-white/[0.03] rounded-lg">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span className="text-[13px] text-gray-300">{perm}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">Your Wallet</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[12px] text-gray-500">Address</span>
              <span className="text-[12px] text-white font-mono">{walletAddress ? `${walletAddress.slice(0,10)}...${walletAddress.slice(-8)}` : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[12px] text-gray-500">Role</span>
              <span className="text-[12px] text-cyan-400 font-semibold">{actorRole}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[12px] text-gray-500">Status</span>
              <span className="text-[12px] text-emerald-400 font-semibold">Active</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
