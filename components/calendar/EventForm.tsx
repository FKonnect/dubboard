'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CalendarEvent } from '@/app/calendar/page'

type EventFormData = Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>

interface EventFormProps {
  event?: CalendarEvent
  onSubmit: (event: EventFormData) => void
  onCancel: () => void
  onDelete?: () => void
}

export default function EventForm({ event, onSubmit, onCancel, onDelete }: EventFormProps) {
  const [title, setTitle] = useState(event?.title || '')
  const [description, setDescription] = useState(event?.description || '')
  const [startTime, setStartTime] = useState(
    event?.start_time ? new Date(event.start_time).toISOString().slice(0, 16) : ''
  )
  const [endTime, setEndTime] = useState(
    event?.end_time ? new Date(event.end_time).toISOString().slice(0, 16) : ''
  )
  const [allDay, setAllDay] = useState(event?.all_day || false)
  const [location, setLocation] = useState(event?.location || '')
  const [color, setColor] = useState(event?.color || '#3b82f6')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      return
    }

    setLoading(true)
    
    const eventData: any = {
      title: title.trim(),
      description: description.trim() || null,
      start_time: allDay ? new Date(startTime).toISOString().split('T')[0] + 'T00:00:00' : new Date(startTime).toISOString(),
      end_time: endTime ? (allDay ? new Date(endTime).toISOString().split('T')[0] + 'T23:59:59' : new Date(endTime).toISOString()) : null,
      all_day: allDay,
      location: location.trim() || null,
      color,
    }

    if (event) {
      // Update existing event
      onSubmit(eventData)
    } else {
      // Create new event
      onSubmit(eventData)
    }

    setLoading(false)
  }

  const colorOptions = [
    { value: '#3b82f6', label: 'Blue' },
    { value: '#ef4444', label: 'Red' },
    { value: '#10b981', label: 'Green' },
    { value: '#f59e0b', label: 'Orange' },
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#ec4899', label: 'Pink' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
          required
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Event description"
          rows={3}
          className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-blue-400"
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startTime">Start Time *</Label>
          <Input
            id="startTime"
            type={allDay ? 'date' : 'datetime-local'}
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type={allDay ? 'date' : 'datetime-local'}
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="allDay"
          checked={allDay}
          onChange={(e) => setAllDay(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          disabled={loading}
        />
        <Label htmlFor="allDay">All day event</Label>
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Event location"
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="color">Color</Label>
        <div className="flex items-center space-x-2">
          {colorOptions.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setColor(option.value)}
              className={`w-8 h-8 rounded-full border-2 ${
                color === option.value ? 'border-gray-900 dark:border-white' : 'border-gray-300 dark:border-gray-600'
              }`}
              style={{ backgroundColor: option.value }}
              disabled={loading}
            />
          ))}
        </div>
      </div>

      <div className="flex space-x-2">
        <Button type="submit" disabled={loading || !title.trim()}>
          {loading ? 'Saving...' : event ? 'Update Event' : 'Add Event'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        {event && onDelete && (
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              if (confirm('Are you sure you want to delete this event?')) {
                onDelete()
              }
            }}
            disabled={loading}
          >
            Delete
          </Button>
        )}
      </div>
    </form>
  )
}

