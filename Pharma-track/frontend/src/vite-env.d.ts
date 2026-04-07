/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_CONTRACT_ADDRESS?: string
  readonly VITE_CHAIN_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
