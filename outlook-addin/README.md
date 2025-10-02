# Outlook Add-in - Task Manager

Microsoft Outlook extension to create tasks directly from emails.

## 📋 Features

- ✅ Create tasks from any email
- ✅ Auto-extract subject as task title
- ✅ Add email body as comment
- ✅ Assign to users
- ✅ Set priority and due date
- ✅ Publish to public dashboard
- ✅ Native Outlook interface

## 🚀 Installation

### Prerequisites

1. **Host the files** via HTTPS on `task-manager.digitaldream.work`
2. **Create icons** (PNG: 16x16, 32x32, 64x64, 128x128)
3. **Configure CORS** on server

### Method 1: Outlook Web (Recommended for New Manifest)

**⚠️ Important**: Microsoft now requires the **JSON manifest format** (Unified Manifest) for new add-ins.

1. Open **Outlook on the web** (outlook.office.com)
2. Click **Settings** (⚙️) → **View all Outlook settings**
3. Go to **General → Manage add-ins**
4. Click **+ Add a custom add-in**
5. Select **Add from URL**
6. Enter: `https://task-manager.digitaldream.work/outlook/manifest.json`
7. Click **Install**

### Method 2: Sideload for Testing (Desktop)

**For development/testing only:**

1. Download the manifest file locally
2. Open Outlook Desktop
3. Go to **File → Info → Manage Add-ins** (or **Get Add-ins**)
4. Click **My add-ins** → **Add a custom add-in** → **Add from file**
5. Select the downloaded `manifest.json`
6. Accept the installation

### Method 3: Centralized Deployment (Microsoft 365 Admin)

**For organizations:**

1. Sign in to **Microsoft 365 Admin Center**
2. Go to **Settings → Integrated apps**
3. Click **Upload custom apps**
4. Select **Upload manifest file**
5. Upload `manifest.json` (or `manifest.xml` for legacy support)
6. Assign to users/groups

## 📁 Manifest Files

We provide **two manifest formats**:

### 1. **manifest.json** (Unified Manifest - RECOMMENDED)
- Modern JSON format
- Required for new Outlook add-ins (2024+)
- Better support for newer Outlook versions
- Use this URL: `https://task-manager.digitaldream.work/outlook/manifest.json`

### 2. **manifest.xml** (Legacy - For older Outlook)
- Classic XML format
- For older Outlook Desktop versions
- May not work in newest Outlook Web
- Use this URL: `https://task-manager.digitaldream.work/outlook/manifest.xml`

**Microsoft's Transition**: Microsoft is phasing out XML manifests in favor of JSON Unified Manifests. If you can't install the XML version, use the JSON version.

## 🔧 Server Configuration

### 1. Serve Outlook Files

```javascript
// server/src/server.js
app.use('/outlook', express.static(path.join(__dirname, '../../outlook-addin')));
```

### 2. Configure CORS

```javascript
// server/src/server.js
app.use(cors({
  origin: [
    'https://outlook.office.com',
    'https://outlook.office365.com',
    'https://outlook.live.com',
    'https://task-manager.digitaldream.work'
  ],
  credentials: true
}));
```

### 3. Create Icons

Create PNG icons at these sizes:
- `icon-16.png` (16x16)
- `icon-32.png` (32x32)
- `icon-64.png` (64x64)
- `icon-128.png` (128x128)

Place them in `/outlook-addin/` directory.

## 💡 Usage

1. Open any email in Outlook
2. Look for the **Task Manager** button in the ribbon (Home tab)
3. Click **Create Task**
4. Side panel opens with:
   - Pre-filled title (email subject)
   - Email sender displayed
   - Task creation form
5. Fill in the details and click **Create Task**

## 🌐 API Endpoints Used

The add-in communicates with:
```
GET  https://task-manager.digitaldream.work/api/users
POST https://task-manager.digitaldream.work/api/tasks
POST https://task-manager.digitaldream.work/api/tasks/:id/comments
```

## 📱 Compatibility

| Platform | JSON Manifest | XML Manifest |
|----------|--------------|--------------|
| Outlook Web (2024+) | ✅ Yes | ⚠️ Limited |
| Outlook Desktop (Win) | ✅ Yes | ✅ Yes |
| Outlook Desktop (Mac) | ✅ Yes | ✅ Yes |
| Outlook Mobile | ✅ Yes | ⚠️ Limited |
| Office 365 | ✅ Yes | ✅ Yes |

**Note**: For maximum compatibility with modern Outlook, use the **JSON manifest**.

## 🔒 Security

- **HTTPS Required**: All connections must use HTTPS
- **Permissions**: `MailboxItem.Read.User` (read email only)
- **No storage**: Email content is not stored on the server
- **Secure API**: All communications via HTTPS

## 🐛 Troubleshooting

### Add-in doesn't appear
- Verify manifest is accessible via HTTPS
- Check if using correct manifest format (JSON for new Outlook)
- Clear Outlook cache and restart
- Try the other manifest format

### "Manifest not supported" error
- You're trying to use XML manifest in new Outlook
- Switch to `manifest.json` instead

### CORS errors
- Verify CORS configuration on server
- Ensure `https://outlook.office.com` is allowed
- Check browser console (F12) in taskpane

### Users don't load
- Check if `/api/users` endpoint is accessible
- Open DevTools console in taskpane (F12)
- Verify CORS headers

## 📚 Resources

- [Office Add-ins Documentation](https://docs.microsoft.com/office/dev/add-ins/)
- [Unified Manifest (JSON)](https://docs.microsoft.com/office/dev/add-ins/develop/unified-manifest-overview)
- [Outlook Add-ins API](https://docs.microsoft.com/office/dev/add-ins/outlook/)
- [Manifest Validator](https://github.com/OfficeDev/office-addin-manifest)

## 🔄 Migration from XML to JSON

If you have the XML manifest installed and want to switch to JSON:

1. **Uninstall the old add-in**:
   - Outlook → Settings → Manage Add-ins
   - Remove the XML version

2. **Install the JSON version**:
   - Follow "Method 1: Outlook Web" instructions above
   - Use `manifest.json` URL

## 📝 Version History

### v1.1.0 (Current)
- ✅ Added JSON Unified Manifest (manifest.json)
- ✅ Modern Outlook compatibility
- ✅ Improved ribbon integration
- ✅ Updated icons and branding

### v1.0.0
- Initial release with XML manifest
- Email-to-task creation
- Auto-extract email details
- User assignment and priorities
