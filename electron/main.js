const { app, BrowserWindow, Menu, Tray, nativeImage } = require('electron')
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'

let mainWindow = null
let widgetWindow = null
let tray = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Task Manager - Digital Dream',
    backgroundColor: '#f9fafb',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'icon.png'),
    titleBarStyle: 'hiddenInset', // macOS only: hidden title bar with traffic lights
    trafficLightPosition: { x: 16, y: 16 } // Position of macOS traffic lights
  })

  // Load app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../client/dist/index.html'))
  }

  // macOS: Hide window on close (don't quit)
  mainWindow.on('close', (event) => {
    if (process.platform === 'darwin' && !app.isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Create application menu
  createMenu()
}

function createWidgetWindow() {
  widgetWindow = new BrowserWindow({
    width: 350,
    height: 500,
    x: 50,
    y: 50,
    alwaysOnTop: true,
    resizable: true,
    title: 'Tasks Widget',
    skipTaskbar: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  if (isDev) {
    widgetWindow.loadURL('http://localhost:5173')
  } else {
    widgetWindow.loadFile(path.join(__dirname, '../client/dist/index.html'))
  }

  // Navigate to widget view after load
  widgetWindow.webContents.on('did-finish-load', () => {
    widgetWindow.webContents.executeJavaScript(`
      window.location.hash = '/app';
    `)
  })

  widgetWindow.on('closed', () => {
    widgetWindow = null
  })
}

function createMenu() {
  const template = [
    {
      label: 'Task Manager',
      submenu: [
        { role: 'about', label: 'À propos de Task Manager' },
        { type: 'separator' },
        { role: 'services', label: 'Services' },
        { type: 'separator' },
        { role: 'hide', label: 'Masquer Task Manager' },
        { role: 'hideOthers', label: 'Masquer les autres' },
        { role: 'unhide', label: 'Tout afficher' },
        { type: 'separator' },
        { role: 'quit', label: 'Quitter Task Manager' }
      ]
    },
    {
      label: 'Fichier',
      submenu: [
        {
          label: 'Nouvelle tâche',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('new-task')
            }
          }
        },
        { type: 'separator' },
        { role: 'close', label: 'Fermer' }
      ]
    },
    {
      label: 'Édition',
      submenu: [
        { role: 'undo', label: 'Annuler' },
        { role: 'redo', label: 'Rétablir' },
        { type: 'separator' },
        { role: 'cut', label: 'Couper' },
        { role: 'copy', label: 'Copier' },
        { role: 'paste', label: 'Coller' },
        { role: 'selectAll', label: 'Tout sélectionner' }
      ]
    },
    {
      label: 'Vue',
      submenu: [
        {
          label: 'Vue Liste',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            if (mainWindow) {
              mainWindow.loadURL(isDev ? 'http://localhost:5173/app' : `file://${path.join(__dirname, '../client/dist/index.html#/app')}`)
            }
          }
        },
        {
          label: 'Vue Kanban',
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            if (mainWindow) {
              mainWindow.loadURL(isDev ? 'http://localhost:5173/kanban' : `file://${path.join(__dirname, '../client/dist/index.html#/kanban')}`)
            }
          }
        },
        {
          label: 'Dashboard',
          accelerator: 'CmdOrCtrl+3',
          click: () => {
            if (mainWindow) {
              mainWindow.loadURL(isDev ? 'http://localhost:5173/dashboard' : `file://${path.join(__dirname, '../client/dist/index.html#/dashboard')}`)
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Widget Bureau',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            if (widgetWindow) {
              widgetWindow.close()
            } else {
              createWidgetWindow()
            }
          }
        },
        { type: 'separator' },
        { role: 'reload', label: 'Actualiser' },
        { role: 'forceReload', label: 'Forcer l\'actualisation' },
        { role: 'toggleDevTools', label: 'Outils de développement' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Taille réelle' },
        { role: 'zoomIn', label: 'Zoom avant' },
        { role: 'zoomOut', label: 'Zoom arrière' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Plein écran' }
      ]
    },
    {
      label: 'Fenêtre',
      submenu: [
        { role: 'minimize', label: 'Réduire' },
        { role: 'zoom', label: 'Zoom' },
        ...(process.platform === 'darwin'
          ? [
              { type: 'separator' },
              { role: 'front', label: 'Tout ramener au premier plan' },
              { type: 'separator' },
              { role: 'window', label: 'Fenêtre' }
            ]
          : [{ role: 'close', label: 'Fermer' }])
      ]
    },
    {
      label: 'Aide',
      submenu: [
        {
          label: 'Documentation',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://github.com/digitaldream/task-manager')
          }
        },
        {
          label: 'Signaler un bug',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://github.com/digitaldream/task-manager/issues')
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function createTray() {
  // Create tray icon (macOS/Windows system tray)
  const iconPath = path.join(__dirname, 'tray-icon.png')
  const icon = nativeImage.createFromPath(iconPath)
  tray = new Tray(icon.resize({ width: 16, height: 16 }))

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Afficher',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
        } else {
          createWindow()
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Nouvelle tâche',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.webContents.send('new-task')
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quitter',
      click: () => {
        app.isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setToolTip('Task Manager')
  tray.setContextMenu(contextMenu)

  // Show window on click (Windows/Linux)
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
      }
    } else {
      createWindow()
    }
  })
}

app.whenReady().then(() => {
  createWindow()
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else if (mainWindow) {
      mainWindow.show()
    }
  })
})

app.on('window-all-closed', () => {
  // On macOS, keep app running in tray
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  app.isQuitting = true
})
