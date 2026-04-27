import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Package, CheckCircle, Send, Loader2, ExternalLink } from 'lucide-react';
import { useBatch } from '../../hooks/useBatch';
import type { BatchWithDetails } from '../../lib/api';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  MANUFACTURED:     'bg-emerald-500/20 text-emerald-400',
  WITH_DISTRIBUTOR: 'bg-yellow-500/20 text-yellow-400',
  WITH_PHARMACY:    'bg-purple-500/20 text-purple-400',
  PARTIALLY_SOLD:   'bg-cyan-500/20 text-cyan-400',
  FULLY_SOLD:       'bg-gray-500/20 text-gray-400',
};

export default function DistributorInventory() {
  const { batches, isLoading, fetchIncoming, confirmReceipt, transferToPharmacy } = useBatch();
  const [transferModal, setTransferModal] = useState<BatchWithDetails | null>(null);
  const [pharmWallet, setPharmWallet] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { fetchIncoming(); }, [fetchIncoming]);

  const handleConfirm = async (batch: BatchWithDetails) => {
    setActionLoading(batch.id);
    await confirmReceipt(batch.id);
    setActionLoading(null);
    fetchIncoming();
  };

  const handleTransfer = async () => {
    if (!transferModal || !pharmWallet.trim()) { toast.error('Enter pharmacy wallet'); return; }
    setActionLoading('transfer');
    const result = await transferToPharmacy(transferModal.id, pharmWallet.trim());
    setActionLoading(null);
    if (result) {
      setTransferModal(null);
      setPharmWallet('');
      fetchIncoming();
    }
  };

  return (
    <DashboardLayout role="distributor">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Inventory</h1>
        <p className="text-sm text-gray-500 mt-1">Manage received and incoming batches.</p>
      </div>

      <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-gray-500">
            <Loader2 size={24} className="animate-spin mr-3" /> Loading batches...
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p>No batches in your inventory.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider font-medium pb-3">Batch #</th>
                <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider font-medium pb-3">Medicine</th>
                <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider font-medium pb-3">Strips</th>
                <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider font-medium pb-3">Status</th>
                <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider font-medium pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map(batch => (
                <tr key={batch.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="py-4 text-[13px] text-white font-medium">{batch.batchNumber}</td>
                  <td className="py-4 text-[13px] text-gray-300">{batch.medicineName}</td>
                  <td className="py-4 text-[13px] text-gray-400">{batch.totalStrips}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider ${STATUS_COLORS[batch.status] || 'bg-gray-500/20 text-gray-400'}`}>
                      {batch.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-4 flex gap-2">
                    {batch.status === 'WITH_DISTRIBUTOR' && (
                      <>
                        <button onClick={() => handleConfirm(batch)} disabled={actionLoading === batch.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-[11px] font-medium hover:bg-emerald-500/20 disabled:opacity-50">
                          {actionLoading === batch.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />} Confirm
                        </button>
                        <button onClick={() => setTransferModal(batch)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg text-[11px] font-medium hover:bg-cyan-500/20">
                          <Send size={12} /> To Pharmacy
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {transferModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-1">Transfer to Pharmacy</h3>
            <p className="text-[12px] text-gray-500 mb-4">Transfer <span className="text-cyan-400">{transferModal.batchNumber}</span></p>
            <label className="block text-[12px] text-gray-400 uppercase tracking-wider mb-2">Pharmacy Wallet</label>
            <input value={pharmWallet} onChange={(e) => setPharmWallet(e.target.value)} placeholder="0x..."
              className="w-full h-12 px-4 mb-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/40" />
            <div className="flex gap-3">
              <button onClick={() => { setTransferModal(null); setPharmWallet(''); }}
                className="flex-1 py-2.5 bg-white/5 border border-white/10 text-gray-400 rounded-xl text-sm hover:bg-white/10">Cancel</button>
              <button onClick={handleTransfer} disabled={actionLoading === 'transfer'}
                className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                {actionLoading === 'transfer' ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
