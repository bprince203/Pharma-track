import { useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ShieldCheck, Search, CheckCircle2, XCircle, AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import { verifyApi, type VerifyResult } from '../../lib/api';
import toast from 'react-hot-toast';

interface VerificationProps {
  role: 'manufacturer' | 'distributor' | 'pharmacy';
}

const VERDICT_CONFIG = {
  AUTHENTIC:    { icon: CheckCircle2,  color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Authentic' },
  EXPIRED:      { icon: Clock,         color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  label: 'Expired' },
  COUNTERFEIT:  { icon: XCircle,       color: 'text-red-400',     bg: 'bg-red-500/10',     label: 'Counterfeit' },
  UNREGISTERED: { icon: AlertTriangle, color: 'text-gray-400',    bg: 'bg-gray-500/10',    label: 'Unregistered' },
};

export default function Verification({ role }: VerificationProps) {
  const [tokenId, setTokenId] = useState('');
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (!tokenId.trim()) { toast.error('Enter a token ID'); return; }
    setIsLoading(true);
    try {
      const data = await verifyApi.verifyToken(tokenId.trim());
      setResult(data);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const verdictCfg = result ? VERDICT_CONFIG[result.verdict] : null;

  return (
    <DashboardLayout role={role}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Verification</h1>
        <p className="text-sm text-gray-500 mt-1">Verify medicine authenticity using sale token ID.</p>
      </div>

      <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-6 mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              placeholder="Enter sale token ID or on-chain ID..."
              className="w-full h-12 pl-11 pr-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/40"
            />
          </div>
          <button
            onClick={handleVerify}
            disabled={isLoading}
            className="px-6 h-12 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl text-sm font-semibold hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </div>

      {result && verdictCfg && (
        <>
          <div className={`${verdictCfg.bg} border border-white/5 rounded-2xl p-6 mb-6 flex items-center gap-4`}>
            <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center">
              <verdictCfg.icon size={28} className={verdictCfg.color} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">VERDICT</p>
              <p className={`text-2xl font-bold ${verdictCfg.color}`}>{verdictCfg.label}</p>
            </div>
            {result.cached && (
              <span className="ml-auto px-2.5 py-1 bg-white/5 text-[10px] text-gray-400 rounded-md">CACHED</span>
            )}
          </div>

          {result.batch && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-4">Batch Details</h3>
                <div className="space-y-3">
                  {[
                    ['Medicine', result.batch.medicineName],
                    ['Batch #', result.batch.batchNumber],
                    ['Manufacturer', result.batch.manufacturer],
                    ['Manufacture Date', new Date(result.batch.manufactureDate).toLocaleDateString()],
                    ['Expiry Date', new Date(result.batch.expiryDate).toLocaleDateString()],
                    ['Total Strips', result.batch.totalStrips],
                    ['Status', result.batch.status],
                  ].map(([label, value]) => (
                    <div key={label as string} className="flex justify-between">
                      <span className="text-[12px] text-gray-500">{label}</span>
                      <span className="text-[12px] text-white font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {result.strip && (
                <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-4">Strip & Sale Info</h3>
                  <div className="space-y-3">
                    {[
                      ['Strip #', result.strip.stripNumber],
                      ['Tablets Sold', result.strip.tabletsSold],
                      ['Tablets Total', result.strip.tabletsTotal],
                    ].map(([label, value]) => (
                      <div key={label as string} className="flex justify-between">
                        <span className="text-[12px] text-gray-500">{label}</span>
                        <span className="text-[12px] text-white font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                  {result.txHash && (
                    <a
                      href={`https://amoy.polygonscan.com/tx/${result.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 mt-4 text-[12px] text-cyan-400 hover:underline"
                    >
                      <ExternalLink size={12} /> View on Polygonscan
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {result.events && result.events.length > 0 && (
            <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Supply Chain Timeline</h3>
              <div className="relative">
                <div className="absolute left-[7px] top-3 bottom-3 w-px bg-white/10" />
                <div className="space-y-4">
                  {result.events.map((event, i) => (
                    <div key={i} className="flex gap-4 relative">
                      <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 z-10 ring-4 ring-[#111827] ${
                        event.eventType === 'MANUFACTURED' ? 'bg-cyan-500' :
                        event.eventType === 'SOLD' ? 'bg-emerald-500' : 'bg-purple-500'
                      }`} />
                      <div>
                        <p className="text-[12px] font-bold text-white">{event.eventType.replace(/_/g, ' ')}</p>
                        <p className="text-[11px] text-gray-400">
                          {event.actorName} {event.actorCity ? `· ${event.actorCity}` : ''}
                        </p>
                        <p className="text-[10px] text-gray-600 font-mono">{new Date(event.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
