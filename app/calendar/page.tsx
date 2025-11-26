'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import CalendarView from '@/components/calendar/CalendarView'
import EventForm from '@/components/calendar/EventForm'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'

export interface CalendarEvent {
  id: string
  user_id: string
  title: string
  description: string | null
  start_time: string
  end_time: string | null
  all_day: boolean
  location: string | null
  color: string
  created_at: string
  updated_at: string
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to view calendar events',
          variant: 'destructive',
        })
        return
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_time', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load events',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddEvent = async (event: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to add events',
          variant: 'destructive',
        })
        return
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          ...event,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      
      setEvents([...events, data])
      setShowEventForm(false)
      toast({
        title: 'Success',
        description: 'Event added successfully',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add event',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      setEvents(events.map(event => event.id === id ? data : event))
      setEditingEvent(null)
      toast({
        title: 'Success',
        description: 'Event updated successfully',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update event',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteEvent = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setEvents(events.filter(event => event.id !== id))
      setEditingEvent(null)
      toast({
        title: 'Success',
        description: 'Event deleted successfully',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete event',
        variant: 'destructive',
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Calendar
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Manage your events and schedule
            </p>
          </div>
          <button
            onClick={() => {
              setEditingEvent(null)
              setShowEventForm(true)
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Add Event
          </button>
        </div>

        {showEventForm && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <EventForm
              onSubmit={handleAddEvent}
              onCancel={() => setShowEventForm(false)}
            />
          </div>
        )}

        {editingEvent && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <EventForm
              event={editingEvent}
              onSubmit={(updates) => handleUpdateEvent(editingEvent.id, updates)}
              onCancel={() => setEditingEvent(null)}
              onDelete={() => handleDeleteEvent(editingEvent.id)}
            />
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">Loading calendar...</p>
            </div>
          ) : (
            <CalendarView
              events={events}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              onEventClick={setEditingEvent}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

