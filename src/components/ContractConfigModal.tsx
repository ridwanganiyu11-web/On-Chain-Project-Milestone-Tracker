import React, { useState, useEffect } from 'react';
import {
  X,
  Cpu,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Rocket,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { useMilestoneChain, DEFAULT_DEPLOYED_CONTRACT_ADDRESS } from '../context/MilestoneChainContext';
import { BOTCHAIN_NETWORK_METADATA } from '../config/web3';
import { getExplorerAddressUrl, getExplorerTxUrl } from '../utils/format';

export const ContractConfigModal: React.FC = () => {
  const {
    contractAddress,
    isContractVerifiedOnChain,
    isCheckingBytecode,
    projectCount,
    totalMilestonesCreated,
    totalMilestonesCompleted,
    setContractAddress,
    deployTrackerContract,
    isDeploying,
    deployError,
    refreshProjects,
    isConfigModalOpen,
    setIsConfigModalOpen,
  } = useMilestoneChain();

  const [inputAddress, setInputAddress] = useState(contractAddress || '');
  const [inputError, setInputError] = useState<string | null>(null);
  const [deployTxHash, setDeployTxHash] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setInputAddress(contractAddress || '');
  }, [contractAddress, isConfigModalOpen]);

  if (!isConfigModalOpen) return null;

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);
    const ok = setContractAddress(inputAddress);
    if (!ok) {
      setInputError('Please enter a valid 0x Ethereum/Botchain contract address.');
    }
  };

  const handleDeploy = async () => {
    setInputError(null);
    setDeployTxHash(null);
    try {
      const res = await deployTrackerContract();
      setInputAddress(res.contractAddress);
      setDeployTxHash(res.txHash);
    } catch {
      // handled by context deployError
    }
  };

  const handleCopy = () => {
    if (!contractAddress) return;
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                ProjectMilestoneTracker.sol Contract
              </h3>
              <p className="text-xs text-slate-400">
                Botchain Testnet · Chain ID {BOTCHAIN_NETWORK_METADATA.chainId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsConfigModalOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Status Banner */}
          <div
            className={`rounded-xl border p-3.5 ${
              isContractVerifiedOnChain
                ? 'border-emerald-500/30 bg-emerald-500/10'
                : 'border-amber-500/30 bg-amber-500/10'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                {isContractVerifiedOnChain ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                )}
                <div>
                  <p className="text-sm font-semibold text-white">
                    {isCheckingBytecode
                      ? 'Verifying contract bytecode on Botchain Testnet...'
                      : isContractVerifiedOnChain
                      ? 'Live Smart Contract Verified on Botchain Testnet'
                      : 'No Verified Contract Detected at Current Address'}
                  </p>
                  {contractAddress && (
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <code className="font-mono text-xs text-slate-300 break-all">
                        {contractAddress}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1 rounded bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-300 hover:text-white"
                      >
                        {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                      <a
                        href={getExplorerAddressUrl(contractAddress)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"
                      >
                        <span>Explorer</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => refreshProjects()}
                className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:text-white"
                title="Refresh on-chain stats"
              >
                <RefreshCw className={`h-4 w-4 ${isCheckingBytecode ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {isContractVerifiedOnChain && (
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-emerald-500/20 pt-3 text-center">
                <div>
                  <div className="text-xs text-slate-400">Projects</div>
                  <div className="text-sm font-bold text-white">{projectCount}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Milestones</div>
                  <div className="text-sm font-bold text-white">{totalMilestonesCreated}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Completed</div>
                  <div className="text-sm font-bold text-emerald-400">
                    {totalMilestonesCompleted}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Custom Contract Address Input */}
          <form onSubmit={handleSaveAddress} className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              Contract Address on Botchain Testnet (Chain ID 968)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputAddress}
                onChange={(e) => setInputAddress(e.target.value)}
                placeholder="0x..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Use Address
              </button>
            </div>
            {DEFAULT_DEPLOYED_CONTRACT_ADDRESS &&
              contractAddress !== DEFAULT_DEPLOYED_CONTRACT_ADDRESS && (
                <button
                  type="button"
                  onClick={() => {
                    setInputAddress(DEFAULT_DEPLOYED_CONTRACT_ADDRESS);
                    setContractAddress(DEFAULT_DEPLOYED_CONTRACT_ADDRESS);
                  }}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  Restore default deployed contract ({DEFAULT_DEPLOYED_CONTRACT_ADDRESS.slice(0, 10)}...)
                </button>
              )}
            {inputError && <p className="text-xs text-rose-400">{inputError}</p>}
          </form>

          {/* 1-Click Deploy New Instance */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Deploy Fresh Contract Instance
            </h4>
            <p className="mt-1 text-xs text-slate-400">
              Want your own dedicated <code className="text-slate-300">ProjectMilestoneTracker.sol</code>{' '}
              contract on Botchain Testnet? Deploy directly from your connected MetaMask wallet.
            </p>
            <button
              type="button"
              onClick={handleDeploy}
              disabled={isDeploying}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md transition-all hover:brightness-110 disabled:opacity-50"
            >
              <Rocket className="h-4 w-4" />
              <span>
                {isDeploying
                  ? 'Deploying ProjectMilestoneTracker on Chain 968...'
                  : 'Deploy New Contract via MetaMask'}
              </span>
            </button>

            {deployError && (
              <p className="mt-2 text-xs text-rose-400 break-words">{deployError}</p>
            )}
            {deployTxHash && (
              <div className="mt-2 flex items-center justify-between rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                <span>Contract deployed!</span>
                <a
                  href={getExplorerTxUrl(deployTxHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold underline"
                >
                  <span>View Tx</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

