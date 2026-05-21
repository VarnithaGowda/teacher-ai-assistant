/**
 * pages/Evaluation.jsx - AI Student Answer Evaluation
 */

import { useState, useEffect } from 'react'
import { evaluationAPI, rubricAPI } from '../services/api'
import { Card, CardHeader } from '../components/Card'
import { AIGeneratingLoader } from '../components/LoadingSpinner'
import MarkdownRenderer from '../components/MarkdownRenderer'
import { UserCheck, Upload, FileText, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function GradeBadge({ grade }) {
  const colors = {
    'A+': 'bg-green-100 text-green-700', 'A': 'bg-green-100 text-green-700',
    'B+': 'bg-blue-100 text-blue-700',   'B': 'bg-blue-100 text-blue-700',
    'C':  'bg-yellow-100 text-yellow-700', 'D': 'bg-orange-100 text-orange-700',
    'F':  'bg-red-100 text-red-700',
  }
  return (
    <span className={`text-2xl font-bold px-4 py-2 rounded-xl ${colors[grade] || 'bg-gray-100 text-gray-700'}`}>
      {grade}
    </span>
  )
}

export default function Evaluation() {
  const [form, setForm] = useState({
    student_name: '', assignment_title: '', total_marks: 50,
    rubric_id: '', rubric_text: '', model_answer: '', student_answer_text: ''
  })
  const [answerFile, setAnswerFile] = useState(null)
  const [rubrics, setRubrics] = useState([])
  const [evaluating, setEvaluating] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [inputMode, setInputMode] = useState('text') // 'text' or 'file'
  const [rubricMode, setRubricMode] = useState('text') // 'text' or 'saved'

  useEffect(() => {
    rubricAPI.list().then(res => setRubrics(res.data)).catch(() => {})
    evaluationAPI.list().then(res => setHistory(res.data)).catch(() => {})
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEvaluating(true)
    setResult(null)

    const fd = new FormData()
    fd.append('student_name', form.student_name)
    fd.append('assignment_title', form.assignment_title)
    fd.append('total_marks', form.total_marks)

    if (rubricMode === 'saved' && form.rubric_id) {
      fd.append('rubric_id', form.rubric_id)
    } else {
      fd.append('rubric_text', form.rubric_text)
    }

    if (form.model_answer) fd.append('model_answer', form.model_answer)

    if (inputMode === 'file' && answerFile) {
      fd.append('student_answer_file', answerFile)
    } else {
      fd.append('student_answer_text', form.student_answer_text)
    }

    try {
      const res = await evaluationAPI.evaluate(fd)
      setResult(res.data)
      setHistory(prev => [res.data, ...prev])
      toast.success('Evaluation complete!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Evaluation failed')
    } finally {
      setEvaluating(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Evaluator</h1>
        <p className="text-gray-500 text-sm mt-1">AI-powered grading with detailed feedback</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Evaluate Answer" icon={UserCheck} />
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Student Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="student_name" required value={form.student_name} onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Assignment Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="assignment_title" required value={form.assignment_title} onChange={handleChange}
                  placeholder="Python OOP Project"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Marks</label>
                <input
                  name="total_marks" type="number" min="10" max="100"
                  value={form.total_marks} onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Rubric source */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rubric Source</label>
                <div className="flex gap-2 mb-2">
                  {['text', 'saved'].map(m => (
                    <button key={m} type="button"
                      onClick={() => setRubricMode(m)}
                      className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${rubricMode === m ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {m === 'text' ? 'Paste Rubric' : 'Saved Rubric'}
                    </button>
                  ))}
                </div>
                {rubricMode === 'saved' ? (
                  <select
                    name="rubric_id" value={form.rubric_id} onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">Select a rubric...</option>
                    {rubrics.map(r => (
                      <option key={r.id} value={r.id}>{r.assignment_title}</option>
                    ))}
                  </select>
                ) : (
                  <textarea
                    name="rubric_text" value={form.rubric_text} onChange={handleChange}
                    placeholder="Paste your rubric here..."
                    rows={4}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                )}
              </div>

              {/* Student answer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student Answer</label>
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
                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">
                      {answerFile ? answerFile.name : 'Click to upload PDF/DOCX/TXT'}
                    </span>
                    <input type="file" accept=".pdf,.docx,.txt" className="hidden"
                      onChange={e => setAnswerFile(e.target.files[0])} />
                  </label>
                ) : (
                  <textarea
                    name="student_answer_text" value={form.student_answer_text} onChange={handleChange}
                    placeholder="Paste student's answer here..."
                    rows={5}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                )}
              </div>

              <button
                type="submit" disabled={evaluating}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                {evaluating
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Evaluating...</>
                  : <><UserCheck className="w-4 h-4" /> Evaluate</>
                }
              </button>
            </form>
          </Card>
        </div>

        {/* Result */}
        <div className="lg:col-span-3 space-y-4">
          {evaluating && <AIGeneratingLoader message="AI is evaluating the answer..." />}

          {result && !evaluating && (
            <Card>
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">{result.student_name}</h3>
                    <p className="text-sm text-gray-500">{result.assignment_title}</p>
                  </div>
                  <GradeBadge grade={result.grade} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-gray-800">{result.marks_obtained}</p>
                    <p className="text-xs text-gray-500">/ {result.total_marks} marks</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-indigo-600">{result.percentage}%</p>
                    <p className="text-xs text-gray-500">Score</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-gray-800">{result.grade}</p>
                    <p className="text-xs text-gray-500">Grade</p>
                  </div>
                </div>
              </div>

              {/* Strengths & Improvements */}
              {(result.strengths?.length > 0 || result.improvements?.length > 0) && (
                <div className="p-5 grid grid-cols-2 gap-4 border-b border-gray-100">
                  <div>
                    <h4 className="text-sm font-semibold text-green-700 flex items-center gap-1 mb-2">
                      <CheckCircle className="w-4 h-4" /> Strengths
                    </h4>
                    <ul className="space-y-1">
                      {result.strengths?.map((s, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                          <span className="text-green-500 mt-0.5">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-amber-700 flex items-center gap-1 mb-2">
                      <XCircle className="w-4 h-4" /> Improvements
                    </h4>
                    <ul className="space-y-1">
                      {result.improvements?.map((s, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                          <span className="text-amber-500 mt-0.5">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="p-5">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Detailed Feedback</h4>
                <MarkdownRenderer content={result.feedback} />
              </div>
            </Card>
          )}

          {!evaluating && !result && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Evaluations</h3>
              {history.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400 text-sm">
                  No evaluations yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {history.slice(0, 10).map(ev => (
                    <div key={ev.id} className="bg-white border border-gray-200 rounded-xl px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{ev.student_name}</p>
                        <p className="text-xs text-gray-500">{ev.assignment_title}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">{ev.grade}</p>
                        <p className="text-xs text-gray-500">{ev.percentage}%</p>
                      </div>
                    </div>
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
