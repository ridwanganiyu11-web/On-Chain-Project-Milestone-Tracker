import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import {
  CheckCircle2,
  Clock,
  PlusCircle,
  Share2,
  ExternalLink,
  ArrowLeft,
  User,
  Calendar,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Eye,
  History,
} from 'lucide-react';
import {
  useMilestoneChain,
  type OnChainProject,
} from '../context/MilestoneChainContext';
import { ProjectQrShareCard } from '../components/ShareModal';
import {
  calculateProgress,
  formatTimestamp,
  getExplorerAddressUrl,
  getExplorerTxUrl,
  shortenAddress,
} from '../utils/format';

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const { address } = useAccount();

  const {
    projects,
    fetchProjectById,
    addMilestoneOnChain,
    completeMilestoneOnChain,
    activityLogs,
    setShareModalProject,
  } = useMilestoneChain();

  const [project, setProject] = useState<OnChainProject | null>(() => {
    return projects.find((p) => p.id === projectId) || null;
  });
  const [isLoading, setIsLoading] = useState(!project);
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [completingIndex, setCompletingIndex] = useState<number | null>(null);
  const [txBanner, setTxBanner] = useState<{ message: string; txHash: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      <div className="mx-auto max-w-4xl space-y-6 pb-16">
        <div className="h-44 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60" />
        <div className="h-80 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-800 bg-slate-900/80 p-10 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-amber-400" />
        <h2 className="mt-3 text-xl font-bold text-white">Project #{id} Not Found</h2>
        <p className="mt-1 text-xs text-slate-400">
          This project ID has not been registered on the active ProjectMilestoneTracker contract yet.
        </p>
        <Link
          to="/"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  const isOwner =
    Boolean(address) && address?.toLowerCase() === project.owner.toLowerCase();
  const progress = calculateProgress(project.completedCount, project.milestoneCount);

  const projectActivity = activityLogs.filter((a) => a.projectId === project.id);

  const handleCompleteMilestone = async (milestoneIndex: number, milestoneName: string) => {
    setError(null);
    setTxBanner(null);
    setCompletingIndex(milestoneIndex);
    try {
      const res = await completeMilestoneOnChain(
        project.id,
        milestoneIndex,
        milestoneName,
        project.name
      );
      setTxBanner({
        message: `Milestone "${milestoneName}" permanently marked completed on-chain!`,
        txHash: res.txHash,
      });
      await loadProject();
    } catch (err: any) {
      setError(err?.shortMessage || err?.message || 'Failed to complete milestone.');
    } finally {
      setCompletingIndex(null);
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTxBanner(null);
    const trimmed = newMilestoneName.trim();
    if (!trimmed) return;
    if (trimmed.length > 140) {
      setError('Milestone name must be 140 characters or fewer.');
      return;
    }

    setIsAddingMilestone(true);
    try {
      const res = await addMilestoneOnChain(project.id, trimmed, project.name);
      setNewMilestoneName('');
      setTxBanner({
        message: `Added milestone "${trimmed}" on Botchain Testnet!`,
        txHash: res.txHash,
      });
      await loadProject();
    } catch (err: any) {
      setError(err?.shortMessage || err?.message || 'Failed to add milestone.');
    } finally {
      setIsAddingMilestone(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Projects</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={loadProject}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync State</span>
          </button>
          <Link
            to={`/public/${project.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Public Verification View</span>
          </Link>
          <button
            type="button"
            onClick={() => setShareModalProject(project)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:brightness-110"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share Link & QR Code</span>
          </button>
        </div>
      </div>

      {/* Main Project Header Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 font-mono text-xs font-bold text-emerald-400">
                Project #{project.id}
              </span>
              {isOwner ? (
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Owner Mode Active (You can add & complete milestones)
                </span>
              ) : (
                <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                  Read-Only View (Only owner can update)
                </span>
              )}
            </div>

            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{project.name}</h1>

            {project.description && (
              <p className="max-w-2xl text-sm leading-relaxed text-slate-300">
                {project.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-emerald-400" />
                <span>Project owner:</span>
                <a
                  href={getExplorerAddressUrl(project.owner)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-mono font-semibold text-white hover:text-emerald-400 hover:underline"
                >
                  <span>{shortenAddress(project.owner, 6)}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-cyan-400" />
                <span>Created: {formatTimestamp(project.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Progress Ring / Box */}
          <div className="flex shrink-0 flex-col items-end justify-center rounded-2xl border border-slate-800 bg-slate-950/90 px-6 py-4 text-right">
            <span className="text-xs font-medium text-slate-400">Project progress</span>
            <div className="mt-1 text-4xl font-black text-emerald-400">{progress}%</div>
            <span className="mt-1 text-xs text-slate-400">
              {project.completedCount} of {project.milestoneCount} milestones completed
            </span>
          </div>
        </div>

        {/* Full-Width Progress Bar */}
        <div className="mt-6">
          <div className="h-3.5 w-full overflow-hidden rounded-full border border-slate-800 bg-slate-950 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Transaction Notification or Error */}
      {txBanner && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-4 text-xs text-emerald-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
            <span className="font-semibold">{txBanner.message}</span>
          </div>
          <a
            href={getExplorerTxUrl(txBanner.txHash)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-bold text-emerald-300 underline"
          >
            <span>View Transaction on Botchain Explorer</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-5 py-4 text-xs text-rose-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Milestones Checklist & Owner Controls */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">On-Chain Milestones</h2>
                <p className="text-xs text-slate-400">
                  Each completed milestone records the exact Botchain block timestamp.
                </p>
              </div>
              <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 font-mono text-xs font-semibold text-slate-300">
                {project.completedCount}/{project.milestoneCount} Done
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {project.milestones.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 text-center text-xs text-slate-400">
                  No milestones have been added to this project yet.
                </div>
              ) : (
                project.milestones.map((m) => {
                  const isCompleting = completingIndex === m.index;
                  return (
                    <div
                      key={m.index}
                      className={`flex flex-col justify-between gap-3 rounded-xl border p-4 transition sm:flex-row sm:items-center ${
                        m.completed
                          ? 'border-emerald-500/30 bg-emerald-500/10'
                          : 'border-slate-800 bg-slate-950/70'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {m.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                          ) : (
                            <Clock className="h-5 w-5 text-amber-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-slate-400">
                              #{m.index + 1}
                            </span>
                            <h3 className="text-sm font-bold text-white">{m.name}</h3>
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            {m.completed ? (
                              <span className="text-emerald-300/90">
                                Completed on-chain: <strong>{formatTimestamp(m.completedAt)}</strong>
                              </span>
                            ) : (
                              <span>Added: {formatTimestamp(m.createdAt)} · Status: Pending</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                        {m.completed ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Completed</span>
                          </span>
                        ) : isOwner ? (
                          <button
                            type="button"
                            disabled={isCompleting}
                            onClick={() => handleCompleteMilestone(m.index, m.name)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-sm transition hover:bg-emerald-400 disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>
                              {isCompleting ? 'Confirm in MetaMask...' : 'Mark Completed'}
                            </span>
                          </button>
                        ) : (
                          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-400">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Milestone Form (Owner Only) */}
            {isOwner && (
              <form
                onSubmit={handleAddMilestone}
                className="mt-6 border-t border-slate-800 pt-5"
              >
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Add New Milestone (Owner Only)
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    maxLength={140}
                    value={newMilestoneName}
                    onChange={(e) => setNewMilestoneName(e.target.value)}
                    placeholder="e.g., Connect the backend, Launch the website..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isAddingMilestone || !newMilestoneName.trim()}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:brightness-110 disabled:opacity-50"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>{isAddingMilestone ? 'Signing...' : 'Add Milestone'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: QR Share Card & On-Chain Completion History */}
        <div className="lg:col-span-5 space-y-6">
          <ProjectQrShareCard project={project} compact />

          {/* Completion History Audit Log */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3.5">
              <History className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">On-Chain Completion History</h3>
            </div>

            <div className="mt-4 space-y-3">
              {/* Completed milestones from contract state */}
              {project.milestones
                .filter((m) => m.completed)
                .map((m) => (
                  <div
                    key={`done-${m.index}`}
                    className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-300">
                        ✓ Milestone #{m.index + 1} Completed
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {formatTimestamp(m.completedAt)}
                      </span>
                    </div>
                    <p className="mt-1 font-medium text-white">{m.name}</p>
                  </div>
                ))}

              {/* Activity logs with transaction hashes */}
              {projectActivity.map((act) => (
                <div
                  key={act.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">
                      {act.type === 'PROJECT_CREATED'
                        ? 'Project Created'
                        : act.type === 'MILESTONE_COMPLETED'
                        ? `Completed: ${act.milestoneName || `#${(act.milestoneIndex ?? 0) + 1}`}`
                        : `Added: ${act.milestoneName || `#${(act.milestoneIndex ?? 0) + 1}`}`}
                    </span>
                    <a
                      href={getExplorerTxUrl(act.txHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-[11px] text-cyan-400 hover:underline"
                    >
                      <span>{shortenAddress(act.txHash, 4)}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">
                    {formatTimestamp(act.timestamp)}
                  </div>
                </div>
              ))}

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Project Registered On-Chain</span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {formatTimestamp(project.createdAt)}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  Owner: <code className="text-slate-300">{shortenAddress(project.owner, 6)}</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

