'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Todo } from '@/app/todos/page'

export default function TodosWidget() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTodos()
  }, [])

  const loadTodos = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setTodos(data || [])
    } catch (error) {
      console.error('Failed to load todos:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <p className="text-gray-600 dark:text-gray-400 text-sm">Loading...</p>
  }

  if (todos.length === 0) {
    return (
      <div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
          No todos yet. Get started by creating one!
        </p>
        <Link
          href="/todos"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
        >
          Add Todo
        </Link>
      </div>
    )
  }

  const activeTodos = todos.filter(t => !t.completed)
  const completedTodos = todos.filter(t => t.completed)

  return (
    <div>
      <div className="space-y-2 mb-4">
        {activeTodos.slice(0, 3).map(todo => (
          <div key={todo.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={todo.completed}
              disabled
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-900 dark:text-white truncate flex-1">
              {todo.title}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{activeTodos.length} active, {completedTodos.length} completed</span>
        <Link
          href="/todos"
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
        >
          Manage →
        </Link>
      </div>
    </div>
  )
}



