# Unified Insurance Operations System

## Overview

This is a comprehensive insurance operations management system built with React, Express, and PostgreSQL. The application provides document management, task tracking, meeting scheduling, email archiving, and team collaboration features designed specifically for insurance teams.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration for client-server separation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express session with PostgreSQL store
- **File Handling**: Multer for document uploads
- **API Design**: RESTful endpoints with JSON responses

### Database Architecture
- **Database**: PostgreSQL with Neon serverless connection
- **ORM**: Drizzle ORM with type-safe queries
- **Schema Management**: Drizzle Kit for migrations
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Authentication System
- Replit Auth integration with OIDC
- Session-based authentication with PostgreSQL storage
- User profile management with team assignments
- Role-based access control (member/admin roles)

### Document Management
- File upload system supporting PDF, Word, and Excel files
- Document categorization and metadata storage
- Full-text search capabilities across documents
- Team-based document organization
- File size limits (10MB) and type validation

### Task Management
- Task creation with priorities (low, medium, high)
- Status tracking (pending, in-progress, completed)
- Due date management with calendar integration
- Team member assignment
- Activity logging for task changes

### Meeting Scheduling
- Calendar integration for meeting scheduling
- Meeting location and video link support
- Status management (scheduled, completed, cancelled)
- Team-based meeting visibility

### Email Archive
- Email archiving system with metadata storage
- Search functionality across archived emails
- Tag-based organization
- Date-based filtering and sorting

### Team Management
- Multi-team support with team switching
- Team member management with roles
- Team-based data isolation
- Activity logging across teams

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit Auth, sessions stored in PostgreSQL
2. **API Requests**: React components use TanStack Query for data fetching with automatic caching
3. **File Uploads**: Multer processes uploads, files stored locally, metadata in database
4. **Database Operations**: Drizzle ORM handles all database interactions with type safety
5. **Real-time Updates**: Query invalidation triggers UI updates after mutations

## External Dependencies

### Core Dependencies
- **Database**: PostgreSQL (via Neon serverless)
- **Authentication**: Replit Auth with OpenID Connect
- **UI Components**: Radix UI primitives via shadcn/ui
- **File Storage**: Local filesystem with configurable upload directory

### Development Tools
- **TypeScript**: Full type safety across client and server
- **Vite**: Development server with HMR and build optimization
- **Drizzle Kit**: Database schema management and migrations
- **PostCSS**: CSS processing with Tailwind CSS

## Deployment Strategy

### Development Environment
- Replit-native development with integrated database
- Vite dev server with Express backend proxy
- Hot module replacement for frontend changes
- Automatic TypeScript compilation

### Production Build
- Vite builds optimized frontend bundle to `dist/public`
- ESBuild compiles server code to `dist/index.js`
- Static files served from Express in production
- Database migrations run via `npm run db:push`

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Session encryption key (required)
- `REPLIT_DOMAINS`: Allowed domains for Replit Auth (required)
- `ISSUER_URL`: OIDC issuer URL (defaults to Replit)
- `NODE_ENV`: Environment mode (development/production)

## Changelog

- June 26, 2025: Complete Unified Insurance Operations System implementation
  - Built comprehensive platform with document management, task tracking, meeting scheduling, and email archiving
  - Implemented multi-team support for Personal Lines, Commercial, Corporate, and Claims teams
  - Created professional landing page with feature overview
  - Set up Replit Auth integration with OpenID Connect
  - Configured PostgreSQL database with Drizzle ORM
  - Built responsive dashboard with real-time metrics and activity feeds
  - Added file upload system with validation and categorization
  - Implemented search functionality across documents and emails
  - Created README.md with complete documentation and setup instructions
- June 26, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.