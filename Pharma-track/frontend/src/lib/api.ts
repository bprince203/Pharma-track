// ─── API Client for PharmaTrack Backend ───────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'

// ─── Token storage ────────────────────────────────────────────────────────────

export const getToken = (): string | null => localStorage.getItem('pharmatrack_token')
export const setToken = (token: string): void => localStorage.setItem('pharmatrack_token', token)
export const clearToken = (): void => localStorage.removeItem('pharmatrack_token')

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10_000) // 10s timeout

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Handle 401 — clear auth and redirect
    if (res.status === 401) {
      clearToken()
      localStorage.removeItem('pharmatrack_store')
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.href = '/'
      }
      throw new Error('Session expired — please sign in again')
    }

    const json = await res.json() as {
      success: boolean
      message: string
      data: T
      errors?: Record<string, string[]>
    }

    if (!res.ok) {
      const message = json?.message ?? `HTTP ${res.status}`
      throw new Error(message)
    }

    return json.data
  } catch (err) {
    clearTimeout(timeoutId)
    if ((err as Error).name === 'AbortError') {
      throw new Error('Request timed out')
    }
    throw err
  }
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  getNonce: (walletAddress: string) =>
    apiFetch<{ nonce: string; expiresAt: string }>(`/api/auth/nonce/${walletAddress}`),

  verifySignature: (walletAddress: string, signature: string) =>
    apiFetch<{ actor: Actor; token: string }>('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature }),
    }),
}

// ─── Batch API ────────────────────────────────────────────────────────────────

