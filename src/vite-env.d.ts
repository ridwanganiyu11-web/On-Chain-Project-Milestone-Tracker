/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REOWN_PROJECT_ID?: string;
  readonly VITE_BOTCHAIN_CHAIN_ID?: string;
  readonly VITE_BOTCHAIN_RPC_URL?: string;
  readonly VITE_BOTCHAIN_EXPLORER_URL?: string;
  readonly VITE_MILESTONE_CONTRACT_ADDRESS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

