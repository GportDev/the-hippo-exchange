# The Hippo Exchange

**don't buy. borrow.**

A modern asset and maintenance tracking platform that helps users manage their belongings, track maintenance schedules, and build a sharing community.

## Overview

The Hippo Exchange is a full-stack web application built with React that enables users to:

- **Manage Assets**: Track your belongings with details like purchase date, cost, location, and condition
- **Maintenance Tracking**: Schedule and manage maintenance tasks with recurring reminders
- **Smart Notifications**: Get notified about overdue maintenance tasks
- **Mobile-First Design**: Fully responsive interface optimized for all devices
- **Secure Authentication**: User authentication powered by Clerk

## Tech Stack

### Frontend
- **React 18.3.1** - Modern UI library
- **TypeScript 5.7.2** - Type-safe development
- **TanStack Router** - File-based routing with type safety
- **TanStack Query** - Powerful data fetching and caching
- **Tailwind CSS 4.0** - Utility-first styling
- **Shadcn/UI** - Beautiful, accessible component library
- **Clerk** - Authentication and user management
- **Sonner** - Toast notifications

### Development Tools
- **Vite 6.3** - Lightning-fast build tool
- **Biome** - Fast linting and formatting
- **Vitest** - Unit testing framework
- **pnpm** - Efficient package manager

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 10+

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
# Create a .env.local file with:
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key_here

# Start development server
pnpm dev
```

The app will be available at `https://localhost:3000`

## Available Scripts

```bash
# Development
pnpm dev          # Start dev server
pnpm start        # Alias for dev

# Production
pnpm build        # Build for production
pnpm serve        # Preview production build

# Code Quality
pnpm lint         # Run linter
pnpm format       # Format code
pnpm check        # Run all checks

# Testing
pnpm test         # Run tests
```

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ui/            # Shadcn base components
│   ├── Modals/        # Dialog components
│   └── Skeletons/     # Loading states
├── routes/            # File-based routing
│   ├── __root.tsx     # Root layout with sidebar
│   ├── index.tsx      # Landing page
│   ├── home/          # Dashboard
│   ├── assets/        # Asset management
│   └── maintenance/   # Maintenance tracking
├── lib/               # Utilities and helpers
│   ├── api.ts         # API client
│   ├── Types.ts       # TypeScript interfaces
│   └── utils.ts       # Utility functions
└── integrations/      # Third-party integrations
    ├── clerk/         # Authentication
    └── tanstack-query/# Data fetching
```

## Features

### Asset Management
- Add, edit, and delete assets
- Upload asset images
- Track purchase cost, date, and location
- Mark assets as favorites
- Filter by status (Available, In Repair, Unlisted)
- Search by name, brand, or category

### Maintenance Tracking
- Create maintenance tasks for any asset
- Set due dates and recurring schedules
- Track completion status
- View overdue, upcoming, and completed tasks
- Automatic recurring task generation
- Tool location and requirements tracking

### Dashboard
- Overview of total assets and value
- Upcoming maintenance tasks
- Overdue notifications
- Favorite assets showcase

## Environment Variables

Required environment variables:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

## Deployment

The app is configured for deployment on Vercel:

```bash
pnpm build
```

The `vercel.json` configuration handles SPA routing automatically.

## API Integration

The frontend connects to the Hippo Exchange API at `https://api.thehippoexchange.com`

API endpoints:
- `GET /assets` - Fetch user assets
- `POST /assets` - Create new asset
- `PUT /assets/:id` - Update asset
- `DELETE /assets/:id` - Delete asset
- `GET /maintenance` - Fetch maintenance tasks
- `POST /assets/:id/maintenance` - Create maintenance task
- `PUT /maintenance/:id` - Update maintenance task
- `DELETE /maintenance/:id` - Delete maintenance task

## Contributing

This is a student project developed as part of a Computer Science course.

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Built with [TanStack](https://tanstack.com/) ecosystem
- UI components from [Shadcn/UI](https://ui.shadcn.com/)
- Authentication by [Clerk](https://clerk.com/)
- Icons by [Lucide](https://lucide.dev/)
