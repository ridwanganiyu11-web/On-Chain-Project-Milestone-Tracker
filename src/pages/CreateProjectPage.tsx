import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import {
  PlusCircle,
  Trash2,
  Sparkles,
  Wallet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Info,
  Layers,
} from 'lucide-react';
import { useMilestoneChain } from '../context/MilestoneChainContext';
import {
  PROJECT_TEMPLATES,
  getExplorerTxUrl,
} from '../utils/format';

export const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isConnected } = useAccount();
  const { open } = useAppKit();
  const { createProjectOnChain, isContractVerifiedOnChain, setIsConfigModalOpen } =
    useMilestoneChain();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [milestones, setMilestones] = useState<string[]>([
    'Design the website',
    'Build the frontend',
    'Connect the backend',
    'Launch the website',
  ]);
  const [newMilestoneInput, setNewMilestoneInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<{
    projectId: number;
    txHash: string;
  } | null>(null);

  useEffect(() => {
    const tplIdx = searchParams.get('template');
    if (tplIdx !== null) {
      const idx = Number(tplIdx);
      if (!Number.isNaN(idx) && PROJECT_TEMPLATES[idx]) {
        const tpl = PROJECT_TEMPLATES[idx];
        setName(tpl.name);
        setDescription(tpl.description);
        setMilestones([...tpl.milestones]);
      }
    }
  }, [searchParams]);

  const applyTemplate = (index: number) => {
    const tpl = PROJECT_TEMPLATES[index];
    if (!tpl) return;
    setName(tpl.name);
    setDescription(tpl.description);
    setMilestones([...tpl.milestones]);
    setError(null);
  };

  const handleAddMilestoneField = () => {
    const trimmed = newMilestoneInput.trim();
    if (!trimmed) return;
    if (trimmed.length > 140) {
      setError('Keep milestone names under 140 characters to minimize gas costs.');
      return;
    }
    setMilestones((prev) => [...prev, trimmed]);
    setNewMilestoneInput('');
    setError(null);
  };

  const handleUpdateMilestone = (idx: number, val: string) => {
    setMilestones((prev) => prev.map((item, i) => (i === idx ? val : item)));
  };

  const handleRemoveMilestone = (idx: number) => {
    setMilestones((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isConnected) {
      open();
      return;
    }

    if (!isContractVerifiedOnChain) {
      setIsConfigModalOpen(true);
      setError('Please verify or deploy the ProjectMilestoneTracker contract first.');
      return;
    }

    const trimmedName = name.trim();
    const trimmedDesc = description.trim();
    if (!trimmedName) {
      setError('Please enter a project name.');
      return;
    }
    if (trimmedName.length > 100) {
      setError('Project name must be 100 characters or fewer.');
      return;
    }
    if (trimmedDesc.length > 280) {
      setError('Project description must be 280 characters or fewer to reduce storage gas.');
      return;
    }

    const validMilestones = milestones.map((m) => m.trim()).filter(Boolean);
    for (const m of validMilestones) {
      if (m.length > 140) {
        setError(`Milestone "${m.slice(0, 30)}..." exceeds 140 characters.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await createProjectOnChain(trimmedName, trimmedDesc, validMilestones);
      setCreatedResult(res);
    } catch (err: any) {
      setError(
        err?.shortMessage || err?.message || 'Failed to submit createProject transaction.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <PlusCircle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Create On-Chain Project</h1>
            <p className="text-xs text-slate-400">
              Your connected MetaMask wallet becomes the immutable project owner on Botchain Testnet (Chain ID 968).
            </p>
          </div>
        </div>

        {/* Preset Templates */}
        <div className="mt-5 border-t border-slate-800 pt-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Quick-Fill Templates (1-Click):</span>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {PROJECT_TEMPLATES.map((tpl, idx) => (
              <button
                key={tpl.label}
                type="button"
                onClick={() => applyTemplate(idx)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-300"
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {createdResult && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 shadow-xl">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-400" />
            <div className="w-full space-y-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Project #{createdResult.projectId} Recorded on Botchain Testnet!
                </h3>
                <p className="mt-1 text-xs text-slate-300">
                  Your project and initial milestones are now permanently stored on-chain.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/project/${createdResult.projectId}`)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                >
                  <span>Open Project Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/public/${createdResult.projectId}`)}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-slate-900 px-4 py-2 text-xs font-semibold text-emerald-300 hover:bg-slate-800"
                >
                  <span>View Public Share Page</span>
                </button>
                <a
                  href={getExplorerTxUrl(createdResult.txHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:underline"
                >
                  <span>View Transaction on Botchain Explorer</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/75 p-6 shadow-xl"
      >
        {/* Project Name */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-white">
              Project Name <span className="text-emerald-400">*</span>
            </label>
            <span className="font-mono text-xs text-slate-400">{name.length}/100</span>
          </div>
          <input
            type="text"
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Website Development"
            className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Short Description */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-white">
              Short Description
            </label>
            <span className="font-mono text-xs text-slate-400">{description.length}/280</span>
          </div>
          <textarea
            rows={3}
            maxLength={280}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Concise summary of project scope and deliverables..."
            className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
            <Info className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
            <span>
              Keep descriptions concise to reduce on-chain storage gas costs on Botchain.
            </span>
          </p>
        </div>

        {/* Initial Milestones Builder */}
        <div className="space-y-3 border-t border-slate-800 pt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              <label className="text-sm font-semibold text-white">
                Project Milestones ({milestones.length})
              </label>
            </div>
            <span className="text-xs text-slate-400">
              You can also add more milestones later
            </span>
          </div>

          {/* Existing Milestone Rows */}
          <div className="space-y-2">
            {milestones.map((m, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 font-mono text-xs font-bold text-emerald-400">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  maxLength={140}
                  value={m}
                  onChange={(e) => handleUpdateMilestone(idx, e.target.value)}
                  placeholder={`Milestone #${idx + 1} name`}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveMilestone(idx)}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-2 text-slate-400 hover:border-rose-500/40 hover:text-rose-400"
                  title="Remove milestone"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Milestone Input */}
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              maxLength={140}
              value={newMilestoneInput}
              onChange={(e) => setNewMilestoneInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddMilestoneField();
                }
              }}
              placeholder="Add another milestone (e.g., Security Audit, Production Launch)..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddMilestoneField}
              className="shrink-0 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25"
            >
              + Add Milestone
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs text-rose-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          {!isConnected ? (
            <button
              type="button"
              onClick={() => open()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:brightness-110"
            >
              <Wallet className="h-4 w-4" />
              <span>Connect MetaMask to Create Project</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-110 disabled:opacity-50"
            >
              <PlusCircle className="h-4 w-4 stroke-[2.5]" />
              <span>
                {isSubmitting
                  ? 'Confirming Transaction in MetaMask...'
                  : milestones.filter((m) => m.trim()).length > 0
                  ? `Create Project & ${milestones.filter((m) => m.trim()).length} Milestones On-Chain`
                  : 'Create Project On-Chain'}
              </span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

