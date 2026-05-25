'use client'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, X } from 'lucide-react'

interface ToastProps {
  message: string
  show: boolean
  onClose: () => void
  type?: 'success' | 'info'
}

export function Toast({ message, show, onClose, type = 'success' }: ToastProps) {
  useEffect(() => {
    if (!show) return
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [show, onClose])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white border border-slate-200 shadow-xl rounded-2xl px-5 py-3.5 max-w-sm w-full mx-4"
        >
          <CheckCircle2 size={18} className={type === 'success' ? 'text-emerald-500 shrink-0' : 'text-indigo-500 shrink-0'} />
          <span className="text-sm font-medium text-slate-700 flex-1">{message}</span>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={14} className="text-slate-400" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
