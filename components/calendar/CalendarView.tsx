'use client'

import { useState } from 'react'
import { CalendarEvent } from '@/app/calendar/page'

interface CalendarViewProps {
  events: CalendarEvent[]
  selectedDate: Date
  onDateSelect: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

export default function CalendarView({
  events,
  selectedDate,
  onDateSelect,
  onEventClick,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    onDateSelect(today)
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const days = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
          >
            ←
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {dayNames.map(day => (
          <div key={day} className="text-center font-semibold text-gray-700 dark:text-gray-300 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={index} className="aspect-square" />
          }

          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
          const dayEvents = getEventsForDate(date)

          return (
            <div
              key={day}
              onClick={() => onDateSelect(date)}
              className={`
                aspect-square border rounded-lg p-2 cursor-pointer transition-colors
                ${isToday(day) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}
                ${isSelected(day) ? 'ring-2 ring-blue-500' : ''}
                hover:bg-gray-50 dark:hover:bg-gray-700
              `}
            >
              <div className={`text-sm font-medium mb-1 ${isToday(day) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                {day}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick(event)
                    }}
                    className="text-xs px-1 py-0.5 rounded truncate"
                    style={{ backgroundColor: `${event.color}20`, color: event.color }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Events on {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </h3>
        {getEventsForDate(selectedDate).length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No events scheduled for this date.</p>
        ) : (
          <div className="space-y-2">
            {getEventsForDate(selectedDate).map(event => (
              <div
                key={event.id}
                onClick={() => onEventClick(event)}
                className="p-3 rounded-lg border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
              >
                <div className="font-semibold text-gray-900 dark:text-white">{event.title}</div>
                {event.description && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.description}</div>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(event.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  {event.end_time && ` - ${new Date(event.end_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}



