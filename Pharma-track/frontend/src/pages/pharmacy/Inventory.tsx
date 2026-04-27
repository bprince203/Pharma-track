import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Package, Pill, ShoppingCart, Loader2, QrCode } from 'lucide-react';
import { stripApi, type StripWithBatch } from '../../lib/api';
import toast from 'react-hot-toast';

export default function PharmacyInventory() {
  const [strips, setStrips] = useState<StripWithBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await stripApi.getInventory();
        setStrips(data);
      } catch (err) {
        toast.error((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <DashboardLayout role="pharmacy">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">Strip-level inventory with tablet counts.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Total Strips</p>
          <p className="text-2xl font-bold text-white">{strips.length}</p>
        </div>
        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Available for Sale</p>
          <p className="text-2xl font-bold text-emerald-400">{strips.filter(s => !s.isSold && s.tabletsRemaining > 0).length}</p>
        </div>
        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Fully Sold</p>
          <p className="text-2xl font-bold text-gray-400">{strips.filter(s => s.isSold).length}</p>
        </div>
      </div>

      <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-gray-500">
            <Loader2 size={24} className="animate-spin mr-3" /> Loading inventory...
          </div>
        ) : strips.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p>No strips in inventory. Receive batches first.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider font-medium pb-3">Strip #</th>
                <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider font-medium pb-3">Medicine</th>
                <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider font-medium pb-3">Tablets</th>
                <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider font-medium pb-3">Status</th>
                <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider font-medium pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {strips.map(strip => (
                <tr key={strip.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="py-4 text-[13px] text-white font-medium">Strip #{strip.stripNumber}</td>
                  <td className="py-4 text-[13px] text-gray-300">{strip.batch?.medicineName || 'N/A'}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-white font-medium">{strip.tabletsRemaining}</span>
                      <span className="text-[11px] text-gray-600">/ {strip.tabletsTotal}</span>
                      <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${strip.tabletsRemaining === 0 ? 'bg-gray-500' : strip.tabletsRemaining < strip.tabletsTotal * 0.3 ? 'bg-red-500' : 'bg-emerald-500'}`}
                          style={{ width: `${(strip.tabletsRemaining / strip.tabletsTotal) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase ${
                      strip.isSold ? 'bg-gray-500/20 text-gray-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {strip.isSold ? 'SOLD OUT' : 'AVAILABLE'}
                    </span>
                  </td>
                  <td className="py-4">
                    {!strip.isSold && strip.tabletsRemaining > 0 && (
                      <Link
                        to={`/pharmacy/sell?stripId=${strip.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg text-[11px] font-medium hover:bg-cyan-500/20"
                      >
                        <ShoppingCart size={12} /> Sell
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}
