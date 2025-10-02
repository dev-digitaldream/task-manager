# Testing Guide

Complete testing checklist for Todo Collaboratif.

---

## 🧪 Automated Tests

### Backend API Tests

```bash
# Health check
curl http://localhost:3001/health
# Expected: {"status":"OK","timestamp":"..."}

# Public tasks endpoint
curl http://localhost:3001/api/tasks/public
# Expected: Array of public tasks

# Users endpoint
curl http://localhost:3001/api/users
# Expected: Array of users

# Rate limiting test (should block after 100 requests)
for i in {1..110}; do 
  curl -s http://localhost:3001/api/tasks > /dev/null
  echo -n "."
done
# Expected: "Too many requests..." after request 101

# Security headers check
curl -I http://localhost:3001/health | grep -E "X-|Content-Security"
# Expected: Multiple security headers

# Compression test
curl -H "Accept-Encoding: gzip" -I http://localhost:3001/health | grep "Content-Encoding"
# Expected: Content-Encoding: gzip
```

### Frontend Tests

```bash
# Start frontend
cd client
npm run dev

# Access in browser:
# - http://localhost:5173 (should redirect to /dashboard)
# - http://localhost:5173/dashboard (public, no auth)
# - http://localhost:5173/app (requires login)
```

---

## ✅ Manual Testing Checklist

### Public Dashboard (No Auth Required)
- [ ] Visit `/dashboard` - loads without login
- [ ] See KPI cards (total tasks, completion rate, overdue, members)
- [ ] See progress bar
- [ ] See task list with safe fields only
- [ ] Clock displays and updates every second
- [ ] Dark mode toggle works
- [ ] No "Edit" or "Delete" buttons visible
- [ ] "Claim task" button visible for unassigned tasks

### Authentication
- [ ] Visit `/app` - redirects to `/login`
- [ ] Login with existing user (select from dropdown)
- [ ] Login creates new user if name doesn't exist
- [ ] After login, redirected to `/app`
- [ ] User avatar appears in header
- [ ] Logout button works

### Task Management (Requires Auth)
- [ ] Click "New Task" - form opens
- [ ] Create task with all fields:
  - Title (required)
  - Assignee
  - Owner (auto-set to current user)
  - Priority (low/medium/high/urgent)
  - Due date
  - Public visibility checkbox
  - Public summary (optional)
- [ ] Task appears in list immediately (real-time)
- [ ] Click task to expand details
- [ ] Edit task - changes reflected immediately
- [ ] Change status (To Do → In Progress → Completed)
- [ ] Add comment - appears in task detail
- [ ] Delete task - removed immediately
- [ ] Toggle "Show on public dashboard" - task appears/disappears on dashboard

### Real-time Sync
- [ ] Open two browser windows
- [ ] Create task in window 1 - appears in window 2 (<100ms)
- [ ] Update task in window 1 - updates in window 2
- [ ] Delete task in window 1 - removed in window 2
- [ ] User goes online - green dot appears for all users
- [ ] User goes offline - grey dot appears

### Search & Filters
- [ ] Search by title - filters results
- [ ] Search by assignee - filters results
- [ ] Search by owner - filters results
- [ ] Filter by status (To Do/In Progress/Completed)
- [ ] Filter by priority (Low/Medium/High/Urgent)
- [ ] Combined filters work together
- [ ] Clear search button works
- [ ] Results count displays correctly

### Export & Calendar
- [ ] Export JSON - downloads file with all tasks
- [ ] Export CSV - downloads CSV with correct columns
- [ ] Calendar modal - displays .ics URL
- [ ] Copy .ics URL to clipboard
- [ ] Subscribe in Outlook/iPhone - tasks appear

### Admin Panel (Admin Users Only)
- [ ] Admin badge visible in user list
- [ ] Admin panel button visible in header
- [ ] Can promote user to admin
- [ ] Can demote admin to regular user
- [ ] Can view all users with stats

### Notifications (If Configured)
- [ ] Assign task - email sent to assignee
- [ ] Complete task - email sent to owner
- [ ] Add comment - email sent to owner/assignee
- [ ] Deadline D-1 - reminder email sent

### File Uploads (If Cloudinary Configured)
- [ ] Attach file to task
- [ ] File uploaded to Cloudinary
- [ ] File preview visible in task detail
- [ ] Download file works
- [ ] Delete file works

### Outlook Extension
- [ ] Sideload manifest.xml in Outlook
- [ ] Extension button appears in ribbon
- [ ] Click button - taskpane opens
- [ ] Email subject pre-filled in title
- [ ] Select assignee
- [ ] Create task - appears in app

---

## 🔒 Security Tests

### XSS Prevention
```bash
# Try to inject script in task title
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"<script>alert(1)</script>","ownerId":"user-id"}'

# Verify response sanitizes input
# Expected: Title should be HTML-escaped
```

### Rate Limiting
```bash
# Exceed rate limit
for i in {1..150}; do
  curl -s http://localhost:3001/api/tasks > /dev/null
done

# Expected: 429 Too Many Requests after 100
```

### CORS
```bash
# Try request from unauthorized origin
curl -H "Origin: https://evil.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS http://localhost:3001/api/tasks

# Expected: No CORS headers in response (blocked)
```

