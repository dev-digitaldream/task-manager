// Popup script for Task Manager Thunderbird extension

// Translation strings
const translations = {
  en: {
    headerTitle: 'Create Task from Email',
    loadingText: 'Loading email...',
    errorLoadingEmail: 'Error: Could not load email. Please open an email first.',
    errorCreatingTask: 'Error creating task. Please check your server URL and try again.',
    successText: 'Task created successfully!',
    labelServerUrl: 'Server URL',
    serverUrlHelp: 'Configure your Task Manager server URL',
    labelTaskTitle: 'Task Title',
    labelEmailFrom: 'From',
    labelDueDate: 'Due Date',
    labelPriority: 'Priority',
    priorityLow: 'Low',
    priorityMedium: 'Medium',
    priorityHigh: 'High',
    labelAssignee: 'Assign To',
    assigneeNone: 'No one (unassigned)',
    assigneeHelp: 'Loading users...',
    assigneeHelpLoaded: 'Select a user to assign this task',
    assigneeHelpError: 'Could not load users from server',
    labelStatus: 'Status',
    statusTodo: 'To Do',
    statusDoing: 'Doing',
    statusDone: 'Done',
    labelIncludeBody: 'Include email body as first comment',
    submitButton: 'Create Task',
    cancelButton: 'Cancel',
    previewTitle: 'Email Preview'
  },
  fr: {
    headerTitle: 'Créer une tâche depuis l\'email',
    loadingText: 'Chargement de l\'email...',
    errorLoadingEmail: 'Erreur : Impossible de charger l\'email. Veuillez d\'abord ouvrir un email.',
    errorCreatingTask: 'Erreur lors de la création de la tâche. Vérifiez l\'URL du serveur et réessayez.',
    successText: 'Tâche créée avec succès !',
    labelServerUrl: 'URL du serveur',
    serverUrlHelp: 'Configurez l\'URL de votre serveur Task Manager',
    labelTaskTitle: 'Titre de la tâche',
    labelEmailFrom: 'De',
    labelDueDate: 'Date d\'échéance',
    labelPriority: 'Priorité',
    priorityLow: 'Basse',
    priorityMedium: 'Moyenne',
    priorityHigh: 'Haute',
    labelAssignee: 'Assigner à',
    assigneeNone: 'Personne (non assigné)',
    assigneeHelp: 'Chargement des utilisateurs...',
    assigneeHelpLoaded: 'Sélectionnez un utilisateur pour assigner cette tâche',
    assigneeHelpError: 'Impossible de charger les utilisateurs depuis le serveur',
    labelStatus: 'Statut',
    statusTodo: 'À faire',
    statusDoing: 'En cours',
    statusDone: 'Terminé',
    labelIncludeBody: 'Inclure le corps de l\'email comme premier commentaire',
    submitButton: 'Créer la tâche',
    cancelButton: 'Annuler',
    previewTitle: 'Aperçu de l\'email'
  },
  nl: {
    headerTitle: 'Taak aanmaken vanuit e-mail',
    loadingText: 'E-mail laden...',
    errorLoadingEmail: 'Fout: Kan e-mail niet laden. Open eerst een e-mail.',
    errorCreatingTask: 'Fout bij het aanmaken van taak. Controleer uw server-URL en probeer opnieuw.',
    successText: 'Taak succesvol aangemaakt!',
    labelServerUrl: 'Server-URL',
    serverUrlHelp: 'Configureer uw Task Manager server-URL',
    labelTaskTitle: 'Taaknaam',
    labelEmailFrom: 'Van',
    labelDueDate: 'Vervaldag',
    labelPriority: 'Prioriteit',
    priorityLow: 'Laag',
    priorityMedium: 'Gemiddeld',
    priorityHigh: 'Hoog',
    labelAssignee: 'Toewijzen aan',
    assigneeNone: 'Niemand (niet toegewezen)',
    assigneeHelp: 'Gebruikers laden...',
    assigneeHelpLoaded: 'Selecteer een gebruiker om deze taak toe te wijzen',
    assigneeHelpError: 'Kan gebruikers niet laden van de server',
    labelStatus: 'Status',
    statusTodo: 'Te doen',
    statusDoing: 'Bezig',
    statusDone: 'Klaar',
    labelIncludeBody: 'E-mailinhoud opnemen als eerste opmerking',
    submitButton: 'Taak aanmaken',
    cancelButton: 'Annuleren',
    previewTitle: 'E-mailvoorbeeld'
  }
};

