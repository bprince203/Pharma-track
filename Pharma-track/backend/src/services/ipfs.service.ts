import { config } from '../utils/config.js'

export const uploadToIPFS = async (
  buffer: Buffer,
  filename: string
): Promise<string> => {
  if (!config.web3StorageToken) {
    console.warn('[IPFS] WEB3_STORAGE_TOKEN not set — skipping IPFS upload')
    return `https://placeholder.ipfs.io/${filename}`
  }

  try {
    const formData = new FormData()
    const blob     = new Blob([new Uint8Array(buffer)], { type: 'image/png' })
    formData.append('file', blob, filename)

    const res = await fetch('https://api.web3.storage/upload', {
      method:  'POST',
      headers: {
        Authorization: `Bearer ${config.web3StorageToken}`,
      },
      body: formData,
    })

    if (!res.ok) {
      throw new Error(`web3.storage upload failed: ${res.statusText}`)
    }

    const data = await res.json() as { cid: string }
    return `https://${data.cid}.ipfs.w3s.link/${filename}`
  } catch (err) {
    console.error('[IPFS] Upload failed:', err)
    return `https://placeholder.ipfs.io/${filename}`
  }
}
