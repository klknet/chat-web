export default {
  ping: function () {
    let req = {
      type: 0,
      data: 'ping'
    }
    let ping = JSON.stringify(req)
    setTimeout(() => {
      window.wsChat.send(ping)
    }, 15000)
  }
}
