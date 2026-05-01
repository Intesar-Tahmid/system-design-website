'use client'
import { useEffect, useState } from 'react'

interface ProgressBarProps {
  value: number
  max: number
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md'
  color?: string
}

export function ProgressBar({ value, max, className = '', showLabel = false, size = 'md', color = 'bg-indigo-500' }: ProgressBarProps) {
  const [width, setWidth] = useState(0)
  const percent = max > 0 ? Math.round((value / max) * 100) : 0

  useEffect(() => {
    const timer = setTimeout(() => setWidth(percent), 100)
    return () => clearTimeout(timer)
  }, [percent])

  const height = size === 'sm' ? 'h-1.5' : 'h-2'

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>{value} / {max}</span>
          <span>{percent}%</span>
        </div>
      )}
      <div className={`w-full ${height} bg-slate-200 rounded-full overflow-hidden`}>
        <div
          className={`${height} ${color} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}
