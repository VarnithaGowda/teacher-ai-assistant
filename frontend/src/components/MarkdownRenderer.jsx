/**
 * components/MarkdownRenderer.jsx - Renders AI-generated markdown content
 * Supports: tables, math (LaTeX), code blocks, lists, bold, italic
 */

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

export default function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-gray-300 text-sm" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-indigo-50" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-gray-300 px-4 py-2 text-gray-600" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="even:bg-gray-50" {...props} />
          ),
          code: ({ node, inline, ...props }) => (
            inline
              ? <code className="bg-gray-100 text-indigo-700 px-1 py-0.5 rounded text-xs font-mono" {...props} />
              : <code className="block bg-gray-900 text-green-400 p-4 rounded-lg text-xs font-mono overflow-x-auto my-2" {...props} />
          ),
          h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-gray-800 mt-4 mb-2" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-gray-800 mt-3 mb-2" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-base font-semibold text-gray-700 mt-2 mb-1" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 my-2 text-gray-700" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 my-2 text-gray-700" {...props} />,
          li: ({ node, ...props }) => <li className="ml-2" {...props} />,
          p: ({ node, ...props }) => <p className="my-1.5 text-gray-700 leading-relaxed" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-semibold text-gray-800" {...props} />,
          hr: ({ node, ...props }) => <hr className="my-3 border-gray-200" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}