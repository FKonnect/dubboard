'use client'

import { useState } from 'react'
import { Todo } from '@/app/todos/page'
import { Button } from '@/components/ui/button'

interface TodoItemProps {
  todo: Todo
  onUpdate: (id: string, updates: Partial<Todo>) => void
  onDelete: (id: string) => void
}

export default function TodoItem({ todo, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(todo.title)
  const [description, setDescription] = useState(todo.description || '')

  const handleToggleComplete = () => {
    onUpdate(todo.id, { completed: !todo.completed })
  }

  const handleSave = () => {
    onUpdate(todo.id, { title, description: description || null })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTitle(todo.title)
    setDescription(todo.description || '')
    setIsEditing(false)
  }

  const getPriorityColor = () => {
    switch (todo.priority) {
      case 'high':
        return 'border-red-500'
      case 'medium':
        return 'border-yellow-500'
      case 'low':
        return 'border-green-500'
      default:
        return 'border-gray-300'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div
      className={`border-l-4 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 ${getPriorityColor()} ${
        todo.completed ? 'opacity-60' : ''
      }`}
    >
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Todo title"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Description (optional)"
            rows={3}
          />
          <div className="flex space-x-2">
            <Button onClick={handleSave} size="sm">Save</Button>
            <Button onClick={handleCancel} variant="outline" size="sm">Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={handleToggleComplete}
            className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="flex-1">
            <h3
              className={`text-lg font-medium ${
                todo.completed
                  ? 'line-through text-gray-500 dark:text-gray-400'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {todo.title}
            </h3>
            {todo.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {todo.description}
              </p>
            )}
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
              {todo.category && (
                <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded">
                  {todo.category}
                </span>
              )}
              {todo.due_date && (
                <span>Due: {formatDate(todo.due_date)}</span>
              )}
              <span className="capitalize">{todo.priority} priority</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => setIsEditing(true)}
              variant="ghost"
              size="sm"
            >
              Edit
            </Button>
            <Button
              onClick={() => onDelete(todo.id)}
              variant="destructive"
              size="sm"
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

