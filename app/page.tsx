import DashboardLayout from '@/components/layout/DashboardLayout'
import TodosWidget from '@/components/todos/TodosWidget'
import WeatherWidget from '@/components/weather/WeatherWidget'

export default function Home() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Dubboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Your self-hosted personal dashboard is ready! Test your database connection to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {/* Weather Widget */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl">🌤️</span>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Weather</h2>
            </div>
            <WeatherWidget />
          </div>

          {/* Calendar Widget Placeholder */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl">📅</span>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Calendar</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Calendar widget coming soon
            </p>
          </div>

          {/* To-Do List Widget */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">✅</span>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">To-Do List</h2>
              </div>
              <a
                href="/todos"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
              >
                View All →
              </a>
            </div>
            <TodosWidget />
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Next Steps
          </h3>
          <ul className="list-disc list-inside space-y-2 text-blue-800 dark:text-blue-200">
            <li>Set up your environment variables in <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">.env.local</code></li>
            <li>Run the database migration in your Supabase instance</li>
            <li>Test your database connection using the Test DB page</li>
            <li>Start building features one at a time!</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  )
}
