/**
 * pages/Analytics.jsx - Analytics dashboard with charts
 */

import { useState, useEffect } from 'react'
import { analyticsAPI } from '../services/api'
import { StatCard } from '../components/Card'
import { PageLoader } from '../components/LoadingSpinner'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts'
import { BookOpen, ClipboardList, UserCheck, FileText, TrendingUp } from 'lucide-react'

const GRADE_COLORS = {
  'A+': '#22c55e', 'A': '#4ade80', 'B+': '#60a5fa', 'B': '#93c5fd',
  'C': '#fbbf24', 'D': '#fb923c', 'F': '#f87171',
}

export default function Analytics() {
  const [summary, setSummary] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      analyticsAPI.getSummary(),
      analyticsAPI.getChartData(),
    ]).then(([s, c]) => {
      setSummary(s.data)
      setChartData(c.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader message="Loading analytics..." />

  // Format grade distribution for pie chart
  const gradeData = chartData?.grade_distribution
    ? Object.entries(chartData.grade_distribution).map(([grade, count]) => ({
        name: grade, value: count, fill: GRADE_COLORS[grade] || '#94a3b8'
      }))
    : []

  // Format score trend for line chart
  const trendData = chartData?.score_trend?.map(item => ({
    date: item.date,
    score: item.percentage,
    name: item.student_name,
  })) || []

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Track your teaching activity and student performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Lesson Plans"  value={summary?.total_lesson_plans ?? 0}  icon={BookOpen}     color="indigo" />
        <StatCard label="Rubrics"       value={summary?.total_rubrics ?? 0}        icon={ClipboardList} color="purple" />
        <StatCard label="Evaluations"   value={summary?.total_evaluations ?? 0}    icon={UserCheck}    color="green" />
        <StatCard label="Documents"     value={summary?.total_documents ?? 0}      icon={FileText}     color="amber" />
      </div>

      {/* Average score banner */}
      {summary?.average_score && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-5 text-white flex items-center justify-between">
          <div>
            <p className="text-indigo-200 text-sm">Class Average Score</p>
            <p className="text-4xl font-bold mt-1">{summary.average_score}%</p>
          </div>
          <TrendingUp className="w-12 h-12 text-white/30" />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Grade Distribution</h3>
          {gradeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={gradeData}
                  cx="50%" cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {gradeData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
              No evaluation data yet
            </div>
          )}
        </div>

        {/* Score Trend */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Score Trend (Last 30 Days)</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v}%`, 'Score']} />
                <Line
                  type="monotone" dataKey="score"
                  stroke="#6366f1" strokeWidth={2}
                  dot={{ fill: '#6366f1', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
              No score data yet
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {summary?.recent_activity?.length > 0 ? (
            summary.recent_activity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  item.type === 'lesson_plan' ? 'bg-indigo-500' :
                  item.type === 'evaluation' ? 'bg-green-500' : 'bg-purple-500'
                }`} />
                <p className="text-sm text-gray-700 flex-1">{item.title}</p>
                {item.grade && <span className="text-xs font-bold text-gray-600">{item.grade}</span>}
                <span className="text-xs text-gray-400">
                  {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                </span>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-gray-400 text-sm">No activity yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
