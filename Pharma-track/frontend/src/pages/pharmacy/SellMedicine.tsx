import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ShoppingCart, Loader2, CheckCircle2, Download, QrCode } from 'lucide-react';
import { saleApi, stripApi, type StripWithBatch, type SaleTokenResponse } from '../../lib/api';
import toast from 'react-hot-toast';

export default function SellMedicine() {
  const [searchParams] = useSearchParams();
  const preselectedStripId = searchParams.get('stripId') || '';

  const [strips, setStrips] = useState<StripWithBatch[]>([]);
  const [selectedStripId, setSelectedStripId] = useState(preselectedStripId);
  const [tabletsSold, setTabletsSold] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStrips, setLoadingStrips] = useState(true);
  const [result, setResult] = useState<SaleTokenResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await stripApi.getInventory();
        setStrips(data.filter(s => !s.isSold && s.tabletsRemaining > 0));
      } catch (err) {
        toast.error('Failed to load strips');
      } finally {
        setLoadingStrips(false);
      }
    };
    load();
  }, []);

  const selectedStrip = strips.find(s => s.id === selectedStripId);

  const handleSell = async () => {
    if (!selectedStripId) { toast.error('Select a strip'); return; }
    if (tabletsSold < 1) { toast.error('Enter tablets count'); return; }
    if (selectedStrip && tabletsSold > selectedStrip.tabletsRemaining) {
      toast.error(`Max ${selectedStrip.tabletsRemaining} tablets available`);
      return;
    }

    setIsLoading(true);
    try {
      const data = await saleApi.generateToken(selectedStripId, tabletsSold);
      setResult(data);
      toast.success('Sale token generated!');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (result) {
    return (
      <DashboardLayout role="pharmacy">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <CheckCircle2 size={28} className="text-emerald-400" /> Sale Complete!
          </h1>
          <p className="text-sm text-gray-500 mt-1">QR code generated for patient verification.</p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-8 text-center mb-6">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-4">PATIENT VERIFICATION QR</p>
            {result.qrDataUrl ? (
              <img src={result.qrDataUrl} alt="Sale QR Code" className="w-64 h-64 mx-auto rounded-xl border border-white/10 mb-4" />
            ) : result.qrImageUrl ? (
              <img src={result.qrImageUrl} alt="Sale QR Code" className="w-64 h-64 mx-auto rounded-xl border border-white/10 mb-4" />
            ) : (
              <div className="w-64 h-64 mx-auto bg-white/5 rounded-xl flex items-center justify-center mb-4">
                <QrCode size={60} className="text-gray-600" />
              </div>
            )}
            <p className="text-sm text-gray-400 mb-1">Token: <span className="text-cyan-400 font-mono">{result.tokenOnChainId}</span></p>
            <p className="text-sm text-gray-400">Tablets Remaining: <span className="text-white font-bold">{result.tabletsRemaining}</span></p>
          </div>

          <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5 mb-6">
            <div className="space-y-2">
              {[
                ['Tablets Sold', tabletsSold],
                ['Transaction Hash', result.txHash || 'Pending'],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between">
                  <span className="text-[12px] text-gray-500">{label}</span>
                  <span className="text-[12px] text-white font-mono">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            {(result.qrDataUrl || result.qrImageUrl) && (
              <a
                href={result.qrDataUrl || result.qrImageUrl}
                download="sale-qr.png"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-xl text-sm hover:bg-white/10"
              >
                <Download size={14} /> Download QR
              </a>
            )}
            <button
              onClick={() => { setResult(null); setSelectedStripId(''); setTabletsSold(1); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl text-sm font-semibold hover:bg-cyan-500/20"
            >
              <ShoppingCart size={14} /> Sell Another
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="pharmacy">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Sell Medicine</h1>
        <p className="text-sm text-gray-500 mt-1">Generate a verifiable sale token for a patient.</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-[12px] text-gray-400 uppercase tracking-wider mb-2">Select Strip</label>
            {loadingStrips ? (
              <div className="flex items-center gap-2 text-gray-500 text-sm"><Loader2 size={14} className="animate-spin" /> Loading strips...</div>
            ) : strips.length === 0 ? (
              <p className="text-sm text-gray-500">No strips available. Receive inventory first.</p>
            ) : (
              <select
                value={selectedStripId}
                onChange={(e) => setSelectedStripId(e.target.value)}
                className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/40 [color-scheme:dark]"
              >
                <option value="">Choose a strip...</option>
                {strips.map(strip => (
                  <option key={strip.id} value={strip.id}>
                    Strip #{strip.stripNumber} — {strip.batch?.medicineName || 'Unknown'} — {strip.tabletsRemaining}/{strip.tabletsTotal} tablets
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedStrip && (
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Medicine</p>
                  <p className="text-sm text-white font-medium">{selectedStrip.batch?.medicineName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Tablets Left</p>
                  <p className="text-sm text-emerald-400 font-bold">{selectedStrip.tabletsRemaining}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Batch</p>
                  <p className="text-sm text-gray-300">{selectedStrip.batch?.batchNumber || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[12px] text-gray-400 uppercase tracking-wider mb-2">Tablets to Sell</label>
            <input
              type="number"
              min={1}
              max={selectedStrip?.tabletsRemaining || 10}
              value={tabletsSold}
              onChange={(e) => setTabletsSold(parseInt(e.target.value) || 1)}
              className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/40"
            />
          </div>

          <button
            onClick={handleSell}
            disabled={isLoading || !selectedStripId}
            className="w-full flex items-center justify-center gap-2 h-12 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <><Loader2 size={16} className="animate-spin" /> Generating Token...</>
            ) : (
              <><ShoppingCart size={16} /> Generate Sale Token</>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
