# Task Manager - Thunderbird Extension

Create tasks from emails directly in Thunderbird and sync with your Task Manager application.

## Features

- Create tasks from emails with one click
- Auto-populate task title from email subject
- Add email body as first comment
- Assign tasks to team members
- Set due dates and priorities
- Multi-language support (English, French, Dutch)
- Configurable server URL for multiple instances
- Context menu integration
- Toolbar button for quick access

## Requirements

- Thunderbird 102 or later
- Access to a Task Manager server instance

## Installation

### Method 1: Install from XPI file (Production)

1. Download the `.xpi` file
2. Open Thunderbird
3. Go to **Tools** > **Add-ons and Themes** (or press `Ctrl+Shift+A`)
4. Click the gear icon and select **Install Add-on From File**
5. Select the downloaded `.xpi` file
6. Click **Add** when prompted
7. Restart Thunderbird if required

### Method 2: Temporary Installation (Development)

1. Open Thunderbird
2. Go to **Tools** > **Developer Tools** > **Debug Add-ons** (or navigate to `about:debugging#/runtime/this-thunderbird`)
3. Click **Load Temporary Add-on**
4. Navigate to the extension directory and select `manifest.json`
5. The extension will be loaded temporarily (until Thunderbird restarts)

## Configuration

### First-Time Setup

1. Click the Task Manager icon in the Thunderbird toolbar
2. Configure the **Server URL** field with your Task Manager instance:
   - Production: `https://task-manager.digitaldream.work`
   - Development: `http://localhost:3000`
   - Custom: Your server URL
3. Select your preferred language (English, French, or Dutch)
4. The settings are saved automatically

### Changing Server URL

You can switch between different Task Manager instances:
1. Open the extension popup
2. Update the Server URL field
3. The extension will reload users from the new server

## Usage

### Creating a Task from an Email

**Method 1: Toolbar Button**
1. Open or select an email in Thunderbird
2. Click the Task Manager icon in the toolbar
3. The popup will open with the email subject as the task title

**Method 2: Context Menu**
1. Right-click on an email in the message list
2. Select **Create Task from this Email**
3. The popup will open with the email details

**Method 3: Message Display Action**
1. Open an email
2. Click the Task Manager icon in the message header
3. The popup will open with the email details

### Filling Out the Task Form

1. **Task Title**: Pre-filled with email subject (editable)
2. **From**: Shows the email sender (read-only)
3. **Due Date**: Optional, defaults to tomorrow
4. **Priority**: Low, Medium (default), or High
5. **Assign To**: Select a team member or leave unassigned
6. **Status**: To Do (default), Doing, or Done
7. **Include email body**: Check to add email content as first comment

### Submitting the Task

1. Review the task details
2. Click **Create Task**
3. A success message will appear
4. The popup will close automatically
5. The task is now available in your Task Manager application

## Troubleshooting

### Extension Not Loading

- Ensure you're using Thunderbird 102 or later
- Check that the `manifest.json` file is valid
- Look for errors in the Browser Console (`Ctrl+Shift+J`)

### Cannot Load Email

- Make sure an email is selected or open
- Try refreshing Thunderbird
- Check the Browser Console for errors

### Task Creation Fails

- Verify the Server URL is correct and accessible
- Ensure the server is running
- Check your network connection
- Verify API endpoints are working (`/api/tasks`, `/api/users`)

### Users Not Loading

- Confirm the Server URL is correct
- Check that the server has users in the database
- Look for CORS issues in the Browser Console
- Ensure the `/api/users` endpoint is accessible

## Development

### Building the Extension

To package the extension for distribution:

```bash
cd thunderbird-addon
zip -r task-manager-thunderbird.xpi * -x "*.git*" "*.DS_Store" "README.md"
```

### Project Structure

```
thunderbird-addon/
├── manifest.json          # Extension manifest (Manifest V2)
├── background.js          # Background script for message handling
├── popup.html            # Popup UI structure
├── popup.js              # Popup logic and API integration
├── popup.css             # Popup styling
├── icons/                # Extension icons (16, 32, 48, 96 px)
│   ├── icon-16.svg
│   ├── icon-32.svg
│   ├── icon-48.svg
│   └── icon-96.svg
├── _locales/             # Internationalization files
│   ├── en/
│   │   └── messages.json
│   ├── fr/
│   │   └── messages.json
│   └── nl/
│       └── messages.json
└── README.md             # This file
```

### Testing

1. Load the extension temporarily in Thunderbird
2. Open the Browser Console (`Ctrl+Shift+J`) for debugging
3. Test with different emails and scenarios
4. Verify task creation on the server
5. Test all three languages
6. Test with different server URLs

### API Endpoints Used

- `GET /api/users` - Fetch available users for assignment
- `POST /api/tasks` - Create a new task
- `POST /api/tasks/:id/comments` - Add email body as comment

### Adding New Languages

1. Create a new directory in `_locales/` (e.g., `de` for German)
2. Copy `en/messages.json` to the new directory
3. Translate all message values
4. Add the language to the dropdown in `popup.html`
5. Add translations to the `translations` object in `popup.js`

## Privacy & Security

- The extension only reads emails you explicitly select
- Email content is sent only to the configured Task Manager server
- No data is stored or transmitted to third parties
- Server URL and language preferences are stored locally

## Support

For issues, feature requests, or questions:
- Check the Task Manager application documentation
- Review the Browser Console for error messages
- Verify server connectivity and API availability

## Version History

### 1.0.0 (Initial Release)
- Create tasks from emails
- Multi-language support (EN, FR, NL)
- Context menu integration
- Configurable server URL
- User assignment and due dates
- Priority levels
- Email body as comment

## License

Copyright 2025 Task Manager Team. All rights reserved.

---

**Built with Thunderbird WebExtension APIs**
