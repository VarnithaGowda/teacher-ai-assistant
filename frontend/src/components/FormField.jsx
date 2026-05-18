/**
 * components/FormField.jsx - Reusable form input components
 */

export function FormField({ label, error, required, children, hint }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
        placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-400
        ${className}`}
      {...props}
    />
  )
}

export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
        bg-white disabled:bg-gray-50
        ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
        placeholder:text-gray-400 resize-y min-h-[100px]
        ${className}`}
      {...props}
    />
  )
}

export function Button({ children, loading, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary:   'bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-indigo-300',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50',
    danger:    'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-300',
    outline:   'border border-indigo-600 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50',
  }
  return (
    <button
      disabled={loading || props.disabled}
      className={`
        flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
        transition-colors duration-150 disabled:cursor-not-allowed
        ${variants[variant]} ${className}
      `}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
