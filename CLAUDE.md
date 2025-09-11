# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

**Development:**

- `yarn dev` - Start development server with Turbopack
- `yarn build` - Build production version
- `yarn start` - Start production server
- `yarn lint` - Run ESLint checks and TypeScript compilation (includes `tsc --noEmit`)
- `yarn lint:fix` - Run ESLint with auto-fix
- `yarn format` - Format all files with Prettier
- `yarn format:check` - Check if files are properly formatted
- `yarn format:fix` - Format files and fix linting issues

**Testing:**

- No test framework configured yet

## Architecture Overview

This is a Next.js 15 application for displaying football/soccer match data and statistics. The project uses the Football API Sports service to fetch match data for Argentine Liga Profesional and other international leagues.

### Key Components Structure

- **API Layer**:
  - `/app/api/fixtures/route.ts` - Main endpoint for fetching matches by date/league
  - `/app/api/teams/route.ts` - Team search and listing endpoint
  - `/app/api/teams/[id]/route.ts` - Individual team data endpoint
  - `/app/api/leagues/route.ts` - League data endpoint
  - `/app/api/lineups/route.ts` - Match lineups endpoint

- **Data Layer**:
  - `/lib/footballApi.ts` - Contains `FootballApi` (client-side) and `FootballApiServer` (server-side) classes
  - `/lib/server/match-fetcher.ts` - Server-side match fetching utilities
  - `/types/match.ts` - TypeScript interfaces for Match, Team, League, statistics, events, and lineups

- **UI Layer**:
  - `/components/dashboard/MainDashboard.tsx` - Main dashboard component with date selection and league filtering
  - `/components/dashboard/LeagueSection.tsx` - Groups matches by league
  - `/components/dashboard/SimpleMatchCard.tsx` - Individual match display component
  - `/components/Navbar.tsx` - Top navigation with logo and search
  - `/components/SearchDropdown.tsx` - Team search functionality
  - `/components/Lineups.tsx` - Match lineup visualization

### Data Flow

1. Client requests matches via `FootballApi.getMatches()` or `FootballApi.getMultipleLeaguesMatches()`
2. These call corresponding `/api/fixtures` endpoint with date/league parameters
3. Server uses `FootballApiServer` to fetch fixtures from external Football API Sports
4. Data includes match statistics, events, and lineups when available
5. `MainDashboard` component renders matches grouped by league with real-time filtering

### Environment Variables

- `FOOTBALL_API_KEY` - Required for Football API Sports access
- `NEXT_PUBLIC_BASE_URL` - Base URL for client-side API calls (defaults to localhost:3000)

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives (Popover, Slot) with custom components
- **Icons**: Lucide React
- **Date Handling**: date-fns and date-fns-tz
- **TypeScript**: Full TypeScript support with strict mode
- **Build Tool**: Turbopack (in development)
- **Package Manager**: Yarn v1.22.22

### API Integration

The app integrates with Football API Sports (v3.football.api-sports.io) to fetch:

- Match fixtures by date and league
- Team data with search capabilities
- Detailed match statistics for each team
- Match events (goals, cards, substitutions)
- Team lineups and formations
- League data by country

### Component Architecture

- Uses Server Components by default with selective "use client" directives
- Dashboard components are structured hierarchically with clear data flow
- Match statistics and events are localized to Spanish using `STATISTICS_LABELS` and `EVENTS_LABELS` mappings
- Real-time match filtering by team name search
- League-based organization with support for multiple leagues (Liga Profesional, Champions League, Europa League, etc.)

### League Configuration

Default leagues displayed:

- Liga Profesional de Futbol (ID: 128)
- Primera Nacional (ID: 129)
- Copa Argentina (ID: 130)
- Champions League (ID: 2)
- Europa League (ID: 3)
- Conference League (ID: 848)
- Mundial Clubes (ID: 15)

### Development Notes

- All API responses include comprehensive error handling
- Statistics and events are fetched individually for each match to provide detailed data
- The app supports both specific league filtering and multi-league views
- Images from api-sports.io are configured in Next.js image optimization
- Mobile-first responsive design with max-width container
- Custom scrollbar hiding with Tailwind utilities

### Code Quality Tools

- **ESLint**: Configured with Next.js and TypeScript rules for code linting
- **Prettier**: Automatic code formatting with Tailwind CSS class sorting
- **Configuration Files**:
  - `eslint.config.mjs` - ESLint configuration with Prettier integration
  - `.prettierrc` - Prettier formatting rules
  - `.prettierignore` - Files excluded from formatting

### Important File Patterns

- API routes follow REST conventions in `/app/api/` directory
- UI components are organized by feature in `/components/dashboard/` and `/components/shared/`
- Type definitions are centralized in `/types/match.ts`
- Utility functions are in `/lib/utils.ts` and `/lib/footballApi.ts`
