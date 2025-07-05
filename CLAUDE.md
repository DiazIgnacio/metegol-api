# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

**Development:**
- `yarn dev` - Start development server with Turbopack
- `yarn build` - Build production version
- `yarn start` - Start production server
- `yarn lint` - Run ESLint checks

**Testing:**
- No test framework configured yet

## Architecture Overview

This is a Next.js 15 application for displaying football/soccer match data and statistics. The project uses the Football API Sports service to fetch match data for Argentine Liga Profesional.

### Key Components Structure

- **API Layer**: `/app/api/team-matches/route.ts` - Server-side API route that fetches matches and statistics from Football API Sports
- **Data Layer**: 
  - `/lib/footballApi.ts` - Contains `FootballApi` (client-side) and `FootballApiServer` (server-side) classes
  - `/types/match.ts` - TypeScript interfaces for Match, Team, and statistics data
- **UI Layer**: 
  - `/components/dashboard/MainDashboard.tsx` - Main dashboard component that displays grouped matches
  - `/components/dashboard/TeamMatches.tsx` - Specialized component for Liga Profesional matches
  - `/components/dashboard/MatchCard.tsx` - Individual match display component

### Data Flow

1. Client requests matches via `FootballApi.getMatches()`
2. This calls `/api/team-matches` endpoint
3. Server uses `FootballApiServer` to fetch teams, matches, and statistics from external API
4. Data is enriched with team statistics and returned to client
5. `MainDashboard` component renders matches grouped by league

### Environment Variables

- `FOOTBALL_API_KEY` - Required for Football API Sports access
- `NEXT_PUBLIC_BASE_URL` - Base URL for client-side API calls (defaults to localhost:3000)

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives with custom components
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **TypeScript**: Full TypeScript support
- **Build Tool**: Turbopack (in development)

### API Integration

The app integrates with Football API Sports (v3.football.api-sports.io) to fetch:
- Team data for Liga Profesional (league ID: 128)
- Match fixtures for current season (2025)
- Detailed match statistics for each team

### Component Architecture

- Uses Server Components by default (no "use client" directives needed for most components)
- Dashboard components are structured hierarchically with clear data flow
- Match statistics are localized to Spanish using `STATISTICS_LABELS` mapping
- League logos are stored in `/public/leagues/` directory

### Development Notes

- API calls are limited to 1 team (`API_LIMIT = 1`) to avoid rate limiting during development
- All API responses include comprehensive error handling
- Statistics are fetched individually for each match to provide detailed data
- The app focuses specifically on Argentine Liga Profesional de Futbol matches