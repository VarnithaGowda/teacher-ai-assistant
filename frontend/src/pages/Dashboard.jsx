/**
 * pages/Dashboard.jsx - Teacher dashboard with stats and recent activity
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { analyticsAPI } from '../services/api'
import { StatCard } from '../components/Card'
import { PageLoader } from '../components/LoadingSpinner'
import {
  BookOpen, ClipboardList, UserCheck, FileText,
  TrendingUp, ArrowRight, Sparkles, MessageSquare
} from 'lucide-react'

const quickActions = [
  { label: 'Generate Lesson Plan', path: '/lesson-plan', icon: BookOpen, color: 'bg-indigo-500' },
  { label: 'Create Rubric',        path: '/rubric',      icon: ClipboardList, color: 'bg-purple-500' },
  { label: 'Evaluate Student',     path: '/evaluation',  icon: UserCheck, color: 'bg-green-500' },
  { label: 'Ask AI Chatbot',       path: '/chatbot',     icon: MessageSquare, color: 'bg-amber-500' },
]

function ActivityBadge({ type }) {
  const map = {
    lesson_plan: { label: 'Lesson Plan', cls: 'bg-indigo-100 text-indigo-700' },
    rubric:      { label: 'Rubric',      cls: 'bg-purple-100 text-purple-700' },
    evaluation:  { label: 'Evaluation',  cls: 'bg-green-100 text-green-700' },
  }
  const { label, cls } = map[type] || { label: type, cls: 'bg-gray-100 text-gray-700' }
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsAPI.getSummary()
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader message="Loading dashboard..." />

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Here's what's happening with your AI teaching tools
          </p>
        </div>
        <Link
          to="/workflow"
          className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Run AI Workflow
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Lesson Plans"  value={stats?.total_lesson_plans ?? 0}  icon={BookOpen}     color="indigo" />
        <StatCard label="Rubrics"       value={stats?.total_rubrics ?? 0}        icon={ClipboardList} color="purple" />
        <StatCard label="Evaluations"   value={stats?.total_evaluations ?? 0}    icon={UserCheck}    color="green" />
        <StatCard label="Avg Score"     value={stats?.average_score ? `${stats.average_score}%` : 'N/A'} icon={TrendingUp} color="amber" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(({ label, path, icon: Icon, color }) => (
            <Link
              key={path}
              to={path}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-indigo-200 transition-all group"
            >
              <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">
                {label}
              </p>
              <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-indigo-500 mt-1 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Recent Activity</h2>
          <Link to="/analytics" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {stats?.recent_activity?.length > 0 ? (
            stats.recent_activity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <ActivityBadge type={item.type} />
                <p className="text-sm text-gray-700 flex-1 truncate">{item.title}</p>
                {item.grade && (
                  <span className="text-xs font-bold text-gray-500">{item.grade}</span>
                )}
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                </span>
              </div>
            ))
          ) : (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">
              No activity yet. Start by generating a lesson plan!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
