const { app, BrowserWindow, dialog, Menu } = require('electron')
const fs = require('fs')
const path = require('path')

let mainWindow

/**
 * Creates a new Electron Browser Window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 960,
    webPreferences: {
      nodeIntegration: true
    },
    icon: path.join(__dirname, 'resources/icons/64x64.png')
  })

  mainWindow.loadFile('index.html')

  const template = createMenuTemplate()
  /**
   * If MacOS add this submenu
   */
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    })

    // Edit menu
    template[1].submenu.push(
      { type: 'separator' },
      {
        label: 'Speech',
        submenu: [{ role: 'startspeaking' }, { role: 'stopspeaking' }]
      }
    )

    // Window menu
    template[3].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ]
  }

  // Open DevTools
  //mainWindow.webContents.openDevTools()

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
  mainWindow.on('closed', function() {
    mainWindow = null
  })
}

/**
 * Functions that generates the MenuTemeplate for Electron.
 */
const createMenuTemplate = () => {
  return [
    {
      label: 'File',
      submenu: [
        { label: 'New File', accelerator: 'CmdOrCtrl+N' },
        { label: 'New Workspace', accelerator: 'CmdOrCtrl+SHIFT+N' },
        { type: 'separator' },
        {
          label: 'Open File',
          accelerator: 'CmdOrCtrl+O',
          click() {
            openFile()
          }
        },
        {
          label: 'Open Workspace',
          accelerator: 'CmdOrCtrl+shift+O',
          click() {
            openDir()
          }
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click() {
            mainWindow.webContents.send('save-file')
          }
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+SHIFT+S',
          click() {
            mainWindow.webContents.send('save-file-as')
          }
        },
        { type: 'separator' },
        {
          label: 'Export...',
          submenu: [{ label: 'PDF' }, { label: 'Word' }, { label: 'PNG' }]
        },
        { type: 'separator' },
        { label: 'Settings...' },
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteandmatchstyle' },
        { role: 'delete' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'Themes',
      submenu: [
        { label: 'Dark & Simple' },
        { label: 'TypeWriter' },
        { label: 'GitHub' }
      ]
    },
    {
      label: 'Developer',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ]
}

app.on('ready', createWindow)

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function() {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Open files directory and sends it to ForntEnd.
 * @return file data as a String
 */
function openFile() {
  const files = dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      {
        name: 'Markdown',
        extensions: ['md', 'markdown', 'txt']
      },
      {
        name: 'All',
        extensions: ['*']
      }
    ]
  })

  if (!files) return

  const file = fs.readFileSync(files[0]).toString()
  console.log(file)

  mainWindow.webContents.send('new-file', file)
}

/**
 * Lets user select a directory a Workspace
 */
function openDir() {
  const directory = dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  })

  if (!directory) return

  const dir = directory[0]
  mainWindow.webContents.send('new-dir', dir)
}
