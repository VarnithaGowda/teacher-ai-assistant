/**
 * components/LoadingSpinner.jsx - Reusable loading states
 */

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={`${sizes[size]} border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin ${className}`} />
  )
}

export function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  )
}

export function AIGeneratingLoader({ message = 'AI is generating...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="relative">
        <LoadingSpinner size="lg" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg">✨</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-indigo-600 font-medium">{message}</p>
        <p className="text-gray-400 text-sm mt-1">This may take 10-30 seconds</p>
      </div>
    </div>
  )
}