export const batchApi = {
  create: (data: CreateBatchInput) =>
    apiFetch<BatchCreateResponse>('/api/batch/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  list: () =>
    apiFetch<BatchWithDetails[]>('/api/batch/list'),

  getById: (batchId: string) =>
    apiFetch<BatchWithDetails>(`/api/batch/${batchId}`),

  getIncoming: () =>
    apiFetch<BatchWithDetails[]>('/api/batch/incoming'),
}

// ─── Transfer API ─────────────────────────────────────────────────────────────

export const transferApi = {
  toDistributor: (batchId: string, distributorWallet: string) =>
    apiFetch<TransferResponse>('/api/transfer/to-distributor', {
      method: 'POST',
      body: JSON.stringify({ batchId, distributorWallet }),
    }),

  toPharmacy: (batchId: string, pharmacyWallet: string) =>
    apiFetch<TransferResponse>('/api/transfer/to-pharmacy', {
      method: 'POST',
      body: JSON.stringify({ batchId, pharmacyWallet }),
    }),

  confirmReceipt: (batchId: string) =>
    apiFetch<ConfirmReceiptResponse>('/api/transfer/confirm-receipt', {
      method: 'POST',
      body: JSON.stringify({ batchId }),
    }),
}

// ─── Strip API ────────────────────────────────────────────────────────────────

export const stripApi = {
  getById: (stripId: string) =>
    apiFetch<StripWithBatch>(`/api/strip/${stripId}`),

  getInventory: () =>
    apiFetch<StripWithBatch[]>('/api/strip/inventory'),
}

// ─── Sale API ─────────────────────────────────────────────────────────────────

export const saleApi = {
  generateToken: (stripId: string, tabletsSold: number) =>
    apiFetch<SaleTokenResponse>('/api/sale/generate-token', {
      method: 'POST',
      body: JSON.stringify({ stripId, tabletsSold }),
    }),

  getRecent: () =>
    apiFetch<SaleToken[]>('/api/sale/recent'),
}

// ─── Verify API ───────────────────────────────────────────────────────────────

export const verifyApi = {
  verifyToken: (tokenId: string) =>
    apiFetch<VerifyResult>(`/api/verify/${tokenId}`),

  reportCounterfeit: (reportedQR: string, city?: string) =>
    apiFetch<ReportResponse>('/api/verify/report', {
      method: 'POST',
      body: JSON.stringify({ reportedQR, city }),
    }),
}

// ─── Stats API ────────────────────────────────────────────────────────────────

export const statsApi = {
  getGlobal: () =>
    apiFetch<GlobalStats>('/api/stats/global'),
}

// ─── Health check ─────────────────────────────────────────────────────────────

export const healthCheck = () =>
  apiFetch<{ status: string; timestamp: string; env: string }>('/health')

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActorRole = 'MANUFACTURER' | 'DISTRIBUTOR' | 'PHARMACY' | 'ADMIN'

export interface Actor {
  id:            string
  walletAddress: string
  role:          ActorRole
  name:          string
  licenseNumber: string | null
  city:          string | null
  isVerified:    boolean
  createdAt:     string
}

export interface CreateBatchInput {
  medicineName: string
  batchNumber:  string
  expiryDate:   string  // ISO 8601
  totalStrips:  number
}

export interface BatchCreateResponse {
  batch:       BatchWithDetails
  stripsCount: number
  batchQrUrl:  string
  stripQrUrls: string[]
}

export interface BatchWithDetails {
  id:              string
  onChainId:       string
  medicineName:    string
  batchNumber:     string
  manufactureDate: string
  expiryDate:      string
  totalStrips:     number
  status:          'MANUFACTURED' | 'WITH_DISTRIBUTOR' | 'WITH_PHARMACY' | 'PARTIALLY_SOLD' | 'FULLY_SOLD'
  qrImageUrl:      string | null
  txHash:          string | null
  isExpired:       boolean
  isFlagged:       boolean
  manufacturerId:  string
  createdAt:       string
  manufacturer?:   Partial<Actor>
  strips?:         Strip[]
  events?:         SupplyChainEvent[]
}

export interface Strip {
  id:               string
  onChainId:        string
  stripNumber:      number
  tabletsTotal:     number
  tabletsRemaining: number
  qrImageUrl:       string | null
  isSold:           boolean
  batchId:          string
  createdAt:        string
}

export interface StripWithBatch extends Strip {
  batch?: Partial<BatchWithDetails>
}

export interface SaleToken {
  id:          string
  onChainId:   string
  tabletsSold: number
  qrImageUrl:  string | null
  txHash:      string | null
  stripId:     string
  pharmacyId:  string
  createdAt:   string
  strip?:      StripWithBatch
}

export interface SaleTokenResponse {
  token:            SaleToken
  qrImageUrl:       string
  qrDataUrl:        string
  txHash:           string | null
  tabletsRemaining: number
  tokenOnChainId:   string
}

export interface SupplyChainEvent {
  id:        string
  eventType: 'MANUFACTURED' | 'DISTRIBUTOR_RECEIVED' | 'PHARMACY_RECEIVED' | 'SOLD'
  actorName: string
  actorCity: string | null
  txHash:    string | null
  batchId:   string
  actorId:   string | null
  timestamp: string
}

export interface TransferResponse {
  txHash:           string
  supplyChainEvent: SupplyChainEvent
}

export interface ConfirmReceiptResponse {
  eventType:        string
  supplyChainEvent: SupplyChainEvent
}

export interface VerifyResult {
  verdict:   'AUTHENTIC' | 'EXPIRED' | 'COUNTERFEIT' | 'UNREGISTERED'
  isGenuine: boolean       // derived: verdict === 'AUTHENTIC'
  tabletsSold: number | null
  batch: {
    medicineName:    string
    batchNumber:     string
    manufacturer:    string
    manufactureDate: string
    expiryDate:      string
    totalStrips:     number
    status:          string
    txHash:          string | null
  } | null
  strip: {
    stripNumber:  number
    tabletsSold:  number
    tabletsTotal: number
  } | null
  events:  SupplyChainEvent[]
  txHash:  string | null
  cached?: boolean
}

export interface ReportResponse {
  report:       unknown
  reportCount:  number
  batchFlagged: boolean
}

export interface GlobalStats {
  totalBatches:       number
  totalVerifications: number
  flaggedBatches:     number
  totalSaleTokens:    number
  cached?:            boolean
}
