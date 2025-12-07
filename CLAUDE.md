# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FlowSpaces** is a professional collaborative task management platform with enterprise features. It supports multi-tenancy (workspaces), real-time synchronization, file attachments, recurring tasks, integrations with ticketing systems, calendar subscriptions, email client extensions, and analytics. The application includes workspace management, user authentication with 2FA, audit logging, and advanced task features.

**Tech Stack**: React 18 + Vite (frontend), Node.js + Express (backend), PostgreSQL + Prisma ORM, Socket.io (real-time), Cloudinary (file storage), Email extensions (Outlook/Thunderbird).

## Common Development Commands

### Full Setup
```bash
npm run setup              # Install dependencies, generate Prisma, push schema, seed data
npm run dev               # Run both client (Vite) and server (nodemon) concurrently
```

### Client (React + Vite)
```bash
cd client
npm run dev               # Dev server at http://localhost:5173
npm run build             # Production build
npm run preview           # Preview built version
```

### Server (Node.js + Express)
```bash
cd server
npm run dev               # Watch mode with nodemon
npm run start             # Production mode
npm run db:generate       # Generate Prisma client (rarely needed)
npm run db:push           # Sync Prisma schema to PostgreSQL
npm run db:migrate        # Interactive migration creation
npm run db:seed           # Run seed script (server/src/seed.js)
```

## Architecture Overview

### Technology Stack
- **Frontend**: React 18, Vite, TailwindCSS, Radix UI, Socket.io-client, i18next (EN/FR/NL)
- **Backend**: Node.js, Express, Prisma ORM, Socket.io, Helmet, CORS, Rate limiting
- **Database**: PostgreSQL with Prisma
- **Real-time**: WebSocket via Socket.io (< 100ms target latency)
- **File Storage**: Cloudinary (up to 10MB per file)
- **Email**: Nodemailer (Postmark, SendGrid, SMTP support)
- **Extensions**: Outlook Add-in, Thunderbird extension, iCalendar subscriptions

### Directory Structure
```
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/             # 50+ feature components (Tasks, Users, Workspace, etc.)
│   │   ├── hooks/                  # Custom hooks (useSocket, useTasks, useExpenses, etc.)
│   │   ├── context/                # React Context (WorkspaceContext, SearchContext)
│   │   ├── locales/                # i18n translations (en.json, fr.json, nl.json)
│   │   ├── i18n.js                 # i18next configuration
│   │   └── App.jsx                 # Main routing & auth logic
│   └── vite.config.js
│
├── server/                          # Node.js backend
│   ├── src/
│   │   ├── routes/                 # API endpoints (tasks, users, auth, ical, integrations, etc.)
│   │   ├── integrations/           # Ticketing system integrations (Zammad, osTicket, Freshdesk)
│   │   ├── services/               # Business logic (cloudinary.js, recurring.js, notifications.js)
│   │   ├── middleware/             # Security (Helmet, rate limit, input sanitization)
│   │   ├── server.js               # Express app setup & Socket.io
│   │   └── seed.js                 # Database seeding script
│   ├── prisma/
│   │   └── schema.prisma           # Database models (User, Task, Workspace, etc.)
│   └── package.json
│
├── outlook-addin/                   # Outlook Add-in manifest & files
├── thunderbird-addon/               # Thunderbird extension
├── Dockerfile                       # Multi-stage build
├── docker-compose.yml               # Services: app + PostgreSQL
├── start.sh                         # Container entrypoint
└── README.md                        # Full documentation
```

## Core Concepts

### Multi-Tenancy (Workspaces)
The application is workspace-based. Each workspace is isolated with:
- **Workspace model**: id, name, slug (URL-safe), description, logo, owner
- **WorkspaceMember model**: Manages user access per workspace (roles: owner, admin, member)
- **All tasks/resources** are scoped to `workspaceId` (foreign key constraint)

Key files: [server/src/routes/workspaces.js](server/src/routes/workspaces.js), Prisma schema lines 142-200+

