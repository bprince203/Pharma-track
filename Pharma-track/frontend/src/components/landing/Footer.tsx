import { Network, Globe, Code2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#070b07] border-t border-white/5 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <p className="font-mono font-bold text-[#39ff8a] tracking-widest text-sm mb-4">
              PHARMA_LEDGER
            </p>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Securing the global medicine supply chain through advanced cryptography
              and decentralized consensus protocols.
            </p>
          </div>

          {/* Platform */}
          <div>
            <p className="text-sm font-semibold text-white mb-4">Platform</p>
            <ul className="space-y-3">
              {["Explorer", "Governance", "Security", "API Reference"].map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="text-sm font-semibold text-white mb-4">Resources</p>
            <ul className="space-y-3">
              {["Whitepaper", "Compliance Guide", "Case Studies", "Support Portal"].map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <p className="text-sm font-semibold text-white mb-4">Connect</p>
            <div className="flex items-center gap-3">
              {[
                { icon: Network, label: "Network" },
                { icon: Globe, label: "Website" },
                { icon: Code2, label: "GitHub" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-[#111611] border border-white/5 flex items-center justify-center text-slate-400 hover:text-[#39ff8a] hover:border-[#39ff8a]/30 transition-all"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/5 gap-4">
          <p className="text-xs font-mono text-slate-600 uppercase tracking-wider">
            © 2024 PHARMA_LEDGER FOUNDATION. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs font-mono text-slate-600 hover:text-slate-400 uppercase tracking-wider transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs font-mono text-slate-600 hover:text-slate-400 uppercase tracking-wider transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}