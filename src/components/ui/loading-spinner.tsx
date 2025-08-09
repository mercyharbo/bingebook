// LoadingSpinner.tsx
import React from 'react'

interface LoadingSpinnerProps {
  size?: number // Optional prop to customize size
  borderWidth?: number // Optional prop to customize border width
  color?: string // Optional prop to customize border color
  className?: string // Optional prop to customize the wrapper div
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 8,
  borderWidth = 2,
  color = 'border-primary',
  className = '',
}) => {
  return (
    <div className={`flex justify-center ${className}`}>
      <div
        className={`h-${size} w-${size} border-${borderWidth} ${color} border-t-transparent rounded-full animate-spin`}
        style={{ height: `${size}px`, width: `${size}px` }}
      ></div>
    </div>
  )
}

export default LoadingSpinner
