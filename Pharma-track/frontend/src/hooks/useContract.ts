import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../lib/contract'
import type { Abi } from 'viem'

/**
 * Hook for direct contract interactions from the frontend.
 *
 * Note: Most state-changing contract calls go through the backend API,
 * which uses its own ethers.js signer. This hook is for cases where
 * the user needs to sign a transaction directly from their wallet.
 */
export function useContract() {
  const { address, chain } = useAccount()

  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract()

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1,
  })

  const callContract = (functionName: string, args: unknown[]) => {
    if (!address || !chain) return
    writeContract({
      address:      CONTRACT_ADDRESS,
      abi:          CONTRACT_ABI as Abi,
      functionName,
      args,
      chain,
      account:      address,
    })
  }

  return {
    callContract,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    reset,
  }
}
