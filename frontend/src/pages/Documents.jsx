/**
 * pages/Documents.jsx - Document upload and RAG management
 */

import { useState, useEffect } from 'react'
import { ragAPI } from '../services/api'
import { Card, CardHeader } from '../components/Card'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Upload, FileText, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function StatusBadge({ status }) {
  const map = {
    ready:      { icon: CheckCircle, cls: 'text-green-600 bg-green-50', label: 'Ready' },
    processing: { icon: Clock,       cls: 'text-amber-600 bg-amber-50', label: 'Processing' },
    error:      { icon: AlertCircle, cls: 'text-red-600 bg-red-50',     label: 'Error' },
  }
  const { icon: Icon, cls, label } = map[status] || map.processing
  return (
    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  )
}

export default function Documents() {
  const [documents, setDocuments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ragAPI.listDocuments()
      .then(res => setDocuments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleUpload = async (file) => {
    if (!file) return
    const allowed = ['pdf', 'docx', 'doc', 'txt']
    const ext = file.name.split('.').pop().toLowerCase()
    if (!allowed.includes(ext)) {
      toast.error('Only PDF, DOCX, and TXT files are supported')
      return
    }

    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)

    try {
      const res = await ragAPI.uploadDocument(fd)
      setDocuments(prev => [res.data, ...prev])
      toast.success(`${file.name} uploaded and processed (${res.data.chunks_created} chunks)`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (docId, filename) => {
    if (!confirm(`Delete "${filename}"?`)) return
    try {
      await ragAPI.deleteDocument(docId)
      setDocuments(prev => prev.filter(d => d.document_id !== docId))
      toast.success('Document deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documents & RAG</h1>
        <p className="text-gray-500 text-sm mt-1">
          Upload your syllabus, notes, and textbooks. The AI chatbot will use them to answer questions.
        </p>
      </div>

      {/* Upload area */}
      <Card>
        <CardHeader title="Upload Document" subtitle="PDF, DOCX, or TXT (max 10MB)" icon={Upload} />
        <div className="p-5">
          <label
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`
              flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-colors
              ${dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}
              ${uploading ? 'pointer-events-none opacity-60' : ''}
            `}
          >
            {uploading ? (
              <>
                <LoadingSpinner size="lg" className="mb-3" />
                <p className="text-sm text-indigo-600 font-medium">Processing document...</p>
                <p className="text-xs text-gray-400 mt-1">Chunking and generating embeddings</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                  <Upload className="w-7 h-7 text-indigo-400" />
                </div>
                <p className="text-sm font-medium text-gray-700">Drop file here or click to browse</p>
                <p className="text-xs text-gray-400 mt-1">Supports PDF, DOCX, TXT</p>
              </>
            )}
            <input
              type="file" accept=".pdf,.docx,.doc,.txt" className="hidden"
              onChange={e => handleUpload(e.target.files[0])}
              disabled={uploading}
            />
          </label>
        </div>
      </Card>

      {/* How it works */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-indigo-800 mb-2">How RAG works</h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { step: '1', label: 'Upload', desc: 'PDF/DOCX/TXT' },
            { step: '2', label: 'Parse', desc: 'Extract text' },
            { step: '3', label: 'Embed', desc: 'HuggingFace vectors' },
            { step: '4', label: 'Retrieve', desc: 'AI uses context' },
          ].map(({ step, label, desc }) => (
            <div key={step} className="bg-white rounded-lg p-2">
              <div className="w-6 h-6 bg-indigo-600 text-white rounded-full text-xs font-bold flex items-center justify-center mx-auto mb-1">{step}</div>
              <p className="text-xs font-medium text-gray-700">{label}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Document list */}
      <Card>
        <CardHeader title="Your Documents" subtitle={`${documents.length} document${documents.length !== 1 ? 's' : ''}`} icon={FileText} />
        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : documents.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">
              No documents uploaded yet. Upload your first document above.
            </div>
          ) : (
            documents.map(doc => (
              <div key={doc.document_id || doc.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{doc.filename}</p>
                  <p className="text-xs text-gray-400">
                    {doc.chunks_created ? `${doc.chunks_created} chunks` : ''} ·{' '}
                    {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : ''}
                  </p>
                </div>
                <StatusBadge status={doc.status || 'ready'} />
                <button
                  onClick={() => handleDelete(doc.document_id || doc.id, doc.filename)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
