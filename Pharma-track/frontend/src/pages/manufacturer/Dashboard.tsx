import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import { FileText, Zap, AlertTriangle, ShieldCheck, Download, History, ExternalLink, Loader2 } from 'lucide-react';
import { batchApi, statsApi, type BatchWithDetails, type GlobalStats } from '../../lib/api';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  MANUFACTURED:     'bg-emerald-500/20 text-emerald-400',
  WITH_DISTRIBUTOR: 'bg-yellow-500/20 text-yellow-400',
  WITH_PHARMACY:    'bg-purple-500/20 text-purple-400',
  PARTIALLY_SOLD:   'bg-cyan-500/20 text-cyan-400',
  FULLY_SOLD:       'bg-gray-500/20 text-gray-400',
};

export default function ManufacturerDashboard() {
  const [batches, setBatches] = useState<BatchWithDetails[]>([]);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [batchData, statsData] = await Promise.all([
          batchApi.list(),
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

  const activeBatches = batches.filter(b => !b.isExpired && b.status !== 'FULLY_SOLD');
  const expiredBatches = batches.filter(b => b.isExpired);

  const exportCSV = () => {
    const headers = 'Batch Number,Medicine,Status,Expiry Date,Strips,TX Hash\n';
    const rows = batches.map(b =>
      `${b.batchNumber},${b.medicineName},${b.status},${b.expiryDate},${b.totalStrips},${b.txHash || ''}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'batches-export.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  return (
    <DashboardLayout role="manufacturer" searchPlaceholder="Search hash, batch, or destination...">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Manufacturer Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time overview of pharmaceutical supply chain.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[13px] text-gray-300 hover:bg-white/10 transition-colors">
            <Download size={14} /> Export Report
          </button>
          <Link to="/manufacturer/verification" className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-[13px] text-cyan-400 hover:bg-cyan-500/20 transition-colors">
            <History size={14} /> Verify Medicine
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<FileText size={20} className="text-cyan-400" />}
          label="TOTAL BATCHES"
          value={isLoading ? '...' : String(stats?.totalBatches ?? batches.length)}
          badge={batches.length > 0 ? 'Active' : ''}
          badgeColor="text-emerald-400"
          iconBg="bg-cyan-500/10"
        />
        <StatCard
          icon={<Zap size={20} className="text-yellow-400" />}
          label="ACTIVE BATCHES"
          value={isLoading ? '...' : String(activeBatches.length)}
          badge="●"
          badgeColor="text-emerald-400"
          iconBg="bg-yellow-500/10"
        />
        <StatCard
          icon={<AlertTriangle size={20} className="text-red-400" />}
          label="EXPIRED"
          value={isLoading ? '...' : String(expiredBatches.length)}
          badge={expiredBatches.length > 0 ? 'Alert' : 'Clear'}
          badgeColor={expiredBatches.length > 0 ? 'text-red-400' : 'text-emerald-400'}
          iconBg="bg-red-500/10"
        />
        <StatCard
          icon={<ShieldCheck size={20} className="text-emerald-400" />}
          label="FLAGGED BATCHES"
          value={isLoading ? '...' : String(stats?.flaggedBatches ?? 0)}
          badge={stats?.flaggedBatches === 0 ? 'Clean' : 'Review'}
          badgeColor={stats?.flaggedBatches === 0 ? 'text-emerald-400' : 'text-red-400'}
          iconBg="bg-emerald-500/10"
        />
      </div>

      <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-white">Recent Drug Batches</h3>
          <Link to="/manufacturer/inventory" className="text-[12px] text-cyan-400 hover:underline">View All →</Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <Loader2 size={24} className="animate-spin mr-3" /> Loading batches...
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p>No batches registered yet.</p>
            <Link to="/manufacturer/register-batch" className="text-cyan-400 text-sm hover:underline mt-2 inline-block">Register your first batch →</Link>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider font-medium pb-3">BATCH ID</th>
                  <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider font-medium pb-3">MEDICINE</th>
                  <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider font-medium pb-3">TX HASH</th>
                  <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider font-medium pb-3">EXPIRY DATE</th>
                  <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider font-medium pb-3">STATUS</th>
                  <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider font-medium pb-3">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {batches.slice(0, 8).map((batch) => (
                  <tr key={batch.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 text-[13px] text-white font-medium">{batch.batchNumber}</td>
                    <td className="py-4 text-[13px] text-gray-300">{batch.medicineName}</td>
                    <td className="py-4 text-[13px] text-cyan-400 font-mono">
                      {batch.txHash ? `${batch.txHash.slice(0, 8)}...${batch.txHash.slice(-4)}` : 'Pending'}
                    </td>
                    <td className="py-4 text-[13px] text-gray-400">{new Date(batch.expiryDate).toLocaleDateString()}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider ${STATUS_COLORS[batch.status] || 'bg-gray-500/20 text-gray-400'}`}>
                        {batch.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4">
                      {batch.txHash && (
                        <a href={`https://amoy.polygonscan.com/tx/${batch.txHash}`} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gray-300 transition-colors">
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
              <span className="text-[12px] text-gray-500">Showing {Math.min(8, batches.length)} of {batches.length} entries</span>
              <Link to="/manufacturer/inventory" className="px-3 py-1.5 text-[12px] text-cyan-400 hover:text-white bg-cyan-500/10 rounded-lg transition-colors">
                View All
              </Link>
            </div>
          </>
        )}
      </div>

      <Link to="/manufacturer/register-batch" className="fixed bottom-8 right-8 w-14 h-14 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 text-2xl transition-colors z-50">
        +
      </Link>
    </DashboardLayout>
  );
}