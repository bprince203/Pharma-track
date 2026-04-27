import { useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Truck, Package, Loader2, CheckCircle2, Clock } from 'lucide-react';
import { useBatch } from '../../hooks/useBatch';

export default function PharmacyLogistics() {
  const { batches, isLoading, fetchIncoming } = useBatch();

  useEffect(() => { fetchIncoming(); }, [fetchIncoming]);

  return (
    <DashboardLayout role="pharmacy">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Logistics</h1>
        <p className="text-sm text-gray-500 mt-1">Track incoming batches from distributors.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Incoming</p>
          <p className="text-2xl font-bold text-yellow-400">{batches.filter(b => b.status === 'WITH_PHARMACY').length}</p>
        </div>
        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Total Received</p>
          <p className="text-2xl font-bold text-emerald-400">{batches.length}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <Loader2 size={24} className="animate-spin mr-3" /> Loading...
        </div>
      ) : batches.length === 0 ? (
        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-10 text-center text-gray-500">
          <Truck size={40} className="mx-auto mb-3 opacity-30" />
          <p>No incoming batches.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {batches.map(batch => (
            <div key={batch.id} className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Package size={18} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-white">{batch.batchNumber}</p>
                    <p className="text-[11px] text-gray-500">{batch.medicineName} • {batch.totalStrips} strips</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-md text-[10px] font-semibold">
                  <CheckCircle2 size={10} /> RECEIVED
                </span>
              </div>

              {batch.events && batch.events.length > 0 && (
                <div className="relative pl-4 border-t border-white/5 pt-3">
                  <div className="absolute left-[7px] top-5 bottom-1 w-px bg-white/10" />
                  {batch.events.map((event, i) => (
                    <div key={i} className="flex gap-4 relative mb-2">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 z-10 ring-4 ring-[#111827] ${
                        i === batch.events!.length - 1 ? 'bg-cyan-400' : 'bg-white/20'
                      }`} />
                      <div>
                        <p className="text-[12px] font-bold text-white">{event.eventType.replace(/_/g, ' ')}</p>
                        <p className="text-[10px] text-gray-500">{event.actorName} • {new Date(event.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
