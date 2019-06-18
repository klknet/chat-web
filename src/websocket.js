import vm from '@/event'
import util from '@/util'
import storage from '@/storage'
import config from '@/config'

const wsChat = new WebSocket(config.ws)
console.log('create websoket connection')
window.wsChat = wsChat

export default {
  connect: function () {
    wsChat.onopen = () => {
      ping()
      vm.$emit('main-authentication')
    }
    wsChat.onclose = (evt) => {
      console.log('connection closed', wsChat.id)
    }
    //处理消息
    wsChat.onmessage = (evt) => {
      let resp = JSON.parse(evt.data)
      switch (resp.type) {
        case 0:
          ping()
          break
        case 1:
          // console.log(resp)
          if (resp.code == 60001) {
            util.toIndex()
          }
          else if (resp.code == 80001) {
            window.wsChat.close()
            let time = new Date()
            time.getHours()
            time.getMinutes()
            let f = time.getHours() + ':' + time.getMinutes()
            alert('当前账号于' + f + '在其它设备上登录。此客户端已退出登录。')
            storage.removeUser()
          }
          else if (resp.code == 80002) {
            //同意好友请求
            vm.$emit('roster-fresh-friend')
          }
          else if (resp.code == 80003) {
            vm.$emit('roster-friend-request')
          }
          else if (resp.code == 80004) {
            vm.$emit('chat-get-conversation')
          }
          break
        case 2:
          vm.$emit('chat-receive-message', resp.data)
          if (Notification.permission == 'granted') {
            notify(resp.data)
          } else {
            Notification.requestPermission().then(function (permission) {
              if (permission == 'granted') {
                notify(resp.data)
              }
            })
          }
          break
      }
    }

    //浏览器通知消息
    function notify (message) {
      let notify = new Notification('收到一条新消息', {
        body: message.content,
        tag: 'newMessage',

      })
      setTimeout(function () {
        notify.close()
      }, 8000)
    }

    function ping () {
      let req = {
        type: 0,
        data: 'ping'
      }
      let ping = JSON.stringify(req)
      setTimeout(() => {
        window.wsChat.send(ping)
      }, 15000)
    }
  },

  send: function (data) {
    wsChat.send(data)
  }
}
