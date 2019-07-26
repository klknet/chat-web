<template>
  <div class="chat" @click="clear">
    <div class="median" id="median">
      <div class="search">
        <div>
          <i class="fa fa-search"></i>
          <input class="search-input" type="text" placeholder="搜索"/>
          <span class="add-friend" @click="addGroupChat">+</span>
        </div>
      </div>
      <div class="conversations">
        <div></div>
        <div class="inner">
          <ul>
            <li v-for="(conversation, index) in conversations"
                @click="show(conversation, index)"
                @contextmenu.prevent="menu(index, $event)"
                v-bind:class="{active: cur===index, top: conversation.top}">
              <div>
              <span class="profile">
                  <img v-bind:src="fmtImg(conversation.profileUrl)">
                  <a><span :class="{'badge': conversation.unreadCount>0}" v-show="conversation.unreadCount>0">
                      {{conversation.unreadCount>99?'99+':conversation.unreadCount}}
                  </span></a>
              </span>
                <span>
                  <span class="nickname">{{conversation.notename}}</span>
                  <span class="last-date">{{formatDate(conversation.updateTime, 'YY/M/D')}}</span>
                  <span class="last-msg">
                      <template v-if="conversation.messageType === 0">
                        {{conversation.lastMsg}}
                      </template>
                      <template v-else-if="conversation.messageType == 1">
                          [图片]
                      </template>
                      <template v-else-if="conversation.messageType == 5">
                          撤回了一条消息
                      </template>
                  </span>
                  <span class="dnd" v-show="conversation.dnd"></span>
              </span>
              </div>
            </li>
          </ul>
        </div>
      </div>

    </div>

    <div class="right">
      <div class="chat-person">
        <span>{{cur == -1 ? '' : chatPerson.notename}}</span>
      </div>
      <div class="chat-area" v-show="cur === -1"></div>
      <div class="chat-area"
           :class="{'chat-active': cur!= -1 && conversations[cur] && info.conv.conversationId===conversations[cur].conversationId}"
           v-for="(info, i) in messageMap"
           v-show="cur!= -1 && conversations[cur] && info.conv.conversationId===conversations[cur].conversationId">
        <div style="height: 45px;"></div>
        <div @scroll.passive="scrollEvent" class="chat-inner">
          <ul>
            <li v-for="(message,index) in info.messages">
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
                  <div v-if="message.type==3">
                    <a class="myself-content" @contextmenu.prevent="msgMenu(message, $event)"><img
                      :src="imgPrefix+'/'+message.content"></a>
                  </div>
                  <div v-else-if="message.type==0">
                    <span class="myself" @contextmenu.prevent="msgMenu(message, $event)">{{message.content}}</span>
                  </div>

                </div>
              </div>
              <div class="img-msg" v-else>
                <div v-if="message.type==5" class="revocation">
                  <span>{{fmtRevocation(message)}}</span>
                </div>
                <div v-else>
                  <template v-if="message.chatType === 0">
                    <a class="other-person"><img v-bind:src="fmtImg(chatPerson.profileUrl)"></a>
                  </template>
                  <template v-else>
                    <a class="other-person"><img v-bind:src="fmtImg(groupChatMember(message, info.conv).profileUrl)"></a>
                    <span class="nickname ">{{groupChatMember(message, info.conv).nickname}}</span>
                  </template>
                  <template v-if="message.type == 0">
                    <span class="other-person" @contextmenu.prevent="msgMenu(message, $event)"
                          :class="{'group-person': message.chatType == 1}">{{message.content}}</span>
                  </template>
                  <template v-if="message.type == 1">
                    <a class="other-person-content"
                       @contextmenu.prevent="msgMenu(message, $event)"
                       @click="imageEnlarge($event, message.destId)"><img
                      :src="message.content"></a>
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
                  <img :src="filepath">
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
    </div>

    <div class="conv-menu" :style="menuStyle">
      <ul>
        <li @click="top">
          <a>{{isTop?'取消置顶':'置顶'}}</a>
        </li>
        <li @click="dnd">
          <a>{{isDnd?'开启新消息提醒':'消息免打扰'}}</a>
        </li>
        <li class="divider" @click="remove">
          <a>删除聊天</a>
        </li>
      </ul>
    </div>

    <div class="msg-menu" :style="msgMenuStyle">
      <ul>
        <li @click="copy"><a>复制</a></li>
        <template v-if="showRevocation">
          <li class="divider" @click="revocation"><a>撤回</a></li>
        </template>
        <li @click="ref">引用</li>
        <li @click="delMsg">删除</li>
      </ul>
    </div>
  </div>

