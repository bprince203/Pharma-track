import QRCode from 'qrcode'
import { config } from '../utils/config.js'

const VERIFY_BASE = `${config.frontendUrl}/verify`

export type QRFormat = 'dataURL' | 'buffer'


export const generateBatchQR = async (batchOnChainId: string): Promise<string> => {
  const url = `${VERIFY_BASE}/batch/${batchOnChainId}`
  return QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' },
    errorCorrectionLevel: 'H',
  })
}


export const generateStripQR = async (stripOnChainId: string): Promise<string> => {
  const url = `${VERIFY_BASE}/strip/${stripOnChainId}`
  return QRCode.toDataURL(url, {
    width: 250,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' },
    errorCorrectionLevel: 'M',
  })
}


export const generateSaleTokenQR = async (tokenOnChainId: string): Promise<string> => {
  const url = `${VERIFY_BASE}/token/${tokenOnChainId}`
  return QRCode.toDataURL(url, {
    width: 350,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' },
    errorCorrectionLevel: 'H',
  })
}


export const dataURLToBuffer = (dataURL: string): Buffer => {
  const base64 = dataURL.replace(/^data:image\/png;base64,/, '')
  return Buffer.from(base64, 'base64')
}
