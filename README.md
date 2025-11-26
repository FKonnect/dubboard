# Dubboard - Personal Dashboard

A self-hosted, beautifully designed, multi-device synced personal dashboard app built with Next.js and Supabase.

## Features

- 🌤️ Weather Widget
- 📅 Calendar
- ✅ To-Do List
- 🔐 Authentication
- 📱 PWA Support

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Self-hosted Supabase (PostgreSQL)
- **Containerization**: Docker

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed
- Self-hosted Supabase instance running

### Development

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your Supabase connection details

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Docker Deployment

Build and run with Docker Compose:
```bash
docker-compose up -d
```

## Project Structure

```
dubboard/
├── app/                    # Next.js app directory
├── components/            # Reusable UI components
├── lib/                   # Utility functions
└── supabase/             # Database migrations
```
