<template>
  <div class="box">
    <div class="inner" @click="clear" v-show="display" :class="{'full-screen': max}">
      <Left :user="user"/>
      <keep-alive>
        <router-view ></router-view>
      </keep-alive>
      <div class="func-area">
        <div>
          <span class="gray-bg" @click="minWin">-</span>
          <span class="gray-bg" @click="maxWin">□</span>
          <span class="red-bg" @click="closeWin">x</span>
        </div>
      </div>
    </div>
    <div class="thumbnail" v-show="!display" @click="show">
    </div>
  </div>
</template>

<script>
  import Left from '@/components/Left'
  import storage from '../storage'
  import config from '../config'
  import ws from '../websocket'

  export default {
    name: 'MainChat',
    components: {Left},
    data () {
      return {
        user: {},
        display: true,
        max: false,
      }
    },
    created () {
      let user = storage.getUser()
      this.user = user
      const wsChat = new WebSocket(config.ws)
      window.wsChat = wsChat
      wsChat.onopen = () => {
        ws.ping()
        this.authentication()
      }
      wsChat.onclose = (evt) => {
        console.log("connection closed", wsChat.id)
      }
      this.$router.push({name: 'Chat'})

    },
    methods: {
      clear() {

      },
      closeWin: function () {
        window.wsChat.close()
        storage.removeUser()

      },
      maxWin: function () {
        this.max = !this.max
      },
      minWin: function () {
        this.display = false
      },
      show: function () {
        this.display = true
      },
      authentication: function () {
        let auth = {
          userId: this.user.userId
        }
        let req = {
          type: 1,
          ticket: this.user.ticket,
          data: JSON.stringify(auth)
        }
        wsChat.send(JSON.stringify(req))
      }

    }
  }
</script>

<style scoped>
  .box {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .inner {
    width: 870px;
    height: 605px;
    border: solid 1px #d6d6d6;
  }

  .full-screen {
    width: 100%;
    height: 100vh;
  }

  li, ul, div {
    margin: 0;
    padding: 0
  }

  li {
    list-style: none;
  }

  .func-area {
    display: inline;
    position: absolute;
    right: 0;
    top: 0;
    z-index: 1000;
    line-height: 5px;
  }

  .red-bg, .gray-bg {
    padding: 10px;
    cursor: pointer;
    display: inline-block;
    font-size: 1.2em;
  }

  .red-bg:hover {
    background-color: #F45454;
    color: #ffffff;
  }

  .gray-bg:hover {
    background-color: #E3E3E3;
  }

  .thumbnail{
    position: absolute;
    bottom: 5px;
    background: url("/web/static/img/thumbnail.png") center;
    width:65px;
    height: 65px;
  }




</style>
