import fs from 'node:fs';
import path from 'node:path';
import solc from 'solc';
import { createWalletClient, createPublicClient, http, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// Load .env
const envPath = path.resolve('.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && !process.env[key]) {
      process.env[key] = val;
    }
  }
}

const rpcUrl = process.env.VITE_BOTCHAIN_RPC_URL || 'https://rpc.bohr.life';
const contractAddress = process.env.VITE_MILESTONE_CONTRACT_ADDRESS;

const botchainTestnet = defineChain({
  id: 968,
  name: 'Botchain Testnet',
  nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
  rpcUrls: { default: { http: [rpcUrl] } },
  blockExplorers: { default: { name: 'Botchain Explorer', url: 'https://scan.bohr.life' } },
  testnet: true,
});

function getAbi() {
  const source = fs.readFileSync(path.resolve('contracts/ProjectMilestoneTracker.sol'), 'utf8');
  const input = {
    language: 'Solidity',
    sources: { 'ProjectMilestoneTracker.sol': { content: source } },
    settings: { outputSelection: { '*': { '*': ['abi'] } } },
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  return output.contracts['ProjectMilestoneTracker.sol']['ProjectMilestoneTracker'].abi;
}

async function main() {
  const pk = (process.env.PRIVATE_KEY || '').trim();
  if (!pk || !contractAddress) {
    console.log('Skipping seed: missing PRIVATE_KEY or VITE_MILESTONE_CONTRACT_ADDRESS');
    return;
  }

  const abi = getAbi();
  const formattedPk = pk.startsWith('0x') ? pk : `0x${pk}`;
  const account = privateKeyToAccount(formattedPk);

  const publicClient = createPublicClient({ chain: botchainTestnet, transport: http(rpcUrl) });
  const walletClient = createWalletClient({
    account,
    chain: botchainTestnet,
    transport: http(rpcUrl),
  });

  const existingCount = await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: 'getProjectCount',
  });

  if (Number(existingCount) > 0) {
    console.log(`Contract already has ${existingCount} project(s). Skipping seed.`);
    return;
  }

  console.log('Seeding Project #1 ("Website Development") on Botchain Testnet...');
  const createHash = await walletClient.writeContract({
    address: contractAddress,
    abi,
    functionName: 'createProjectWithMilestones',
    args: [
      'Website Development',
      'End-to-end client website design, frontend build, backend API integration, and production launch.',
      [
        'Design the website',
        'Build the frontend',
        'Connect the backend',
        'Launch the website',
      ],
    ],
  });
  await publicClient.waitForTransactionReceipt({ hash: createHash });
  console.log('Created Project #1:', createHash);

  console.log('Marking Milestone #0 ("Design the website") completed...');
  const m0Hash = await walletClient.writeContract({
    address: contractAddress,
    abi,
    functionName: 'completeMilestone',
    args: [1n, 0n],
  });
  await publicClient.waitForTransactionReceipt({ hash: m0Hash });

  console.log('Marking Milestone #1 ("Build the frontend") completed...');
  const m1Hash = await walletClient.writeContract({
    address: contractAddress,
    abi,
    functionName: 'completeMilestone',
    args: [1n, 1n],
  });
  await publicClient.waitForTransactionReceipt({ hash: m1Hash });

  console.log('Seeded Project #1 (50% complete, 2/4 milestones completed on-chain)!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

