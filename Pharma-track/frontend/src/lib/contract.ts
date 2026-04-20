import PharmaTrackABI from '../../public/abis/PharmaTrack.json'

// ─── Contract address ─────────────────────────────────────────────────────────

export const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS ?? '0x0000000000000000000000000000000000000000') as `0x${string}`

// ─── Contract ABI ─────────────────────────────────────────────────────────────

export const CONTRACT_ABI = PharmaTrackABI.abi as readonly unknown[]

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Shorten an Ethereum address for display: 0x1234...abcd
 */
export const shortenAddress = (address: string): string => {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Validate an Ethereum address format
 */
export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Get Polygonscan URL for a transaction hash
 */
export const getExplorerTxUrl = (txHash: string): string => {
  const chainId = parseInt(import.meta.env.VITE_CHAIN_ID ?? '80001', 10)
  if (chainId === 80001) return `https://mumbai.polygonscan.com/tx/${txHash}`
  if (chainId === 137) return `https://polygonscan.com/tx/${txHash}`
  return `#` // local
}

/**
 * Get Polygonscan URL for a contract address
 */
export const getExplorerAddressUrl = (address: string): string => {
  const chainId = parseInt(import.meta.env.VITE_CHAIN_ID ?? '80001', 10)
  if (chainId === 80001) return `https://mumbai.polygonscan.com/address/${address}`
  if (chainId === 137) return `https://polygonscan.com/address/${address}`
  return `#`
}
