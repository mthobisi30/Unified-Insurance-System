# Unified Insurance Operations System

A comprehensive platform designed to streamline the day-to-day operations of insurance teams, including Personal Lines, Commercial, Corporate, and Claims. The system integrates document filing, email archiving, task management, and meeting scheduling, all within a single unified platform.

## Features

### Document Management
- **File Upload & Storage**: Upload PDF, Word, and Excel documents up to 10MB
- **Categorization**: Organize documents by type (Policy Documents, Claims Reports, Financial Reports, etc.)
- **Search Functionality**: Full-text search across document names, descriptions, and categories
- **Team-based Organization**: Documents are isolated by team for security and organization
- **Status Tracking**: Track document approval status (pending, approved, rejected)

### Task Management
- **Task Creation**: Create tasks with titles, descriptions, and priority levels
- **Assignment System**: Assign tasks to team members with due dates
- **Priority Levels**: Low, medium, and high priority task classification
- **Status Tracking**: Track task progress (pending, in-progress, completed)
- **Calendar Integration**: Due date management with calendar interface

### Meeting Scheduling
- **Calendar Interface**: Visual calendar for scheduling and viewing meetings
- **Meeting Details**: Include location, video links, and descriptions
- **Team Coordination**: Schedule meetings within team context
- **Status Management**: Track meeting status (scheduled, completed, cancelled)

### Email Archiving
- **Email Storage**: Archive important emails with full content preservation
- **Metadata Capture**: Store sender, recipient, date, and subject information
- **Categorization**: Organize archived emails by category and tags
- **Search Capability**: Search through archived email content and metadata

### Team Management
- **Multi-team Support**: Separate workspaces for different insurance teams
- **Team Switching**: Easy switching between teams (Personal Lines, Commercial, Corporate, Claims)
- **Role-based Access**: Team member and admin role management
- **Data Isolation**: Team-based data separation for security

### Dashboard & Analytics
- **Real-time Metrics**: Active tasks, documents filed today, meetings scheduled, pending reviews
- **Recent Activity**: Live feed of team activities across all modules
- **Quick Actions**: Fast access to common operations
- **Performance Tracking**: Visual indicators and progress tracking

## Tech Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with shadcn/ui components for modern UI
- **TanStack Query** for efficient server state management
- **Wouter** for lightweight client-side routing
- **React Hook Form** with Zod validation

### Backend
- **Node.js** with Express.js framework
- **TypeScript** with ES modules for type safety
- **Replit Auth** with OpenID Connect for authentication
- **Multer** for file upload handling
- **Express Session** with PostgreSQL storage

### Database
- **PostgreSQL** with Neon serverless connection
- **Drizzle ORM** for type-safe database operations
- **Connection pooling** for optimal performance
- **Automated migrations** with Drizzle Kit

### Development Tools
- **TypeScript** for full-stack type safety
- **PostCSS** with Tailwind CSS processing
- **ESLint** and **Prettier** for code quality
- **Hot Module Replacement** for fast development

## Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Git

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/unified-insurance-system.git
   cd unified-insurance-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file with the following variables:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   SESSION_SECRET=your_session_secret_key
   REPLIT_DOMAINS=your_domain.com
   ISSUER_URL=https://replit.com/oidc
   NODE_ENV=development
   ```

4. **Database Setup**
   ```bash
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access the Application**
   Open your browser to `http://localhost:5000`

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── App.tsx         # Main application component
├── server/                 # Backend Express application
│   ├── db.ts              # Database connection
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Data access layer
│   ├── replitAuth.ts      # Authentication setup
│   └── index.ts           # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema and types
└── uploads/               # File upload directory
```

## API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user information
- `GET /api/login` - Initiate login flow
- `GET /api/logout` - Logout user
- `POST /api/setup` - Initialize user teams

### Teams
- `GET /api/teams` - Get user teams
- `POST /api/teams/:id/select` - Select active team

### Documents
- `GET /api/documents` - Get team documents
- `POST /api/documents/upload` - Upload documents
- `GET /api/documents/search` - Search documents

### Tasks
- `GET /api/tasks` - Get team tasks
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task

### Meetings
- `GET /api/meetings` - Get team meetings
- `POST /api/meetings` - Schedule meeting

### Email Archives
- `GET /api/email-archives` - Get archived emails
- `POST /api/email-archives` - Archive email

### Dashboard
- `GET /api/dashboard/metrics` - Get dashboard metrics
- `GET /api/dashboard/recent-activity` - Get recent activity

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio

### Database Schema
The application uses a normalized PostgreSQL schema with the following main tables:
- `users` - User accounts and profiles
- `teams` - Insurance team definitions
- `team_members` - User-team relationships
- `documents` - File metadata and storage info
- `tasks` - Task management and assignments
- `meetings` - Calendar and meeting data
- `email_archives` - Archived email storage
- `activity_log` - System activity tracking
- `sessions` - User session storage

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
Ensure all production environment variables are configured:
- `DATABASE_URL` - Production database connection
- `SESSION_SECRET` - Secure session encryption key
- `REPLIT_DOMAINS` - Production domain(s)
- `NODE_ENV=production`

### Database Migration
```bash
npm run db:push
```

## Security Features

- **Session-based Authentication** with secure cookie handling
- **Team-based Data Isolation** for multi-tenant security
- **File Upload Validation** with type and size restrictions
- **SQL Injection Protection** through parameterized queries
- **CSRF Protection** with secure session management

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the API documentation above

---

**Built with modern web technologies for insurance operations teams**