'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface WeatherData {
  temperature: number
  condition: string
  description: string
  icon: string
  location: string
  humidity: number
  windSpeed: number
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [location, setLocation] = useState<string>('')

  useEffect(() => {
    loadUserLocation()
  }, [])

  const loadUserLocation = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      // Try to get location from user preferences
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('preference_value')
        .eq('user_id', user.id)
        .eq('preference_key', 'weather_location')
        .single()

      if (prefs?.preference_value) {
        setLocation(prefs.preference_value)
        loadWeather(prefs.preference_value)
      } else {
        // Try to get location from browser
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords
              // Use reverse geocoding or just use coordinates
              await loadWeatherByCoords(latitude, longitude)
            },
            () => {
              // Fallback to default location
              loadWeather('New York')
            }
          )
        } else {
          loadWeather('New York')
        }
      }
    } catch (error) {
      console.error('Failed to load location:', error)
      loadWeather('New York')
    }
  }

  const loadWeatherByCoords = async (lat: number, lon: number) => {
    try {
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      if (!response.ok) throw new Error('Failed to fetch weather')
      const data = await response.json()
      setWeather(data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load weather')
    } finally {
      setLoading(false)
    }
  }

  const loadWeather = async (loc: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/weather?q=${encodeURIComponent(loc)}`)
      if (!response.ok) throw new Error('Failed to fetch weather')
      const data = await response.json()
      setWeather(data)
      setLocation(loc)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load weather')
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (iconCode: string) => {
    // Map OpenWeatherMap icon codes to emojis
    const iconMap: Record<string, string> = {
      '01d': '☀️',
      '01n': '🌙',
      '02d': '⛅',
      '02n': '⛅',
      '03d': '☁️',
      '03n': '☁️',
      '04d': '☁️',
      '04n': '☁️',
      '09d': '🌧️',
      '09n': '🌧️',
      '10d': '🌦️',
      '10n': '🌦️',
      '11d': '⛈️',
      '11n': '⛈️',
      '13d': '❄️',
      '13n': '❄️',
      '50d': '🌫️',
      '50n': '🌫️',
    }
    return iconMap[iconCode] || '🌤️'
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600 dark:text-gray-400 text-sm">Loading weather...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        <p className="text-gray-600 dark:text-gray-400 text-xs mt-2">
          Weather API not configured. See setup instructions.
        </p>
      </div>
    )
  }

  if (!weather) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600 dark:text-gray-400 text-sm">No weather data available</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-4xl mb-2">{getWeatherIcon(weather.icon)}</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {Math.round(weather.temperature)}°F
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {weather.location}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
            {weather.description}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
        <div>
          <span className="font-medium">Humidity:</span> {weather.humidity}%
        </div>
        <div>
          <span className="font-medium">Wind:</span> {weather.windSpeed} mph
        </div>
      </div>
    </div>
  )
}


