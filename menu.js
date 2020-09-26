const path = require('path');
const {
  app, Menu, shell, dialog,
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('electron');
const {
  is,
  appMenu,
  aboutMenuItem,
  openUrlMenuItem,
  openNewGitHubIssue,
  debugInfo,
} = require('electron-util');
const config = require('./config');

const showPreferences = () => {
  // Show the app's preferences here
};

let mainWindow;

const helpSubmenu = [
  openUrlMenuItem({
    label: 'Website',
    url: 'https://github.com/kuun/xdebug-trace-viewer',
  }),
  {
    label: 'Report an Issue…',
    click() {
      const body = `${debugInfo()}`;

      openNewGitHubIssue({
        user: 'kuun',
        repo: 'xdebug-trace-viewer',
        body,
      });
    },
  },
];

if (!is.macos) {
  helpSubmenu.push(
    {
      type: 'separator',
    },
    aboutMenuItem({
      icon: path.join(__dirname, 'static', 'icon.png'),
      text: 'An Xdebug trace viewer, created by kuun<kuunwang@gmail.com>',
    }),
  );
}

const debugSubmenu = [
  {
    label: 'Show Settings',
    click() {
      config.openInEditor();
    },
  },
  {
    label: 'Show App Data',
    click() {
      shell.openItem(app.getPath('userData'));
    },
  },
  {
    type: 'separator',
  },
  {
    label: 'Delete Settings',
    click() {
      config.clear();
      app.relaunch();
      app.quit();
    },
  },
  {
    label: 'Delete App Data',
    click() {
      shell.moveItemToTrash(app.getPath('userData'));
      app.relaunch();
      app.quit();
    },
  },
];

const macosTemplate = [
  appMenu([
    {
      label: 'Preferences…',
      accelerator: 'Command+,',
      click() {
        showPreferences();
      },
    },
  ]),
  {
    role: 'fileMenu',
    submenu: [
      {
        label: 'Open file',
        click: () => selectTraceFile(),
      },
    ],
  },
  {
    role: 'viewMenu',
  },
  {
    role: 'windowMenu',
  },
  {
    role: 'help',
    submenu: helpSubmenu,
  },
];

function selectTraceFile() {
  dialog.showOpenDialog(
    {
      properties: ['openFile'],
      filters: [
        {
          name: 'Trace Files',
          extensions: ['xt'],
        },
        {
          name: 'All Files',
          extensions: ['*'],
        },
      ],
    },
    (fileNames) => {
      if (fileNames && fileNames.length > 0) {
        const fileName = fileNames[0];
        console.log(fileName);
        mainWindow.webContents.send('open-file', fileName);
      }
    },
  );
}

// Linux and Windows
const otherTemplate = [
  {
    role: 'fileMenu',
    submenu: [
      {
        label: 'Open file',
        click: () => selectTraceFile(),
      },
      {
        type: 'separator',
      },
      {
        role: 'quit',
      },
    ],
  },
  {
    role: 'viewMenu',
  },
  {
    role: 'help',
    submenu: helpSubmenu,
  },
];

const template = process.platform === 'darwin' ? macosTemplate : otherTemplate;

if (is.development) {
  template.push({
    label: 'Debug',
    submenu: debugSubmenu,
  });
}

module.exports = {
  menu: Menu.buildFromTemplate(template),
  setMainWindow: (window) => mainWindow = window,
};
