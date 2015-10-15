'use strict';
var app = require('app');
var BrowserWindow = require('browser-window');
// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();
// adds ipc from web windows
var ipc = require('ipc');


var mainWindow = null;


function createMainWindow() {
	var win = new BrowserWindow({
		width: 500,
		height: 400,
		y: 0,
		// resizable: false
	});

	win.loadUrl(`file://${__dirname}/app/index.html`);
	win.on('closed', onClosed);

	return win;
}

function onClosed() {
	// deref the window
	// for multiple windows store them in an array
	mainWindow = null;
}




app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate-with-no-open-windows', function () {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('ready', function () {
	mainWindow = createMainWindow();
	mainWindow.openDevTools();

	var foo = '42';
	app.dock.setBadge(foo);

});


ipc.on('temperature-update', function (event, arg) {
	var foo = arg;

	if (process.platform == 'darwin') {
		app.dock.setBadge(foo);
	}
});