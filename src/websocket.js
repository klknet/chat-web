import vm from '@/event'
import util from '@/util'
import storage from '@/storage'
import config from '@/config'

let wsChat

let connect = function () {
  let user = storage.getUser()
  wsChat = new WebSocket(config.ws + '?userId=' + user.userId + '&ticket=' + user.ticket)
  wsChat.onopen = () => {
    console.log('create WebSocket connection')
    ping()
  }
  wsChat.onerror = (e) => {
    console.error('websocket communication error', e)
  }

  wsChat.onclose = (e) => {
    console.log('connection closed', e.code, e.reason, e.wasClean)
    if (e.code == 1006) {
      wsChat.close()
    }
    setTimeout(() => {
      console.log('ws state', wsChat.readyState)
      this.connect()
    }, 1000 * 8)
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
          wsChat.close()
          util.toIndex()
        }
        else if (resp.code == 80001) {
          wsChat.close()
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
        else if (resp.code == 80005) {
          vm.$emit('chat-get-conversation')
          vm.$emit('roster-fresh-friend')
        }
        break
      case 2:
        if (resp.code == 70001) {
          let message = JSON.parse(resp.data)
          vm.$emit('chat-receive-message', message)
          //send ack
          wsChat.send(JSON.stringify({type: 1, data: message.messageId}))
        } else if (resp.code == 70002) {
          vm.$emit('chat-revocation-message', JSON.parse(resp.data))
        } else if (resp.code == 70003) {
          console.log('delete')
          vm.$emit('chat-delete-message', JSON.parse(resp.data))
        } else if (resp.code == 70004) {
          vm.$emit('chat-update-conversation', JSON.parse(resp.data))
        } else if (resp.code == 70005) {
          vm.$emit('chat-ack', resp.data)
        }
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
      send(ping)
    }, 15000)
  }

  function close () {
    wsChat.close()
  }
}

let send =  function (data) {
  if (wsChat.readyState == 1) {
    wsChat.send(data)
  }
}

export default {connect, send}
