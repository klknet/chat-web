import vm from '@/event'
import util from '@/util'
import storage from '@/storage'
import config from '@/config'

let wsChat

export default {
  connect: function() {
    wsChat = new WebSocket(config.ws)
    wsChat.onopen = () => {
      console.log('create websoket connection')
      authentication()
      ping()
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
          else if(resp.code == 80005) {
            vm.$emit('chat-get-conversation')
            vm.$emit('roster-fresh-friend')
          }
          break
        case 2:
          vm.$emit('chat-receive-message', resp.data)
          break
      }
    }



    function ping () {
      let req = {
        type: 0,
        data: 'ping'
      }
      let ping = JSON.stringify(req)
      setTimeout(() => {
        wsChat.send(ping)
      }, 15000)
    }

    function authentication() {
      console.log('auth')
      let user = storage.getUser()
      let auth = {
        userId: user.userId
      }
      let req = {
        type: 1,
        ticket: user.ticket,
        data: JSON.stringify(auth)
      }
      wsChat.send(JSON.stringify(req))
    }
  },

  send: function (data) {
    wsChat.send(data)
  },

  close: function () {
    wsChat.close()
  },


}
