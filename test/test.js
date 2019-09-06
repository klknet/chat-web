var fs = require('fs')
var websocket = require('nodejs-websocket')
var uuid = require('uuid')

var connection = websocket.connect('ws://localhost:8080/ims/ws/chat?userId=8001&meetingId=9001&source=windows')
var connection1 = websocket.connect('ws://localhost:8080/ims/ws/chat?userId=80021&meetingId=9001&source=windows')

connection.on('connect', function () {
  console.log('connect to the server')
  connection.send(JSON.stringify({
    type: 1,
    body: {
      from:"8001",
      to:"9001",
      msgType:0,
      chatType:0,
      content:'hello world',
      msgId: uuid.v1()
    }

  }))

})

connection.on("data", function(d) {
  console.log(d)
})

connection.on("error", function (e) {
  console.error(e)
})

connection1.on('connect', function () {
  console.log('connect to the server')

})

connection1.on("data", function(d) {
  console.log(d)
})

connection1.on("error", function (e) {
  console.error(e)
})








