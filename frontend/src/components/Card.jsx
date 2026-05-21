/**
 * components/Card.jsx - Reusable card components
 */

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, icon: Icon, action }) {
  return (
    <div className="flex items-start justify-between p-5 border-b border-gray-100">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-indigo-600" />
          </div>
        )}
        <div>
          <h2 className="font-semibold text-gray-800">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function StatCard({ label, value, icon: Icon, color = 'indigo', trend }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green:  'bg-green-50 text-green-600',
    amber:  'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    rose:   'bg-rose-50 text-rose-600',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}
