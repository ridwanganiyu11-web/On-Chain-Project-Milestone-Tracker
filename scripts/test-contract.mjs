import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import solc from 'solc';

console.log('Running ProjectMilestoneTracker.sol verification suite...');

const contractPath = path.resolve('contracts/ProjectMilestoneTracker.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'ProjectMilestoneTracker.sol': { content: source },
  },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      '*': { '*': ['abi', 'evm.bytecode.object'] },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = (output.errors || []).filter((e) => e.severity === 'error');
assert.equal(errors.length, 0, `Expected 0 Solidity compilation errors, got ${errors.length}`);

const contract = output.contracts['ProjectMilestoneTracker.sol']['ProjectMilestoneTracker'];
assert.ok(contract, 'Contract ProjectMilestoneTracker must exist in compiled output');

const fnNames = contract.abi.filter((item) => item.type === 'function').map((item) => item.name);
const requiredFunctions = [
  'createProject',
  'createProjectWithMilestones',
  'addMilestone',
  'completeMilestone',
  'getProject',
  'getMilestone',
  'getProjectMilestones',
  'getProjectCount',
  'getOwnerProjects',
];

for (const fn of requiredFunctions) {
  assert.ok(fnNames.includes(fn), `Missing required contract function: ${fn}`);
}

const eventNames = contract.abi.filter((item) => item.type === 'event').map((item) => item.name);
for (const ev of ['ProjectCreated', 'MilestoneAdded', 'MilestoneCompleted']) {
  assert.ok(eventNames.includes(ev), `Missing required contract event: ${ev}`);
}

assert.ok(
  contract.evm.bytecode.object.length > 200,
  'Compiled bytecode should be non-empty'
);

console.log('✓ All required Solidity functions & events verified:', requiredFunctions.join(', '));
console.log('✓ Bytecode length:', contract.evm.bytecode.object.length, 'hex chars');

