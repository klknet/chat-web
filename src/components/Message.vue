<template>
  <div class="right">
    <div class="chat-person">
      <span>{{cur == -1 ? '' : chatPerson.notename}}</span>
    </div>
    <div class="chat-area" v-show="cur === -1"></div>
    <div class="chat-area"
         :class="{'chat-active': cur!= -1 && info.conv.conversationId === cur}"
         v-for="(info, i) in messageMap"
         @scroll="scrollEvent(info)"
         v-show="cur!= -1 && info.conv.conversationId === cur">
      <!--<div style="height: 45px;"></div>-->
      <div class="chat-inner">
        <ul>
          <li v-for="(message,index) in info.messages" v-bind:id="message.messageId">
            <div v-if="index==0" class="more-info">
              <span @click="showMore" v-show="info.showMore">查看更多消息</span>
            </div>
            <div v-if="index==0" class="oldest-time-area">
              <span class="oldest-time">{{formatDate(message.createTime)}}</span>
            </div>
            <div v-if="index>0 && diff(info.messages, index)"
                 class="oldest-time-area">
              <span class="oldest-time">{{formatDate(message.createTime)}}</span>
            </div>

            <div class="img-msg" v-if="message.userId==user.userId">
              <div v-if="message.type==5" class="revocation">
                <span>你撤回了一条消息</span>
              </div>
              <div v-else>
                <a class="myself"><img v-bind:src="fmtImg(user.profileUrl)"></a>
                <div v-if="message.type==1">
                  <a class="myself-content" @contextmenu.prevent="msgMenu(message, $event)"><img
                    :src="fmtImg(message.content)"></a>
                </div>
                <div v-else-if="message.type==0">
                  <span class="myself" @contextmenu.prevent="msgMenu(message, $event)">{{message.content}}</span>
                </div>
                <div v-else-if="message.type==2" @contextmenu.prevent="msgMenu(message, $event)">
                    <span class="myself msg-file" @click="download(message)">
                      <span class="msg-file-left">
                        <span>{{message.fileDetail.filename}}</span>
                        <br/>
                        <span style="font-size: 0.9em; color: #B2B2C9;">{{fmtByteSize(message.fileDetail.size)}}</span>
                      </span>
                      <span class="msg-file-right">
                        <img src="../../static/img/msg_file.png">
                      </span>
                    </span>
                </div>
              </div>
            </div>

            <div class="img-msg" v-else>
              <div v-if="message.type==5" class="revocation">
                <span>{{fmtRevocation(message)}}</span>
              </div>
              <div v-else>
                <template v-if="message.chatType == null || message.chatType === 0">
                  <a class="other-person"><img v-bind:src="fmtImg(chatPerson.profileUrl)"></a>
                </template>
                <template v-else-if="message.chatType == 1">
                  <a class="other-person"><img
                    v-bind:src="fmtImg(groupChatMember(message, info.conv).profileUrl)"></a>
                  <span class="nickname ">{{groupChatMember(message, info.conv).nickname}}</span>
                </template>
                <template v-if="message.type == 0">
                    <span class="other-person" @contextmenu.prevent="msgMenu(message, $event)"
                          :class="{'group-person': message.chatType == 1}">{{message.content}}</span>
                </template>
                <template v-if="message.type == 1">
                  <a class="other-person-content"
                     @contextmenu.prevent="msgMenu(message, $event)"><img
                    :src="fmtImg(message.content)"></a>
                </template>
                <template v-else-if="message.type == 2">
                    <span class="other-person msg-file" @click="download(message)"
                          @contextmenu.prevent="msgMenu(message, $event)">
                      <span class="msg-file-left">
                        <span>{{message.fileDetail.filename}}</span>
                        <br/>
                        <span style="font-size: 0.9em; color: #B2B2C9;">{{fmtByteSize(message.fileDetail.size)}}</span>
                      </span>
                      <span class="msg-file-right">
                        <img src="../../static/img/msg_file.png">
                      </span>
                    </span>
                </template>
              </div>
            </div>
            <div class="clear"></div>
          </li>
        </ul>
      </div>
    </div>

    <div class="send-area">
      <div class="content-area">
        <div class="menu-area">
          <input type="file" @change="selFile" id="prop_file" style="display:none">
          <span class="menu-item">
                            <img @click="propFile" src="/web/static/img/file.png">
                        </span>
          <span class="menu-item videa-chat">
                            <img src="/web/static/img/video.png">
                        </span>
        </div>
        <div class="content" @keydown.delete="clearMsg" @paste.prevent="paste"
             v-on:keydown.enter.prevent="sendMsg">
          <div class="img-area">
            <ul>
              <li v-for="filepath in filepaths">
                {{filepath.name}}
              </li>
            </ul>
          </div>
          <textarea id="sendArea" v-model="message2send"></textarea>
        </div>
      </div>
      <div class="">
        <button v-on:click="sendMsg" class="send-btn"><span>发送(S)</span></button>
      </div>
    </div>

    <div class="msg-menu" :style="msgMenuStyle">
      <ul>
        <li @click="copy"><a>复制</a></li>
        <li class="divider"></li>
        <li @click="collect"><a>收藏</a></li>
        <template v-if="showRevocation">
          <li @click="revocation"><a>撤回</a></li>
        </template>
        <li @click="ref">引用</li>
        <li @click="delMsg">删除</li>
      </ul>
    </div>
  </div>
