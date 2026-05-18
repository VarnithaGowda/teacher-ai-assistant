/**
 * pages/Chatbot.jsx - Teacher AI Chatbot with RAG support
 */

import { useState, useEffect, useRef } from 'react'
import { chatAPI } from '../services/api'
import { LoadingSpinner } from '../components/LoadingSpinner'
import MarkdownRenderer from '../components/MarkdownRenderer'
import { Send, Bot, User, MessageSquare, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-indigo-600' : 'bg-gray-200'}`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-gray-600" />}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isUser ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-gray-200 rounded-tl-sm'}`}>
        {isUser ? (
          <p className="text-sm">{msg.content}</p>
        ) : (
          <div className="text-sm text-gray-700">
            <MarkdownRenderer content={msg.content} />
            {msg.sources?.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400">Sources: {msg.sources.join(', ')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const SUGGESTIONS = [
  'Generate a quiz on photosynthesis for Grade 8',
  'What are effective teaching strategies for visual learners?',
  'Create a 5-question assignment on World War II',
  'Explain the difference between formative and summative assessment',
]

export default function Chatbot() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [sessions, setSessions] = useState([])
  const [useRag, setUseRag] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    chatAPI.getSessions().then(res => setSessions(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const userMsg = text || input.trim()
    if (!userMsg) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await chatAPI.sendMessage({
        message: userMsg,
        session_id: sessionId,
        use_rag: useRag,
      })
      setSessionId(res.data.session_id)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.message,
        sources: res.data.sources,
      }])
    } catch (err) {
      toast.error('Failed to get response')
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const startNewChat = () => {
    setMessages([])
    setSessionId(null)
  }

  const loadSession = async (sid) => {
    try {
      const res = await chatAPI.getHistory(sid)
      const msgs = []
      res.data.forEach(item => {
        msgs.push({ role: 'user', content: item.user_message })
        msgs.push({ role: 'assistant', content: item.ai_response, sources: item.sources })
      })
      setMessages(msgs)
      setSessionId(sid)
    } catch {
      toast.error('Failed to load session')
    }
  }

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex gap-4">
      {/* Sessions sidebar */}
      <div className="hidden lg:flex flex-col w-56 bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-3 border-b border-gray-100">
          <button
            onClick={startNewChat}
            className="w-full flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map(s => (
            <button
              key={s.session_id}
              onClick={() => loadSession(s.session_id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${s.session_id === sessionId ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <p className="truncate font-medium">{s.last_message || 'Chat session'}</p>
              <p className="text-gray-400 mt-0.5">{s.message_count} messages</p>
            </button>
          ))}
          {sessions.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">No previous chats</p>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Teaching Assistant</p>
              <p className="text-xs text-green-500">● Online</p>
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
            <input
              type="checkbox" checked={useRag} onChange={e => setUseRag(e.target.checked)}
              className="rounded"
            />
            Use my documents
          </label>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-1">How can I help you today?</h3>
              <p className="text-sm text-gray-400 mb-6">Ask me anything about teaching, curriculum, or your uploaded documents</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="text-left text-xs bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 border border-gray-200 hover:border-indigo-200 rounded-lg px-3 py-2 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => <Message key={i} msg={msg} />)}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-600" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask anything about teaching..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
