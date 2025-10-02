# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a collaborative todo application with real-time synchronization, designed for teams of up to 5 users. The application features task management, user assignment, due dates, comments, and a shared dashboard view.

## Common Development Commands

### Full Setup
```bash
npm run setup              # Complete installation and database setup
npm run dev               # Run both client and server in development
```

### Individual Components
```bash
# Server (Backend)
cd server
npm run dev               # Start server with nodemon
npm run start             # Start server in production
npm run db:generate       # Generate Prisma client
npm run db:push          # Apply schema changes
npm run db:seed          # Populate with sample data

# Client (Frontend)
cd client
npm run dev              # Start Vite dev server
npm run build           # Build for production
npm run preview         # Preview production build
```

### Database Management
```bash
npm run db:setup         # Initialize database with sample data
```

### Docker Deployment
```bash
docker-compose up -d     # Start in production
docker-compose down      # Stop services
```

## Architecture Overview

### Technology Stack
- **Frontend**: React 18 + Vite + TailwindCSS + React Router
- **Backend**: Node.js + Express + Socket.io + Prisma ORM
- **Database**: SQLite (persistent, with Docker volumes)
- **Real-time**: WebSocket communication via Socket.io
- **Deployment**: Docker with CapRover support

### Project Structure
```
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Dashboard.jsx # Full-screen shared view
│   │   │   ├── TaskList.jsx  # Main task management
│   │   │   ├── TaskItem.jsx  # Individual task display
│   │   │   ├── TaskForm.jsx  # Task creation/editing
│   │   │   ├── UserSelector.jsx # User selection
│   │   │   └── CommentSection.jsx # Comments
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── useSocket.js # Socket.io integration
│   │   │   ├── useTasks.js  # Task state management
│   │   │   └── useUsers.js  # User state management
│   │   └── App.jsx          # Main application component
├── server/                   # Node.js backend
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   │   ├── tasks.js     # Task CRUD operations
│   │   │   └── users.js     # User management
│   │   ├── server.js        # Main server file
│   │   └── seed.js          # Database seeding
│   └── prisma/
│       └── schema.prisma    # Database schema
├── Dockerfile               # Multi-stage Docker build
├── docker-compose.yml       # Docker orchestration
└── captain-definition       # CapRover deployment config
```

## Database Schema

### Key Models
- **User**: id, name, avatar, isOnline (max 5 users)
- **Task**: id, title, status (todo/doing/done), dueDate, assigneeId
- **Comment**: id, content, taskId, authorId, createdAt

### Important Relations
- Users have many Tasks (via assigneeId)
- Tasks have many Comments
- Comments belong to User (author) and Task

## API Endpoints

### Tasks
- `GET /api/tasks` - List all tasks with assignments and comments
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task (status, assignee, dueDate)
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/comments` - Add comment to task

### Users
- `GET /api/users` - List all users with task counts
- `POST /api/users` - Create new user (max 5)
- `GET /api/users/export` - Export all data as JSON

## Real-time Features

### Socket.io Events
- `user:join` / `user:left` - User presence management
- `task:created` / `task:updated` / `task:deleted` - Task synchronization
- `users:online` - Online user updates

### Performance Requirements
- Real-time updates must be < 100ms
- Optimistic updates for immediate UI feedback
- Automatic reconnection handling

## Key Features

### Task Management
- Title (required), optional due date and assignee
- Status progression: todo → doing → done
- Visual indicators for overdue tasks
- Bulk operations and quick status changes

### Collaboration
- No complex authentication (user selection from list)
- Real-time presence indicators
- Instant synchronization across all clients
- Comment system with timestamps

### Dashboard View (`/dashboard`)
- Full-screen shared display for team screens
- Real-time statistics and progress tracking
- Task alerts and team status
- Auto-refreshing clock and metrics

### Dark Mode
- Persistent theme preference (localStorage)
- Smooth transitions between themes
- Consistent styling across all components

## Development Guidelines

### State Management
- Use custom hooks for API integration
- Socket.io for real-time state synchronization
- Local state for UI-only concerns
- Optimistic updates with error handling

### Error Handling
- Graceful WebSocket reconnection
- User-friendly error messages
- Fallback for offline scenarios
- Input validation on both client and server

### Performance Considerations
- Task list sorting: doing → todo → done, then by due date
- Efficient re-renders using React keys
- Debounced input for search/filter operations
- Lazy loading for large comment threads

### Styling Patterns
- TailwindCSS utility classes
- Consistent color scheme for task statuses
- Responsive design (mobile-first approach)
- Accessibility compliance (ARIA labels, keyboard navigation)

## Deployment Notes

### Environment Variables
- Server: `PORT`, `CLIENT_URL`, `DATABASE_URL`
- Client: `VITE_SERVER_URL` for API endpoint

### Docker Production
- Multi-stage build for optimization
- SQLite database with persistent volume
- Health checks for container monitoring
- CapRover compatibility with captain-definition

### Data Persistence
- SQLite database file in `/app/data` volume
- Automatic database initialization on first run
- Backup-friendly single-file database