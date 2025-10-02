# Task Manager - User Guide

**Open Source Task Management** by [Digital Dream](https://www.digitaldream.work)

---

## 🎯 Welcome!

Task Manager is a real-time collaborative task management application designed for teams. This guide will help you get started.

---

## 📝 Getting Started

### 1. First Login

1. Open the application in your browser
2. Click **"Login"** (or go to `/login`)
3. **Option A**: Select an existing user from the list
4. **Option B**: Enter a new name to create your account
5. Choose an avatar emoji (optional)
6. Click **"Login"**

**Note**: Authentication is simple by design. No password required for basic setup. For production, enable authentication in settings.

---

## 🏠 Dashboard (Public View)

The **public dashboard** (`/dashboard`) is accessible without login and displays:

- **Total tasks** across all users
- **Completion rate** percentage
- **Overdue tasks** count
- **Active members** online
- **Progress bar** showing overall completion
- **Task list** (public tasks only, read-only)

**Use case**: Display on a shared screen during standups or in the office.

---

## 📋 Task Management

### Creating a Task

1. Go to `/app` (requires login)
2. Click **"New Task"**
3. Fill in the form:
   - **Title** (required)
   - **Assign to**: Select a team member
   - **Priority**: Low, Medium, High, Urgent
   - **Due date**: Optional deadline
   - **Description**: Details about the task
   - **Public**: Toggle to show on dashboard
4. Click **"Create"**

**Real-time**: Tasks appear instantly for all online users!

### Task Indicators

Each task card displays:
- **Colored dot + text**: Priority (Gray/Yellow/Orange/Red)
- **Dot + text**: Client approval status (if enabled)
- **Eye icon**: Public visibility
- **Clock icon**: Overdue warning

### Updating a Task

1. Click on a task card to expand
2. Click **"Edit"** (pencil icon)
3. Modify any field
4. Click **"Update"**

**Status shortcuts**: Click the status dropdown to quickly change:
- **To Do** → Gray dot
- **In Progress** → Blue dot
- **Completed** → Green dot

### Deleting a Task

1. Click the task card
2. Click **"Delete"** (trash icon)
3. Confirm deletion

---

## 💬 Comments

### Adding Comments

1. Open a task
2. Scroll to the **Comments** section
3. Type your message
4. Click **"Send"**

Comments include:
- Author name and avatar
- Timestamp (relative: "2 minutes ago")
- Real-time updates

---

## 👥 User Management

### Viewing Users

1. Click the **Settings icon** (⚙️) in the header
2. See all registered users
3. View online status (green = online, gray = offline)

### Creating Users

1. Logout
2. Go to `/login`
3. Enter a new name
4. Choose an avatar
5. Click **"Create & Login"**

---

## 🔔 Notifications

### Email Notifications

If enabled by your administrator, you'll receive emails when:
- A task is assigned to you
- Someone completes your task
- New comments are added to your tasks
- Deadline is approaching (D-1)

### Managing Preferences

1. Click the **Bell icon** (🔔) in the header
2. Toggle notification types:
   - Assign notifications
   - Completion notifications
   - Comment notifications
3. Add your email address
4. Click **"Save"**

---

## 📅 Calendar Integration

### Subscribe to Your Tasks

1. Click the **Calendar icon** (📅) in the header
2. Copy the `.ics` URL
3. Add to your calendar app:

**iPhone/iPad**:
- Settings → Calendar → Accounts → Add Account
- Other → Add Subscribed Calendar
- Paste URL → Done

**Outlook**:
- File → Account Settings → Internet Calendars
- New → Paste URL → OK

**Google Calendar**:
- Settings → Add calendar → From URL
- Paste URL → Add calendar

Your tasks with due dates will appear in your calendar!

---

## 📊 Export & Backup

### Export JSON

1. Click the **Download icon** (⬇️) in the header
2. File downloads: `todo-export-YYYY-MM-DD.json`
3. Contains all tasks, users, and comments

### Export CSV

1. Click the **File icon** (📄) in the header
2. File downloads: `tasks-YYYY-MM-DD.csv`
3. Open in Excel or Google Sheets

---

## 🎨 Dark Mode

Toggle dark mode:
1. Click the **Sun/Moon icon** (☀️/🌙) in the header
2. Preference is saved automatically

---

## 🔍 Search & Filter

### Search Tasks

1. Use the **search bar** at the top
2. Search by:
   - Task title
   - Assignee name
   - Owner name

### Filter Tasks

Use the dropdowns to filter by:
- **Status**: To Do, In Progress, Completed
- **Priority**: Low, Medium, High, Urgent

Filters are combined (AND logic).

---

## 📱 Mobile Usage

The app is fully responsive:
- **Touch-friendly** buttons
- **Swipe** gestures (if enabled)
- **Optimized layout** for small screens
- **Fast loading** on mobile networks

---

## 🚀 Advanced Features

### Public/Private Tasks

**Private tasks** (default):
- Only visible to you and assignees
- Not shown on public dashboard

**Public tasks**:
1. Create or edit a task
2. Enable **"Show on public dashboard"**
3. Optionally add a **public summary** (masks sensitive info)
4. Save

### Client Approval Workflow

1. Create a task
2. Set **Client Approval** to "Pending"
3. Client reviews and sets to "Approved" or "Rejected"
4. Team executes approved tasks

### Recurring Tasks

(If enabled by administrator)

1. Create a task
2. Enable **"Recurring"**
3. Choose pattern: Daily, Weekly, Monthly
4. System auto-generates instances

### File Attachments

(If enabled by administrator)

1. Open a task
2. Click **"Attach files"**
3. Select files (max 10MB each)
4. Files are uploaded to cloud storage

---

## ⚙️ Admin Panel

### Accessing Admin Panel

If you're an administrator:
1. Click the **Shield icon** (🛡️) in the header
2. Access admin functions

### Admin Functions

- **Promote/demote admins**
- **View system stats**
- **Manage users**
- **Configure settings**

---

## 🆘 Troubleshooting

### Tasks not updating?

- Check your internet connection
- Refresh the page (Cmd/Ctrl+R)
- Check if WebSocket is connected (green indicator)

### Can't login?

- Try creating a new user
- Clear browser cache (Cmd+Shift+Delete)
- Contact your administrator

### Missing features?

Some features require:
- Administrator setup (email, calendar, files)
- Cloud version subscription
- Environment configuration

---

## 🔒 Privacy & Security

### Data Storage

- **Self-hosted**: All data stays on your server
- **Cloud**: Data encrypted at rest and in transit
- **GDPR compliant**: Export/delete your data anytime

### Permissions

- **Owner**: Can edit/delete own tasks
- **Assignee**: Can update status and comment
- **Public**: Read-only access to public tasks
- **Admin**: Full access to all features

---

## 💡 Tips & Best Practices

### Team Collaboration

1. **Use public dashboard** for daily standups
2. **Comment** instead of external messages
3. **Set deadlines** for accountability
4. **Assign clearly** to avoid confusion
5. **Update status** regularly

### Task Organization

1. **Use priorities** wisely (not everything is urgent!)
2. **Break down** large tasks into smaller ones
3. **Add descriptions** with context
4. **Link related tasks** in comments
5. **Archive completed tasks** periodically

### Performance

1. **Close old browsers tabs** to save memory
2. **Refresh occasionally** to get latest updates
3. **Use search/filter** instead of scrolling
4. **Export old data** and clean up database

---

## 📞 Support

### Community Support (Free)

- **GitHub Issues**: Report bugs or request features
- **Discussions**: Ask questions, share tips
- **Documentation**: Complete guides and API docs

### Priority Support (Cloud/Enterprise)

- **Email support**: support@digitaldream.work
- **Response time**: < 24h (business days)
- **Video calls**: For Enterprise plans
- **Custom development**: Contact sales

---

## 🔗 Resources

- **Website**: https://www.digitaldream.work
- **GitHub**: https://github.com/your-repo/task-manager
- **Documentation**: See `/docs` folder
- **Changelog**: See `CHANGELOG.md`

---

## 📜 License

**Open Source** (MIT License) - Self-hosting free forever

**Cloud/Enterprise** - Subscription required for hosted version

---

**Made with ❤️ by [Digital Dream](https://www.digitaldream.work)**

---

## 🎓 Quick Reference

### Keyboard Shortcuts

- `N` - New task
- `S` - Search
- `D` - Dark mode toggle
- `Esc` - Close modals
- `/` - Focus search

### Status Icons

- ⚫ Gray dot - To Do
- 🔵 Blue dot - In Progress
- 🟢 Green dot - Completed
- 🔴 Red dot - Overdue

### Priority Colors

- ⚫ Gray - Low
- 🟡 Yellow - Medium
- 🟠 Orange - High
- 🔴 Red - Urgent

---

**Version 1.0** - Last updated: October 2025
