import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { PlusCircle, Loader2, CheckCircle2, Download } from 'lucide-react';
import { useBatch } from '../../hooks/useBatch';
import type { CreateBatchInput } from '../../lib/api';
import toast from 'react-hot-toast';

export default function RegisterBatch() {
  const { createBatch, isLoading } = useBatch();
  const [result, setResult] = useState<{ batchQrUrl: string; stripQrUrls: string[]; txHash?: string } | null>(null);

  const [form, setForm] = useState<CreateBatchInput>({
    medicineName: '',
    batchNumber: '',
    expiryDate: '',
    totalStrips: 10,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.medicineName || !form.batchNumber || !form.expiryDate) {
      toast.error('All fields are required');
      return;
    }
    const data = await createBatch({
      ...form,
      expiryDate: new Date(form.expiryDate).toISOString(),
    });
    if (data) {
      setResult({
        batchQrUrl: data.batchQrUrl,
        stripQrUrls: data.stripQrUrls,
        txHash: data.batch.txHash || undefined,
      });
    }
  };

  const updateField = (field: keyof CreateBatchInput, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (result) {
    return (
      <DashboardLayout role="manufacturer">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <CheckCircle2 size={28} className="text-emerald-400" /> Batch Registered!
          </h1>
          <p className="text-sm text-gray-500 mt-1">Your batch has been registered on the blockchain.</p>
        </div>

        {result.txHash && (
          <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5 mb-6">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Transaction Hash</p>
            <a
              href={`https://amoy.polygonscan.com/tx/${result.txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-cyan-400 font-mono hover:underline break-all"
            >{result.txHash}</a>
          </div>
        )}

        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-bold text-white mb-4">Batch QR Code</h3>
          {result.batchQrUrl && (
            <div className="flex items-center gap-4">
              <img src={result.batchQrUrl} alt="Batch QR" className="w-40 h-40 rounded-xl border border-white/10" />
              <a href={result.batchQrUrl} download={`batch-${form.batchNumber}.png`}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10">
                <Download size={14} /> Download
              </a>
            </div>
          )}
        </div>

        {result.stripQrUrls.length > 0 && (
          <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5 mb-6">
            <h3 className="text-sm font-bold text-white mb-4">Strip QR Codes ({result.stripQrUrls.length})</h3>
            <div className="grid grid-cols-5 gap-3">
              {result.stripQrUrls.map((url, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-2 text-center">
                  <img src={url} alt={`Strip ${i+1}`} className="w-full rounded-lg" />
                  <p className="text-[10px] text-gray-500 mt-1">Strip {i+1}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => { setResult(null); setForm({ medicineName: '', batchNumber: '', expiryDate: '', totalStrips: 10 }); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl text-sm font-semibold hover:bg-cyan-500/20"
        >
          <PlusCircle size={16} /> Register Another Batch
        </button>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="manufacturer">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Register New Batch</h1>
        <p className="text-sm text-gray-500 mt-1">Deploy a new medicine batch to the blockchain.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-[12px] text-gray-400 uppercase tracking-wider mb-2">Medicine Name</label>
            <input
              value={form.medicineName}
              onChange={(e) => updateField('medicineName', e.target.value)}
              placeholder="e.g. Amoxicillin 500mg"
              className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/40"
            />
          </div>

          <div>
            <label className="block text-[12px] text-gray-400 uppercase tracking-wider mb-2">Batch Number</label>
            <input
              value={form.batchNumber}
              onChange={(e) => updateField('batchNumber', e.target.value)}
              placeholder="e.g. MFG-88291-LX"
              className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] text-gray-400 uppercase tracking-wider mb-2">Expiry Date</label>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => updateField('expiryDate', e.target.value)}
                className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/40 [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-[12px] text-gray-400 uppercase tracking-wider mb-2">Total Strips</label>
              <input
                type="number"
                min={1}
                max={100}
                value={form.totalStrips}
                onChange={(e) => updateField('totalStrips', parseInt(e.target.value) || 1)}
                className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/40"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 h-12 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <><Loader2 size={16} className="animate-spin" /> Deploying to Blockchain...</>
            ) : (
              <><PlusCircle size={16} /> Register Batch</>
            )}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}
