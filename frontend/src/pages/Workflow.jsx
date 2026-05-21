/**
 * pages/Workflow.jsx - LangGraph Multi-Step AI Workflow
 * Syllabus → Topics → Lesson Plan → Rubric → Assignment
 */

import { useState, useEffect } from 'react'
import { workflowAPI } from '../services/api'
import { Card, CardHeader } from '../components/Card'
import { AIGeneratingLoader } from '../components/LoadingSpinner'
import MarkdownRenderer from '../components/MarkdownRenderer'
import { Workflow, Upload, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const STEPS = [
  { key: 'topics', label: 'Extract Topics', icon: '📚' },
  { key: 'lesson', label: 'Lesson Plan',    icon: '📝' },
  { key: 'rubric', label: 'Rubric',         icon: '📋' },
  { key: 'assign', label: 'Assignment',     icon: '✏️' },
]

function StepIndicator({ currentStatus }) {
  const statusMap = {
    running:              0,
    topics_extracted:     1,
    lesson_plan_generated: 2,
    rubric_generated:     3,
    completed:            4,
  }
  const current = statusMap[currentStatus] ?? 0

  return (
    <div className="flex items-center gap-2 mb-6">
      {STEPS.map((step, i) => (
        <div key={step.key} className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            i < current ? 'bg-green-100 text-green-700' :
            i === current ? 'bg-indigo-100 text-indigo-700' :
            'bg-gray-100 text-gray-400'
          }`}>
            {i < current ? <CheckCircle className="w-3 h-3" /> : <span>{step.icon}</span>}
            {step.label}
          </div>
          {i < STEPS.length - 1 && <div className={`w-4 h-0.5 ${i < current ? 'bg-green-300' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  )
}

function ResultSection({ title, content, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="font-medium text-gray-800 text-sm">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <div className="p-5 bg-white">
          <MarkdownRenderer content={content} />
        </div>
      )}
    </div>
  )
}

export default function WorkflowPage() {
  const [form, setForm] = useState({ subject: '', grade_level: '', syllabus_text: '' })
  const [syllabusFile, setSyllabusFile] = useState(null)
  const [inputMode, setInputMode] = useState('text')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => {
    workflowAPI.getHistory().then(res => setHistory(res.data)).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setRunning(true)
    setResult(null)

    const fd = new FormData()
    fd.append('subject', form.subject)
    fd.append('grade_level', form.grade_level)

    if (inputMode === 'file' && syllabusFile) {
      fd.append('syllabus_file', syllabusFile)
    } else {
      fd.append('syllabus_text', form.syllabus_text)
    }

    try {
      const res = await workflowAPI.run(fd)
      setResult(res.data)
      setHistory(prev => [res.data, ...prev])
      toast.success('Workflow completed!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Workflow failed')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Teacher Workflow</h1>
        <p className="text-gray-500 text-sm mt-1">
          Upload a syllabus and automatically generate topics, lesson plan, rubric, and assignment
        </p>
      </div>

      {/* Pipeline visualization */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4">
        <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-3">LangGraph Pipeline</p>
        <div className="flex items-center gap-2 flex-wrap">
          {['📄 Syllabus Input', '→', '📚 Extract Topics', '→', '📝 Lesson Plan', '→', '📋 Rubric', '→', '✏️ Assignment'].map((item, i) => (
            <span key={i} className={`text-sm ${item === '→' ? 'text-gray-400' : 'bg-white border border-indigo-200 text-indigo-700 px-3 py-1 rounded-full font-medium'}`}>
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Run Workflow" icon={Workflow} />
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  required value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. Biology"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Grade Level <span className="text-red-500">*</span>
                </label>
                <input
                  required value={form.grade_level}
                  onChange={e => setForm({ ...form, grade_level: e.target.value })}
                  placeholder="e.g. Grade 9"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Syllabus Input</label>
                <div className="flex gap-2 mb-2">
                  {['text', 'file'].map(m => (
                    <button key={m} type="button"
                      onClick={() => setInputMode(m)}
                      className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${inputMode === m ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {m === 'text' ? 'Paste Text' : 'Upload File'}
                    </button>
                  ))}
                </div>

                {inputMode === 'file' ? (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-indigo-400 transition-colors">
                    <Upload className="w-5 h-5 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">
                      {syllabusFile ? syllabusFile.name : 'Upload syllabus PDF/DOCX/TXT'}
                    </span>
                    <input type="file" accept=".pdf,.docx,.txt" className="hidden"
                      onChange={e => setSyllabusFile(e.target.files[0])} />
                  </label>
                ) : (
                  <textarea
                    required={inputMode === 'text'}
                    value={form.syllabus_text}
                    onChange={e => setForm({ ...form, syllabus_text: e.target.value })}
                    placeholder="Paste your syllabus content here..."
                    rows={8}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                )}
              </div>

              <button
                type="submit" disabled={running}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                {running
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Running Workflow...</>
                  : <><Workflow className="w-4 h-4" /> Run AI Workflow</>
                }
              </button>
            </form>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {running && (
            <div>
              <StepIndicator currentStatus="running" />
              <AIGeneratingLoader message="Running 4-step AI workflow..." />
            </div>
          )}

          {result && !running && (
            <div className="space-y-4">
              <StepIndicator currentStatus={result.status} />

              {result.topics_extracted?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">📚 Extracted Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.topics_extracted.map((t, i) => (
                      <span key={i} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.lesson_plan && (
                <ResultSection title="📝 Generated Lesson Plan" content={result.lesson_plan} defaultOpen={true} />
              )}
              {result.rubric && (
                <ResultSection title="📋 Generated Rubric" content={result.rubric} />
              )}
              {result.assignment && (
                <ResultSection title="✏️ Generated Assignment" content={result.assignment} />
              )}
            </div>
          )}

          {!running && !result && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Previous Workflows</h3>
              {history.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400 text-sm">
                  No workflows run yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map(w => (
                    <button
                      key={w.workflow_id}
                      onClick={() => setResult(w)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3 flex items-center justify-between hover:border-indigo-200 hover:bg-indigo-50 transition-colors text-left"
                    >
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{w.subject} · {w.grade_level}</p>
                        <p className="text-xs text-gray-500">{w.topics_extracted?.length || 0} topics extracted</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${w.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {w.status}
                      </span>
                    </button>
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
