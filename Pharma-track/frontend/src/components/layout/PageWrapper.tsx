import type { WithChildren } from '../../types/common'

export default function PageWrapper({ children }: WithChildren) {
  return <div className="flex min-h-screen bg-slate-50 text-slate-900">{children}</div>
}
