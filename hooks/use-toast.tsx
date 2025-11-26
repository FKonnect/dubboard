'use client'

import { useState, useCallback, useEffect } from 'react'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

let toastCount = 0
const toasts: Toast[] = []
const listeners: Array<(toasts: Toast[]) => void> = []

function addToast(toastData: Omit<Toast, 'id'>) {
  const id = `toast-${toastCount++}`
  const newToast = { ...toastData, id }
  toasts.push(newToast)
  listeners.forEach(listener => listener([...toasts]))
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    removeToast(id)
  }, 5000)
  
  return id
}

// Standalone toast function that can be imported directly
export function toast({ title, description, variant = 'default' }: Omit<Toast, 'id'>) {
  return addToast({ title, description, variant })
}

function removeToast(id: string) {
  const index = toasts.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.splice(index, 1)
    listeners.forEach(listener => listener([...toasts]))
  }
}

export function useToast() {
  const [toastList, setToastList] = useState<Toast[]>([])

  useEffect(() => {
    listeners.push(setToastList)
    setToastList([...toasts])
    
    return () => {
      const index = listeners.indexOf(setToastList)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  const toast = useCallback(({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    addToast({ title, description, variant })
  }, [])

  return { toast, toasts: toastList }
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-lg border p-4 shadow-lg ${
            toast.variant === 'destructive'
              ? 'bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
              : 'bg-white border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100'
          }`}
        >
          {toast.title && (
            <div className="font-semibold mb-1">{toast.title}</div>
          )}
          {toast.description && (
            <div className="text-sm">{toast.description}</div>
          )}
        </div>
      ))}
    </div>
  )
}

