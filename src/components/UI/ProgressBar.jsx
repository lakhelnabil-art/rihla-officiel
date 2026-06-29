import React from 'react'

const trackH = { xs: 'h-1', sm: 'h-1.5', md: 'h-2', lg: 'h-3', xl: 'h-4' }

const resolveColor = (pct, color) => {
  if (color && color !== 'auto') return color
  if (pct >= 100) return 'bg-green-500'
  if (pct >= 70)  return 'bg-primary-600'
  if (pct >= 40)  return 'bg-amber-500'
  return 'bg-red-500'
}

export const ProgressBar = ({
  value,
  max = 100,
  color = 'auto',
  size = 'md',
  showLabel = false,
  label,
  animated = false,
  className = '',
}) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const h   = trackH[size] ?? trackH.md
  const fill = resolveColor(pct, color)

  return (
    <div className={`w-full ${className}`}>
      {(label || showLabel) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs font-medium text-slate-600">{label}</span>}
          {showLabel && <span className="text-xs text-slate-500 tabular-nums">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${h}`}>
        <div
          className={`${fill} ${h} rounded-full transition-all duration-500 ease-out ${animated ? 'animate-pulse' : ''}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}

/** Stacked / segmented variant — pass an array of { value, color, label }. */
export const SegmentedBar = ({ segments = [], total, className = '' }) => {
  const sum = total ?? segments.reduce((a, s) => a + s.value, 0)
  return (
    <div className={`flex w-full h-2.5 rounded-full overflow-hidden gap-px ${className}`}>
      {segments.map((s, i) => (
        <div
          key={i}
          className={`${s.color ?? 'bg-primary-600'} transition-all duration-500`}
          style={{ width: `${(s.value / sum) * 100}%` }}
          title={s.label ? `${s.label}: ${s.value}` : undefined}
        />
      ))}
    </div>
  )
}