### Authentication & Sessions
- **Password**: Hashed with bcryptjs
- **2FA**: TOTP (otplib) with backup codes stored as JSON
- **Email Verification**: Token-based with expiry
- **Sessions**: Stored in DB with token, userAgent, ipAddress, expiresAt

Key files: [server/src/routes/auth.js](server/src/routes/auth.js)

### Real-time Synchronization
Socket.io handles task updates, user presence, and comments across clients. All events go through the server's socket handler, which broadcasts changes to connected clients.

Events: `task:create`, `task:update`, `task:delete`, `comment:add`, `user:join`, `user:left`

### Task Features
- **Status**: todo, doing, done
- **Priority**: low, medium, high, urgent
- **Recurring**: RRULE format (RFC 5545), parent-child relationships
- **Subtasks**: Checklist items (Subtask model)
- **Attachments**: Via Cloudinary (Attachment model tracks fileSize, publicId, url)
- **Color/Icon**: Custom colors (hex) and Material icons per task
- **Visibility**: isPublic flag, publicSummary for dashboard display
- **Approval**: clientApproval enum (none, pending, approved, rejected)

Key files: [server/src/routes/tasks.js](server/src/routes/tasks.js), schema lines 24-66

### Integrations
**Ticketing Systems**: Bidirectional sync with Zammad, osTicket, Freshdesk
- Base class pattern: [server/src/integrations/ticketing-base.js](server/src/integrations/ticketing-base.js)
- Stored in UserIntegration model (per-user configuration, encrypted API keys TODO)

**iCalendar**: Subscription endpoints at `/api/ical/user/:id/subscribe.ics` and `/api/ical/tasks/subscribe.ics`
- Uses `ical-generator` library
- Real calendar apps (Google, Outlook) auto-sync via webcal:// protocol

### File Attachments & Cloudinary
- Upload endpoint: `POST /api/attachments/:taskId`
- Uses Multer middleware + Cloudinary SDK
- Stores fileSize, fileType, url, publicId for deletion
- Max 10MB per file (configured in server/src/server.js line 50)

Key service: [server/src/services/cloudinary.js](server/src/services/cloudinary.js)

## Database Models (Key Fields)

**User**: id, name, password (hashed), email, avatar, isOnline, isAdmin, emailVerified, twoFactorEnabled, twoFactorSecret, backupCodes, notifyOnAssign/Complete/Comment, createdAt, updatedAt

**Task**: id, title, description, status, startDate, dueDate, color, icon, workspaceId, assigneeId, ownerId, isPublic, publicSummary, isRecurring, recurrenceRule, parentTaskId, priority, clientApproval, approvalComment, createdAt, updatedAt

**Workspace**: id, name, slug, description, logo, ownerId, createdAt, updatedAt

**WorkspaceMember**: id, workspaceId, userId, role (owner/admin/member), joinedAt

**Comment**: id, content, taskId, authorId (userId), createdAt

**Attachment**: id, taskId, fileName, fileType, fileSize, url, publicId, uploaderId, createdAt

**Subtask**: id, taskId, content, completed, order, createdAt, updatedAt

**AuditLog**: Tracks all changes (user, action, targetType, targetId, timestamp)

## Key Frontend Patterns

### Hooks for State Management
- **useSocket**: WebSocket connection & event handling (auto-reconnect)
- **useTasks**: Task CRUD operations + caching
- **useExpenses**: Expense tracking
- **useDashboard**: Dashboard stats & metrics
- **usePublicTasks**: Public task visibility
- **useQuickTodos**: Quick capture mode

### Context Providers
- **WorkspaceProvider**: Current workspace, members, permissions
- **SearchContext**: Global search functionality across tasks

### Protected Routes
App.jsx uses ProtectedPage/ProtectedRoute wrappers that check `currentUser` and redirect to `/login` if missing. All protected routes wrap children with WorkspaceProvider + SearchProvider.

