# Weather Widget Setup

The weather widget uses the OpenWeatherMap API to fetch weather data. To enable the weather widget, you need to:

## Step 1: Get OpenWeatherMap API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to the API Keys section
4. Generate a new API key (free tier allows 60 calls/minute)

## Step 2: Add API Key to Environment

Add the following to your `.env` file:

```bash
OPENWEATHER_API_KEY=your_api_key_here
```

For Docker deployment, add it to your `.env` file that's used by `docker-compose.yml`.

## Step 3: Restart Services

After adding the API key, restart your services:

```bash
docker-compose restart app
```

Or if running locally:

```bash
npm run dev
```

## How It Works

1. The widget first tries to get the user's location from their preferences (stored in `user_preferences` table with key `weather_location`)
2. If no preference is set, it attempts to use the browser's geolocation API
3. If geolocation is not available, it defaults to "New York"
4. Weather data is fetched via the `/api/weather` route which proxies requests to OpenWeatherMap

## Setting a Default Location

Users can set their preferred location by storing it in the database:

```sql
INSERT INTO user_preferences (user_id, preference_key, preference_value)
VALUES ('user-uuid-here', 'weather_location', 'City Name');
```

## API Rate Limits

The free tier of OpenWeatherMap allows:
- 60 calls per minute
- 1,000,000 calls per month

This should be sufficient for personal use. The widget caches data client-side to minimize API calls.

## Troubleshooting

### Weather Widget Shows Error

1. **Check API Key**: Verify `OPENWEATHER_API_KEY` is set correctly
2. **Check API Status**: Visit [OpenWeatherMap status page](https://status.openweathermap.org/)
3. **Check Browser Console**: Look for error messages in the browser console
4. **Check Server Logs**: For Docker, run `docker-compose logs app` to see API errors

### Location Not Working

- The widget will fall back to "New York" if geolocation fails
- Users can set a preferred location in their preferences
- Make sure the browser has permission to access geolocation

## Alternative Weather APIs

If you prefer a different weather service, you can modify `app/api/weather/route.ts` to use:
- WeatherAPI.com
- AccuWeather
- Weather.gov (free, US only)



