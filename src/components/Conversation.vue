<template>
  <div class="median" id="median">
    <div class="search">
      <div>
        <i class="fa fa-search"></i>
        <input class="search-input" type="text" placeholder="搜索"/>
        <span class="add-friend" @click="addGroupChat">+</span>
      </div>
    </div>
    <div class="conversations">
      <div class="inner">
        <ul>
          <li v-for="(conversation, index) in conversations"
              @click="show(conversation, index)"
              @contextmenu.prevent="convMenu(index, $event)"
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
                      <template v-else-if="conversation.messageType == 2">
                        [文件]
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
  </div>
</template>

<script>
  import convRequest from '../conversation'
  import storage from '../storage'
  import vm from '@/event'
  import messageRequest from '@/message'
  import util from '@/util'
  import CreateGroupChat from '@/components/CreateGroupChat'

  export default {
    name: 'Conversation',
    components: {CreateGroupChat},
    props: {
      user: Object
    },
    data() {
      return {
        conversations: [],
        cur: -1,
        menuStyle: {},
        isTop: false,
        isDnd: false,
        delIdx: -1,
      }
    },
    activated () {
      //组件切换时触发
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
      })
      vm.$on('chat-update-conversation', data => {
        let idx = this.indexOfConversation(data)
        this.conversations[idx] = data
        storage.setConversation(this.conversations)
      })
      vm.$on('conversation-update-lastmsg', data => {
        let idx = this.indexOf(data.conversationId)
        if (idx != -1) {
          this.conversations[idx].lastMsg = data.lastMsg
        }
      })
      //处理新消息
      vm.$on('chat-receive-message', message => {
        let idx = this.indexOf(message.conversationId)
        let selfmessage = (this.user.userId == message.userId)
        //不存在的会话，新创建一个会话
        if (idx == -1) {
          this.getConversation()
        }
        else {
          if (this.cur != idx) {
            this.conversations[idx].unreadCount += 1
            vm.$emit('left-unread-num', 0, 1)
          } else {
            //处于当前会话下就删掉未读消息数量
            messageRequest.delUnread(this.user.userId, message.conversationId)
          }
          this.updateConversation(idx, message, !selfmessage)
        }
        if (!selfmessage) {
          util.notify(message)
        }
      })
      vm.$on('chat-delete-message', data => {
        this.deleteMsgNotify(data)
      })

      vm.$on('all-clear', () => {
        this.clear()
      })
    },
    created() {
      this.getConversation()
    },
    methods: {
      //获取会话列表
      getConversation () {
        console.log('invoke get conversations')
        convRequest.getConversation(this.user.userId).then(res => {
          this.conversations = res.data
          vm.$emit("message-build-map", res.data)
          storage.setConversation(res.data)
          let total = 0
          for (let conv of res.data) {
            total += conv.unreadCount
          }
          vm.$emit('left-unread-num', 0, total)
        })
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
          height: 'auto',
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
            vm.$emit('message-remove-conversation', conv.conversationId)
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
      fmtImg (id) {
        return util.fmtImg(id)
      },
      formatDate (c, fmt) {
        return util.formatDate(c, fmt || 'YYYY年M月D日  HH:mm')
      },
      //点击会话，显示历史消息
      show (conv, idx) {
        this.cur = idx
        if (conv.unreadCount && conv.unreadCount > 0) {
          vm.$emit('left-unread-num', 0, -conv.unreadCount)
          messageRequest.delUnread(this.user.userId, conv.conversationId)
        }
        vm.$emit('message-show', conv)
      },
      //右键点击
      convMenu (index, e) {
        this.delIdx = index
        this.isTop = this.conversations[index].top
        this.isDnd = this.conversations[index].dnd
        this.menuStyle = {
          left: e.clientX + 'px',
          top: e.clientY + 'px',
          width: this.isDnd ? '130px' : '120px',
          display: 'block'
        }
      },
      clear() {
        this.menuStyle.display = 'none'
      },
    }
  }
</script>

<style scoped>

  span{
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
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
    width: 100%;
  }

  .median {
    width: 250px;
    background: linear-gradient(to bottom, #E5E5E6, #EBE8E7, #F0F0F0);
    float: left;
    height: 100%;
    overflow: hidden;
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
    /*overflow-x: hidden;*/
    position: relative;
  }

  .inner {
    width: 250px;
    overflow: hidden;
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

  .conversations .inner li {
    padding: 10px;
    height: 60px;
    position: relative;
    overflow: hidden;
  }

  .conversations .inner li.active {
    background-color: #C4C4C4;
  }

  .conversations .inner li:hover {
    background-color: #DFDDDB;
  }

  .conversations .inner li img {
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

  .conv-menu {
    background-color: #ffffff;
    width: 100px;
    font-size: 12px;
    font-weight: 500;
    position: absolute;
    display: none;
    z-index: 999;
    border: solid 1px #d4d4d4;
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


</style>