// Current language
let currentLang = 'en';
let currentEmailData = null;
let availableUsers = [];

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  // Load saved settings
  const settings = await browser.storage.local.get(['serverUrl', 'language']);

  if (settings.language) {
    currentLang = settings.language;
    document.getElementById('languageSelect').value = currentLang;
  }

  if (settings.serverUrl) {
    document.getElementById('serverUrl').value = settings.serverUrl;
  } else {
    document.getElementById('serverUrl').value = 'https://task-manager.digitaldream.work';
  }

  // Apply translations
  applyTranslations();

  // Setup event listeners
  document.getElementById('languageSelect').addEventListener('change', changeLanguage);
  document.getElementById('taskForm').addEventListener('submit', handleSubmit);
  document.getElementById('cancelButton').addEventListener('click', () => window.close());
  document.getElementById('serverUrl').addEventListener('change', saveServerUrl);

  // Load email data
  await loadEmailData();
});

// Apply translations to UI
function applyTranslations() {
  const t = translations[currentLang];

  document.getElementById('headerTitle').textContent = t.headerTitle;
  document.getElementById('loadingText').textContent = t.loadingText;
  document.getElementById('successText').textContent = t.successText;
  document.getElementById('labelServerUrl').textContent = t.labelServerUrl;
  document.getElementById('serverUrlHelp').textContent = t.serverUrlHelp;
  document.getElementById('labelTaskTitle').textContent = t.labelTaskTitle;
  document.getElementById('labelEmailFrom').textContent = t.labelEmailFrom;
  document.getElementById('labelDueDate').textContent = t.labelDueDate;
  document.getElementById('labelPriority').textContent = t.labelPriority;
  document.getElementById('priorityLow').textContent = t.priorityLow;
  document.getElementById('priorityMedium').textContent = t.priorityMedium;
  document.getElementById('priorityHigh').textContent = t.priorityHigh;
  document.getElementById('labelAssignee').textContent = t.labelAssignee;
  document.getElementById('assigneeNone').textContent = t.assigneeNone;
  document.getElementById('labelStatus').textContent = t.labelStatus;
  document.getElementById('statusTodo').textContent = t.statusTodo;
  document.getElementById('statusDoing').textContent = t.statusDoing;
  document.getElementById('statusDone').textContent = t.statusDone;
  document.getElementById('labelIncludeBody').textContent = t.labelIncludeBody;
  document.getElementById('submitButton').textContent = t.submitButton;
  document.getElementById('cancelButton').textContent = t.cancelButton;
  document.getElementById('previewTitle').textContent = t.previewTitle;
}

// Change language
async function changeLanguage(event) {
  currentLang = event.target.value;
  await browser.storage.local.set({ language: currentLang });
  applyTranslations();
}

// Save server URL
async function saveServerUrl(event) {
  const serverUrl = event.target.value;
  await browser.storage.local.set({ serverUrl });
  // Reload users with new server URL
  await loadUsers();
}

