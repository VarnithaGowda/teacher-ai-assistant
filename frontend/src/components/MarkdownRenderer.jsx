/**
 * components/MarkdownRenderer.jsx - Renders AI-generated markdown content
 */

import ReactMarkdown from 'react-markdown'

export default function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}
