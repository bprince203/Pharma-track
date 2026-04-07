import type { ReactNode } from 'react'

export type WithChildren<T = {}> = T & {
  children?: ReactNode
}

export type Nullable<T> = T | null
export type Optional<T> = T | undefined
