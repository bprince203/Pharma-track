import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Shield } from 'lucide-react';
import clsx from "clsx";

const NAV_LINKS = [
  { label: 'How It Works', href: '#roles' },
  { label: 'Network',      href: '#network' },
  { label: 'Verify',       href: '/verify' },
  { label: 'Docs',         href: '#' },
];

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={clsx(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/20'
        : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-label="PharmaLedger logo">
              <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18"
                stroke="#14b8a6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-bold text-white tracking-tight">
            Pharma<span className="text-teal-400">Ledger</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            link.href.startsWith('/') ? (
              <Link key={link.label} to={link.href}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                {link.label}
              </Link>
            ) : (
              <a key={link.label} href={link.href}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                {link.label}
              </a>
            )
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/verify"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-400 border border-teal-500/30 rounded-lg hover:bg-teal-500/10 transition-all duration-150">
            <Shield size={14} /> Verify Drug
          </Link>
          <Link to="/manufacturer"
            className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors shadow-sm shadow-teal-900/40">
            Launch App
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Toggle menu">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-4 py-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-slate-800 mt-3 flex flex-col gap-2">
            <Link to="/verify" onClick={() => setMenuOpen(false)}
              className="block text-center px-4 py-2.5 text-sm font-medium text-teal-400 border border-teal-500/30 rounded-lg hover:bg-teal-500/10 transition-all">
              Verify Drug
            </Link>
            <Link to="/manufacturer" onClick={() => setMenuOpen(false)}
              className="block text-center px-4 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors">
              Launch App
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}