# FlowSpaces SaaS Transformation Plan

## 🎯 Vision

Transform FlowSpaces from a simple task manager into a **multi-tenant SaaS platform** like Notion/Linear, with:

- Independent workspaces/teams
- Secure authentication with 2FA
- Email integration (killer feature)
- Public signup and workspace creation

---

## 📋 Phase 1: UI & Translations ✅ DONE

- [x] Premium dark sidebar design
- [x] Bento cards with pastel colors
- [x] Dark mode toggle
- [x] Translate all pages to English
- [x] Persistent sidebar across all pages

---

## 📋 Phase 2: Authentication System ✅ DONE

### 2.1 Database Schema Changes ✅

- [x] Added email verification fields
- [x] Added password reset tokens
- [x] Added 2FA fields (secret, backup codes)
- [x] Added Session model for secure sessions
- [x] Compatible with PostgreSQL (Supabase)

### 2.2 Authentication Features ✅

| Feature                   | Priority | Status    |
| ------------------------- | -------- | --------- |
| Email/Password signup     | High     | ✅ Done   |
| Email verification        | High     | ✅ Done   |
| Password reset via email  | High     | ✅ Done   |
| Login with session tokens | High     | ✅ Done   |
| Remember me               | Medium   | ✅ Done   |
| 2FA (TOTP)                | High     | ✅ Done   |
| OAuth (Google, GitHub)    | Low      | 🔜 Future |

### 2.3 API Endpoints ✅

All endpoints implemented:

```
POST /api/auth/register       ✅
POST /api/auth/login          ✅
POST /api/auth/logout         ✅
GET  /api/auth/verify-email   ✅
POST /api/auth/forgot-password ✅
POST /api/auth/reset-password ✅
POST /api/auth/2fa/setup      ✅
POST /api/auth/2fa/verify     ✅
POST /api/auth/2fa/disable    ✅
GET  /api/auth/me             ✅
POST /api/auth/change-password ✅
```

### 2.4 Frontend Components ✅

- [x] Modern LoginForm with premium design
- [x] ForgotPasswordPage (request & reset)
- [x] TwoFactorSetup wizard with QR code
- [x] ProfilePage security section updated

---

## 📋 Phase 3: Multi-Tenant Architecture

### 3.1 Database Schema

```prisma
model Workspace {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique  // e.g., "acme-corp"
  logo        String?
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id])

  members     WorkspaceMember[]
  tasks       Task[]
  invitations WorkspaceInvitation[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model WorkspaceMember {
  id          String   @id @default(cuid())
  userId      String
  workspaceId String
  role        String   @default("member") // owner, admin, member

  user        User      @relation(fields: [userId], references: [id])
  workspace   Workspace @relation(fields: [workspaceId], references: [id])

  @@unique([userId, workspaceId])
}

model WorkspaceInvitation {
  id          String   @id @default(cuid())
  email       String
  workspaceId String
  role        String   @default("member")
  token       String   @unique
  expiresAt   DateTime

  workspace   Workspace @relation(fields: [workspaceId], references: [id])

  createdAt   DateTime @default(now())
}
```

### 3.2 Features

| Feature                              | Priority | Complexity |
| ------------------------------------ | -------- | ---------- |
| Create workspace                     | High     | Low        |
| Invite members by email              | High     | Medium     |
| Accept invitation                    | High     | Medium     |
| Workspace roles (owner/admin/member) | High     | Low        |
| Switch between workspaces            | High     | Medium     |
| Leave workspace                      | Medium   | Low        |
| Transfer ownership                   | Low      | Medium     |
| Workspace settings                   | Medium   | Low        |

### 3.3 Data Isolation

All queries must be scoped by `workspaceId`:

```javascript
const tasks = await prisma.task.findMany({
  where: {
    workspaceId: currentWorkspace.id,
    // other filters
  },
});
```

---

## 📋 Phase 4: Email Integration (Killer Feature)

### 4.1 Create Tasks from Email

**Method 1: Email Forwarding**

1. User gets unique email: `tasks-abc123@flowspaces.work`
2. Forward any email to this address
3. FlowSpaces creates a task with:
   - Title: Email subject
   - Description: Email body
   - Attachments: Email attachments

**Method 2: Outlook Add-in** (Already exists)

- Improve existing add-in
- One-click task creation
- Auto-fill task details from email

**Method 3: Gmail Add-on**

- Similar to Outlook add-in
- Chrome extension alternative

### 4.2 Technical Requirements

```javascript
// Email receiving via SMTP or webhook
// Services: SendGrid Inbound Parse, Mailgun, AWS SES

// Webhook endpoint
POST /api/integrations/email/inbound
{
  from: "john@company.com",
  to: "tasks-abc123@flowspaces.work",
  subject: "Fix login bug",
  body: "The login page shows error 500...",
  attachments: [...]
}
```

### 4.3 Email Notifications

| Notification            | Priority |
| ----------------------- | -------- |
| Task assigned to you    | High     |
| Task status changed     | High     |
| Comment mention (@user) | High     |
| Due date reminder       | High     |
| Workspace invitation    | High     |
| Weekly digest           | Medium   |

---

## 🛠️ Implementation Order

### Week 1: Authentication

1. Update Prisma schema for auth
2. Implement register/login/logout
3. Add email verification
4. Add password reset
5. Update frontend login page

### Week 2: 2FA & Sessions

1. Implement TOTP 2FA
2. Add session management
3. Security improvements (rate limiting, etc.)

### Week 3: Multi-Tenant

1. Add Workspace model
2. Implement workspace CRUD
3. Add invitation system
4. Scope all queries by workspace

### Week 4: Email Integration

1. Set up email receiving (SendGrid/Mailgun)
2. Create inbound email webhook
3. Improve Outlook add-in
4. Add email notifications

---

## 📦 Dependencies to Add

### Backend

```json
{
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.2",
  "otplib": "^12.0.1",
  "qrcode": "^1.5.3",
  "nodemailer": "^6.9.8",
  "resend": "^2.1.0"
}
```

### Frontend

```json
{
  "react-hook-form": "^7.49.0",
  "zod": "^3.22.4",
  "@hookform/resolvers": "^3.3.2"
}
```

---

## 🔒 Security Considerations

1. **Password hashing**: bcrypt with cost factor 12
2. **Session tokens**: Secure random tokens, HTTP-only cookies
3. **Rate limiting**: 5 login attempts per minute
4. **Input validation**: Zod schemas for all inputs
5. **CORS**: Strict origin policy
6. **2FA**: TOTP with backup codes
7. **Email verification**: Required before full access

---

## 📊 Database Migration Path

1. Create new schema with migrations
2. Keep backward compatibility during transition
3. Migrate existing users to new auth system
4. Create default workspace for existing users

---

## 🚀 Next Immediate Steps

1. **NOW**: Start with Phase 2.1 - Update Prisma schema
2. Implement registration/login endpoints
3. Create new login/signup UI
4. Test authentication flow
5. Add password reset

Shall I start implementing Phase 2 (Authentication System)?
