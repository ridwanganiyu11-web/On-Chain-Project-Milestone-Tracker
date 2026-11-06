# MilestoneChain — On-Chain Project Milestone Tracker

> **Track Progress. Prove Completion. Build Trust.**

**MilestoneChain** is a Web3 project milestone tracker built for **Botchain Testnet (Chain ID 968)**. It enables individuals, freelancers, developers, and teams to create public project roadmaps, record milestone completions permanently on-chain via MetaMask, and share wallet-free verification links and QR codes with clients or stakeholders.

---

## 🌐 Botchain Testnet Configuration

| Parameter | Value |
| :--- | :--- |
| **Network Name** | Botchain Testnet |
| **Chain ID** | `968` (`0x3c8`) |
| **RPC URL** | `https://rpc.bohr.life` |
| **Native Token** | `BOT` (18 decimals, Total Supply: 150 Million) |
| **Block Explorer** | `https://scan.bohr.life/` |
| **Deployed Contract (`ProjectMilestoneTracker.sol`)** | `0xb4bb038794fcfda0cbf8e1f9412af89cc4e599da` |

---

## 📜 Smart Contract (`contracts/ProjectMilestoneTracker.sol`)

| Function | Purpose | Access Control |
| :--- | :--- | :--- |
| `createProject(name, description)` | Create a new project; caller wallet becomes project owner | Public (Any wallet) |
| `createProjectWithMilestones(name, description, milestoneNames)` | Create a project and populate initial milestones in 1 transaction | Public (Any wallet) |
| `addMilestone(projectId, name)` | Add a milestone to an existing project | **Project Owner Only** |
| `completeMilestone(projectId, milestoneIndex)` | Mark a milestone completed & record `block.timestamp` | **Project Owner Only** |
| `getProject(projectId)` | Read project metadata, owner address, and progress counts | Read-Only (`view`) |
| `getMilestone(projectId, milestoneIndex)` | Read single milestone details & completion timestamp | Read-Only (`view`) |
| `getProjectMilestones(projectId)` | Read all milestones for a project in a single RPC call | Read-Only (`view`) |
| `getProjectCount()` | Count total registered projects on-chain | Read-Only (`view`) |

---

## 🖥️ Application Pages

1. **Home (`/`)**: Hero overview, live Botchain Testnet stats, Recently Created Public Projects (no wallet required), interactive Illustrative Preview, "How It Works", and "Where the Blockchain Comes In".
2. **Dashboard (`/dashboard`)**: Projects created by the connected wallet, completion metrics, and 1-click completion buttons for next pending milestones.
3. **Create Project (`/create`)**: Create a new project on-chain with character counters for gas optimization and 1-click milestone templates.
4. **Project Details (`/project/:id`)**: Full milestone checklist, progress bar, owner controls to mark milestones completed or add new milestones via MetaMask, QR sharing, and on-chain completion history.
5. **Public Project Page (`/public/:id`)**: Distraction-free public verification page that anyone with the link or QR code can inspect without connecting a wallet.
6. **My Activity (`/activity`)**: Live log of project creations, milestone additions, and milestone completion transactions with direct links to `https://scan.bohr.life/tx/...`.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Compile Solidity contract & run contract verification tests
npm run compile:contract
npm run test:contract

# 3. Start development server
npm run dev

# 4. Build for production
npm run build
```

