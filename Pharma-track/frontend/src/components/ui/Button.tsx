export default function Button({ className = '', children, ...rest }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
