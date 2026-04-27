import { useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Truck, Package, ArrowRight, MapPin, Clock, Loader2 } from 'lucide-react';
import { useBatch } from '../../hooks/useBatch';

const STATUS_COLORS: Record<string, string> = {
  MANUFACTURED:     'bg-emerald-500/20 text-emerald-400',
  WITH_DISTRIBUTOR: 'bg-yellow-500/20 text-yellow-400',
  WITH_PHARMACY:    'bg-purple-500/20 text-purple-400',
  PARTIALLY_SOLD:   'bg-cyan-500/20 text-cyan-400',
  FULLY_SOLD:       'bg-gray-500/20 text-gray-400',
};

export default function ManufacturerLogistics() {
  const { batches, isLoading, fetchBatches } = useBatch();

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  const inTransit = batches.filter(b => b.status === 'WITH_DISTRIBUTOR' || b.status === 'WITH_PHARMACY');

  return (
    <DashboardLayout role="manufacturer">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Logistics</h1>
        <p className="text-sm text-gray-500 mt-1">Track batches in the supply chain.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Total Batches</p>
          <p className="text-2xl font-bold text-white">{batches.length}</p>
        </div>
        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">In Transit</p>
          <p className="text-2xl font-bold text-yellow-400">{inTransit.length}</p>
        </div>
        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">At Warehouse</p>
          <p className="text-2xl font-bold text-emerald-400">{batches.filter(b => b.status === 'MANUFACTURED').length}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <Loader2 size={24} className="animate-spin mr-3" /> Loading logistics data...
        </div>
      ) : inTransit.length === 0 ? (
        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-10 text-center text-gray-500">
          <Truck size={40} className="mx-auto mb-3 opacity-30" />
          <p>No batches currently in transit.</p>
          <p className="text-[12px] mt-1">Transfer batches from Inventory to see logistics tracking.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inTransit.map(batch => (
            <div key={batch.id} className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Package size={18} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-white">{batch.batchNumber}</p>
                    <p className="text-[11px] text-gray-500">{batch.medicineName}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider ${STATUS_COLORS[batch.status]}`}>
                  {batch.status.replace(/_/g, ' ')}
                </span>
              </div>

              {batch.events && batch.events.length > 0 && (
                <div className="relative pl-4">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10" />
                  <div className="space-y-3">
                    {batch.events.map((event, i) => (
                      <div key={i} className="flex gap-4 relative">
                        <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 mt-0.5 z-10 ring-4 ring-[#111827] ${
                          i === batch.events!.length - 1 ? 'bg-cyan-400' : 'bg-white/20'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-[12px] font-bold text-white">{event.eventType.replace(/_/g, ' ')}</p>
                            <span className="text-[10px] text-gray-600">•</span>
                            <p className="text-[10px] text-gray-500">{event.actorName}</p>
                          </div>
                          <p className="text-[10px] text-gray-600 font-mono">{new Date(event.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
