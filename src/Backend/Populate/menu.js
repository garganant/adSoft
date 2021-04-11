const { app, Menu, BrowserWindow } = require('electron')
var path = require("path");

function menuTemplate() {
    let win = BrowserWindow.getFocusedWindow();

    var menu = Menu.buildFromTemplate([
        {
            label: 'Master',
            submenu: [
                {
                    label: 'Home',
                    accelerator: 'Ctrl+H',
                    click() {
                        win.loadURL(path.join(__dirname, path.relative('Backend/Populate', 'Frontend/basePage.html')));
                    }
                },
                {
                    label: 'Vendor',
                    accelerator: 'Alt+V',
                    click() {
                        win.loadURL(path.join(__dirname, path.relative('Backend/Populate', 'Frontend/Master/Vendor.html')));
                    }
                },
                {
                    label: 'Group',
                    accelerator: 'Ctrl+G',
                    click() {
                        win.loadURL(path.join(__dirname, path.relative('Backend/Populate', 'Frontend/Master/Groups.html')));
                    }
                },
                {
                    label: 'Newspaper',
                    accelerator: 'Ctrl+N',
                    click() {
                        win.loadURL(path.join(__dirname, path.relative('Backend/Populate', 'Frontend/Master/Newspaper.html')));
                    }
                },
                {
                    label: 'Edition',
                    click() {
                        win.loadURL(path.join(__dirname, path.relative('Backend/Populate', 'Frontend/Master/Edition.html')));
                    }
                },
                {
                    label: 'Subject',
                    accelerator: 'Alt+S',
                    click() {
                        win.loadURL(path.join(__dirname, path.relative('Backend/Populate', 'Frontend/Master/Subject.html')));
                    }
                },
                {
                    label: 'Office',
                    click() {
                        win.loadURL(path.join(__dirname, path.relative('Backend/Populate', 'Frontend/Master/Office.html')));
                    }
                },
                {
                    label: 'Company',
                    click() {
                        win.loadURL(path.join(__dirname, path.relative('Backend/Populate', 'Frontend/Master/Comp.html')));
                    }
                },
                { type: 'separator' },
                {
                    label: 'Settings',
                    accelerator: 'Ctrl+,',
                    click() {
                        win.loadURL(path.join(__dirname, path.relative('Backend/Populate', 'Frontend/Master/Settings.html')));
                    }
                },
                { type: 'separator' },
                { label: 'Exit', click() { app.quit() } }
            ]
        },
        {
            label: 'Input',
            submenu: [
                {
                    label: 'RO',
                    accelerator: 'Alt+R',
                    click() {
                        win.loadURL(path.join(__dirname, path.relative('Backend/Populate', 'Frontend/Input/Ro.html')));
                    }
                },
                {
                    label: 'New Bill',
                    accelerator: 'Alt+N',
                    click() {
                        win.loadURL(path.join(__dirname, path.relative('Backend/Populate', 'Frontend/Input/NewBill.html')));
                    }
                },
                {
                    label: 'Edit Bill',
                    accelerator: 'Alt+B',
                    click() {
                        win.loadURL(path.join(__dirname, path.relative('Backend/Populate', 'Frontend/Input/EditBill.html')));
                    }
                }
            ]
        },
        {
            label: 'Reports',
            submenu: [
                {
                    label: 'Print bill',
                    click() {
                        win.loadURL(path.join(__dirname, path.relative('Backend/Populate', 'Frontend/Report/PrintBill.html')));
                    }
                },
                {
                    label: 'Bill Report',
                    click() {
                        win.loadURL(path.join(__dirname, path.relative('Backend/Populate', 'Frontend/Report/billReport.html')));
                    }
                }
            ]
        },
        {
            label: 'Utilities',
            submenu: [
                {
                    label: 'Backup & Restore',
                    click() {
                        win.loadURL(path.join(__dirname, path.relative('Backend/Populate', 'Frontend/Utilities/BacRes/BackupRestore.html')));
                    }
                }
            ]
        }
        ,
        {label: 'Tools',
        submenu: [
          {label: 'Developer tools',
          accelerator: process.platform === 'darwin' ? 'Command+Alt+I' : 'F11',
          click(){
            win.webContents.openDevTools()
          }
          }]
        }
    ]);
    Menu.setApplicationMenu(menu);
}

module.exports = { menuTemplate };
