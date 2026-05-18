/**
 * pages/LessonPlan.jsx - AI Lesson Plan Generator
 */

import { useState, useEffect } from 'react'
import { lessonAPI } from '../services/api'
import { Card, CardHeader } from '../components/Card'
import { AIGeneratingLoader } from '../components/LoadingSpinner'
import MarkdownRenderer from '../components/MarkdownRenderer'
import { BookOpen, Plus, ChevronDown, ChevronUp, Download } from 'lucide-react'
import toast from 'react-hot-toast'

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced']

function PlanCard({ plan, expanded, onToggle }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div>
          <p className="font-medium text-gray-800">{plan.topic}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            {plan.subject} · {plan.grade_level} · {plan.duration_minutes} min · {plan.difficulty}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{new Date(plan.created_at).toLocaleDateString()}</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100">
          <MarkdownRenderer content={plan.lesson_plan} className="mt-4" />
        </div>
      )}
    </div>
  )
}

export default function LessonPlan() {
  const [form, setForm] = useState({
    subject: '', topic: '', grade_level: '', duration_minutes: 60,
    difficulty: 'intermediate', additional_notes: ''
  })
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    lessonAPI.list()
      .then(res => setHistory(res.data))
      .catch(() => {})
      .finally(() => setLoadingHistory(false))
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGenerating(true)
    setResult(null)
    try {
      const res = await lessonAPI.generate({
        ...form,
        duration_minutes: parseInt(form.duration_minutes),
      })
      setResult(res.data)
      setHistory(prev => [res.data, ...prev])
      toast.success('Lesson plan generated!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Lesson Planner</h1>
        <p className="text-gray-500 text-sm mt-1">Generate comprehensive lesson plans in seconds</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="New Lesson Plan" icon={BookOpen} />
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {[
                { name: 'subject', label: 'Subject', placeholder: 'e.g. Mathematics' },
                { name: 'topic', label: 'Topic', placeholder: 'e.g. Quadratic Equations' },
                { name: 'grade_level', label: 'Grade Level', placeholder: 'e.g. Grade 10' },
              ].map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label} <span className="text-red-500">*</span>
                  </label>
                  <input
                    name={name} required value={form[name]} onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (min)</label>
                  <input
                    name="duration_minutes" type="number" min="15" max="180"
                    value={form.duration_minutes} onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Difficulty</label>
                  <select
                    name="difficulty" value={form.difficulty} onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {DIFFICULTIES.map(d => (
                      <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Notes</label>
                <textarea
                  name="additional_notes" value={form.additional_notes} onChange={handleChange}
                  placeholder="Any special requirements or focus areas..."
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit" disabled={generating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                {generating
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
                  : <><Plus className="w-4 h-4" /> Generate Plan</>
                }
              </button>
            </form>
          </Card>
        </div>

        {/* Result */}
        <div className="lg:col-span-3 space-y-4">
          {generating && <AIGeneratingLoader message="Creating your lesson plan..." />}

          {result && !generating && (
            <Card>
              <CardHeader
                title={result.topic}
                subtitle={`${result.subject} · ${result.grade_level}`}
                icon={BookOpen}
              />
              <div className="p-5">
                <MarkdownRenderer content={result.lesson_plan} />
              </div>
            </Card>
          )}

          {!generating && !result && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Previous Lesson Plans</h3>
              {loadingHistory ? (
                <p className="text-sm text-gray-400">Loading...</p>
              ) : history.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400 text-sm">
                  No lesson plans yet. Generate your first one!
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map(plan => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      expanded={expandedId === plan.id}
                      onToggle={() => setExpandedId(expandedId === plan.id ? null : plan.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
