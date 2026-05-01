'use client'
import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check } from 'lucide-react'

interface CodeBlockProps {
  code: string
  language?: string
}

export function CodeBlock({ code, language = 'text' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Normalize language names
  const normalizeLanguage = (lang: string): string => {
    const map: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'sh': 'bash',
      'shell': 'bash',
      'yml': 'yaml',
      'dockerfile': 'docker',
      'tf': 'hcl',
      'text': 'text',
      '': 'text',
    }
    return map[lang.toLowerCase()] || lang.toLowerCase()
  }

  const normalizedLang = normalizeLanguage(language)

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-700 my-4 shadow-lg">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 rounded hover:bg-slate-700"
        >
          {copied ? (
            <>
              <Check size={12} className="text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <SyntaxHighlighter
        language={normalizedLang}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '1.25rem 1rem',
          fontSize: '0.8125rem',
          lineHeight: '1.6',
          background: '#1e293b',
          borderRadius: 0,
        }}
        showLineNumbers={code.split('\n').length > 5}
        lineNumberStyle={{ color: '#475569', minWidth: '2.5em' }}
        wrapLongLines={false}
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  )
}
