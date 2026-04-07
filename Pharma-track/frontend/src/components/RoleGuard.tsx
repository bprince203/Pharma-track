import type { WithChildren } from '../types/common'

export default function RoleGuard({ children }: WithChildren) {
  return <>{children}</>
}
