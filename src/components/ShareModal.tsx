import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  ExternalLink,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMilestoneChain, type OnChainProject } from '../context/MilestoneChainContext';
import { calculateProgress, shortenAddress } from '../utils/format';

export const ProjectQrShareCard: React.FC<{
  project: OnChainProject;
  compact?: boolean;
}> = ({ project, compact = false }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const publicUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/public/${project.id}`
      : `https://milestonechain.app/public/${project.id}`;

  useEffect(() => {
    let mounted = true;
    QRCode.toDataURL(publicUrl, {
      width: 260,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (mounted) setQrDataUrl(url);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [publicUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `milestonechain-project-${project.id}-qr.png`;
    link.click();
  };

  const progress = calculateProgress(project.completedCount, project.milestoneCount);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-emerald-400" />
          <h4 className="text-sm font-bold text-white">Share Public Progress & QR Code</h4>
        </div>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
          No Wallet Needed to View
        </span>
      </div>

      <p className="mt-1.5 text-xs text-slate-400">
        Anyone with this public link or QR code can verify on-chain milestone completion for{' '}
        <span className="font-semibold text-slate-200">{project.name}</span> ({progress}% complete).
      </p>

      <div className={`mt-4 flex flex-col items-center gap-4 ${compact ? '' : 'sm:flex-row'}`}>
        <div className="flex shrink-0 flex-col items-center rounded-xl bg-white p-3 shadow-md">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR Code for ${project.name}`}
              className="h-36 w-36 rounded-lg"
            />
          ) : (
            <div className="flex h-36 w-36 items-center justify-center text-xs text-slate-500">
              Generating QR...
            </div>
          )}
          <span className="mt-1.5 font-mono text-[10px] font-semibold text-slate-700">
            PROJECT #{project.id} · {progress}%
          </span>
        </div>

        <div className="w-full space-y-3">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Public Verification Link
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-400"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadQr}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download QR PNG</span>
            </button>
            <Link
              to={`/public/${project.id}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20"
            >
              <span>Open Public Page</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-[11px] text-slate-400">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>
              Owner Wallet: <code className="text-slate-200">{shortenAddress(project.owner, 5)}</code>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ShareModal: React.FC = () => {
  const { shareModalProject, setShareModalProject } = useMilestoneChain();

  if (!shareModalProject) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Share Project Progress</h3>
              <p className="text-xs text-slate-400">
                Project #{shareModalProject.id}: {shareModalProject.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShareModalProject(null)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4">
          <ProjectQrShareCard project={shareModalProject} />
        </div>
      </div>
    </div>
  );
};

