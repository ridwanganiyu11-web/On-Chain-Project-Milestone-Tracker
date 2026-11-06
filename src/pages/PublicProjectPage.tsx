import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  ExternalLink,
  User,
  Calendar,
  Info,
  RefreshCw,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import {
  useMilestoneChain,
  type OnChainProject,
} from '../context/MilestoneChainContext';
import { ProjectQrShareCard } from '../components/ShareModal';
import { BOTCHAIN_NETWORK_METADATA } from '../config/web3';
import {
  calculateProgress,
  formatTimestamp,
  getExplorerAddressUrl,
  shortenAddress,
} from '../utils/format';

export const PublicProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const { projects, fetchProjectById, contractAddress } = useMilestoneChain();

  const [project, setProject] = useState<OnChainProject | null>(() => {
    return projects.find((p) => p.id === projectId) || null;
  });
  const [isLoading, setIsLoading] = useState(!project);

  const loadProject = useCallback(async () => {
    if (!projectId || Number.isNaN(projectId)) return;
    setIsLoading(true);
    try {
      const fresh = await fetchProjectById(projectId);
      if (fresh) setProject(fresh);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, fetchProjectById]);

  useEffect(() => {
    const cached = projects.find((p) => p.id === projectId);
    if (cached) setProject(cached);
    loadProject();
  }, [projectId, projects, loadProject]);

  if (isLoading && !project) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 pb-16">
        <div className="h-64 animate-pulse rounded-3xl border border-slate-800 bg-slate-900/60" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-800 bg-slate-900/80 p-10 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-amber-400" />
        <h2 className="mt-3 text-xl font-bold text-white">Public Project #{id} Not Found</h2>
        <p className="mt-1 text-xs text-slate-400">
          Could not find Project #{id} on Botchain Testnet (Chain ID 968).
        </p>
        <Link
          to="/"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Explore All Public Projects</span>
        </Link>
      </div>
    );
  }

  const progress = calculateProgress(project.completedCount, project.milestoneCount);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      {/* Top Verification Badge Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>
            Public On-Chain Verification Record · Botchain Testnet (Chain ID{' '}
            {BOTCHAIN_NETWORK_METADATA.chainId}) · No Wallet Required
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadProject}
            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-200 hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to={`/project/${project.id}`}
            className="text-xs font-semibold text-cyan-300 hover:underline"
          >
            Owner / Manage View →
          </Link>
        </div>
      </div>

      {/* Main Public Project Report Card (Matches Section 3 Interface Example) */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-slate-800 px-2 py-0.5 font-mono text-xs font-semibold text-emerald-400">
                PROJECT #{project.id}
              </span>
              <span className="text-xs text-slate-400">Verified via RPC https://rpc.bohr.life</span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
              {project.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-emerald-400" />
                <span>Project owner:</span>
                <a
                  href={getExplorerAddressUrl(project.owner)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-mono font-bold text-white hover:text-emerald-400 hover:underline"
                  title={project.owner}
                >
                  <span>{shortenAddress(project.owner, 4)}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>Created {formatTimestamp(project.createdAt)}</span>
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 px-5 py-3.5 text-right">
            <div className="text-xs font-medium text-slate-400">Project progress</div>
            <div className="text-3xl font-black text-emerald-400">{progress}%</div>
          </div>
        </div>

        {project.description && (
          <p className="mt-4 text-sm leading-relaxed text-slate-300">{project.description}</p>
        )}

        {/* Progress Bar */}
        <div className="mt-5">
          <div className="h-3.5 w-full overflow-hidden rounded-full border border-slate-800 bg-slate-950 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Milestone List */}
        <div className="mt-6 space-y-3">
          {project.milestones.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">
              No milestones recorded yet.
            </p>
          ) : (
            project.milestones.map((m) => (
              <div
                key={m.index}
                className={`flex items-center justify-between rounded-xl border px-4 py-3.5 ${
                  m.completed
                    ? 'border-emerald-500/30 bg-emerald-500/10'
                    : 'border-slate-800 bg-slate-950/70'
                }`}
              >
                <div className="flex items-start gap-3">
                  {m.completed ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                  ) : (
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                  )}
                  <div>
                    <div className="text-sm font-bold text-white">{m.name}</div>
                    {m.completed && m.completedAt > 0 && (
                      <div className="mt-0.5 text-xs text-emerald-300/90">
                        Completed timestamp: {formatTimestamp(m.completedAt)}
                      </div>
                    )}
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                    m.completed
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {m.completed ? 'Completed' : 'Pending'}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Contract Proof Footer */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-4 text-xs text-slate-400">
          <span>Live blockchain record on Botchain Testnet (Chain ID 968)</span>
          {contractAddress && (
            <a
              href={getExplorerAddressUrl(contractAddress)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-emerald-400 hover:underline"
            >
              <span>Contract: {shortenAddress(contractAddress, 6)}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* Share Link & QR Code */}
      <ProjectQrShareCard project={project} />

      {/* Limitation / Trust Explanation from Spec */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-start gap-2.5 text-xs text-slate-400">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
          <p>
            <strong className="text-slate-200">Verification Scope:</strong> Blockchain records
            cryptographically prove that the project owner&apos;s wallet (
            <code className="text-slate-300">{shortenAddress(project.owner, 4)}</code>) marked each
            milestone complete at the recorded block timestamp; they do not independently prove
            off-chain work delivery.
          </p>
        </div>
      </div>
    </div>
  );
};