</template>

<script>
  import storage from '../storage'
  import convRequest from '../conversation'
  import msgRequest from '../message'
  import util from '../util'
  import vm from '@/event'
  import lodash from 'lodash'
  import userRequest from '../user'
  import messageRequest from '@/message'
  import ws from '../websocket'
  import CreateGroupChat from './CreateGroupChat'
  import config from '@/config'

  export default {
    name: 'Chat',
    data () {
      return {
        user: {},
        conversations: [],
        messageMap: [],
        cur: -1,
        delIdx: -1,
        menuStyle: {},
        msgMenuStyle: {},
        filepaths: [],
        message2send: '',
        chatPerson: {
          notename: ''
        },
        checkedMessage: {},
        isTop: false,
        isDnd: false,
        showRevocation: true,
      }
    },
    activated () {
      //组件切换时触发
      console.log('activited')
      let params = this.$route.params
      if (params.destId != undefined) {
        for (let i = 0; i < this.conversations.length; i++) {
          if (this.conversations[i].destId == params.destId) {
            this.show(this.conversations[i], i)
            return
          }
        }
        convRequest.buildConversation(this.user.userId, params.destId)
          .then(res => {
            this.getConversation()
            this.show(res.data, this.indexOfConversation(res.data))
          })
      }
    },
    mounted () {
      //更新会话列表
      vm.$on('chat-get-conversation', data => {
        let conv = null
        if (this.cur >= 0) {
          conv = this.conversations[this.cur]
        }
        this.getConversation()
        if (conv != null) {
          this.cur = this.indexOfConversation(conv)
        }
        console.log('cur=', this.cur)
      })
      vm.$on('chat-update-conversation', data => {
        let idx = this.indexOfConversation(data)
        this.conversations[idx] = data
        storage.setConversation(this.conversations)
      })
      //处理新消息
      vm.$on('chat-receive-message', data => {
        let message = JSON.parse(data)
        let exist = false
        for (let i in this.messageMap) {
          let info = this.messageMap[i]
          if (info.conv.conversationId === message.conversationId) {
            exist = true
            info.messages.push(message)
            if (this.cur != -1) {
              this.scroll2End()
            }
            break
          }
        }
        //不存在的会话，新创建一个会话
        if (!exist) {
          this.getConversation()
        }
        let selfmessage = (this.user.userId == message.userId)
        for (let i = 0; i < this.conversations.length; i++) {
          let conv = this.conversations[i]
          if (conv.conversationId == message.conversationId) {
            if (this.cur != i) {
              conv.unreadCount += 1
              vm.$emit('left-unread-num', 0, 1)
            } else {
              //处于当前会话下就删掉未读消息数量
              messageRequest.delUnread(this.user.userId, message.conversationId)
            }
            this.updateConversation(i, message, !selfmessage)
          }
        }
        if (!selfmessage) {
          util.notify(message)
        }
      })

      vm.$on('chat-revocation-message', data => {
        this.revocationNotify(data)
      })

      vm.$on('chat-delete-message', data=> {
        this.deleteMsgNotify(data)
      })
    },
    created () {
      let user = storage.getUser()
      this.user = user
      this.getConversation()
    },
    methods: {
      //当前消息和上条消息间隔是否超过5分钟
      diff (messages, index) {
        let d = new Date(messages[index].createTime).getTime() - new Date(messages[index - 1].createTime).getTime()
        return d > 300000
      },
      //获取会话列表
      getConversation () {
        console.log('invoke get conversations')
        convRequest.getConversation(this.user.userId).then(res => {
          this.conversations = res.data
          this.buildMessageMap(res.data)
          storage.setConversation(res.data)
          let total = 0
          for (let conv of res.data) {
            total += conv.unreadCount
          }
          vm.$emit('left-unread-num', 0, total)
        })
      },
      //构建messageMap
      buildMessageMap (conversations) {
        this.messageMap.length = 0
        for (let conv of conversations) {
          let info = {}
          info.messages = []
          info.showMore = false
          info.requested = false
          info.conv = conv
          this.messageMap.push(info)
        }
      },
      //移除messageMap里的会话引用
      removeMapRef (convId) {
        for (let i = 0; i < this.messageMap.length; i++) {
          let info = this.messageMap[i]
          if (info.conversationId === convId) {
            this.messageMap.splice(i, 1)
            break
          }
        }
      },
      addConversation (conv) {
        let info = {}
        info.messages = []
        info.showMore = false
        info.requested = false
        info.conversationId = conv.conversationId
        this.messageMap.push(info)
      },
      formatDate (c, fmt) {
        return util.formatDate(c, fmt || 'YYYY年M月D日  HH:mm')
      },
      //点击会话，显示历史消息
      show (c, idx) {
        let conv = this.conversations[idx]
        if (conv.unreadCount && conv.unreadCount > 0) {
          vm.$emit('left-unread-num', 0, -conv.unreadCount)
          messageRequest.delUnread(this.user.userId, conv.conversationId)
        }
        conv.unreadCount = 0
        this.chatPerson = {
          notename: c.notename + (conv.type == 1 ? '（' + conv.groupChat.members.length + '）' : ''),
          destId: c.destId,
          profileUrl: c.profileUrl
        }
        for (let info of this.messageMap) {
          if (info.conv.conversationId == conv.conversationId) {
            if (!info.requested) {
              msgRequest.historyMessage(conv.conversationId, this.user.userId, conv.createTime, true).then(res => {
                if (res.data) {
                  info.messages = res.data
                  this.cur = idx
                  this.scroll2End()
                  info.requested = true
                }
              })
            } else {
              this.cur = idx
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
      //右键点击
      menu (index, e) {
        this.delIdx = index
        this.isTop = this.conversations[index].top
        this.isDnd = this.conversations[index].dnd
        this.menuStyle = {
          left: e.clientX + 'px',
          top: e.clientY + 'px',
          width: this.isDnd ? '130px' : '100px',
          display: 'block'
        }
      },

      msgMenu (msg, e) {
        let diff = new Date().getTime() - new Date(msg.createTime).getTime()
        this.showRevocation = diff <= 120000
        this.checkedMessage = msg
        this.msgMenuStyle = {
          left: e.clientX + 'px',
          top: e.clientY + 'px',
          display: 'block'
        }
      },

      hideMenu () {
        this.menuStyle.display = 'none'
        this.msgMenuStyle.display = 'none'
        this.checkedMessage = {}
        this.showRevocation = true
      },
      clear () {
        this.hideMenu()
      },
      //发送消息
      sendMsg: function () {
        if (this.message2send && this.cur != -1) {
          let conv = this.conversations[this.cur]
          let message = {
            conversationId: conv.conversationId,
            userId: this.user.userId,
            destId: conv.destId,
            content: this.message2send,
            type: 0,
            chatType: conv.type,
            createTime: new Date().getTime(),
          }
          let data = {
            type: 2,
            data: JSON.stringify(message),
            ticket: this.user.ticket
          }
          let text = JSON.stringify(data)
          ws.send(text)
          this.message2send = ''
        }
      },
      revocation: function () {
        if (this.checkedMessage.messageId) {
          messageRequest.revocation(this.user.userId, this.checkedMessage.messageId)
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
            if (idx >= 0)
              messages.splice(idx, 1)
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
        let idx = this.indexOf(convId)
        if (idx != -1) {
          this.conversations[idx].lastMsg = myself ? '你撤回了一条消息' : message.content
        }
      },
      fmtRevocation (message) {
        if (message.chatType == 0) {
          let idx = this.friendIdx(message.userId)
          if (idx != -1)
            return this.user.friends[idx].remark+'撤回了一条消息'

        }else {
          let idx = this.indexOf(message.conversationId)
          if (idx != -1) {
            let conv = this.conversations[idx]
            let member = this.groupChatMember(message, conv)
            return member.nickname+'撤回了一条消息'
          }
        }
        return '撤回了一条消息'
      },
      friendIdx(userId) {
        for (let i=0; i<this.user.friends.length; i++) {
          let friend = this.user.friends[i]
          if (friend.userId == userId) {
            return i
          }
        }
        return -1
      },
      copy(e) {

      },
      //引用
      ref() {
        if(this.checkedMessage.messageId) {
          if (this.checkedMessage.userId == this.user.userId)
            this.message2send = '「我： '+this.checkedMessage.content+"」\n- - - - - - - - - - - - - - -\n"
          else {
            let idx = this.friendIdx(this.checkedMessage.userId)
            this.message2send = '「'+this.user.friends[idx].username+'： '+this.checkedMessage.content+"」\n- - - - - - - - - - - - - - -\n"
          }
        }
      },
      delMsg() {
        if(this.checkedMessage.messageId)
          msgRequest.delMsg(this.checkedMessage.messageId, this.user.userId)
      },
      //更新会话信息
      updateConversation (idx, message, stay) {
        let conv = this.conversations[idx]
        conv.lastMsg = message.content
        conv.updateTime = new Date()
        conv.messageType = message.type
        if (this.conversations.length > 0) {
          let curConv = this.conversations[this.cur]
          let i = 0
          if (!conv.top) {
            //非置顶会话排在置顶会话下面
            i = this.noTopIndex()
          }
          if (idx == i) {
            return
          }
          this.conversations.splice(idx, 1)
          this.conversations.splice(i, 0, conv)
          if (stay) {
            this.cur = this.indexOfConversation(curConv)
          } else if (this.cur != i) {
            console.log(this.cur, i)
            this.cur = i
          }
        }
      },
      //会话索引
      indexOfConversation (conv) {
        return this.indexOf(conv.conversationId)
      },
      indexOf (convId) {
        let i = 0
        for (; i < this.conversations.length; i++) {
          if (this.conversations[i].conversationId == convId) {
            return i
          }
        }
        return -1
      },
      //非置顶会话index
      noTopIndex: function () {
        let i = 0
        for (i = 0; i < this.conversations.length; i++) {
          if (!this.conversations[i].top) {
            break
          }
        }
        return i
      },
      //比conv time早的会话索引
      earlyConversationIndex: function (conv) {
        let i = 0
        for (i = 0; i < this.conversations.length; i++) {
          let cur = this.conversations[i]
          if (cur.top) {
            continue
          }
          if (cur.updateTime <= conv.updateTime) {
            break
          }
        }
        return i
      },
      addGroupChat: function () {
        this.$modal.show(CreateGroupChat, {}, {
          draggable: true,
          width: 550,
          height: 485,
          clickToClose: false,
        })
      },
      //置顶、取消置顶
      top: function () {
        if (this.delIdx >= 0) {
          let prev = -1
          if (this.cur > 0) {
            prev = this.conversations[this.cur]
          }
          let conv = this.conversations[this.delIdx]
          convRequest.top(this.user.userId, conv.conversationId, !conv.top)
            .then(() => {
              let i = 0
              if (conv.top) {
                //取消置顶 按更新时间排序
                i = this.earlyConversationIndex(conv)
                console.log(i)
                if (this.delIdx != i) {
                  this.conversations.splice(this.delIdx, 1)
                  this.conversations.splice(i == this.conversations.length ? i : i - 1, 0, conv)
                }
              } else {
                //置顶
                if (this.delIdx != i) {
                  this.conversations.splice(this.delIdx, 1)
                  this.conversations.unshift(conv)
                }
              }
              conv.top = !conv.top

              if (this.cur > 0) {
                let curIdx = this.indexOfConversation(prev)
                if (curIdx != this.cur) {
                  this.cur = curIdx
                }
              }
            })
        }
      },
      dnd: function () {
        if (this.delIdx >= 0) {
          let conv = this.conversations[this.delIdx]
          convRequest.dnd(this.user.userId, conv.conversationId, !conv.dnd)
            .then(() => conv.dnd = !conv.dnd)
        }
      },
      //删除会话
      remove () {
        if (this.delIdx >= 0) {
          let conv = this.conversations[this.delIdx]
          convRequest.delConversation(this.user.userId, conv.conversationId).then(res => {
            storage.spliceConversation(this.delIdx, 1)
            this.removeMapRef(conv.conversationId)
            if (this.delIdx < this.cur) {
              this.cur -= 1
            }
            if (this.conversations.length == 0) {
              this.cur = -1
            }
          })
        }
      },
      //群聊图片地址拼接
      getProfileUrl (conv) {
        if (conv.type == 0) {
          return conv.profileUrl
        }
        return 'http://' + config.host + config.context + '/file/img?id=' + conv.profileUrl
      },
      fmtImg (id) {
        return util.fmtImg(id)
      },
      //群聊成员头像
      groupChatMember (message, conv) {
        if (conv.groupChat) {
          for (let member of conv.groupChat.members) {
            if (member.userId === message.userId) {
              return member
            }
          }
        }
      },
      paste: function (e) {
        var clipboardData = e.clipboardData
        if (!(clipboardData && clipboardData.items)) {//是否有粘贴内容
          return;
        }
        for (var i = 0, len = clipboardData.items.length; i < len; i++) {
          var item = clipboardData.items[i];
          if (item.kind === "string" && item.type == "text/plain") {
            item.getAsString((str) => {
              // str 是获取到的字符串,创建文本框
              //处理粘贴的文字内容
              this.message2send += str
            })
          } else if (item.kind === "file") {//file 一般是各种截图base64数据
            var pasteFile = item.getAsFile();
            // pasteFile就是获取到的文件
            var reader = new FileReader();
            reader.onload = function (event) {
              var base64Img = event.target.result;
            }; // data url
            reader.readAsDataURL(pasteFile);
          }
        }
      },
      propFile: function () {

      },
      clearMsg: function () {

      },
      showMore: function () {

      }
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

  a {
    text-decoration: none;
    color: #000000;
    cursor: default;
  }

  .chat {
    height: 100%;
  }

  .median {
    width: 250px;
    background: linear-gradient(to bottom, #E5E5E6, #EBE8E7, #F0F0F0);
    float: left;
    height: 100%;
    overflow: hidden;
  }

  .right {
    width: calc(100% - 250px - 60px);
    min-width: 300px;
    float: left;
    height: 100%;
    background: #F5F5F5;
    overflow: hidden;
    /*url("/static/img/wechat.png") no-repeat center;
       background-size: 93px;*/
  }

  .search {
    margin: 25px 0 15px 0px;
    position: relative;
  }

  .search i {
    position: absolute;
    left: 20px;
    top: 8px;
    color: #636363;
    font-size: 10px;
  }

  .search-input {
    background-color: #DBD9D8;
    border-radius: 5px;
    margin-left: 10px;
    border: 1px solid #DBDBDB;
    height: 25px;
    padding: 8px 0 8px 25px;
    width: 192px;
    font-size: 12px;
    color: #818181
  }

  .search-input:focus {
    background-color: #ffffff;
  }

  .search-input:focus {
    background-color: #ffffff;
  }

  .add-friend {
    width: 20px;
    vertical-align: middle;
    margin-left: 4px;
    padding: 4px 8px;
    border-radius: 5px;
    cursor: pointer;
    /*font-size: 1.2em;*/
    background-color: #DCD9D8;
  }

  .add-friend:hover {
    background-color: #D1D1D1;
  }

  .profile {
    float: left;
  }

  .conversations {
    height: calc(100% - 65px);
    width: 270px;
    overflow-y: scroll;
    overflow-x: hidden;
    position: relative;
  }

  .inner {
    width: 250px;
  }

  .conversations .nickname {
    position: absolute;
    font-weight: 500;
    color: #000000;
    top: 10px;
  }

  .conversations .last-date {
    color: #999999;
    float: right;
    font-size: 0.86em;
  }

  .conversations .last-msg {
    position: absolute;
    bottom: 10px;
    color: #999999;
    font-size: 0.86em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 150px;
  }

  .conversations .dnd {
    position: absolute;
    bottom: 10px;
    right: 10px;
    width: 12px;
    height: 12px;
    background: url("../../static/img/dnd.svg");
    background-size: 12px;
  }

  .conversations .nickname, .conversations .last-msg {
    left: 60px;
  }

  .conversations li {
    padding: 10px;
    height: 60px;
    position: relative;
  }

  .conversations li.active {
    background-color: #C4C4C4;
  }

  .conversations li:hover {
    background-color: #DFDDDB;
  }

  .conversations li img {
    width: 40px;
  }

  .badge {
    background-color: #FF3B30;
    z-index: 1000;
    position: absolute;
    top: 2px;
    left: 40px;
    padding: 3px 6px;
    font-weight: 500;
  }

  .conversations li .hidden {
    display: none;
  }

  .conversations li.active {
    background: linear-gradient(to right, #C8C6C6, #C3C3C3, #CAC7C6);
  }

  .top {
    background: linear-gradient(to right, #D6D5D5, #D6D6D7, #D5D2D2);
  }

  .conv-menu, .msg-menu {
    background-color: #ffffff;
    width: 100px;
    font-size: 12px;
    font-weight: 500;
    position: absolute;
    display: none;
    z-index: 999;
  }

  .msg-menu {
    width: 80px;
  }

  .conv-menu .divider, .msg-menu .divider {
    border-top: solid 1px #e7e7e7;
  }

  .conv-menu li, .msg-menu li {
    padding: 5px 20px;
    text-align: left;
  }

  .msg-menu li {
    text-align: center;
  }

  .conv-menu li:hover, .msg-menu li:hover {
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

  .chat-area li {
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
    border-right-color: #000000;
  }

  .chat-area div.img-msg {
    position: relative;
  }

  span.myself:after, a.myself-content:after {
    border-left-color: #9EEA6A;
    left: 100%;
  }

  a.myself-content:after {
    border-left-color: #000000;
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
    background-color: #F6F6F6;
  }

  span.other-person:hover:before {
    border-right-color: #F6F6F6;
  }

  span.myself:hover {
    background-color: #98E165;
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
