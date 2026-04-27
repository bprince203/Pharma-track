import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  Link2, ShieldAlert, AlertTriangle, Pill, Plus, ExternalLink, ChevronDown, Loader2, Package
} from 'lucide-react';
import { stripApi, saleApi, statsApi, type StripWithBatch, type SaleToken, type GlobalStats } from '../../lib/api';
import toast from 'react-hot-toast';

export default function PharmacyDashboard() {
  const [strips, setStrips] = useState<StripWithBatch[]>([]);
  const [sales, setSales] = useState<SaleToken[]>([]);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [stripData, saleData, statsData] = await Promise.all([
          stripApi.getInventory(),
          saleApi.getRecent(),
          statsApi.getGlobal(),
        ]);
        setStrips(stripData);
        setSales(saleData);
        setStats(statsData);
      } catch (err) {
        toast.error((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const availableStrips = strips.filter(s => !s.isSold && s.tabletsRemaining > 0);
  const lowStock = strips.filter(s => !s.isSold && s.tabletsRemaining > 0 && s.tabletsRemaining < s.tabletsTotal * 0.3);
  const expiredStrips = strips.filter(s => {
    const batch = s.batch;
    if (!batch?.expiryDate) return false;
    return new Date(batch.expiryDate) < new Date();
  });

  const visibleSales = showAll ? sales : sales.slice(0, 5);

  return (
    <DashboardLayout role="pharmacy" searchPlaceholder="Search batch, drug, or node...">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Pharmacy Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Inventory overview and recent sales activity.</p>
        </div>
        <div className="flex items-center gap-3 bg-[#111827]/80 border border-white/5 rounded-xl px-4 py-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[12px] font-semibold text-emerald-400">ONLINE</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <Loader2 size={24} className="animate-spin mr-3" /> Loading dashboard...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-2">TOTAL STRIPS IN INVENTORY</p>
              <p className="text-4xl font-bold text-white mb-4">{strips.length}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-emerald-400">{availableStrips.length} available for sale</span>
              </div>
              <div className="absolute top-4 right-4 opacity-10">
                <Link2 size={80} className="text-cyan-400" />
              </div>
            </div>

            <Link to="/pharmacy/inventory" className="bg-[#111827]/80 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center hover:bg-[#111827] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-3">
                <ShieldAlert size={24} className="text-yellow-400" />
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1">LOW STOCK ALERTS</p>
              <p className="text-3xl font-bold text-white mb-1">{lowStock.length}</p>
              <span className="text-[11px] text-cyan-400 hover:underline font-medium">VIEW INVENTORY ›</span>
            </Link>

            <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-3">
                <AlertTriangle size={24} className="text-red-400" />
              </div>
              <p className="text-[10px] text-red-400 uppercase tracking-wider font-semibold mb-1">EXPIRING / EXPIRED</p>
              <p className="text-3xl font-bold text-white mb-1">{expiredStrips.length}</p>
              <span className="text-[11px] text-red-400 font-medium">{expiredStrips.length === 0 ? 'All Clear' : 'Needs Attention'}</span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-3">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-base font-bold text-white">Inventory Status</h3>
                <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 rounded text-[10px] text-cyan-400 font-semibold">LIVE</span>
                <div className="flex-1" />
                <Link to="/pharmacy/inventory" className="text-[12px] text-cyan-400 hover:underline font-medium">MANAGE →</Link>
              </div>

              {availableStrips.length === 0 ? (
                <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-10 text-center text-gray-500">
                  <Package size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No strips in inventory. Receive batches first.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableStrips.slice(0, 5).map((strip) => (
                    <div key={strip.id} className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5 hover:bg-[#111827] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                          <Pill size={18} className="text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-[14px] font-bold text-white">{strip.batch?.medicineName || 'Unknown'}</h4>
                            <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                              strip.tabletsRemaining < strip.tabletsTotal * 0.3 ? 'text-red-400' : 'text-emerald-400'
                            }`}>
                              {strip.tabletsRemaining < strip.tabletsTotal * 0.3 ? 'LOW STOCK' : 'IN STOCK'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[12px] text-gray-400 mb-2">
                            Strip #{strip.stripNumber} • <span className="text-white font-semibold">{strip.tabletsRemaining}</span> / {strip.tabletsTotal} tablets
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                strip.tabletsRemaining < strip.tabletsTotal * 0.3 ? 'bg-red-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${(strip.tabletsRemaining / strip.tabletsTotal) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Recent Sales</h3>
              </div>

              {sales.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <p className="text-sm">No sales recorded yet.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-1 relative overflow-y-auto max-h-[360px] pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e293b transparent' }}>
                    <div className="absolute left-[7px] top-3 bottom-3 w-px bg-white/5" />
                    {visibleSales.map((sale, i) => (
                      <div key={sale.id} className="flex gap-4 py-3 relative group hover:bg-white/[0.02] rounded-lg px-1 transition-colors">
                        <div className="w-[15px] h-[15px] rounded-full bg-emerald-500 flex-shrink-0 mt-0.5 relative z-10 ring-4 ring-[#0a0f0a]" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-0.5">
                            <span className="text-[11px] text-gray-500 font-mono">{new Date(sale.createdAt).toLocaleTimeString()}</span>
                            <span className="text-[10px] text-gray-600">— SALE</span>
                          </div>
                          <p className="text-[13px] font-bold text-white truncate">
                            {sale.tabletsSold} tablets sold
                          </p>
                          <p className="text-[11px] text-gray-500 truncate font-mono">
                            {sale.txHash ? `${sale.txHash.slice(0, 16)}...` : 'Pending'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {!showAll && sales.length > 5 && (
                    <button onClick={() => setShowAll(true)}
                      className="w-full flex items-center justify-center gap-2 mt-3 py-2.5 bg-white/[0.03] border border-white/5 rounded-xl text-[12px] text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors">
                      <ChevronDown size={14} /> Show {sales.length - 5} more
                    </button>
                  )}
                  {showAll && (
                    <button onClick={() => setShowAll(false)}
                      className="w-full flex items-center justify-center gap-2 mt-3 py-2.5 bg-white/[0.03] border border-white/5 rounded-xl text-[12px] text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors">
                      Show less
                    </button>
                  )}
                </>
              )}

              <Link to="/pharmacy/verification"
                className="w-full flex items-center justify-center gap-2 mt-3 py-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-[13px] text-cyan-400 font-semibold hover:bg-cyan-500/20 transition-colors">
                <ExternalLink size={14} /> Verify Medicine
              </Link>
            </div>
          </div>
        </>
      )}

      <Link to="/pharmacy/sell" className="fixed bottom-8 right-8 w-14 h-14 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 transition-colors z-50">
        <Plus size={24} />
      </Link>
    </DashboardLayout>
  );
}
