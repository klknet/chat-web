<template>
  <div class="chat" @click="clear">
    <div class="median" id="median">
      <div class="search">
        <div>
          <i class="fa fa-search"></i>
          <input class="search-input" type="text" placeholder="搜索"/>
          <span class="add-friend" @click="addFriend">+</span>
        </div>
      </div>
      <div class="conversations">
        <router-view>
        </router-view>
        <ul>
          <li v-for="(conversation, index) in conversations"
              @click="show(conversation, index)"
              @contextmenu.prevent="menu(index, $event)"
              v-bind:class="{active: cur===index}">
            <div>
              <span class="profile">
                  <img v-bind:src="conversation.profileUrl">
                  <a><span style="display: none;">
                      {{conversation.unreadCount>99?'99+':conversation.unreadCount}}
                  </span></a>
              </span>
              <span>
                  <span class="nickname">{{conversation.notename}}</span>
                  <span class="last-date">{{formatDate(conversation.updateTime, 'YY/M/D')}}</span>
                  <span class="last-msg">
                      <template v-if="conversation.msgType === null">
                      </template>
                      <template v-else-if="conversation.type == 0">
                          {{conversation.lastMsg}}
                      </template>
                      <template v-else>
                          [图片]
                      </template>
                  </span>
              </span>
            </div>
          </li>
        </ul>
      </div>
      <div class="conv-menu" :style="menuStyle">
        <ul>
          <li>
            <a>置顶</a>
          </li>
          <li>
            <a>消息免打扰</a>
          </li>
          <li class="divider" @click="remove">
            <a>删除聊天</a>
          </li>
        </ul>
      </div>
    </div>

    <div class="right">
      <div class="chat-person">
        <span>{{chatPerson.notename}}</span>
      </div>
      <div class="chat-area" v-show="cur === -1"></div>
      <div class="chat-area" :class="{'chat-active': i===cur}" v-for="(info, i) in messageMap"
           v-show="cur!= -1 && info.conversationId===conversations[cur].conversationId">
        <div @scroll.passive="scrollEvent">
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
                <a class="myself"><img v-bind:src="user.profileUrl"></a>
                <div v-if="message.type==3">
                  <a class="myself-content" @click="imageEnlarge($event, message.destId)"><img
                    :src="imgPrefix+'/'+message.content"></a>
                </div>
                <div v-if="message.type==0">
                  <span class="myself">{{message.content}}</span>
                </div>
              </div>
              <div class="img-msg" v-else>
                <a class="other-person"><img v-bind:src="chatPerson.profileUrl"></a>
                <div v-if="message.type==3">
                  <a class="other-person-content" @click="imageEnlarge($event, message.destId)"><img
                    :src="message.content"></a>
                </div>
                <div v-if="message.type==0">
                  <span class="other-person">{{message.content}}</span>
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
          <div class="content" @keydown.delete="clearMsg" @paste.prevent="pasteImg"
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
    <modals-container>
      <!--<modal name="add-friend"></modal>-->
    </modals-container>
  </div>

</template>

