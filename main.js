const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('node:path')
const sqlite3 = require('sqlite3').verbose();

function runMigration(){
  const db = new sqlite3.Database('db/notes.db');

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, title text, description text)");

});

db.close();
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  ipcMain.on('fetch-notes', (event) => {
    const db = new sqlite3.Database('db/notes.db');

        db.all("SELECT * FROM notes", function(err, rows) {
          // Handle the errors
          win.webContents.send('read-notes-ui', rows)
        });
    
    db.close(); 
  })


  win.loadFile('index.html')
}

  ipcMain.on('create-notes', (event, title, description) => {
    const db = new sqlite3.Database('db/notes.db');

    db.serialize(() => {
        db.exec("INSERT INTO notes(title, description) VALUES('"+title+"', '"+description+"')");
    
    });
    
    db.close(); 
  })

  ipcMain.on('update-notes', (event, id, title, description) => {
    const db = new sqlite3.Database('db/notes.db');

    db.serialize(() => {
        db.exec("UPDATE notes SET title = '"+title+"', description = '"+description+"' WHERE id =" +id);
    
    });
    
    db.close(); 
  })

  ipcMain.on('delete-notes', (event, id) => {
    const db = new sqlite3.Database('db/notes.db');

    db.serialize(() => {
        db.exec("DELETE FROM notes WHERE id = " +id);
    
    });
    
    db.close(); 
  })

app.whenReady().then(() => {
  runMigration()
  createWindow()
})