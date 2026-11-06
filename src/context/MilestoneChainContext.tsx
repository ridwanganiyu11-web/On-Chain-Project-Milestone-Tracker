import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isAddress, parseEventLogs, type Address } from 'viem';
import { useAccount, useWalletClient } from 'wagmi';
import {
  botchainPublicClient,
  BOTCHAIN_CHAIN_ID,
  switchOrAddBotchainNetwork,
} from '../config/web3';
import {
  PROJECT_MILESTONE_TRACKER_ABI,
  PROJECT_MILESTONE_TRACKER_BYTECODE,
} from '../contracts/ProjectMilestoneTrackerArtifact';

const CONTRACT_STORAGE_KEY = 'milestonechain_contract_address_968_v2';
const ACTIVITY_STORAGE_KEY = 'milestonechain_activity_logs_968';

export interface OnChainMilestone {
  index: number;
  name: string;
  completed: boolean;
  completedAt: number;
  createdAt: number;
}

export interface OnChainProject {
  id: number;
  name: string;
  description: string;
  owner: Address;
  createdAt: number;
  milestoneCount: number;
  completedCount: number;
  exists: boolean;
  milestones: OnChainMilestone[];
}

export interface ActivityRecord {
  id: string;
  type: 'PROJECT_CREATED' | 'MILESTONE_ADDED' | 'MILESTONE_COMPLETED' | 'CONTRACT_DEPLOYED';
  projectId?: number;
  projectName?: string;
  milestoneIndex?: number;
  milestoneName?: string;
  actor: Address;
  txHash: `0x${string}`;
  timestamp: number;
  blockNumber?: number;
}

interface MilestoneChainContextValue {
  contractAddress: Address | null;
  isContractVerifiedOnChain: boolean;
  isCheckingBytecode: boolean;
  projectCount: number;
  totalMilestonesCreated: number;
  totalMilestonesCompleted: number;
  projects: OnChainProject[];
  isLoadingProjects: boolean;
  activityLogs: ActivityRecord[];
  isLoadingActivity: boolean;
  setContractAddress: (addr: string) => boolean;
  deployTrackerContract: () => Promise<{ contractAddress: Address; txHash: `0x${string}` }>;
  isDeploying: boolean;
  deployError: string | null;
  refreshProjects: () => Promise<void>;
  fetchProjectById: (projectId: number) => Promise<OnChainProject | null>;
  createProjectOnChain: (
    name: string,
    description: string,
    initialMilestones: string[]
  ) => Promise<{ projectId: number; txHash: `0x${string}` }>;
  addMilestoneOnChain: (
    projectId: number,
    milestoneName: string,
    projectName?: string
  ) => Promise<{ txHash: `0x${string}` }>;
  completeMilestoneOnChain: (
    projectId: number,
    milestoneIndex: number,
    milestoneName?: string,
    projectName?: string
  ) => Promise<{ txHash: `0x${string}` }>;
  isConfigModalOpen: boolean;
  setIsConfigModalOpen: (open: boolean) => void;
  shareModalProject: OnChainProject | null;
  setShareModalProject: (project: OnChainProject | null) => void;
}

const MilestoneChainContext = createContext<MilestoneChainContextValue | undefined>(undefined);

export const DEFAULT_DEPLOYED_CONTRACT_ADDRESS =
  import.meta.env.VITE_MILESTONE_CONTRACT_ADDRESS ||
  '0xb4bb038794fcfda0cbf8e1f9412af89cc4e599da';

