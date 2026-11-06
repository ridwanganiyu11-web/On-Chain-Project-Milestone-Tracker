import { BOTCHAIN_EXPLORER_URL } from '../config/web3';

export function shortenAddress(address?: string | null, chars = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatTimestamp(unixSeconds?: bigint | number | null): string {
  if (!unixSeconds) return 'Pending';
  const num = typeof unixSeconds === 'bigint' ? Number(unixSeconds) : unixSeconds;
  if (!num || num <= 0) return 'Pending';
  const date = new Date(num * 1000);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(unixSeconds?: bigint | number | null): string {
  if (!unixSeconds) return '';
  const num = typeof unixSeconds === 'bigint' ? Number(unixSeconds) : unixSeconds;
  if (!num || num <= 0) return '';
  const diffSeconds = Math.floor(Date.now() / 1000) - num;
  if (diffSeconds < 60) return 'Just now';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  return `${Math.floor(diffSeconds / 86400)}d ago`;
}

export function calculateProgress(completedCount: number, totalCount: number): number {
  if (!totalCount || totalCount <= 0) return 0;
  return Math.round((completedCount / totalCount) * 100);
}

export function getExplorerTxUrl(txHash: string): string {
  return `${BOTCHAIN_EXPLORER_URL}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `${BOTCHAIN_EXPLORER_URL}/address/${address}`;
}

export interface ProjectTemplate {
  label: string;
  name: string;
  description: string;
  milestones: string[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    label: 'Website Development (Spec Example)',
    name: 'Website Development',
    description:
      'End-to-end client website design, frontend implementation, backend API integration, and production launch.',
    milestones: [
      'Design the website',
      'Build the frontend',
      'Connect the backend',
      'Launch the website',
    ],
  },
  {
    label: 'Standard Software Lifecycle',
    name: 'Full-Stack Product Launch',
    description:
      'Five-stage product delivery roadmap with on-chain milestone verification on Botchain.',
    milestones: ['Research', 'Design', 'Development', 'Testing', 'Launch'],
  },
  {
    label: 'Web3 Smart Contract & DApp',
    name: 'DeFi Protocol & Audit',
    description:
      'Solidity smart contract architecture, unit testing, security review, and Botchain deployment.',
    milestones: [
      'Smart contract specification',
      'Solidity implementation & tests',
      'Security review & gas optimization',
      'Botchain Testnet deployment',
    ],
  },
  {
    label: 'Community Grant Initiative',
    name: 'Botchain Ecosystem Grant',
    description:
      'Transparent grant milestone tracking for community contributors and ecosystem reviewers.',
    milestones: [
      'Architecture & technical proposal',
      'MVP prototype release',
      'Public beta & user feedback',
      'Final documentation & launch',
    ],
  },
];

export const ILLUSTRATIVE_PREVIEW_PROJECT = {
  name: 'Website Development',
  ownerDisplay: '0x72...A91F',
  ownerFull: '0x7284B90C32E14d1289bF409C182930485712A91F',
  description:
    'Client website redesign and full-stack deployment tracked with verifiable milestone timestamps.',
  progress: 50,
  milestones: [
    { index: 0, name: 'Website design', completed: true, completedAtLabel: 'Verified On-Chain' },
    {
      index: 1,
      name: 'Frontend development',
      completed: true,
      completedAtLabel: 'Verified On-Chain',
    },
    { index: 2, name: 'Backend integration', completed: false, completedAtLabel: 'Pending' },
    { index: 3, name: 'Website launch', completed: false, completedAtLabel: 'Pending' },
  ],
};

