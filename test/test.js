var fs = require('fs')
var websocket = require('nodejs-websocket')

var connection = websocket.connect('ws://localhost:8080/ims/ws/chat')

connection.on('connect', function () {
  console.log('connect to the server')
  fs.readFile('d:/GeoGebra-Windows-Installer-6-0-541-0.exe', function (err, data) {
    if (err) {
      return console.error(err)
    }
    console.log(data.length)
    var size = 1024 * 8
    if (data.length > size) {
      var seg
      page = data.length % size == 0 ? data.length / size : parseInt(data.length / size) + 1
      i = 0
      while (i < page) {
        seg = data.slice(i * size, (i + 1) * size)
        i++
        connection.sendBinary(seg, function () {
          if (i == page) {
            connection.close()
          }
        })
      }
    } else {
      connection.sendBinary(data)
    }
  })
})







