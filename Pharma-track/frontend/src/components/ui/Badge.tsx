export default function Badge({ className = '', children, ...rest }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 ${className}`}
      {...rest}
    >
      {children}
    </span>
  )
}
