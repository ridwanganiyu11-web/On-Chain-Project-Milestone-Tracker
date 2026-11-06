import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  PlusCircle,
  FolderKanban,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Search,
  RefreshCw,
  ArrowRight,
  Layers,
  QrCode,
  Wallet,
  Lock,
  Info,
} from 'lucide-react';
import { useMilestoneChain } from '../context/MilestoneChainContext';
import { ProjectCard } from '../components/ProjectCard';
import {
  BOTCHAIN_NETWORK_METADATA,
} from '../config/web3';
import {
  ILLUSTRATIVE_PREVIEW_PROJECT,
  getExplorerAddressUrl,
  shortenAddress,
} from '../utils/format';

export const HomePage: React.FC = () => {
  const {
    contractAddress,
    isContractVerifiedOnChain,
    projectCount,
    totalMilestonesCreated,
    totalMilestonesCompleted,
    projects,
    isLoadingProjects,
    refreshProjects,
    setIsConfigModalOpen,
  } = useMilestoneChain();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.owner.toLowerCase().includes(q) ||
      String(p.id) === q
    );
  });

  const blockchainActions = [
    { action: 'Browse public projects', wallet: 'No', gas: 'No', highlight: false },
    { action: 'View project milestones', wallet: 'No', gas: 'No', highlight: false },
    { action: 'Create a project', wallet: 'Yes (MetaMask)', gas: 'Yes (BOT)', highlight: true },
    { action: 'Add a milestone', wallet: 'Yes (Owner only)', gas: 'Yes (BOT)', highlight: true },
    {
      action: 'Complete a milestone',
      wallet: 'Yes (Owner only)',
      gas: 'Yes (BOT)',
      highlight: true,
    },
  ];

  const contractFunctions = [
    { fn: 'createProject()', desc: 'Create a project and assign caller wallet as project owner' },
    { fn: 'addMilestone()', desc: 'Add a milestone to an existing project (owner-only)' },
    {
      fn: 'completeMilestone()',
      desc: 'Mark a milestone completed & record block.timestamp (owner-only)',
    },
    { fn: 'getProject()', desc: 'Read project metadata, owner wallet, and progress counts' },
    { fn: 'getMilestone()', desc: 'Read milestone name, completion status, and timestamp' },
    { fn: 'getProjectCount()', desc: 'Count total registered projects on Botchain' },
  ];

  return (
    <div className="space-y-14 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800/90 bg-gradient-to-br from-slate-900 via-slate-900/95 to-emerald-950/30 p-6 sm:p-10 lg:p-12 shadow-2xl">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          {/* Left Hero Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Botchain Testnet (Chain ID {BOTCHAIN_NETWORK_METADATA.chainId}) · Native Token: BOT</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:leading-[1.12]">
                Track Progress.{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Prove Completion.
                </span>{' '}
                Build Trust.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                <strong>MilestoneChain</strong> is an on-chain project milestone tracker for
                freelancers, developers, and teams. Create project roadmaps, record milestone
                completions permanently on the Botchain blockchain via MetaMask, and share a
                wallet-free verification link or QR code with clients.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                to="/create"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-110"
              >
                <PlusCircle className="h-4 w-4 stroke-[2.5]" />
                <span>Create Project On-Chain</span>
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 px-5 py-3 text-sm font-semibold text-white transition hover:border-slate-600 hover:bg-slate-800"
              >
                <FolderKanban className="h-4 w-4 text-emerald-400" />
                <span>My Dashboard</span>
              </Link>
              <a
                href="#public-projects"
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:text-white"
              >
                <span>Browse Public Projects</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* Live Network & Contract Telemetry Strip */}
            <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  On-Chain Projects
                </div>
                <div className="mt-1 text-xl font-extrabold text-white">{projectCount}</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Milestones Logged
                </div>
                <div className="mt-1 text-xl font-extrabold text-cyan-400">
                  {totalMilestonesCreated}
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Proven Complete
                </div>
                <div className="mt-1 text-xl font-extrabold text-emerald-400">
                  {totalMilestonesCompleted}
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Smart Contract
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  {isContractVerifiedOnChain && contractAddress ? (
                    <a
                      href={getExplorerAddressUrl(contractAddress)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs font-bold text-emerald-400 hover:underline"
                    >
                      <span>{shortenAddress(contractAddress, 4)}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsConfigModalOpen(true)}
                      className="text-xs font-semibold text-amber-400 underline"
                    >
                      Configure / Deploy
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Illustrative Project Preview (Section 3 of Spec) */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-emerald-500/30 bg-slate-950/90 p-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Example Interface Preview
                  </span>
                  <h3 className="text-lg font-extrabold text-white">
                    {ILLUSTRATIVE_PREVIEW_PROJECT.name}
                  </h3>
                  <p className="font-mono text-xs text-slate-400">
                    Project owner: <span className="text-slate-200">{ILLUSTRATIVE_PREVIEW_PROJECT.ownerDisplay}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Project progress</span>
                  <div className="text-2xl font-black text-emerald-400">
                    {ILLUSTRATIVE_PREVIEW_PROJECT.progress}%
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-900 p-0.5 border border-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                    style={{ width: `${ILLUSTRATIVE_PREVIEW_PROJECT.progress}%` }}
                  />
                </div>
              </div>

              {/* 4 Milestones from Spec */}
              <div className="mt-4 space-y-2.5">
                {ILLUSTRATIVE_PREVIEW_PROJECT.milestones.map((m) => (
                  <div
                    key={m.index}
                    className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm ${
                      m.completed
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {m.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-400" />
                      )}
                      <span className="font-medium">{m.name}</span>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        m.completed
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {m.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-[11px] text-slate-400">
                <span>Illustrative project preview — not a live blockchain record.</span>
                <Link
                  to="/create?template=0"
                  className="font-semibold text-emerald-400 hover:underline"
                >
                  Use Template →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Created Public Projects (Live On-Chain) */}
      <section id="public-projects" className="space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-white">Recently Created Public Projects</h2>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                Live on Chain 968
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Browse live projects recorded on <code className="text-slate-300">ProjectMilestoneTracker.sol</code>. No wallet connection required to inspect progress.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search project, owner, or #ID..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => refreshProjects()}
              disabled={isLoadingProjects}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingProjects ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {isLoadingProjects ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-72 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
              />
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center">
            <Layers className="mx-auto h-10 w-10 text-emerald-400/80" />
            <h3 className="mt-3 text-base font-bold text-white">
              {searchQuery
                ? 'No matching public projects found'
                : 'No public projects recorded on this contract yet'}
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-slate-400">
              {searchQuery
                ? 'Try clearing your search filter or searching by project ID.'
                : 'Be the first to create an on-chain project with verifiable milestones on Botchain Testnet (Chain ID 968).'}
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link
                to="/create"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Create First Project</span>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* How It Works (4-Step Visual Workflow) */}
      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-white">How MilestoneChain Works</h2>
          <p className="mt-1 text-sm text-slate-400">
            Simple project progress tracking where key achievements are permanently timestamped on Botchain.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div className="mt-3 text-xs font-bold uppercase tracking-wider text-emerald-400">
              Step 1 · Create Project
            </div>
            <h3 className="mt-1 text-base font-bold text-white">Define Your Project</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              Give your project a name and short description. Your connected MetaMask wallet
              automatically becomes the verified on-chain project owner.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
              <Layers className="h-5 w-5" />
            </div>
            <div className="mt-3 text-xs font-bold uppercase tracking-wider text-cyan-400">
              Step 2 · Add Milestones
            </div>
            <h3 className="mt-1 text-base font-bold text-white">Structure Deliverables</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              Add concise milestones such as <em>Design the website</em>, <em>Build the frontend</em>,{' '}
              <em>Connect the backend</em>, and <em>Launch the website</em>.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
              <Wallet className="h-5 w-5" />
            </div>
            <div className="mt-3 text-xs font-bold uppercase tracking-wider text-indigo-400">
              Step 3 · Update Progress
            </div>
            <h3 className="mt-1 text-base font-bold text-white">Prove Completion On-Chain</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              As you complete each milestone, submit a real MetaMask transaction. Botchain records
              the milestone status, owner wallet, and exact block timestamp.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
              <QrCode className="h-5 w-5" />
            </div>
            <div className="mt-3 text-xs font-bold uppercase tracking-wider text-amber-400">
              Step 4 · Share Progress
            </div>
            <h3 className="mt-1 text-base font-bold text-white">Share Public Link & QR</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              Generate a public link and downloadable QR code so clients, teammates, or grant
              reviewers can verify progress without connecting a wallet.
            </p>
          </div>
        </div>
      </section>

      {/* Where the Blockchain Comes In + Smart Contract Architecture */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Table 1: Where the Blockchain Comes In */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Where the Blockchain Comes In</h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Public verification is completely free and wallet-less; mutations require the project
            owner&apos;s cryptographic signature on Botchain Testnet (Chain ID 968).
          </p>

          <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold">Action</th>
                  <th className="px-4 py-3 font-semibold">Wallet Required?</th>
                  <th className="px-4 py-3 font-semibold">Gas?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
                {blockchainActions.map((row) => (
                  <tr key={row.action}>
                    <td className="px-4 py-3 font-medium text-white">{row.action}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          row.highlight
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {row.wallet}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{row.gas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Smart Contract Specification */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <Lock className="h-5 w-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">
                Smart Contract: <code className="text-cyan-300">ProjectMilestoneTracker.sol</code>
              </h3>
            </div>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Lightweight Solidity contract enforcing owner-only milestone additions and completions
            with concise strings to keep Botchain gas costs low.
          </p>

          <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold">Function</th>
                  <th className="px-4 py-3 font-semibold">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
                {contractFunctions.map((item) => (
                  <tr key={item.fn}>
                    <td className="px-4 py-2.5 font-mono font-semibold text-emerald-300">
                      {item.fn}
                    </td>
                    <td className="px-4 py-2.5 text-slate-300">{item.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Transparency & Design Note */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
          <div className="text-xs leading-relaxed text-slate-300">
            <span className="font-bold text-white">On-Chain Verification Note: </span>
            MilestoneChain records prove cryptographically that the project owner&apos;s wallet
            marked a milestone complete at a specific Botchain block timestamp. To keep on-chain
            storage costs minimal, milestone descriptions are kept concise and large documents are
            not stored directly in the smart contract.
          </div>
        </div>
      </section>
    </div>
  );
};

