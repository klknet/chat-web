var fs = require('fs')
var WebSocket = require('ws')
var uuid = require('uuid')
var host = '172.20.36.91'
host = 'localhost:8080'
var connection = new WebSocket('ws://'+host+'/im/ws/chat?userId=windows:8001&meetingId=9001&source=windows&securityKey=')
var connection1 = new WebSocket('ws://'+host+'/im/ws/chat?userId=windows:8002&meetingId=9001&source=windows&securityKey=')

function sendPing(conn) {
  setInterval(() => {
    conn.send(JSON.stringify({
      type: 0
    }))
  }, 45000)
}

function send(conn, userId, meetingId) {
  conn.send(JSON.stringify({
    type: 1,
    body: {
      from: userId,
      to: meetingId,
      msgType:0,
      chatType:0,
      content:'hello world -'+new Date().getTime(),
      msgId: uuid.v1()
    }
  }))
}

function sendAck(conn, msgId) {
  conn.send(JSON.stringify({
    type: 4,
    body: {
      msgId: msgId
    }
  }))
}

function sendAuthority(conn, auth) {
  conn.send(JSON.stringify({
    type: 6,
    body: {
      chatAuthority: 2
    }
  }))
}

function pullMember(conn) {
  conn.send(JSON.stringify({
    type: 3
  }))
}

connection.on('open', function () {
  console.log('connect to the server')
  setTimeout(function () {
    pullMember(connection)
    send(connection, 'windows:8001', '9001')
  }, 5000)
  sendPing(connection)
})

connection.on("message", function(d) {
  console.log('conn '+d)
  var message = JSON.parse(d)
  if (message.type == 1) {
    sendAck(connection, message.body.msgId)
  }
})

connection.on("error", function (e) {
  console.error(e)
})

connection1.on('open', function () {
  console.log('connect to the server')
  setTimeout(function () {
    pullMember(connection1)
    send(connection, 'windows:8002', '9001')
  }, 5000)
})

connection1.on("message", function(d) {
  console.log('conn1 '+d)
  var message = JSON.parse(d)
  if (message.type == 1) {
    sendAck(connection1, message.body.msgId)
    sendAuthority(connection1, 2)
  }
})

connection1.on("error", function (e) {
  console.error(e)
})








