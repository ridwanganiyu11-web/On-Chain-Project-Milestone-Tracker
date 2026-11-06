import React from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import {
  CheckCircle2,
  Clock,
  Share2,
  ArrowUpRight,
  User,
  Calendar,
  Eye,
} from 'lucide-react';
import { useMilestoneChain, type OnChainProject } from '../context/MilestoneChainContext';
import {
  calculateProgress,
  formatTimestamp,
  shortenAddress,
} from '../utils/format';

export const ProjectCard: React.FC<{
  project: OnChainProject;
}> = ({ project }) => {
  const { address } = useAccount();
  const { setShareModalProject } = useMilestoneChain();

  const progress = calculateProgress(project.completedCount, project.milestoneCount);
  const isOwner =
    Boolean(address) && address?.toLowerCase() === project.owner.toLowerCase();

  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/75 p-5 shadow-lg transition-all hover:border-emerald-500/40 hover:bg-slate-900">
      <div>
        {/* Top Row: ID + Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-0.5 font-mono text-xs font-semibold text-slate-300">
              #{project.id}
            </span>
            {isOwner && (
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                Your Project
              </span>
            )}
          </div>

          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              progress === 100 && project.milestoneCount > 0
                ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                : progress > 0
                ? 'border border-cyan-500/30 bg-cyan-500/15 text-cyan-300'
                : 'border border-slate-700 bg-slate-800 text-slate-300'
            }`}
          >
            {progress === 100 && project.milestoneCount > 0
              ? 'Completed'
              : `${progress}% Complete`}
          </span>
        </div>

        {/* Title & Description */}
        <Link to={`/project/${project.id}`} className="mt-3 block">
          <h3 className="text-lg font-bold text-white transition-colors group-hover:text-emerald-400">
            {project.name}
          </h3>
        </Link>
        {project.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
            {project.description}
          </p>
        )}

        {/* Owner & Created metadata */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-slate-500" />
            <span>Owner:</span>
            <code className="font-mono text-slate-200">{shortenAddress(project.owner, 4)}</code>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-500" />
            <span>{formatTimestamp(project.createdAt)}</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300">Project progress</span>
            <span className="font-mono font-bold text-emerald-400">
              {progress}% ({project.completedCount}/{project.milestoneCount})
            </span>
          </div>
          <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-950 p-0.5 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Milestone Preview List (up to 4) */}
        <div className="mt-4 space-y-1.5">
          {project.milestones.length === 0 ? (
            <p className="text-xs italic text-slate-500">
              No milestones added yet.
            </p>
          ) : (
            project.milestones.slice(0, 4).map((m) => (
              <div
                key={m.index}
                className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/60 px-3 py-1.5 text-xs"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  {m.completed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  ) : (
                    <Clock className="h-3.5 w-3.5 shrink-0 text-amber-400/80" />
                  )}
                  <span
                    className={`truncate ${
                      m.completed ? 'text-slate-200 font-medium' : 'text-slate-400'
                    }`}
                  >
                    {m.name}
                  </span>
                </div>
                <span
                  className={`shrink-0 text-[11px] font-semibold ${
                    m.completed ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {m.completed ? 'Completed' : 'Pending'}
                </span>
              </div>
            ))
          )}
          {project.milestones.length > 4 && (
            <p className="pt-0.5 text-center text-[11px] text-slate-500">
              +{project.milestones.length - 4} more milestones
            </p>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-800/80 pt-3.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShareModalProject(project)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white"
            title="Share public link & QR code"
          >
            <Share2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Share QR</span>
          </button>
          <Link
            to={`/public/${project.id}`}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white"
            title="Open wallet-free public verification page"
          >
            <Eye className="h-3.5 w-3.5 text-cyan-400" />
            <span>Public View</span>
          </Link>
        </div>

        <Link
          to={`/project/${project.id}`}
          className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25"
        >
          <span>{isOwner ? 'Manage' : 'Details'}</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
};

