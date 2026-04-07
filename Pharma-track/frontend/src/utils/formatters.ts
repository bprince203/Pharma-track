export function formatAddress(addr = '') {
  if (addr.length <= 10) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export function formatDate(value) {
  return new Date(value).toLocaleString()
}
