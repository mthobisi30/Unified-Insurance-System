# Unified Insurance Operations System

A streamlined, auth-free "Operations Control Center" designed for insurance teams (Personal Lines, Commercial, Corporate, and Claims). This platform centralizes document filing, email archiving, task management, and meeting scheduling into a single unified dashboard, built for fast internal operations.

## Features

### Unified Home Dashboard
- **Operations Control Center**: A high-fidelity landing page with direct access to all system modules.
- **Real-time Metrics**: Instant overview of active tasks, documents filed today, scheduled meetings, and pending reviews.
- **Direct Navigation**: Seamless transition between Documents, Tasks, Calendar, and Email Archive without any login barriers.

### Document Management
- **File Upload & Storage**: Upload PDF, Word, and Excel documents up to 10MB.
- **Categorization**: Organize documents by type (Policies, Claims, Financials, etc.).
- **Search Functionality**: Powerful search across document names, descriptions, and categories.
- **Team-based Organization**: Isolated team environments (Personal, Commercial, Corporate, Claims).

### Task Management
- **Task Tracking**: Create and track operational tasks with priority levels (Low, Medium, High).
- **Status Workflow**: Manage task lifecycle from pending to completion.
- **Calendar Integration**: Visual overview of task deadlines in a calendar interface.

### Meeting Scheduling
- **Meeting Hub**: Schedule team strategy and claims review meetings.
- **Coordination**: Include location and video links for easy accessibility.
- **Sync Ready**: Designed for integration with organizational calendars.

### Email Archiving
- **Permanent Storage**: Archive client and provider emails with full content preservation.
- **Searchable Database**: Quickly find past communications by subject, sender, or date.
- **Organization**: Tag and categorize emails for long-term records management.

## Tech Stack

### Frontend
- **React 18** + TypeScript
- **Vite** for optimized performance
- **Tailwind CSS** + shadcn/ui for high-end operations design
- **TanStack Query** for efficient data fetching and caching
- **Wouter** for lightweight routing
- **Lucide React** for consistent iconography

### Backend
- **Node.js** + Express.js
- **Stateless Architecture**: No session management or auth overhead for maximum speed
- **Multer**: High-performance file upload handling
- **PostgreSQL**: Robust data persistence via Neon Serverless

### Database & Tooling
- **Drizzle ORM**: Type-safe database operations
- **Neon**: Serverless PostgreSQL for scalability
- **GitHub**: Integrated version control and Vercel deployment sync

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (e.g., Neon.tech)

### Steps
1. **Clone the repository**
   ```bash
   git clone https://github.com/mthobisi30/Unified-Insurance-System.git
   cd unified-insurance-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   NODE_ENV=development
   ```

4. **Database Setup**
   ```bash
   npm run db:push
   ```

5. **Start Application**
   ```bash
   npm run dev
   ```

## Project Structure
```
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # UI Design System
│   │   ├── pages/          # Home, Documents, Tasks, etc.
│   │   └── hooks/          # useAuth (Mocked), Query hooks
├── server/                 # Express Backend
│   ├── routes.ts           # Stateless API Endpoints
│   ├── storage.ts          # Data Access Layer
│   └── index.ts            # Local Server Entry
├── api/                    # Vercel Serverless Entry
├── shared/                 # Shared Schemas & Types
└── uploads/                # Local File Storage (/tmp on Vercel)
```

## Deployment
This project is optimized for **Vercel**.
- **Static Frontend**: Vite builds the client to `dist/public`.
- **Serverless API**: `api/index.ts` handles the Express backend.
- **Read-Only Fix**: File uploads use `/tmp` for serverless compatibility.

## Security
- **Internal Access**: Designed as a standalone operations tool.
- **Stateless**: No cookies or session tokens required for internal use.
- **Validation**: Strict file type and database schema validation.

---
**Unified Insurance Operations System | Streamlining Claims and Policies**