// Load email data
async function loadEmailData() {
  const t = translations[currentLang];

  try {
    // Try to get pending message first
    let emailData = await browser.runtime.sendMessage({ action: 'getPendingMessage' });

    // If no pending message, get current message
    if (!emailData) {
      emailData = await browser.runtime.sendMessage({ action: 'getCurrentMessage' });
    }

    if (emailData) {
      currentEmailData = emailData;

      // Populate form
      document.getElementById('taskTitle').value = emailData.subject || 'Untitled';
      document.getElementById('emailFrom').value = emailData.from || '';

      // Set default due date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      document.getElementById('dueDate').value = tomorrow.toISOString().split('T')[0];

      // Hide loading, show form
      document.getElementById('loadingMessage').classList.add('hidden');
      document.getElementById('taskForm').classList.remove('hidden');

      // Load users
      await loadUsers();
    } else {
      throw new Error('No email found');
    }
  } catch (error) {
    console.error('Error loading email:', error);
    document.getElementById('loadingMessage').classList.add('hidden');
    document.getElementById('errorMessage').classList.remove('hidden');
    document.getElementById('errorText').textContent = t.errorLoadingEmail;
  }
}

// Load users from server
async function loadUsers() {
  const t = translations[currentLang];
  const serverUrl = document.getElementById('serverUrl').value;
  const assigneeHelp = document.getElementById('assigneeHelp');

  if (!serverUrl) {
    assigneeHelp.textContent = t.assigneeHelpError;
    return;
  }

  try {
    assigneeHelp.textContent = t.assigneeHelp;

    const response = await fetch(`${serverUrl}/api/users`);
    if (!response.ok) throw new Error('Failed to load users');

    availableUsers = await response.json();

    // Populate assignee dropdown
    const assigneeSelect = document.getElementById('assignee');

    // Clear existing options except the first (No one)
    while (assigneeSelect.options.length > 1) {
      assigneeSelect.remove(1);
    }

    // Add users
    availableUsers.forEach(user => {
      const option = document.createElement('option');
      option.value = user.id;
      option.textContent = user.name;
      assigneeSelect.appendChild(option);
    });

    assigneeHelp.textContent = t.assigneeHelpLoaded;
  } catch (error) {
    console.error('Error loading users:', error);
    assigneeHelp.textContent = t.assigneeHelpError;
  }
}

// Handle form submission
async function handleSubmit(event) {
  event.preventDefault();

  const t = translations[currentLang];
  const serverUrl = document.getElementById('serverUrl').value;
  const taskTitle = document.getElementById('taskTitle').value;
  const dueDate = document.getElementById('dueDate').value;
  const priority = document.getElementById('priority').value;
  const assigneeId = document.getElementById('assignee').value;
  const status = document.getElementById('status').value;
  const includeBody = document.getElementById('includeEmailBody').checked;

  // Disable form
  document.getElementById('submitButton').disabled = true;
  document.getElementById('submitButton').textContent = '...';

  try {
    // Create task
    const taskData = {
      title: taskTitle,
      status: status,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      assigneeId: assigneeId ? parseInt(assigneeId) : null,
      priority: priority
    };

    const taskResponse = await fetch(`${serverUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(taskData)
    });

    if (!taskResponse.ok) {
      throw new Error('Failed to create task');
    }

    const createdTask = await taskResponse.json();

    // Add email body as comment if requested
    if (includeBody && currentEmailData.body) {
      const commentData = {
        content: `Email from: ${currentEmailData.from}\nDate: ${new Date(currentEmailData.date).toLocaleString()}\n\n${currentEmailData.body}`,
        authorId: assigneeId ? parseInt(assigneeId) : (availableUsers[0]?.id || 1)
      };

      await fetch(`${serverUrl}/api/tasks/${createdTask.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commentData)
      });
    }

    // Show success message
    document.getElementById('taskForm').classList.add('hidden');
    document.getElementById('successMessage').classList.remove('hidden');

    // Close popup after 2 seconds
    setTimeout(() => {
      window.close();
    }, 2000);
  } catch (error) {
    console.error('Error creating task:', error);
    document.getElementById('errorMessage').classList.remove('hidden');
    document.getElementById('errorText').textContent = t.errorCreatingTask;
    document.getElementById('submitButton').disabled = false;
    document.getElementById('submitButton').textContent = t.submitButton;
  }
}

console.log('Task Manager popup script loaded');
