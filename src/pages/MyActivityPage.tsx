import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import {
  Activity,
  CheckCircle2,
  PlusCircle,
  Layers,
  Cpu,
  ExternalLink,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { useMilestoneChain } from '../context/MilestoneChainContext';
import {
  formatTimestamp,
  getExplorerAddressUrl,
  getExplorerTxUrl,
  shortenAddress,
} from '../utils/format';

export const MyActivityPage: React.FC = () => {
  const { address } = useAccount();
  const { activityLogs, isLoadingActivity, refreshProjects } = useMilestoneChain();
  const [filterMine, setFilterMine] = useState(false);

  const displayedLogs = filterMine && address
    ? activityLogs.filter((a) => a.actor.toLowerCase() === address.toLowerCase())
    : activityLogs;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            <h1 className="text-2xl font-extrabold text-white">On-Chain Activity & Transactions</h1>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Live project creations, milestone additions, and milestone completion transactions on
            Botchain Testnet (Chain ID 968).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {address && (
            <button
              type="button"
              onClick={() => setFilterMine((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                filterMine
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              <span>{filterMine ? 'Showing My Wallet Only' : 'Showing All Contract Events'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => refreshProjects()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingActivity ? 'animate-spin' : ''}`} />
            <span>Sync Logs</span>
          </button>
        </div>
      </div>

      {displayedLogs.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center">
          <Activity className="mx-auto h-10 w-10 text-emerald-400/80" />
          <h3 className="mt-3 text-base font-bold text-white">No On-Chain Transactions Recorded Yet</h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-slate-400">
            Transactions you submit to create projects, add milestones, or complete milestones on
            Botchain Testnet will appear here with direct links to scan.bohr.life.
          </p>
          <div className="mt-5">
            <Link
              to="/create"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create a Project</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedLogs.map((item) => {
            const isComplete = item.type === 'MILESTONE_COMPLETED';
            const isCreate = item.type === 'PROJECT_CREATED';
            const isAdded = item.type === 'MILESTONE_ADDED';

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/75 p-4 transition hover:border-slate-700 sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      isComplete
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : isCreate
                        ? 'bg-cyan-500/15 text-cyan-400'
                        : isAdded
                        ? 'bg-indigo-500/15 text-indigo-400'
                        : 'bg-amber-500/15 text-amber-400'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : isCreate ? (
                      <PlusCircle className="h-5 w-5" />
                    ) : isAdded ? (
                      <Layers className="h-5 w-5" />
                    ) : (
                      <Cpu className="h-5 w-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {isComplete
                          ? `Completed Milestone: ${item.milestoneName || `#${(item.milestoneIndex ?? 0) + 1}`}`
                          : isCreate
                          ? `Created Project: ${item.projectName || `#${item.projectId}`}`
                          : isAdded
                          ? `Added Milestone: ${item.milestoneName || `#${(item.milestoneIndex ?? 0) + 1}`}`
                          : 'Deployed ProjectMilestoneTracker Contract'}
                      </span>
                      {item.projectId && (
                        <Link
                          to={`/project/${item.projectId}`}
                          className="rounded-md border border-slate-700 bg-slate-950 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-400 hover:underline"
                        >
                          Project #{item.projectId}
                        </Link>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span>
                        Wallet:{' '}
                        <a
                          href={getExplorerAddressUrl(item.actor)}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-slate-200 hover:text-emerald-400 hover:underline"
                        >
                          {shortenAddress(item.actor, 4)}
                        </a>
                      </span>
                      <span>Timestamp: {formatTimestamp(item.timestamp)}</span>
                      {item.blockNumber && <span>Block #{item.blockNumber}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                  <a
                    href={getExplorerTxUrl(item.txHash)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs font-semibold text-cyan-300 hover:border-cyan-500/40 hover:text-cyan-200"
                  >
                    <span>Tx: {shortenAddress(item.txHash, 4)}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

