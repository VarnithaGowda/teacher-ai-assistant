/**
 * pages/Rubric.jsx - AI Rubric Generator
 */

import { useState, useEffect } from 'react'
import { rubricAPI } from '../services/api'
import { Card, CardHeader } from '../components/Card'
import { AIGeneratingLoader } from '../components/LoadingSpinner'
import MarkdownRenderer from '../components/MarkdownRenderer'
import { ClipboardList, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

const ASSIGNMENT_TYPES = ['essay', 'coding', 'presentation', 'quiz', 'project']

function RubricCard({ rubric, expanded, onToggle }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div>
          <p className="font-medium text-gray-800">{rubric.assignment_title}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            {rubric.assignment_type} · {rubric.total_marks} marks
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{new Date(rubric.created_at).toLocaleDateString()}</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100">
          <MarkdownRenderer content={rubric.rubric} className="mt-4" />
        </div>
      )}
    </div>
  )
}

export default function Rubric() {
  const [form, setForm] = useState({
    assignment_title: '', assignment_type: 'essay', subject: '',
    grade_level: '', total_marks: 50, description: ''
  })
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    rubricAPI.list().then(res => setHistory(res.data)).catch(() => {})
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGenerating(true)
    setResult(null)
    try {
      const res = await rubricAPI.generate({
        ...form,
        total_marks: parseInt(form.total_marks),
      })
      setResult(res.data)
      setHistory(prev => [res.data, ...prev])
      toast.success('Rubric generated!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Rubric Generator</h1>
        <p className="text-gray-500 text-sm mt-1">Create detailed grading rubrics for any assignment type</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="New Rubric" icon={ClipboardList} />
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Assignment Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="assignment_title" required value={form.assignment_title} onChange={handleChange}
                  placeholder="e.g. Python OOP Project"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Assignment Type</label>
                <select
                  name="assignment_type" value={form.assignment_type} onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {ASSIGNMENT_TYPES.map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                  <input
                    name="subject" value={form.subject} onChange={handleChange}
                    placeholder="Computer Science"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Grade Level</label>
                  <input
                    name="grade_level" value={form.grade_level} onChange={handleChange}
                    placeholder="Grade 11"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Marks</label>
                <input
                  name="total_marks" type="number" min="10" max="100"
                  value={form.total_marks} onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  name="description" value={form.description} onChange={handleChange}
                  placeholder="Brief description of the assignment..."
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit" disabled={generating}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                {generating
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
                  : <><Plus className="w-4 h-4" /> Generate Rubric</>
                }
              </button>
            </form>
          </Card>
        </div>

        {/* Result */}
        <div className="lg:col-span-3 space-y-4">
          {generating && <AIGeneratingLoader message="Creating your rubric..." />}

          {result && !generating && (
            <Card>
              <CardHeader
                title={result.assignment_title}
                subtitle={`${result.assignment_type} · ${result.total_marks} marks`}
                icon={ClipboardList}
              />
              <div className="p-5">
                <MarkdownRenderer content={result.rubric} />
              </div>
            </Card>
          )}

          {!generating && !result && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Previous Rubrics</h3>
              {history.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400 text-sm">
                  No rubrics yet. Generate your first one!
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map(r => (
                    <RubricCard
                      key={r.id}
                      rubric={r}
                      expanded={expandedId === r.id}
                      onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
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