export const MilestoneChainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const envAddress = (
    import.meta.env.VITE_MILESTONE_CONTRACT_ADDRESS || DEFAULT_DEPLOYED_CONTRACT_ADDRESS
  ).trim();

  const [contractAddress, setContractAddressState] = useState<Address | null>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(CONTRACT_STORAGE_KEY) : null;
    if (saved && isAddress(saved)) return saved as Address;
    if (envAddress && isAddress(envAddress)) return envAddress as Address;
    return null;
  });

  const [isContractVerifiedOnChain, setIsContractVerifiedOnChain] = useState(false);
  const [isCheckingBytecode, setIsCheckingBytecode] = useState(false);
  const [projectCount, setProjectCount] = useState(0);
  const [totalMilestonesCreated, setTotalMilestonesCreated] = useState(0);
  const [totalMilestonesCompleted, setTotalMilestonesCompleted] = useState(0);
  const [projects, setProjects] = useState<OnChainProject[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  const [activityLogs, setActivityLogs] = useState<ActivityRecord[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);

  const [isDeploying, setIsDeploying] = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [shareModalProject, setShareModalProject] = useState<OnChainProject | null>(null);

  const { chainId, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const recordLocalActivity = useCallback((entry: ActivityRecord) => {
    setActivityLogs((prev) => {
      const filtered = prev.filter((item) => item.id !== entry.id);
      const next = [entry, ...filtered].slice(0, 100);
      try {
        localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage quota errors
      }
      return next;
    });
  }, []);

  const fetchProjectById = useCallback(
    async (projectId: number): Promise<OnChainProject | null> => {
      if (!contractAddress || !isAddress(contractAddress) || projectId <= 0) {
        return null;
      }
      try {
        const [rawProject, rawMilestones] = await Promise.all([
          botchainPublicClient.readContract({
            address: contractAddress,
            abi: PROJECT_MILESTONE_TRACKER_ABI,
            functionName: 'getProject',
            args: [BigInt(projectId)],
          }),
          botchainPublicClient.readContract({
            address: contractAddress,
            abi: PROJECT_MILESTONE_TRACKER_ABI,
            functionName: 'getProjectMilestones',
            args: [BigInt(projectId)],
          }),
        ]);

        const [
          id,
          name,
          description,
          owner,
          createdAt,
          milestoneCount,
          completedCount,
          exists,
        ] = rawProject as readonly [
          bigint,
          string,
          string,
          Address,
          bigint,
          bigint,
          bigint,
          boolean,
        ];

        if (!exists) return null;

        const milestones: OnChainMilestone[] = (rawMilestones as any[]).map((m) => ({
          index: Number(m.index),
          name: String(m.name),
          completed: Boolean(m.completed),
          completedAt: Number(m.completedAt),
          createdAt: Number(m.createdAt),
        }));

        return {
          id: Number(id),
          name,
          description,
          owner,
          createdAt: Number(createdAt),
          milestoneCount: Number(milestoneCount),
          completedCount: Number(completedCount),
          exists,
          milestones,
        };
      } catch {
        return null;
      }
    },
    [contractAddress]
  );

  const refreshProjects = useCallback(async () => {
    if (!contractAddress || !isAddress(contractAddress)) {
      setIsContractVerifiedOnChain(false);
      setProjectCount(0);
      setTotalMilestonesCreated(0);
      setTotalMilestonesCompleted(0);
      setProjects([]);
      return;
    }

    setIsCheckingBytecode(true);
    setIsLoadingProjects(true);

    try {
      const code = await botchainPublicClient.getBytecode({ address: contractAddress });
      const hasCode = Boolean(code && code !== '0x' && code.length > 2);
      setIsContractVerifiedOnChain(hasCode);

      if (!hasCode) {
        setProjectCount(0);
        setProjects([]);
        return;
      }

      const [countBig, createdMilestonesBig, completedMilestonesBig] = await Promise.all([
        botchainPublicClient.readContract({
          address: contractAddress,
          abi: PROJECT_MILESTONE_TRACKER_ABI,
          functionName: 'getProjectCount',
        }),
        botchainPublicClient
          .readContract({
            address: contractAddress,
            abi: PROJECT_MILESTONE_TRACKER_ABI,
            functionName: 'totalMilestonesCreated',
          })
          .catch(() => 0n),
        botchainPublicClient
          .readContract({
            address: contractAddress,
            abi: PROJECT_MILESTONE_TRACKER_ABI,
            functionName: 'totalMilestonesCompleted',
          })
          .catch(() => 0n),
      ]);

      const count = Number(countBig);
      setProjectCount(count);
      setTotalMilestonesCreated(Number(createdMilestonesBig));
      setTotalMilestonesCompleted(Number(completedMilestonesBig));

      if (count === 0) {
        setProjects([]);
        return;
      }

      // Fetch projects in reverse chronological order (newest first, up to 30)
      const ids: number[] = [];
      for (let i = count; i >= Math.max(1, count - 29); i--) {
        ids.push(i);
      }

      const loaded = await Promise.all(ids.map((id) => fetchProjectById(id)));
      setProjects(loaded.filter((p): p is OnChainProject => p !== null));
    } catch {
      setIsContractVerifiedOnChain(false);
    } finally {
      setIsCheckingBytecode(false);
      setIsLoadingProjects(false);
    }
  }, [contractAddress, fetchProjectById]);

  const syncOnChainEvents = useCallback(async () => {
    if (!contractAddress || !isAddress(contractAddress) || !isContractVerifiedOnChain) return;
    setIsLoadingActivity(true);
    try {
      const latestBlock = await botchainPublicClient.getBlockNumber();
      const fromBlock = latestBlock > 5000n ? latestBlock - 5000n : 0n;

      const logs = await botchainPublicClient.getLogs({
        address: contractAddress,
        fromBlock,
        toBlock: 'latest',
      });

      const parsed = parseEventLogs({
        abi: PROJECT_MILESTONE_TRACKER_ABI,
        logs,
      });

      const discovered: ActivityRecord[] = [];
      for (const log of parsed) {
        const txHash = log.transactionHash;
        if (!txHash) continue;
        const args = log.args as any;

        if (log.eventName === 'ProjectCreated') {
          discovered.push({
            id: `${txHash}-project-${Number(args.projectId)}`,
            type: 'PROJECT_CREATED',
            projectId: Number(args.projectId),
            projectName: String(args.name || ''),
            actor: args.owner as Address,
            txHash,
            timestamp: Number(args.timestamp || Math.floor(Date.now() / 1000)),
            blockNumber: log.blockNumber ? Number(log.blockNumber) : undefined,
          });
        } else if (log.eventName === 'MilestoneAdded') {
          discovered.push({
            id: `${txHash}-added-${Number(args.projectId)}-${Number(args.milestoneIndex)}`,
            type: 'MILESTONE_ADDED',
            projectId: Number(args.projectId),
            milestoneIndex: Number(args.milestoneIndex),
            milestoneName: String(args.name || ''),
            actor: args.owner as Address,
            txHash,
            timestamp: Number(args.timestamp || Math.floor(Date.now() / 1000)),
            blockNumber: log.blockNumber ? Number(log.blockNumber) : undefined,
          });
        } else if (log.eventName === 'MilestoneCompleted') {
          discovered.push({
            id: `${txHash}-completed-${Number(args.projectId)}-${Number(args.milestoneIndex)}`,
            type: 'MILESTONE_COMPLETED',
            projectId: Number(args.projectId),
            milestoneIndex: Number(args.milestoneIndex),
            milestoneName: String(args.name || ''),
            actor: args.owner as Address,
            txHash,
            timestamp: Number(args.completedAt || Math.floor(Date.now() / 1000)),
            blockNumber: log.blockNumber ? Number(log.blockNumber) : undefined,
          });
        }
      }

      if (discovered.length > 0) {
        setActivityLogs((prev) => {
          const map = new Map<string, ActivityRecord>();
          for (const item of prev) map.set(item.id, item);
          for (const item of discovered) {
            const existing = map.get(item.id);
            map.set(item.id, existing ? { ...existing, ...item } : item);
          }
          const merged = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
          try {
            localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(merged.slice(0, 100)));
          } catch {
            // ignore
          }
          return merged.slice(0, 100);
        });
      }
    } catch {
      // RPC log range limit or network error — fallback to local activity logs silently
    } finally {
      setIsLoadingActivity(false);
    }
  }, [contractAddress, isContractVerifiedOnChain]);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  useEffect(() => {
    if (isContractVerifiedOnChain) {
      syncOnChainEvents();
    }
  }, [isContractVerifiedOnChain, syncOnChainEvents]);

  const setContractAddress = useCallback((addr: string): boolean => {
    const trimmed = addr.trim();
    if (!trimmed) {
      localStorage.removeItem(CONTRACT_STORAGE_KEY);
      setContractAddressState(null);
      return true;
    }
    if (!isAddress(trimmed)) {
      return false;
    }
    localStorage.setItem(CONTRACT_STORAGE_KEY, trimmed);
    setContractAddressState(trimmed as Address);
    return true;
  }, []);

  const ensureNetworkAndWallet = useCallback(async () => {
    if (!isConnected || !walletClient) {
      throw new Error('Please connect your MetaMask wallet first.');
    }
    if (chainId !== BOTCHAIN_CHAIN_ID) {
      await switchOrAddBotchainNetwork();
    }
    return walletClient;
  }, [isConnected, walletClient, chainId]);

  const deployTrackerContract = useCallback(async () => {
    setDeployError(null);
    const client = await ensureNetworkAndWallet();

    if (
      !PROJECT_MILESTONE_TRACKER_BYTECODE ||
      PROJECT_MILESTONE_TRACKER_BYTECODE === '0x' ||
      PROJECT_MILESTONE_TRACKER_BYTECODE.length < 10
    ) {
      throw new Error('Contract bytecode not compiled. Run `npm run compile:contract`.');
    }

    setIsDeploying(true);
    try {
      const txHash = await client.deployContract({
        abi: PROJECT_MILESTONE_TRACKER_ABI,
        bytecode: PROJECT_MILESTONE_TRACKER_BYTECODE,
        account: client.account,
      });

      const receipt = await botchainPublicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      if (!receipt.contractAddress) {
        throw new Error('Deployment succeeded but no contract address was returned in receipt.');
      }

      const deployedAddr = receipt.contractAddress as Address;
      localStorage.setItem(CONTRACT_STORAGE_KEY, deployedAddr);
      setContractAddressState(deployedAddr);
      setIsContractVerifiedOnChain(true);
      setProjectCount(0);
      setProjects([]);

      recordLocalActivity({
        id: `${txHash}-deploy`,
        type: 'CONTRACT_DEPLOYED',
        actor: client.account.address,
        txHash,
        timestamp: Math.floor(Date.now() / 1000),
        blockNumber: Number(receipt.blockNumber),
      });

      return { contractAddress: deployedAddr, txHash };
    } catch (err: any) {
      const msg =
        err?.shortMessage || err?.message || 'Failed to deploy ProjectMilestoneTracker';
      setDeployError(msg);
      throw err;
    } finally {
      setIsDeploying(false);
    }
  }, [ensureNetworkAndWallet, recordLocalActivity]);

  const createProjectOnChain = useCallback(
    async (name: string, description: string, initialMilestones: string[]) => {
      if (!contractAddress || !isAddress(contractAddress)) {
        throw new Error('Smart contract address is not configured.');
      }
      const client = await ensureNetworkAndWallet();
      const cleanedMilestones = initialMilestones
        .map((m) => m.trim())
        .filter((m) => m.length > 0);

      const txHash =
        cleanedMilestones.length > 0
          ? await client.writeContract({
              address: contractAddress,
              abi: PROJECT_MILESTONE_TRACKER_ABI,
              functionName: 'createProjectWithMilestones',
              args: [name.trim(), description.trim(), cleanedMilestones],
              account: client.account,
            })
          : await client.writeContract({
              address: contractAddress,
              abi: PROJECT_MILESTONE_TRACKER_ABI,
              functionName: 'createProject',
              args: [name.trim(), description.trim()],
              account: client.account,
            });

      const receipt = await botchainPublicClient.waitForTransactionReceipt({ hash: txHash });

      let createdProjectId = projectCount + 1;
      try {
        const logs = parseEventLogs({
          abi: PROJECT_MILESTONE_TRACKER_ABI,
          logs: receipt.logs,
          eventName: 'ProjectCreated',
        });
        if (logs.length > 0 && (logs[0].args as any)?.projectId) {
          createdProjectId = Number((logs[0].args as any).projectId);
        }
      } catch {
        // fallback to latest count
      }

      const now = Math.floor(Date.now() / 1000);
      recordLocalActivity({
        id: `${txHash}-project-${createdProjectId}`,
        type: 'PROJECT_CREATED',
        projectId: createdProjectId,
        projectName: name.trim(),
        actor: client.account.address,
        txHash,
        timestamp: now,
        blockNumber: Number(receipt.blockNumber),
      });

      cleanedMilestones.forEach((mName, idx) => {
        recordLocalActivity({
          id: `${txHash}-added-${createdProjectId}-${idx}`,
          type: 'MILESTONE_ADDED',
          projectId: createdProjectId,
          projectName: name.trim(),
          milestoneIndex: idx,
          milestoneName: mName,
          actor: client.account.address,
          txHash,
          timestamp: now,
          blockNumber: Number(receipt.blockNumber),
        });
      });

      await refreshProjects();
      return { projectId: createdProjectId, txHash };
    },
    [contractAddress, ensureNetworkAndWallet, projectCount, recordLocalActivity, refreshProjects]
  );

  const addMilestoneOnChain = useCallback(
    async (projectId: number, milestoneName: string, projectName?: string) => {
      if (!contractAddress || !isAddress(contractAddress)) {
        throw new Error('Smart contract address is not configured.');
      }
      const client = await ensureNetworkAndWallet();

      const txHash = await client.writeContract({
        address: contractAddress,
        abi: PROJECT_MILESTONE_TRACKER_ABI,
        functionName: 'addMilestone',
        args: [BigInt(projectId), milestoneName.trim()],
        account: client.account,
      });

      const receipt = await botchainPublicClient.waitForTransactionReceipt({ hash: txHash });

      let milestoneIndex = 0;
      try {
        const logs = parseEventLogs({
          abi: PROJECT_MILESTONE_TRACKER_ABI,
          logs: receipt.logs,
          eventName: 'MilestoneAdded',
        });
        if (logs.length > 0 && (logs[0].args as any)?.milestoneIndex !== undefined) {
          milestoneIndex = Number((logs[0].args as any).milestoneIndex);
        }
      } catch {
        // ignore
      }

      recordLocalActivity({
        id: `${txHash}-added-${projectId}-${milestoneIndex}`,
        type: 'MILESTONE_ADDED',
        projectId,
        projectName,
        milestoneIndex,
        milestoneName: milestoneName.trim(),
        actor: client.account.address,
        txHash,
        timestamp: Math.floor(Date.now() / 1000),
        blockNumber: Number(receipt.blockNumber),
      });

      await refreshProjects();
      return { txHash };
    },
    [contractAddress, ensureNetworkAndWallet, recordLocalActivity, refreshProjects]
  );

  const completeMilestoneOnChain = useCallback(
    async (
      projectId: number,
      milestoneIndex: number,
      milestoneName?: string,
      projectName?: string
    ) => {
      if (!contractAddress || !isAddress(contractAddress)) {
        throw new Error('Smart contract address is not configured.');
      }
      const client = await ensureNetworkAndWallet();

      const txHash = await client.writeContract({
        address: contractAddress,
        abi: PROJECT_MILESTONE_TRACKER_ABI,
        functionName: 'completeMilestone',
        args: [BigInt(projectId), BigInt(milestoneIndex)],
        account: client.account,
      });

      const receipt = await botchainPublicClient.waitForTransactionReceipt({ hash: txHash });

      recordLocalActivity({
        id: `${txHash}-completed-${projectId}-${milestoneIndex}`,
        type: 'MILESTONE_COMPLETED',
        projectId,
        projectName,
        milestoneIndex,
        milestoneName,
        actor: client.account.address,
        txHash,
        timestamp: Math.floor(Date.now() / 1000),
        blockNumber: Number(receipt.blockNumber),
      });

      await refreshProjects();
      return { txHash };
    },
    [contractAddress, ensureNetworkAndWallet, recordLocalActivity, refreshProjects]
  );

  return (
    <MilestoneChainContext.Provider
      value={{
        contractAddress,
        isContractVerifiedOnChain,
        isCheckingBytecode,
        projectCount,
        totalMilestonesCreated,
        totalMilestonesCompleted,
        projects,
        isLoadingProjects,
        activityLogs,
        isLoadingActivity,
        setContractAddress,
        deployTrackerContract,
        isDeploying,
        deployError,
        refreshProjects,
        fetchProjectById,
        createProjectOnChain,
        addMilestoneOnChain,
        completeMilestoneOnChain,
        isConfigModalOpen,
        setIsConfigModalOpen,
        shareModalProject,
        setShareModalProject,
      }}
    >
      {children}
    </MilestoneChainContext.Provider>
  );
};

export function useMilestoneChain(): MilestoneChainContextValue {
  const ctx = useContext(MilestoneChainContext);
  if (!ctx) {
    throw new Error('useMilestoneChain must be used inside MilestoneChainProvider');
  }
  return ctx;
}
