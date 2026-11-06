import React from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import {
  FolderKanban,
  PlusCircle,
  Wallet,
  CheckCircle2,
  Clock,
  RefreshCw,
  ExternalLink,
  Share2,
  Sparkles,
} from 'lucide-react';
import { useMilestoneChain } from '../context/MilestoneChainContext';
import { ProjectCard } from '../components/ProjectCard';
import {
  calculateProgress,
  getExplorerAddressUrl,
  shortenAddress,
} from '../utils/format';

export const DashboardPage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const {
    projects,
    isLoadingProjects,
    refreshProjects,
    completeMilestoneOnChain,
    setShareModalProject,
  } = useMilestoneChain();

  const [completingKey, setCompletingKey] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const myProjects = React.useMemo(() => {
    if (!address) return [];
    return projects.filter((p) => p.owner.toLowerCase() === address.toLowerCase());
  }, [projects, address]);

  const totalMyMilestones = myProjects.reduce((acc, p) => acc + p.milestoneCount, 0);
  const totalMyCompleted = myProjects.reduce((acc, p) => acc + p.completedCount, 0);
  const avgProgress = calculateProgress(totalMyCompleted, totalMyMilestones);

  const handleQuickComplete = async (
    projectId: number,
    milestoneIndex: number,
    milestoneName: string,
    projectName: string
  ) => {
    setActionError(null);
    const key = `${projectId}-${milestoneIndex}`;
    setCompletingKey(key);
    try {
      await completeMilestoneOnChain(projectId, milestoneIndex, milestoneName, projectName);
    } catch (err: any) {
      setActionError(err?.shortMessage || err?.message || 'Transaction failed');
    } finally {
      setCompletingKey(null);
    }
  };

  if (!isConnected || !address) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-center shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
          <Wallet className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-white">Creator Dashboard</h1>
        <p className="mt-2 text-sm text-slate-400">
          Connect your MetaMask wallet on Botchain Testnet (Chain ID 968) to view your projects,
          add milestones, and submit milestone completion transactions.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => open()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:brightness-110"
          >
            <Wallet className="h-4 w-4" />
            <span>Connect MetaMask Wallet</span>
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-700"
          >
            <span>Browse Public Projects</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/75 p-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-emerald-400" />
            <h1 className="text-2xl font-extrabold text-white">My Project Dashboard</h1>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>Connected Owner Wallet:</span>
            <a
              href={getExplorerAddressUrl(address)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono font-semibold text-emerald-400 hover:underline"
            >
              <span>{shortenAddress(address, 6)}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => refreshProjects()}
            disabled={isLoadingProjects}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingProjects ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:brightness-110"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create New Project</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4">
          <div className="text-xs font-medium text-slate-400">My Projects</div>
          <div className="mt-1 text-2xl font-extrabold text-white">{myProjects.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4">
          <div className="text-xs font-medium text-slate-400">Total Milestones</div>
          <div className="mt-1 text-2xl font-extrabold text-cyan-400">{totalMyMilestones}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4">
          <div className="text-xs font-medium text-slate-400">Completed On-Chain</div>
          <div className="mt-1 text-2xl font-extrabold text-emerald-400">{totalMyCompleted}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4">
          <div className="text-xs font-medium text-slate-400">Overall Completion</div>
          <div className="mt-1 text-2xl font-extrabold text-white">{avgProgress}%</div>
        </div>
      </div>

      {actionError && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
          {actionError}
        </div>
      )}

      {/* Next Pending Milestones Quick-Action Strip */}
      {myProjects.some((p) => p.milestones.some((m) => !m.completed)) && (
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">
              Quick Update — Next Pending Milestones
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Mark your next deliverable as completed directly with a MetaMask transaction on Botchain Testnet.
          </p>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            {myProjects.map((project) => {
              const nextMilestone = project.milestones.find((m) => !m.completed);
              if (!nextMilestone) return null;
              const key = `${project.id}-${nextMilestone.index}`;
              const isBusy = completingKey === key;

              return (
                <div
                  key={project.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/90 p-3.5"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-semibold text-emerald-400">
                        Project #{project.id}
                      </span>
                      <span className="truncate text-xs font-bold text-white">
                        {project.name}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-300">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                      <span className="truncate">
                        Next: <strong>{nextMilestone.name}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() =>
                        handleQuickComplete(
                          project.id,
                          nextMilestone.index,
                          nextMilestone.name,
                          project.name
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{isBusy ? 'Signing...' : 'Mark Complete'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShareModalProject(project)}
                      className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white"
                      title="Share QR & Public Link"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {myProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {myProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center">
          <FolderKanban className="mx-auto h-10 w-10 text-emerald-400/80" />
          <h3 className="mt-3 text-base font-bold text-white">
            You haven&apos;t created any projects with this wallet yet
          </h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-slate-400">
            Create your first project on MilestoneChain and start recording milestone completions on
            Botchain Testnet (Chain ID 968).
          </p>
          <div className="mt-5">
            <Link
              to="/create"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create Your First Project</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

