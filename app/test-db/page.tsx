'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function TestDBPage() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({})

  const testConnection = async () => {
    setStatus('testing')
    setMessage('Testing database connection...')

    try {
      // Test 1: Basic connection
      const { data, error } = await supabase
        .from('user_preferences')
        .select('count', { count: 'exact', head: true })

      if (error) {
        throw error
      }

      setMessage('✅ Database connection successful!')
      setStatus('success')

      // Test 2: Get table counts
      const [prefsCount, todosCount, eventsCount] = await Promise.all([
        supabase.from('user_preferences').select('*', { count: 'exact', head: true }),
        supabase.from('todos').select('*', { count: 'exact', head: true }),
        supabase.from('calendar_events').select('*', { count: 'exact', head: true }),
      ])

      setTableCounts({
        'user_preferences': prefsCount.count || 0,
        'todos': todosCount.count || 0,
        'calendar_events': eventsCount.count || 0,
      })
    } catch (error: any) {
      setStatus('error')
      setMessage(`❌ Connection failed: ${error.message}`)
      console.error('Database connection error:', error)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Database Connection Test</h1>
          
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This page tests the connection between your Next.js app and your self-hosted Supabase database.
            </p>
            
            <button
              onClick={testConnection}
              disabled={status === 'testing'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {status === 'testing' ? 'Testing...' : 'Test Connection'}
            </button>
          </div>

          {status !== 'idle' && (
            <div className={`p-4 rounded-lg ${
              status === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}>
              <p className="font-medium">{message}</p>
            </div>
          )}

          {status === 'success' && Object.keys(tableCounts).length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Table Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">User Preferences</p>
                  <p className="text-2xl font-bold">{tableCounts.user_preferences}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Todos</p>
                  <p className="text-2xl font-bold">{tableCounts.todos}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Calendar Events</p>
                  <p className="text-2xl font-bold">{tableCounts.calendar_events}</p>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h3 className="font-semibold mb-2">Troubleshooting Tips:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>Check that your Supabase instance is running</li>
                <li>Verify your environment variables in .env.local</li>
                <li>Make sure you've run the database migrations</li>
                <li>Check that Row Level Security policies are set up correctly</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