### Styling
- TailwindCSS utilities throughout
- Radix UI for accessible components (Dialog, Select, Dropdown, etc.)
- Dark mode via class toggle on `html` element
- Lucide icons for consistency

## Security Considerations

### Backend Security
- **Helmet.js**: HTTP security headers (CSP, X-Frame-Options, etc.)
- **CORS**: Configured via getCorsOptions() in middleware/security.js
- **Rate Limiting**: 100 req/15min per IP (production only)
- **Input Sanitization**: sanitizeInput middleware strips HTML/scripts
- **Error Handler**: errorHandler middleware catches exceptions

Files: [server/src/middleware/security.js](server/src/middleware/security.js)

### API Key Storage
**TODO**: Ticketing integration API keys currently stored in plaintext in UserIntegration. Should encrypt at rest.

### Environment Variables
**Server (.env)**:
```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/task_manager
CLIENT_URL=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com

# File uploads
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Email
EMAIL_PROVIDER=postmark|sendgrid|smtp
POSTMARK_API_TOKEN=xxx
SENDGRID_API_KEY=xxx
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=xxx
SMTP_PASS=xxx
EMAIL_FROM=noreply@example.com
```

**Client (.env)**:
```
VITE_SERVER_URL=http://localhost:3001
```

## Common Tasks & Patterns

### Adding a New API Route
1. Create file in server/src/routes/feature.js
2. Use Express router: `const router = express.Router()`
3. Attach Prisma queries using `prisma.model.findUnique()` etc.
4. Register in server.js: `app.use('/api/feature', require('./routes/feature'))`
5. Test with curl or REST client

### Sending Real-time Updates
In routes or services, emit Socket.io events:
```javascript
io.emit('task:updated', updatedTask)
```
The io instance is available via require/import or passed as dependency.

### Adding a New Language
1. Create [client/src/locales/de.json](client/src/locales/de.json) with all translation keys
2. Import in [client/src/i18n.js](client/src/i18n.js) and add to resources
3. Add language option to LanguageSwitcher component

### Working with Cloudinary Uploads
Files uploaded via [client/src/components/FileUpload.jsx](client/src/components/FileUpload.jsx) go to POST /api/attachments/:taskId. The server uses [server/src/services/cloudinary.js](server/src/services/cloudinary.js) to upload, returning url and publicId.

### Understanding Recurring Tasks
Use RRULE format (RFC 5545). The recurring.js service handles generating instances. Parent tasks have `isRecurring=true`, child instances link via `parentTaskId`.

## Testing & Debugging

### Check Socket.io Connectivity
Open browser DevTools → Network → WS. Should see Socket.io connection messages.

### Database Inspection
```bash
cd server && npx prisma studio  # Visual database browser
```

### Seed Data
Run `npm run db:seed` in server/ to populate with demo data (see seed.js).

## Deployment

### Docker
```bash
docker-compose up -d   # Builds image, starts app + PostgreSQL
docker-compose down    # Stops all services
```

Multi-stage Dockerfile optimizes build size. Database runs in separate postgres service with volume for persistence.

### CapRover
Use captain-definition file for automatic deployment. Ensure:
- HTTPS enabled
- WebSocket support enabled
- Persistent volumes for /app/data (if using PostgreSQL volumes)
- Environment variables set in CapRover panel

## Performance Optimization Notes

- **Socket.io**: All clients receive updates in < 100ms target
- **Task Sorting**: Frontend sorts by status (todo/doing/done) then dueDate
- **Pagination**: Large task lists should paginate (not yet implemented)
- **PostgreSQL**: Indices on workspaceId, assigneeId, ownerId recommended for queries
- **File Uploads**: Cloudinary handles image optimization, compression

## Known Limitations & TODOs

- Ticketing API keys stored plaintext (encrypt at rest)
- No pagination for large datasets (1000+ tasks)
- WebSocket reconnection could be optimized with exponential backoff
- Audit logs may grow large without archival strategy