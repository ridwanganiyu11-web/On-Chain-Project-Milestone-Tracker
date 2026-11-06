import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { wagmiConfig, BOTCHAIN_NETWORK_METADATA } from './config/web3';
import { MilestoneChainProvider, useMilestoneChain } from './context/MilestoneChainContext';
import { Navbar } from './components/Navbar';
import { ContractConfigModal } from './components/ContractConfigModal';
import { ShareModal } from './components/ShareModal';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { PublicProjectPage } from './pages/PublicProjectPage';
import { MyActivityPage } from './pages/MyActivityPage';
import { getExplorerAddressUrl, shortenAddress } from './utils/format';

const queryClient = new QueryClient();

const Footer: React.FC = () => {
  const { contractAddress } = useMilestoneChain();

  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/90 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-400 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-white">MilestoneChain</span> · Track Progress. Prove
            Completion. Build Trust.
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <span>
            Network:{' '}
            <strong className="text-slate-200">{BOTCHAIN_NETWORK_METADATA.name}</strong> (Chain ID{' '}
            {BOTCHAIN_NETWORK_METADATA.chainId})
          </span>
          <span>
            Token: <strong className="text-emerald-400">BOT</strong> (150M Supply)
          </span>
          {contractAddress && (
            <a
              href={getExplorerAddressUrl(contractAddress)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-emerald-400 hover:underline"
            >
              <span>Contract: {shortenAddress(contractAddress, 4)}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <a
            href={BOTCHAIN_NETWORK_METADATA.explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-slate-300 hover:text-white"
          >
            <span>scan.bohr.life</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export const App: React.FC = () => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <MilestoneChainProvider>
          <BrowserRouter>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-8 sm:px-6 lg:px-8">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/create" element={<CreateProjectPage />} />
                  <Route path="/project/:id" element={<ProjectDetailsPage />} />
                  <Route path="/public/:id" element={<PublicProjectPage />} />
                  <Route path="/p/:id" element={<PublicProjectPage />} />
                  <Route path="/activity" element={<MyActivityPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
              <ContractConfigModal />
              <ShareModal />
            </div>
          </BrowserRouter>
        </MilestoneChainProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;

