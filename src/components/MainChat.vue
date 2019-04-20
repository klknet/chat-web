<template>
  <div class="box">
    <div class="inner">
      <Left :user="user"/>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
  import Left from '@/components/Left'

  export default {
    name: 'MainChat',
    components: {Left},
    data () {
      return {
        user: {}
      }
    },
    created () {
      let user = window.localStorage.user
      if (user == null) {
        location.href = '/'
      }
      this.user = JSON.parse(user)
      const wsChat = new WebSocket(config.ws)
      wsChat.onopen = function () {
        send()
        let s = setInterval(send, 1000 * 15)

        function send () {
          try {
            var req = {
              type: 0,
              data: 'ping'
            }
            wsChat.send(JSON.stringify(req))
          } catch (err) {
            console.error(err)
            clearInterval(s)
          }
        }
      }
      wsChat.onmessage = function (evt) {
        // console.log(evt.data)
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
  }

  li, ul, div {
    margin: 0;
    padding: 0
  }

  li {
    list-style: none;
  }

</style>