<script>
  import storage from '../storage'
  import axios from '../request'
  import util from '../util'
  import AddFriend from './AddFriend'

  export default {
    name: 'Chat',
    data () {
      return {
        user: {},
        conversations: [],
        // messages: [],
        messageMap: [],
        cur: -1,
        delIdx: -1,
        menuStyle: {},
        filepaths: [],
        message2send: '',
        chatPerson: {
          notename: ''
        },
      }
    },
    created () {
      let user = storage.getUser()
      this.user = user
      axios.get('/conversation/list?userId=' + user.userId).then(res => {
        this.conversations = res.data
        this.buildMessageMap(res.data)
        storage.setConversation(res.data)
        if (this.$route.params.idx != undefined) {
          let idx = parseInt(this.$route.params.idx)
          this.show(this.conversations[idx], idx)
        }
      })

      let self = this
      window.wsChat.onmessage = (evt) => {
        let resp = JSON.parse(evt.data)
        switch (resp.type) {
          case 0:
            let req = {
              type: 0,
              data: 'ping'
            }
            let ping = JSON.stringify(req)
            setTimeout(() => {
              wsChat.send(ping)
            }, 15000)
            break
          case 1:
            if (resp.code == 60001) {
              util.toIndex()
            }
            break
          case 2:
            let message = JSON.parse(resp.data)
            for (let i in self.messageMap) {
              let info = self.messageMap[i]
              if (info.conversationId === message.conversationId) {
                info.messages.push(message)
                if(self.cur != -1)
                  self.scroll2End()
                break
              }
            }
            let send2me = (self.user.userId == message.userId)
            if(!send2me) {
              for (let i in self.conversations) {
                let conv = self.conversations[i]
                if (conv.destId == message.userId) {
                  conv.updateTime = message.createTime
                  conv.lastMsg = message.content
                  conv.type = message.type
                  if (i != self.cur) {
                    self.conversations[i] = self.conversations[0]
                    self.conversations[0] = conv
                  }
                }
              }
              if(Notification.permission == 'granted') {
                self.notify(message)
              }else if(Notification.permission == 'denied') {
                console.log('user denied')
              }else {
                Notification.requestPermission().then(function (permission) {
                  if(permission == 'granted') {
                    self.notify(message)
                  }
                })
              }
            }
            break
        }

      }

    },
    methods: {
      notify(message) {
        let notify = new Notification('收到一条新消息', {
          body: message.content,
          tag: 'newMessage',

        })
        setTimeout(function(){
          notify.close()
        }, 8000)
      },
      diff (messages, index) {
        let d = new Date(messages[index].createTime).getTime() - new Date(messages[index - 1].createTime).getTime()
        return d > 300000
      },
      buildMessageMap (conversations) {
        for (let conv of conversations) {
          let info = {}
          info.messages = []
          info.showMore = false
          info.requested = false
          info.conversationId = conv.conversationId
          this.messageMap.push(info)
        }
      },
      formatDate (c, fmt) {
        return util.formatDate(c, fmt || 'YYYY年M月D日  HH:mm')
      },
      show (c, idx) {
        this.chatPerson = {
          notename: c.notename,
          destId: c.destId,
          profileUrl: c.profileUrl
        }
        let conv = this.conversations[idx]
        // debugger
        for (let info of this.messageMap) {
          if(info.conversationId == conv.conversationId) {
            if (!info.requested) {
              let url = '/message/prev?cid=' + conv.conversationId + '&createtime=' + encodeURIComponent(conv.createTime) + '&include=true'
              axios.get(url).then(res => {
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
      scroll2End () {
        this.$nextTick(() => {
          let chatArea = document.getElementsByClassName('chat-active')[0]
          if (chatArea.scrollHeight) {
            chatArea.scrollTop = chatArea.scrollHeight
          }
        })
      },
      menu (index, e) {
        this.delIdx = index
        this.menuStyle = {
          left: e.clientX + 'px',
          top: e.clientY + 'px',
          display: 'block'
        }
      },
      remove () {
        // debugger
        if (this.delIdx >= 0) {
          let conv = this.conversations[this.delIdx]
          let data = {
            'userId': this.user.userId,
            'conversationId': conv.conversationId
          }
          axios.delete('/conversation/delete', {params: data}).then(res => {
            console.log('delete')
            // this.conversations.splice(this.delIdx, 1)
            storage.spliceConversation(this.delIdx, 1)
          })
        }
      },
      hideMenu () {
        this.menuStyle.display = 'none'
      },
      clear () {
        this.hideMenu()
      },
      sendMsg: function () {
        if (this.message2send && this.cur != -1) {
          // console.log('send message', this.message2send)
          let conv = this.conversations[this.cur]
          console.log(conv.destId)
          let message = {
            conversationId: conv.conversationId,
            userId: this.user.userId,
            destId: conv.destId,
            content: this.message2send,
            type: 0,
            createTime: new Date().getTime(),
          }
          let data = {
            type: 2,
            data: JSON.stringify(message),
            ticket: this.user.ticket
          }
          let text = JSON.stringify(data)
          window.wsChat.send(text)
          this.updateConversation(this.cur, message)
          this.message2send = ''
        }
      },
      updateConversation(idx, message) {
        let conv = this.conversations[idx]
        conv.lastMsg = message.content
        conv.updateTime = new Date()
        conv.type = message.type
        if(this.conversations.length > 0) {
          this.conversations[idx] = this.conversations[0]
          this.conversations.splice(idx, 1)
          this.conversations.unshift(conv)
          // this.conversations[0] = conv
          this.cur = 0
          let temp = this.messageMap[idx]
          this.messageMap.splice(idx, 1)
          this.messageMap.unshift(temp)
          // this.messageMap[idx] = this.messageMap[0]
          // this.messageMap[0] = temp
        }
      },
      addFriend: function () {
        this.$modal.show(AddFriend, {}, {
          draggable: true,
          width: 550,
          height: 485,
          clickToClose: false,
        })
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
  /* 设置滚动条的样式 */
  /*::-webkit-scrollbar {*/
  /*width: 7px;*/
  /*margin-left:2px;*/
  /*}*/

  /* 滚动条滑块 */
  /*::-webkit-scrollbar-thumb {*/
  /*border-radius: 6px;*/
  /*background-color: #D2D2D2;*/
  /*}*/

  /*::-webkit-scrollbar-thumb:window-inactive {*/
  /*background:rgba(255,0,0,0.4);*/
  /*display: none;*/
  /*}*/
  window-inactive {
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
    background-color: #EEEAE8;
    float: left;
    height: 100%;
  }

  .right {
    width: calc(100% - 250px - 60px);
    min-width: 300px;
    float: left;
    height: 100%;
    background: #F5F5F5;
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
    overflow-y: scroll;
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
  }

  .conversations .nickname, .conversations .last-msg {
    left: 55px;
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

  .conversations li .badge {
    background-color: red;
    color: #FFF;
    font-size: 9px;
    border-radius: 50%;
    position: absolute;
    z-index: 1000;
    display: inline !important;
    position: absolute;
    top: 2px;
    left: 42px;
  }

  .conversations li .hidden {
    display: none;
  }

  .conversations li.active {
    background-color: #BCBDBE;
  }

  .conv-menu {
    background-color: #ffffff;
    width: 100px;
    font-size: 12px;
    font-weight: 500;
    position: absolute;
    display: none;
    z-index: 999;
  }

  .conv-menu .divider {
    border-top: solid 1px #e7e7e7;
  }

  .conv-menu li {
    padding: 5px 20px;
    text-align: left;
  }

  .conv-menu li:hover {
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

  .other-person, .other-person-content {
    float: left;
  }

  .myself img, .other-person img {
    width: 35px;
  }

  .chat-area {
    height: calc(100% - 146px - 60px);
    overflow-y: auto;
    font-size: 14px;
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
    padding: 8px 30px;
  }

  .chat-area .oldest-time-area {
    text-align: center;
    padding-bottom: 10px;
  }

  .chat-area .oldest-time-area .oldest-time {
    background-color: #DADADA;
    padding: 4px 5px;
    color: #FFFFFF;
    font-size: 0.9em;
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
