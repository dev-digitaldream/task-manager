# Task Manager - Collaborative Todo Application

A modern, real-time collaborative task management application designed for teams, featuring multilingual support, ticketing system integrations, and email client extensions.

🌐 **Live Demo**: [https://task-manager.digitaldream.work](https://task-manager.digitaldream.work)

---

## ✨ Key Features

### 🌍 Internationalization (i18n)
- **3 Languages**: 🇬🇧 English, 🇫🇷 Français, 🇳🇱 Nederlands
- Automatic browser language detection
- User preference persistence
- Complete UI translations

### 🎨 Advanced UI/UX
- **Theme System**: Light, Dark, and System modes
- Real-time synchronization via WebSocket (< 100ms)
- Responsive design for mobile and desktop
- Modern interface with Radix UI components
- Persistent user preferences

### ✅ Task Management
- Create, edit, delete tasks with rich metadata
- User assignment and due dates
- Priority levels (Low, Medium, High, Urgent)
- Status tracking (To Do, Doing, Done)
- Comments system with timestamps
- File attachments via Cloudinary (10MB max)
- Recurring tasks with RRULE standard

### 📅 Calendar Integration
- **iCalendar subscription** (not just download)
- Permanent subscription URL for auto-sync
- Compatible with Google Calendar, Outlook, Apple Calendar
- Task-to-event conversion with reminders

### 📧 Email Client Extensions

#### Outlook Add-in
- Create tasks directly from Outlook (Desktop/Web)
- Auto-extract email subject, sender, body
- Available at `/outlook/manifest.xml`

#### Thunderbird Extension (NEW)
- Full-featured Thunderbird 102+ add-on
- Multi-language support (EN/FR/NL)
- 3 ways to create tasks:
  - Context menu on emails
  - Toolbar button
  - Message display action
- Configurable server URL
- Install: `thunderbird-addon/task-manager-thunderbird.xpi`

### 🎫 Ticketing System Integrations

Connect your task manager with enterprise ticketing systems:

#### Supported Platforms
- **Zammad** - Full REST API integration
- **osTicket** - Complete CRUD support
- **Freshdesk** - API v2 implementation

#### Features
- Bidirectional sync (tasks ↔ tickets)
- Create tickets from tasks
- Import tickets as tasks
- Connection testing
- Custom field mapping
- Priority and status synchronization

### 📊 Analytics & Reporting
- Real-time dashboard with KPIs
- Completion rate tracking
- Average completion time
- Task distribution by user/status/priority
- Meeting mode for critical tasks display

### 🔒 Security & Performance
- Helmet.js security headers
- CORS configuration
- Rate limiting (100 req/15min per IP)
- Input sanitization
- Gzip compression
- Health check endpoint

---

## 🚀 Quick Start

### Development Setup

```bash
# Complete installation (client + server + database)
npm run setup

# Start development servers
npm run dev
```

Access:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Dashboard: http://localhost:5173/dashboard
- Analytics: http://localhost:5173/analytics

### Production with Docker

```bash
# Build and start
docker-compose up -d

# Access
# http://localhost:3001
```

### CapRover Deployment

1. Configure environment variables in CapRover:
```bash
NODE_ENV=production
PORT=80
CLIENT_URL=https://task-manager.digitaldream.work
DATABASE_URL=file:/app/data/dev.db
CORS_ORIGINS=https://task-manager.digitaldream.work
```

2. Set up persistent directory:
   - **Path in App**: `/app/data`
   - **Label**: `task-manager-db`

3. Enable:
   - ✅ HTTPS
   - ✅ Force HTTPS
   - ✅ Websocket Support (critical for Socket.IO)

4. Deploy:
```bash
./deploy.sh
# or
caprover deploy
```

See [CAPROVER-DEPLOY.md](CAPROVER-DEPLOY.md) for detailed instructions.

---

## 📦 Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS + Radix UI
- **i18n**: i18next + react-i18next
- **Routing**: React Router v7
- **Icons**: Lucide React
- **Real-time**: Socket.IO Client

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express
- **Real-time**: Socket.IO
- **Database**: SQLite + Prisma ORM
- **File Upload**: Cloudinary + Multer
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate Limiting

### Infrastructure
- **Container**: Docker (multi-stage build)
- **Deployment**: CapRover compatible
- **Database**: SQLite with persistent volume
- **CDN**: Cloudinary for file storage

---

## 📁 Project Structure

```
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/             # React components
│   │   │   ├── TaskList.jsx
│   │   │   ├── UserProfile.jsx
│   │   │   ├── LanguageSwitcher.jsx
│   │   │   ├── ThemeSwitcher.jsx
│   │   │   ├── CalendarSubscription.jsx
│   │   │   ├── IntegrationsSettings.jsx
│   │   │   └── ...
│   │   ├── hooks/                  # Custom hooks
│   │   ├── locales/                # i18n translations
│   │   │   ├── en.json
│   │   │   ├── fr.json
│   │   │   └── nl.json
│   │   ├── i18n.js                 # i18n configuration
│   │   └── App.jsx
│   └── package.json
│
├── server/                          # Node.js Backend
│   ├── src/
│   │   ├── routes/                 # API routes
│   │   │   ├── tasks.js
│   │   │   ├── users.js
│   │   │   ├── integrations.js    # Ticketing integrations
│   │   │   └── ical.js            # Calendar endpoints
│   │   ├── integrations/          # Ticketing system integrations
│   │   │   ├── ticketing-base.js  # Base class
│   │   │   ├── zammad.js
│   │   │   ├── osticket.js
│   │   │   ├── freshdesk.js
│   │   │   └── index.js
│   │   ├── services/              # Business logic
│   │   │   ├── cloudinary.js
│   │   │   ├── recurring.js
│   │   │   └── notifications.js
│   │   ├── middleware/            # Express middleware
│   │   └── server.js              # Entry point
│   └── prisma/
│       └── schema.prisma          # Database schema
│
├── outlook-addin/                  # Outlook Extension
│   ├── manifest.xml
│   ├── taskpane.html
│   └── README.md
│
├── thunderbird-addon/              # Thunderbird Extension (NEW)
│   ├── manifest.json
│   ├── background.js
│   ├── popup.html
│   ├── popup.js
│   ├── _locales/                  # i18n for extension
│   └── README.md
│
├── Dockerfile                      # Multi-stage build
├── docker-compose.yml
├── start.sh                        # Container startup script
├── deploy.sh                       # Deployment helper
└── README.md                       # This file
```

---

## 🔌 API Reference

### Tasks
```http
GET    /api/tasks                    # List all tasks
POST   /api/tasks                    # Create task
PATCH  /api/tasks/:id                # Update task
DELETE /api/tasks/:id                # Delete task
POST   /api/tasks/:id/comments       # Add comment
```

### Users
```http
GET    /api/users                    # List users
POST   /api/users                    # Create user
GET    /api/users/export             # Export data
```

### Calendar
```http
GET    /api/ical/user/:id/subscribe.ics    # Subscribe to user calendar
GET    /api/ical/tasks/subscribe.ics       # Subscribe to all tasks
```

### Integrations (Ticketing)
```http
GET    /api/integrations?userId={id}               # List integrations
POST   /api/integrations/configure                 # Configure integration
POST   /api/integrations/test                      # Test connection
POST   /api/integrations/create-ticket             # Create ticket from task
POST   /api/integrations/import-ticket             # Import ticket as task
DELETE /api/integrations/:provider?userId={id}     # Remove integration
```

### File Attachments
```http
GET    /api/attachments/:taskId            # List attachments
POST   /api/attachments/:taskId            # Upload file
DELETE /api/attachments/file/:id           # Delete file
```

### WebSocket Events
```javascript
// Client → Server
socket.emit('user:join', userId)
socket.emit('task:create', taskData)
socket.emit('task:update', { id, updates })
socket.emit('task:delete', taskId)

// Server → Client
socket.on('task:created', (task) => {})
socket.on('task:updated', (task) => {})
socket.on('task:deleted', (taskId) => {})
socket.on('users:online', (users) => {})
```

---

## 🌐 Internationalization

### Adding a New Language

1. Create translation file:
```bash
# client/src/locales/de.json
{
  "common": { "save": "Speichern", ... },
  "tasks": { "title": "Aufgaben", ... },
  ...
}
```

2. Register in i18n config:
```javascript
// client/src/i18n.js
import de from './locales/de.json'

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  nl: { translation: nl },
  de: { translation: de }  // Add this
}
```

3. Update LanguageSwitcher component to include new flag

---

## 🎫 Setting Up Ticketing Integrations

### Zammad Configuration
```javascript
{
  provider: "zammad",
  apiUrl: "https://your-zammad.com",
  apiKey: "your-api-token",
  customConfig: {
    defaultGroup: "Support",
    customerEmail: "customer@example.com"
  }
}
```

### osTicket Configuration
```javascript
{
  provider: "osticket",
  apiUrl: "https://your-osticket.com",
  apiKey: "your-api-key",
  customConfig: {
    defaultTopicId: "1",
    defaultName: "Task Manager",
    defaultEmail: "support@example.com"
  }
}
```

### Freshdesk Configuration
```javascript
{
  provider: "freshdesk",
  apiUrl: "https://yourdomain.freshdesk.com",
  apiKey: "your-api-key",
  customConfig: {
    defaultEmail: "support@example.com"
  }
}
```

---

## 📧 Email Extensions

### Outlook Add-in Installation

1. Host the manifest file:
   - Production: `https://task-manager.digitaldream.work/outlook/manifest.xml`

2. Install in Outlook:
   - **Desktop**: File → Manage Add-ins → My Add-ins → Add from URL
   - **Web**: Settings → Manage Add-ins → Add from URL

### Thunderbird Extension Installation

**Development**:
```bash
# Thunderbird → Tools → Developer Tools → Debug Add-ons
# Load Temporary Add-on → Select manifest.json
```

**Production**:
```bash
cd thunderbird-addon
zip -r task-manager-thunderbird.xpi * -x "*.git*" "*.DS_Store"
# Install .xpi via Tools → Add-ons
```

---

## 🔧 Configuration

### Environment Variables

#### Server (.env)
```bash
# Application
NODE_ENV=production
PORT=3001
CLIENT_URL=https://task-manager.digitaldream.work

# Database
DATABASE_URL=file:/app/data/dev.db

# Security
CORS_ORIGINS=https://task-manager.digitaldream.work
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Cloudinary (File uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Notifications)
EMAIL_PROVIDER=dev                    # dev, postmark, sendgrid, smtp
EMAIL_FROM=dev@digitaldream.work
SMTP_HOST=smtp.example.com
SMTP_PORT=587
POSTMARK_API_TOKEN=your_token
SENDGRID_API_KEY=your_key
```

#### Client (.env)
```bash
VITE_SERVER_URL=http://localhost:3001
```

---

## 🛠️ Development

### Available Commands

```bash
# Root
npm run setup              # Complete setup (client + server + db)
npm run dev                # Start both client and server

# Client
cd client
npm run dev                # Vite dev server
npm run build              # Production build
npm run preview            # Preview production build

# Server
cd server
npm run dev                # Start with nodemon
npm run start              # Production start
npm run db:generate        # Generate Prisma client
npm run db:push            # Apply schema changes
npm run db:seed            # Seed demo data
```

### Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String?
  avatar    String?
  isOnline  Boolean  @default(false)
  tasks     Task[]
  comments  Comment[]
}