</template>

<script>
  import vm from '@/event'
  import ws from '../websocket'
  import msgRequest from '@/message'
  import util from '@/util'
  import * as uuid from 'uuid'
  import * as lodash from 'lodash'

  export default {
    name: 'Message',
    props: {
      user: Object
    },
    activated () {
      this.scroll2End()
    },
    data() {
      return {
        messageMap: [],
        showRevocation: true,
        checkedMessage: {},
        chatPerson: {
          notename: ''
        },
        filepaths: [],
        msgMenuStyle: {},
        cur: -1,
        message2send: '',
        unAckMessages: [] // 没有ack的message
      }
    },
    mounted () {
      vm.$on('message-build-map', data => {
        this.buildMessageMap(data)
      })
      vm.$on('chat-delete-message', data => {
        this.deleteMsgNotify(data)
      })
      vm.$on('message-show', (conv) => {
        this.show(conv)
      })
      vm.$on('all-clear', () => {
        this.clear()
      })
      vm.$on('chat-receive-message', message => {
        this.pushMessage(message)
      })
      vm.$on('message-remove-conversation', data => {
        this.removeMapRef(data)
      })
      vm.$on('chat-revocation-message', data => {
        this.revocationNotify(data)
      })
      vm.$on('chat-ack', data=> {
        for (let i=0; i<this.unAckMessages.length; i++) {
          if (data == this.unAckMessages[i].messageId) {
            this.unAckMessages.splice(i, 1)
            break
          }
        }
      })
    },
    methods: {
      //当前消息和上条消息间隔是否超过5分钟
      diff (messages, index) {
        let d = new Date(messages[index].createTime).getTime() - new Date(messages[index - 1].createTime).getTime()
        return d > 300000
      },
      //群聊成员头像
      groupChatMember (message, conv) {
        if (conv.groupChat) {
          for (let member of conv.groupChat) {
            if (member.userId === message.userId) {
              return member
            }
          }
        }
      },
      //消息推送到列表
      pushMessage(message) {
        for (let i in this.messageMap) {
          let info = this.messageMap[i]
          if (info.conv.conversationId === message.conversationId && !info.msgIdSet.has(message.messageId)) {
            if (info.messages.length==0 || info.messages[info.messages.length-1].createTime<message.createTime)
              info.messages.push(message)
            else {
              for (let i=info.messages.length-1;  i>=0; i--){
                if (info.messages[i].createTime<message.createTime) {
                  info.messages.unshift(i+1, message)
                  break
                }
              }
            }
            info.msgIdSet.add(message.messageId)
            if (this.cur != -1) {
              this.scroll2End()
            }
            while (info.messages.length > 128) {
              info.messages.shift()
            }
            break
          }
        }
      },
      async transferFile(conv) {
        let filepaths = this.filepaths
        this.filepaths = []
        for (let file of filepaths) {
          var size = 1024 * 512
          let id = uuid.v1()
          let page = file.size % size == 0 ? file.size / size : parseInt(file.size / size) + 1
          var reader = new FileReader();
          let j=0
          let that = this
          for (let i=0; i<page; i++) {
            var blob = file.slice(i*size, (i + 1)*size, file.type)
            // If we use onloadend, we need to check the readyState.
            let fd = new FormData()
            fd.set('file', new File([blob], file.name, {type: file.type}))
            //传递完成后通知服务器
            function uploadDone() {
              j++
              if (j == page) {
                let ext = file.name.substring(file.name.lastIndexOf('.')+1)
                let imageType = ['png', 'jpg', 'jpeg', 'bmp', 'gif']
                let type = 2
                for (let t of imageType) {
                  if (ext == t) {
                    type = 1
                    break
                  }
                }

                let message = {
                  conversationId: conv.conversationId,
                  userId: that.user.userId,
                  destId: conv.destId,
                  content: that.message2send,
                  type: type,
                  chatType: conv.type,
                  createTime: new Date().getTime(),
                  messageId: uuid.v1()
                }
                msgRequest.uploadDone(id, file.name, message)
              }
            }
            function uploadPart () {
              return msgRequest.uploadFile(id, fd, i * size)
            }
            //断点上传
            await uploadPart().then(() => uploadDone()).catch(err => setTimeout(uploadPart, 10))
          }
        }
        filepaths.splice(0, filepaths.length)
      },
      conversationIndex(convId) {
        for (let i=0; i< this.messageMap.length; i++) {
          if (this.messageMap[i].conv.conversationId == convId) {
            return i
          }
        }
        return -1
      },
      //发送消息
      sendMsg: function() {
        if (this.filepaths.length > 0) {
          let conv = this.messageMap[this.conversationIndex(this.cur)].conv
          this.transferFile(conv)
        }
        else if (this.message2send && this.cur != -1) {
          let conv = this.messageMap[this.conversationIndex(this.cur)].conv
          let message = {
            conversationId: conv.conversationId,
            userId: this.user.userId,
            destId: conv.destId,
            content: this.message2send,
            type: 0,
            chatType: conv.type,
            createTime: new Date().getTime(),
            messageId: uuid.v1()
          }
          let data = {
            type: 2,
            data: JSON.stringify(message),
            ticket: this.user.ticket
          }
          let text = JSON.stringify(data)
          ws.send(text)
          this.unAckMessages.push(message)
          setTimeout(() => {
            for (let i=0; i<this.unAckMessages.length; i++) {
              if (message.messageId == this.unAckMessages[i].messageId) {
                this.unAckMessages.splice(i, 1)
                message.unack = true
                this.pushMessage(message)
                break
              }
            }
          }, 10000)
          this.message2send = ''
        }
      },
      scrollEvent: lodash.debounce(function (info) {
        let chatArea = document.getElementsByClassName('chat-active')[0]
        if (chatArea.scrollTop < 10 && !info.showMore) {
          info.showMore=true
          setTimeout(()=> {
            msgRequest.historyMessage(info.conv.conversationId, this.user.userId, info.conv.createTime, info.messages[0].createTime, false).then(res => {
              info.showMore = false
              if (res.data && res.data.length > 0) {
                let lastMsg = info.messages[0]
                res.data.forEach(v => {
                  if (!info.msgIdSet.has(v.messageId)) {
                    info.msgIdSet.add(v.messageId)
                    info.messages.unshift(v)
                  }
                })
                this.$nextTick(() => {
                  console.log('back to last msg', lastMsg.content)
                  document.getElementById(lastMsg.messageId).scrollIntoView()
                })
              }
            })
          }, 1000)
        }
      }, 200),
      revocation: function () {
        if (this.checkedMessage.messageId) {
          msgRequest.revocation(this.user.userId, this.checkedMessage.messageId)
        }
      },
      paste: function (e) {
        var clipboardData = e.clipboardData
        if (!(clipboardData && clipboardData.items)) {//是否有粘贴内容
          return
        }
        for (var i = 0, len = clipboardData.items.length; i < len; i++) {
          var item = clipboardData.items[i]
          if (item.kind === 'string' && item.type == 'text/plain') {
            item.getAsString((str) => {
              // str 是获取到的字符串,创建文本框
              //处理粘贴的文字内容
              this.message2send += str
            })
          } else if (item.kind === 'file') {//file 一般是各种截图base64数据
            var pasteFile = item.getAsFile()
            // pasteFile就是获取到的文件
            var reader = new FileReader()
            reader.onload = function (event) {
              var base64Img = event.target.result
            } // data url
            reader.readAsDataURL(pasteFile)
          }
        }
      },
      propFile: function () {
        document.getElementById('prop_file').click()
      },
      selFile (e) {
        let file = e.target.files[0]
        console.log(file)
        for (let file of e.target.files) {
          this.filepaths.push(file)
          // this.message2send += file.name
        }
      },
      download(message) {
        msgRequest.download(message.content)
      },
      fmtByteSize(size) {
        if (size < 1<<20) {
          return (size/1024).toFixed(1) + 'K'
        }else if (size < (1<<30)) {
          return (size/(1<<20)).toFixed(1) + 'M'
        } else {
          return (size/(1<<30)).toFixed(1) + 'G'
        }
      },
      //删除一条消息
      deleteMsgNotify (message) {
        let convId = message.conversationId
        let msgId = message.messageId
        let myself = false
        for (let info of this.messageMap) {
          if (info.conv.conversationId == convId) {
            let messages = info.messages
            let idx = -1
            for (let i = 0; i < messages.length; i++) {
              if (msgId == messages[i].messageId) {
                idx = i
                break
              }
            }
            if (idx >= 0) {
              messages.splice(idx, 1)
              info.msgIdSet.delete(msgId)
            }
            break
          }
        }
      },
      //设置撤回消息
      revocationNotify (message) {
        let convId = message.conversationId
        let msgId = message.messageId
        let myself = false
        for (let info of this.messageMap) {
          if (info.conv.conversationId == convId) {
            let messages = info.messages
            for (let i = 0; i < messages.length; i++) {
              if (msgId == messages[i].messageId) {
                messages[i].type = 5
                if (this.user.userId == message.userId) {
                  myself = true
                  messages[i].content = '你撤回了一条消息'
                }
                else {
                  messages[i].content = message.content
                }
                break
              }
            }
            break
          }
        }
        vm.$emit('conversation-update-lastmsg', {
          conversationId: message.conversationId,
          lastMsg: myself ? '你撤回了一条消息' : message.content
        })
      },
      fmtRevocation (message) {
        if (message.chatType == 0) {
          let idx = this.friendIdx(message.userId)
          if (idx != -1) {
            return this.user.friends[idx].remark + '撤回了一条消息'
          }
        } else {
          let idx = this.conversationIndex(message.conversationId)
          if (idx != -1) {
            let conv = this.message2send[idx].conv
            let member = this.groupChatMember(message, conv)
            return member.nickname + '撤回了一条消息'
          }
        }
        return '撤回了一条消息'
      },
      //构建messageMap
      buildMessageMap (conversations) {
        this.messageMap.length = 0
        for (let conv of conversations) {
          let info = {}
          info.messages = []
          info.msgIdSet = new Set()
          info.showMore = false
          info.requested = false
          info.conv = conv
          this.messageMap.push(info)
        }
      },
      //移除messageMap里的会话引用
      removeMapRef (convId) {
        let idx = this.conversationIndex(convId)
        if (idx != -1) {
          this.messageMap.splice(idx, 1)
          if (this.cur == convId)
            this.cur = -1
        }
      },
      //引用
      ref () {
        if (this.checkedMessage.messageId) {
          if (this.checkedMessage.userId == this.user.userId) {
            this.message2send = '「我： ' + this.checkedMessage.content + '」\n- - - - - - - - - - - - - - -\n'
          } else {
            let idx = this.friendIdx(this.checkedMessage.userId)
            this.message2send = '「' + this.user.friends[idx].username + '： ' + this.checkedMessage.content + '」\n- - - - - - - - - - - - - - -\n'
          }
        }
      },
      copy() {

      },
      showMore() {

      },
      friendIdx (userId) {
        for (let i = 0; i < this.user.friends.length; i++) {
          let friend = this.user.friends[i]
          if (friend.userId == userId) {
            return i
          }
        }
        return -1
      },
      fmtImg (id) {
        return util.fmtImg(id)
      },
      //收藏
      collect() {
        if (this.checkedMessage.messageId) {
          msgRequest.collect(this.user.userId, this.checkedMessage.messageId)
        }
      },
      delMsg () {
        if (this.checkedMessage.messageId) {
          msgRequest.delMsg(this.checkedMessage.messageId, this.user.userId)
        }
      },
      formatDate (c, fmt) {
        return util.formatDate(c, fmt || 'YYYY年M月D日  HH:mm')
      },
      //点击会话，显示历史消息
      show (conv) {
        this.cur = conv.conversationId
        if (conv.unreadCount && conv.unreadCount > 0) {
          vm.$emit('left-unread-num', 0, -conv.unreadCount)
          msgRequest.delUnread(this.user.userId, conv.conversationId)
        }
        conv.unreadCount = 0
        let num = conv.type == 1 ? '（' + conv.groupChat.length + '）' : ''
        this.chatPerson = {
          notename: conv.notename + num,
          destId: conv.destId,
          profileUrl: conv.profileUrl
        }
        for (let info of this.messageMap) {
          if (info.conv.conversationId == conv.conversationId) {
            if (!info.requested) {
              msgRequest.historyMessage(conv.conversationId, this.user.userId, conv.createTime, '', true).then(res => {
                if (res.data) {
                  // info.messages = res.data
                  res.data.forEach(v => {
                    if (!info.msgIdSet.has(v.messageId)) {
                      info.msgIdSet.add(v.messageId)
                      info.messages.unshift(v)
                    }
                  })
                  this.scroll2End()
                  info.requested = true
                }
              })
            } else {
              this.scroll2End()
            }
            break
          }
        }
      },
      //消息滚动到底端
      scroll2End () {
        this.$nextTick(() => {
          let chatArea = document.getElementsByClassName('chat-active')[0]
          if (chatArea && chatArea.scrollHeight) {
            chatArea.scrollTop = chatArea.scrollHeight
          }
        })
      },
      msgMenu (msg, e) {
        let diff = new Date().getTime() - new Date(msg.createTime).getTime()
        this.showRevocation = diff <= 120000 && msg.userId == this.user.userId
        this.checkedMessage = msg
        this.msgMenuStyle = {
          left: e.clientX + 'px',
          top: e.clientY + 'px',
          display: 'block'
        }
      },
      clear () {
        this.msgMenuStyle.display = 'none'
        this.checkedMessage = {}
        this.showRevocation = true
      },
      clearMsg: function () {

      },
    }
  }
