import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const q = searchParams.get('q')
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  // Get API key from environment variable
  const apiKey = process.env.OPENWEATHER_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Weather API key not configured. Please set OPENWEATHER_API_KEY in your environment variables.' },
      { status: 500 }
    )
  }

  try {
    let url = 'https://api.openweathermap.org/data/2.5/weather?'
    
    if (q) {
      url += `q=${encodeURIComponent(q)}&`
    } else if (lat && lon) {
      url += `lat=${lat}&lon=${lon}&`
    } else {
      return NextResponse.json(
        { error: 'Location parameter (q) or coordinates (lat, lon) required' },
        { status: 400 }
      )
    }

    url += `appid=${apiKey}&units=imperial`

    const response = await fetch(url)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch weather data' },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      temperature: data.main.temp,
      condition: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      location: data.name,
      humidity: data.main.humidity,
      windSpeed: data.wind?.speed || 0,
    })
  } catch (error: any) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch weather data' },
      { status: 500 }
    )
  }
}


