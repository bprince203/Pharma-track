import { BATCH_STATUS, EVENT_TYPES, VERDICT } from '../utils/constants.js'

export type BatchStatus  = typeof BATCH_STATUS[keyof typeof BATCH_STATUS]
export type EventType    = typeof EVENT_TYPES[keyof typeof EVENT_TYPES]
export type VerdictType  = typeof VERDICT[keyof typeof VERDICT]

export interface Batch {
  id:              string
  onChainId:       string
  medicineName:    string
  batchNumber:     string
  manufactureDate: Date
  expiryDate:      Date
  totalStrips:     number
  status:          BatchStatus
  qrImageUrl:      string | null
  txHash:          string | null
  isExpired:       boolean
  isFlagged:       boolean
  manufacturerId:  string
  createdAt:       Date
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
  createdAt:        Date
}

export interface SaleToken {
  id:          string
  onChainId:   string
  tabletsSold: number
  qrImageUrl:  string | null
  txHash:      string | null
  stripId:     string
  pharmacyId:  string
  createdAt:   Date
}

export interface SupplyChainEvent {
  id:        string
  eventType: EventType
  actorName: string
  actorCity: string | null
  txHash:    string | null
  batchId:   string
  actorId:   string | null
  timestamp: Date
}

export interface VerifyResult {
  verdict:  VerdictType
  batch: {
    medicineName:    string
    batchNumber:     string
    manufacturer:    string
    manufactureDate: string
    expiryDate:      string
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