</script>

<style scoped>
  /*设置滚动条的样式*/
  ::-webkit-scrollbar {
    width: 0;
  }

  ::-webkit-scrollbar-thumb:window-inactive {
    background: rgba(255, 0, 0, 0.4);
    display: none;
  }

  span{
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  a {
    text-decoration: none;
    color: #000000;
    cursor: default;
  }

  li, ul, div {
    margin: 0;
    padding: 0
  }

  li {
    list-style: none;
  }

  input, textarea, button {
    outline: none;
  }

  .right {
    width: calc(100% - 250px);
    min-width: 300px;
    float: left;
    height: 100%;
    background: #F5F5F5;
    overflow: hidden;
    /*url("/static/img/wechat.png") no-repeat center;
       background-size: 93px;*/
  }

  .msg-menu {
    background-color: #ffffff;
    width: 80px;
    font-size: 12px;
    font-weight: 500;
    position: absolute;
    display: none;
    z-index: 999;
    border: solid 1px #d4d4d4;
  }


  .msg-menu .divider {
    border-top: solid 1px #e7e7e7;
  }

  .msg-menu li {
    padding: 5px 20px;
    text-align: center;
  }

  .msg-menu li:hover {
    background-color: #DFDDDB;
  }

  .chat-person {
    font-size: 1.2em;
    height: 60px;
    font-weight: bold;
    line-height: 70px;
    position: relative;
    border-bottom: solid 1px #e7e7e7;
    z-index: 666;
    text-align: left;
  }

  .chat-person span {
    margin-left: 30px;
  }

  .myself, .myself-content {
    float: right;
  }

  .revocation {
    text-align: center;
  }

  .revocation span {
    width: 150px;
  }

  .other-person, .other-person-content {
    float: left;
  }

  .myself img, .other-person img {
    width: 35px;
  }

  .myself-content img, .other-person-content img{
    width: 85px;
  }

  .chat-area {
    height: calc(100% - 146px - 60px);
    width: calc(100% + 20px);
    overflow-y: scroll;
    font-size: 14px;
    position: relative;
  }

  .chat-area .more-info span {
    color: #2C90FC;
    font-size: 0.8em;
    cursor: pointer;
  }

  .chat-area .more-info {
    text-align: center;
    padding-bottom: 10px;
  }

  .chat-area .chat-inner li {
    padding: 8px 50px 8px 30px;
  }

  .chat-area .oldest-time-area {
    text-align: center;
    padding-bottom: 10px;
  }

  .chat-area .oldest-time-area .oldest-time, .revocation span {
    background-color: #DADADA;
    padding: 5px 8px;
    color: #FFFFFF;
    font-size: 0.85em;
  }

  .clear {
    clear: both;
  }

  span.myself {
    background-color: #9EEA6A;
    margin-right: 10px;
  }

  span.other-person {
    margin-left: 10px;
    background-color: #ffffff;
  }

  span.group-person {
    margin-top: 13px;
  }

  .img-msg .nickname {
    position: absolute;
    top: -8px;
    left: 45px;
    font-size: 0.85em;
    color: #C9B2B2;
  }

  a.myself-content, a.other-person-content {
    position: relative;
  }

  a.myself-content {
    margin-right: 10px
  }

  a.other-person-content {
    margin-left: 10px;
  }

  a.myself-content img, a.other-person-content img {
    max-width: 250px
  }

  span.myself:after, a.myself-content:after, span.other-person:before, a.other-person-content:before {
    width: 0;
    height: 0;
    border: 4px solid transparent;
    position: absolute;
    top: 6px;
    content: ""
  }

  span.other-person:before, a.other-person-content:before {
    border-right-color: #FFFFFF;
    right: 100%;
  }

  a.other-person-content:before {
    border-right-color: #fff;
  }

  .chat-area div.img-msg {
    position: relative;
  }

  span.myself:after, a.myself-content:after {
    border-left-color: #9EEA6A;
    left: 100%;
  }

  a.myself-content:after {
    border-left-color: #fff;
  }

  span.myself, span.other-person {
    padding: 5px 10px;
    line-height: 25px;
    /*font-weight: 500;*/
    position: relative;
    max-width: 60%;
    word-break: break-all;
    border: solid 1px #E7E7E7;
    border-radius: 3px;
  }

  span.other-person:hover {
    background-color: #F6F6F6 !important;
  }

  span.other-person:hover:before {
    border-right-color: #F6F6F6;
  }

  span.myself:hover {
    background-color: #98E165;
  }

  .msg-file{
    cursor: pointer;
    width: 230px;
    background-color: #fff !important;
  }

  span.msg-file::after {
    border-left-color: #fff !important;
  }

  span.msg-file:hover {
    background-color: #F6F6F6 !important;
  }

  .msg-file-left {
    float: left;
    width: 55.8%;
  }

  .msg-file-right {
    float: right;
  }

  .msg-file-right img {
    width: 48px;
    margin-top: 20%;
    margin-right: 10%;
  }

  .send-area {
    background-color: #ffffff;
    height: 146px;
    position: relative;
    border-top: solid 1px #e7e7e7;
    z-index: 666;
  }

  .content-area {
    padding: 0 30px;
  }

  .send-area .content {
    overflow-y: auto;
    overflow-x: hidden;
    height: 115px;
  }

  .menu-area {
    height: 20px;
    margin: 5px 0;
    text-align: left;
  }

  .menu-item {
    position: relative;
  }

  .menu-area img {
    width: 20px;
  }

  .content textarea {
    border: none;
    width: 100%;
    height: 80%;
    resize: none;
    font-size: 14px;
  }

  .content .img-area li img {
  }

  .content .img-area ul, .content .img-area li, .content .img-area {
    display: inline;
  }

  .send-btn {
    padding: 5px 8px;
    position: absolute;
    bottom: 10px;
    right: 25px;
    border: 0;
    background-color: #F5F5F5;
  }

  .send-btn span {
    font-size: 13px;
  }

  .send-btn:hover {
    background-color: #129611;
    color: #FFFFFF;
  }


</style>
