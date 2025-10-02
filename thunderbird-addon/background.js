// Background script for Task Manager Thunderbird extension

// Store current message info
let currentMessage = null;

// Listen for message display
browser.messageDisplay.onMessageDisplayed.addListener(async (tab, message) => {
  currentMessage = message;
  console.log('Message displayed:', message.subject);
});

// Create context menu item
browser.menus.create({
  id: "create-task-from-email",
  title: browser.i18n.getMessage("createTaskContextMenu"),
  contexts: ["message_list", "message_display_action"]
});

// Handle context menu clicks
browser.menus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "create-task-from-email") {
    // Get the current message
    let message = currentMessage;

    if (!message) {
      // Try to get the selected message
      const messageLists = await browser.mailTabs.getListedMessages(tab.id);
      if (messageLists && messageLists.messages && messageLists.messages.length > 0) {
        message = messageLists.messages[0];
      }
    }

    if (message) {
      // Store message data for popup
      await browser.storage.local.set({ pendingMessage: message });

      // Open popup
      browser.browserAction.openPopup();
    }
  }
});

// Handle message display action clicks
browser.messageDisplayAction.onClicked.addListener(async (tab) => {
  if (currentMessage) {
    await browser.storage.local.set({ pendingMessage: currentMessage });
  }
  browser.browserAction.openPopup();
});

// Listen for messages from popup
browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "getCurrentMessage") {
    // Try to get current message
    let emailMessage = currentMessage;

    if (!emailMessage) {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]) {
        emailMessage = await browser.messageDisplay.getDisplayedMessage(tabs[0].id);
      }
    }

    if (emailMessage) {
      // Get full message details
      const full = await browser.messages.getFull(emailMessage.id);
      let emailBody = '';

      // Extract email body
      if (full.parts) {
        emailBody = extractTextFromParts(full.parts);
      }

      return Promise.resolve({
        subject: emailMessage.subject,
        from: emailMessage.author,
        date: emailMessage.date,
        body: emailBody,
        id: emailMessage.id
      });
    }

    return Promise.resolve(null);
  }

  if (message.action === "getPendingMessage") {
    const data = await browser.storage.local.get("pendingMessage");
    if (data.pendingMessage) {
      const emailMessage = data.pendingMessage;
      const full = await browser.messages.getFull(emailMessage.id);
      let emailBody = '';

      if (full.parts) {
        emailBody = extractTextFromParts(full.parts);
      }

      // Clear pending message
      await browser.storage.local.remove("pendingMessage");

      return Promise.resolve({
        subject: emailMessage.subject,
        from: emailMessage.author,
        date: emailMessage.date,
        body: emailBody,
        id: emailMessage.id
      });
    }

    return Promise.resolve(null);
  }
});

// Helper function to extract text from message parts
function extractTextFromParts(parts) {
  let text = '';

  for (const part of parts) {
    if (part.contentType === 'text/plain' && part.body) {
      text += part.body + '\n';
    } else if (part.contentType === 'text/html' && part.body) {
      // Simple HTML to text conversion
      text += part.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ') + '\n';
    } else if (part.parts) {
      text += extractTextFromParts(part.parts);
    }
  }

  return text.trim();
}

console.log('Task Manager background script loaded');
