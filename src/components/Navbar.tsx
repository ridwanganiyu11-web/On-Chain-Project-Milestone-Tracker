import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import {
  CheckCircle2,
  Compass,
  FolderKanban,
  PlusCircle,
  Activity,
  Cpu,
  Wallet,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import {
  BOTCHAIN_CHAIN_ID,
  BOTCHAIN_EXPLORER_URL,
  switchOrAddBotchainNetwork,
} from '../config/web3';
import { useMilestoneChain } from '../context/MilestoneChainContext';
import { shortenAddress } from '../utils/format';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { open } = useAppKit();
  const { address, isConnected, chainId } = useAccount();
  const {
    contractAddress,
    isContractVerifiedOnChain,
    setIsConfigModalOpen,
    projectCount,
  } = useMilestoneChain();

  const isWrongNetwork = isConnected && chainId !== BOTCHAIN_CHAIN_ID;

  const navItems = [
    { to: '/', label: 'Home', icon: Compass },
    { to: '/dashboard', label: 'Dashboard', icon: FolderKanban },
    { to: '/create', label: 'Create Project', icon: PlusCircle },
    { to: '/activity', label: 'My Activity', icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-slate-950 shadow-lg shadow-emerald-500/20 transition-transform group-hover:scale-105">
            <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-white">
                Milestone<span className="text-emerald-400">Chain</span>
              </span>
              <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 sm:inline-block">
                Botchain 968
              </span>
            </div>
            <p className="hidden text-xs text-slate-400 md:block">
              Track Progress. Prove Completion. Build Trust.
            </p>
          </div>
        </Link>

        {/* Main Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active =
              to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          {/* Contract Status Button */}
          <button
            type="button"
            onClick={() => setIsConfigModalOpen(true)}
            title="Configure or inspect ProjectMilestoneTracker contract"
            className={`hidden items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors sm:flex ${
              isContractVerifiedOnChain
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                : 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>
              {isContractVerifiedOnChain && contractAddress
                ? `Contract: ${shortenAddress(contractAddress, 3)} (${projectCount})`
                : 'Setup Contract'}
            </span>
          </button>

          {/* Network Warning or Pill */}
          {isWrongNetwork ? (
            <button
              type="button"
              onClick={() => switchOrAddBotchainNetwork()}
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/50 bg-amber-500/20 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/30"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              <span>Switch to Botchain (968)</span>
            </button>
          ) : (
            <a
              href={BOTCHAIN_EXPLORER_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-2 text-xs text-slate-300 hover:border-slate-700 hover:text-white lg:flex"
              title="Open Botchain Testnet Explorer (https://scan.bohr.life/)"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>BOT · 968</span>
              <ExternalLink className="h-3 w-3 text-slate-500" />
            </a>
          )}

          {/* Wallet Connect Button */}
          <button
            type="button"
            onClick={() => open()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/20 transition-all hover:brightness-110"
          >
            <Wallet className="h-4 w-4" />
            <span>
              {isConnected && address ? shortenAddress(address, 4) : 'Connect Wallet'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom / Sub Bar */}
      <div className="flex items-center justify-around border-t border-slate-800/70 bg-slate-950/95 px-2 py-2 md:hidden">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active =
            to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-[11px] font-medium ${
                active ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setIsConfigModalOpen(true)}
          className="flex flex-col items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-slate-200"
        >
          <Cpu className="h-4 w-4" />
          <span>Contract</span>
        </button>
      </div>
    </header>
  );
};

