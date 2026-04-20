import { http, createConfig } from 'wagmi'
import { polygonAmoy, hardhat } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { QueryClient } from '@tanstack/react-query'

// ─── Determine chain ──────────────────────────────────────────────────────────

const chainId = parseInt(import.meta.env.VITE_CHAIN_ID ?? '80002', 10)

// ─── wagmi v2 config ──────────────────────────────────────────────────────────

const rpcUrl = import.meta.env.VITE_POLYGON_RPC || 'https://rpc-amoy.polygon.technology'

export const wagmiConfig = chainId === 31337
  ? createConfig({
      chains: [hardhat],
      connectors: [injected()],
      transports: {
        [hardhat.id]: http('http://127.0.0.1:8545'),
      },
    })
  : createConfig({
      chains: [polygonAmoy],
      connectors: [injected()],
      transports: {
        [polygonAmoy.id]: http(rpcUrl),
      },
    })

// ─── React Query client ──────────────────────────────────────────────────────

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:           1000 * 60 * 5, // 5 minutes
      retry:               2,
      refetchOnWindowFocus: false,
    },
  },
})