### SQL Injection (Prisma protects automatically)
```bash
# Try SQL injection in search
curl "http://localhost:3001/api/tasks?search=' OR '1'='1"

# Expected: Prisma parameterizes queries, no injection
```

---

## 📊 Performance Tests

### Response Time
```bash
# Measure API latency
time curl -s http://localhost:3001/api/tasks > /dev/null

# Expected: <200ms
```

### WebSocket Latency
```bash
# Measure real-time update speed
# (Manual test: create task, measure time until visible in other window)
# Expected: <100ms
```

### Load Test (Optional - requires Apache Bench)
```bash
# 100 concurrent requests
ab -n 1000 -c 100 http://localhost:3001/api/tasks

# Monitor:
# - Requests per second
# - Average response time
# - Failed requests (should be 0)
```

---

## 🐛 Bug Testing

### Edge Cases
- [ ] Create task with empty title - shows error
- [ ] Create task with very long title (1000+ chars) - truncates or errors
- [ ] Set due date in past - accepts (overdue indicator shown)
- [ ] Delete task with comments - comments deleted (cascade)
- [ ] Delete user - tasks unassigned (no orphans)
- [ ] Multiple users edit same task - last write wins
- [ ] Network disconnected - shows offline indicator
- [ ] Network reconnected - syncs automatically

### Browser Compatibility
- [ ] Chrome (desktop) - all features work
- [ ] Firefox (desktop) - all features work
- [ ] Safari (desktop) - all features work
- [ ] Safari (iOS) - responsive, touch works
- [ ] Chrome (Android) - responsive, touch works
- [ ] Edge (Windows) - all features work

### Dark Mode
- [ ] Toggle dark mode - all elements styled correctly
- [ ] Refresh page - preference persisted
- [ ] Text readable in both modes
- [ ] Borders visible in both modes
- [ ] Icons visible in both modes

---

## 📱 Mobile Testing

### Responsive Layout
- [ ] Dashboard readable on phone (portrait)
- [ ] Dashboard readable on phone (landscape)
- [ ] Task list scrollable on phone
- [ ] Task form usable on phone
- [ ] Search/filters accessible on phone
- [ ] Buttons large enough to tap (44x44 minimum)

### Touch Gestures
- [ ] Swipe works (if implemented)
- [ ] Tap to expand task works
- [ ] Long press for context menu (if implemented)
- [ ] Pinch to zoom disabled on form inputs

---

## 🚀 Production Readiness

### Environment
- [ ] NODE_ENV=production set
- [ ] All secrets in .env (not in code)
- [ ] HTTPS enabled (SSL certificate)
- [ ] CORS configured for production domain
- [ ] Rate limiting active
- [ ] Error messages sanitized (no stack traces)

### Monitoring
- [ ] PM2 running and auto-restart enabled
- [ ] Logs accessible via `pm2 logs`
- [ ] Health check endpoint responding
- [ ] Database backups configured (daily cron)

### Documentation
- [ ] README.md complete
- [ ] DEPLOYMENT.md accurate
- [ ] API endpoints documented
- [ ] Environment variables documented

---

## ✅ Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No console errors in browser
- [ ] No server errors in logs
- [ ] Security headers present
- [ ] Rate limiting working
- [ ] CORS configured correctly
- [ ] Database migrations applied
- [ ] Static files served correctly
- [ ] WebSocket connections stable
- [ ] Email notifications working (if configured)
- [ ] File uploads working (if configured)
- [ ] Calendar sync working
- [ ] Outlook extension working (if deployed)

---

## 🔄 Continuous Testing

### After Each Deploy
1. Run health check
2. Test public dashboard
3. Test task creation
4. Test real-time sync
5. Check logs for errors
6. Monitor performance

### Weekly
1. Check for dependency updates (`npm audit`)
2. Review logs for errors
3. Test backup/restore
4. Check disk space (database growth)
5. Review rate limit stats

### Monthly
1. Full security audit
2. Performance benchmarks
3. Load testing
4. User feedback review
5. Update documentation

---

## 📝 Test Report Template

```markdown
## Test Report - [Date]

### Environment
- Branch: [main/develop/feature]
- Commit: [hash]
- Tester: [name]

### Results
- Total tests: X
- Passed: Y
- Failed: Z
- Skipped: W

### Failed Tests
1. [Test name]
   - Expected: [...]
   - Actual: [...]
   - Steps to reproduce: [...]

### Performance
- Average API response: Xms
- WebSocket latency: Xms
- Failed requests: X%

### Notes
- [Any observations]
- [Known issues]
- [Recommendations]

### Sign-off
- [ ] Ready for deployment
- [ ] Needs fixes
```

---

## 🎯 Success Criteria

### Minimum Requirements
- ✅ All critical features work
- ✅ No security vulnerabilities
- ✅ Response time <500ms
- ✅ Real-time updates <200ms
- ✅ No data loss
- ✅ Logs accessible

### Recommended
- ✅ All tests passing
- ✅ Response time <200ms
- ✅ Real-time updates <100ms
- ✅ 99% uptime
- ✅ Automated backups

### Excellent
- ✅ Unit tests (80%+ coverage)
- ✅ E2E tests
- ✅ Response time <100ms
- ✅ Real-time updates <50ms
- ✅ 99.9% uptime
- ✅ Monitoring/alerting
- ✅ CI/CD pipeline

---

**Good luck with testing! 🚀**
