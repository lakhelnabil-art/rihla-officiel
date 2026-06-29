import React from 'react'

const DEFAULT_COLORS = [
  'bg-primary-100 text-primary-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-green-100 text-green-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
]

const initials = (name = '') =>
  name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

const autoColor = (name = '') => {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff
  return DEFAULT_COLORS[hash % DEFAULT_COLORS.length]
}

export const Avatar = ({ name = '', colorClass, size = 'md', className = '' }) => {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' }
  const color = colorClass ?? autoColor(name)
  return (
    <div
      className={`${sizes[size] ?? sizes.md} rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${color} ${className}`}
    >
      {initials(name)}
    </div>
  )
}
