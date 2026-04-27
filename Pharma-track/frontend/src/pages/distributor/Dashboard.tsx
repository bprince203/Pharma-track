import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import {
  Truck, CheckCircle2, Package, ShieldCheck, AlertTriangle,
  Loader2, ExternalLink, Clock
} from 'lucide-react';
import { batchApi, statsApi, type BatchWithDetails, type GlobalStats } from '../../lib/api';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  MANUFACTURED:     'bg-emerald-500/20 text-emerald-400',
  WITH_DISTRIBUTOR: 'bg-yellow-500/20 text-yellow-400',
  WITH_PHARMACY:    'bg-purple-500/20 text-purple-400',
  PARTIALLY_SOLD:   'bg-cyan-500/20 text-cyan-400',
  FULLY_SOLD:       'bg-gray-500/20 text-gray-400',
};

export default function DistributorDashboard() {
  const [batches, setBatches] = useState<BatchWithDetails[]>([]);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [batchData, statsData] = await Promise.all([
          batchApi.getIncoming(),
          statsApi.getGlobal(),
        ]);
        setBatches(batchData);
        setStats(statsData);
      } catch (err) {
        toast.error((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const pendingBatches = batches.filter(b => b.status === 'WITH_DISTRIBUTOR');
  const forwardedBatches = batches.filter(b => b.status === 'WITH_PHARMACY');

  return (
    <DashboardLayout role="distributor" searchPlaceholder="Search ledger or tracking ID...">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Logistics Hub</h1>
          <p className="text-sm text-gray-500 mt-1">Distribution network overview and batch management.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/distributor/verification" className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-[13px] text-cyan-400 hover:bg-cyan-500/20 transition-colors">
            <ShieldCheck size={14} /> Verify Shipment
          </Link>
          <Link to="/distributor/inventory" className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[13px] text-gray-300 hover:bg-white/10 transition-colors">
            <Package size={14} /> Manage Inventory
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Truck size={20} className="text-cyan-400" />}
          label="Total Batches"
          value={isLoading ? '...' : String(batches.length)}
          badge="Incoming"
          badgeColor="text-cyan-400"
          iconBg="bg-cyan-500/10"
        />
        <StatCard
          icon={<Clock size={20} className="text-yellow-400" />}
          label="Pending Confirmation"
          value={isLoading ? '...' : String(pendingBatches.length)}
          badge={pendingBatches.length > 0 ? 'Action Needed' : 'Clear'}
          badgeColor={pendingBatches.length > 0 ? 'text-yellow-400' : 'text-emerald-400'}
          iconBg="bg-yellow-500/10"
        />
        <StatCard
          icon={<CheckCircle2 size={20} className="text-emerald-400" />}
          label="Forwarded to Pharmacy"
          value={isLoading ? '...' : String(forwardedBatches.length)}
          badge="Completed"
          badgeColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
        />
        <StatCard
          icon={<AlertTriangle size={20} className="text-red-400" />}
          label="Flagged"
          value={isLoading ? '...' : String(stats?.flaggedBatches ?? 0)}
          badge={stats?.flaggedBatches === 0 ? 'Clean' : 'Alert'}
          badgeColor={stats?.flaggedBatches === 0 ? 'text-emerald-400' : 'text-red-400'}
          iconBg="bg-red-500/10"
        />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-2 bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Incoming Batches</h3>
            <Link to="/distributor/inventory" className="text-[12px] text-cyan-400 hover:underline">View All →</Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-500">
              <Loader2 size={24} className="animate-spin mr-3" /> Loading...
            </div>
          ) : batches.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Package size={40} className="mx-auto mb-3 opacity-30" />
              <p>No incoming batches yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {batches.slice(0, 5).map((batch) => (
                <div key={batch.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-3.5 hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <Package size={14} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-white">{batch.batchNumber}</p>
                        <p className="text-[10px] text-gray-500">{batch.medicineName}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${STATUS_COLORS[batch.status] || 'bg-gray-500/20 text-gray-400'}`}>
                      {batch.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-gray-500">{batch.totalStrips} strips • Expires {new Date(batch.expiryDate).toLocaleDateString()}</p>
                    {batch.txHash && (
                      <a href={`https://amoy.polygonscan.com/tx/${batch.txHash}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-cyan-400 hover:underline">
                        <ExternalLink size={10} /> View TX
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
          <h3 className="text-base font-bold text-white mb-1">Network Status</h3>
          <p className="text-[11px] text-gray-500 mb-5">Supply chain overview.</p>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-white tracking-wider">Total Batches</span>
                <span className="text-[11px] font-semibold text-emerald-400">{stats?.totalBatches ?? 0}</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-white tracking-wider">Sale Tokens Issued</span>
                <span className="text-[11px] font-semibold text-cyan-400">{stats?.totalSaleTokens ?? 0}</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: stats?.totalBatches ? `${Math.min(100, ((stats.totalSaleTokens ?? 0) / Math.max(1, stats.totalBatches)) * 100)}%` : '0%' }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <p className="text-xl font-bold text-white">{stats?.totalVerifications ?? 0}</p>
                <p className="text-[9px] text-gray-500 uppercase tracking-wider">VERIFICATIONS</p>
              </div>
              <div>
                <p className="text-xl font-bold text-white">{stats?.flaggedBatches ?? 0}</p>
                <p className="text-[9px] text-gray-500 uppercase tracking-wider">FLAGGED</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Link to="/distributor/logistics" className="fixed bottom-8 right-8 w-14 h-14 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 text-2xl transition-colors z-50">
        +
      </Link>
    </DashboardLayout>
  );
}
