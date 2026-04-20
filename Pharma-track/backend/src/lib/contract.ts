import { ethers, Contract, JsonRpcProvider, Wallet } from 'ethers'
import { config } from '../utils/config.js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)

let ABI: ethers.InterfaceAbi

try {
  const abiPath = join(__dirname, '../../public/abis/PharmaTrack.json')
  const abiFile = JSON.parse(readFileSync(abiPath, 'utf-8')) as { abi: ethers.InterfaceAbi }
  ABI = abiFile.abi
} catch {
  try {
    const abiPath = join(__dirname, '../../public/abis/PharmaTrack.json')
    const mod = await import(abiPath, { with: { type: 'json' } })
    ABI = mod.default.abi
  } catch {
    ABI = []
  }
}

const provider = new JsonRpcProvider(config.polygonRpc)
const signer   = new Wallet(config.privateKey, provider)

export const contract = new Contract(config.contractAddress, ABI, signer)

export const verifyContractConnection = async (): Promise<void> => {
  try {
    const network = await provider.getNetwork()
    console.log(`[CONTRACT] Connected to chain ${network.chainId} (${network.name})`)
    console.log(`[CONTRACT] Contract address: ${config.contractAddress}`)

    const adminRole = await contract.DEFAULT_ADMIN_ROLE()
    console.log(`[CONTRACT] DEFAULT_ADMIN_ROLE: ${adminRole}`)
    console.log('[CONTRACT] ✅ Contract connection verified')
  } catch (err) {
    console.error('[CONTRACT] ⚠️  Contract connection failed:', (err as Error).message)
    console.error('[CONTRACT] The server will start but blockchain features may not work')
  }
}

export const sendTransaction = async (
  txPromise: Promise<ethers.ContractTransactionResponse>
): Promise<ethers.ContractTransactionReceipt> => {
  const tx      = await txPromise
  const receipt = await tx.wait(1)
  if (!receipt) throw new Error('Transaction receipt is null')
  return receipt
}

export const getEventArgs = (
  receipt: ethers.ContractTransactionReceipt,
  eventName: string
): ethers.Result | null => {
  const iface = new ethers.Interface(ABI)
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog({ topics: [...log.topics], data: log.data })
      if (parsed && parsed.name === eventName) {
        return parsed.args
      }
    } catch {
    }
  }
  return null
}

export { provider, signer, ABI }