model Task {
  id          String    @id @default(cuid())
  title       String
  status      String    @default("todo")
  priority    String?
  dueDate     DateTime?
  assigneeId  String?
  assignee    User?     @relation(fields: [assigneeId], references: [id])
  isRecurring Boolean   @default(false)
  recurrenceRule String?
  comments    Comment[]
  attachments Attachment[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Attachment {
  id         String   @id @default(cuid())
  taskId     String
  task       Task     @relation(fields: [taskId], references: [id])
  fileName   String
  fileType   String
  fileSize   Int
  url        String
  publicId   String
  uploaderId String
  uploader   User     @relation(fields: [uploaderId], references: [id])
  createdAt  DateTime @default(now())
}
```

---

## 📊 Performance & Limits

- **WebSocket latency**: < 100ms for real-time updates
- **Max file upload**: 10MB per file
- **Rate limiting**: 100 requests per 15 minutes per IP
- **Recommended users**: < 100 active users (SQLite limitation)
- **Browser support**: Chrome, Firefox, Safari, Edge (latest 2 versions)

---

## 🔐 Security

### Built-in Security Features
- Helmet.js for HTTP headers
- CORS with configurable origins
- Input sanitization on all endpoints
- Rate limiting for API routes
- XSS protection
- CSRF token support (optional)
- Secure WebSocket connections (WSS in production)

### Ticketing Integration Security
- API keys stored server-side only
- **TODO**: Migrate to database with encryption
- Never expose credentials to client
- HTTPS required for production

---

## 📝 Documentation

- [New Features Guide](NOUVELLES_FONCTIONNALITES.md) - Complete feature documentation (FR)
- [CapRover Deployment](CAPROVER-DEPLOY.md) - Deployment guide
- [Deployment Config](DEPLOY_CONFIG.md) - Environment configuration
- [Thunderbird Extension](thunderbird-addon/README.md) - Extension setup
- [Outlook Add-in](outlook-addin/README.md) - Outlook integration

---

## 🐛 Troubleshooting

### Dark mode not working
- Clear browser cache and localStorage
- Ensure `ThemeSwitcher` component is properly initialized
- Check browser console for errors

### WebSocket connection fails
- Verify WebSocket support is enabled in CapRover
- Check CORS configuration
- Ensure firewall allows WebSocket connections

### Ticketing integration errors
- Test connection using the "Test Connection" button
- Verify API credentials
- Check API URL format (include protocol: https://)
- Review server logs for detailed error messages

### Calendar subscription not working
- Use the full subscription URL with `webcal://` or `https://`
- Check that the iCalendar endpoint is accessible
- Verify user ID in the subscription URL

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 📞 Support

- **Website**: https://task-manager.digitaldream.work
- **Email**: dev@digitaldream.work
- **Issues**: [GitHub Issues](https://github.com/dev-digitaldream/task-manager/issues)

---

## 🙏 Acknowledgments

- Built with [React](https://react.dev)
- UI components from [Radix UI](https://radix-ui.com)
- Icons by [Lucide](https://lucide.dev)
- Database ORM by [Prisma](https://prisma.io)
- Real-time by [Socket.IO](https://socket.io)
- File storage by [Cloudinary](https://cloudinary.com)

---

**Made with ❤️ by Digital Dream**

🤖 Enhanced with [Claude Code](https://claude.com/claude-code)
