'use strict'
var BrowserWindow = require('electron').BrowserWindow
// var shell = require('electron').shell
var extend = require('xtend')

var webPreferences = {
  nodeIntegration: false,
  javascript: true,
  webSecurity: true,
  images: true,
  java: false,
  webgl: false, // maybe allow?
  webaudio: false, // maybe allow?
  plugins: false,
  experimentalFeatures: false,
  experimentalCanvasFeatures: false,
  sharedWorker: false
}

// retain global references, if not, window will be closed automatically when
// garbage collected
var windows = {}

function createWindow (opts) {
  var window = new BrowserWindow(opts)
  windows[window.id] = window
  return window
}

// should not need to be called directly, but just in case
// window.destroy() is ever called
function unref () {
  delete windows[this.id]
}

function create (opts) {
  opts = extend({
    title: 'QUBS',
    width: 1600,
    height: 900,
    webPreferences: webPreferences
  }, opts)

  var window = createWindow(opts)
  window.unref = unref.bind(window)
  window.once('close', window.unref)
  // window.webContents.on('new-window', function (e, url) {
  //   // open in the browser
  //   e.preventDefault()
  //   shell.openExternal(url)
  // })
  return window
}

module.exports = {
  create: create,
  windows: windows
}