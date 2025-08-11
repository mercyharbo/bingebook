import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import React from 'react'

interface LoadingSpinnerProps {
  size?: number // Optional prop to customize size
  color?: string // Optional prop to customize border color
  className?: string // Optional prop to customize the wrapper div
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 24,
  color = 'border-gray-600 dark:border-white',
  className = '',
}) => {
  return (
    <div className={cn('flex justify-center items-center', className)}>
      <Loader2
        className={cn('h-4 w-4 animate-spin', color)}
        style={{
          height: `${size}px`,
          width: `${size}px`,
        }}
      />
    </div>
  )
}

export default LoadingSpinner
