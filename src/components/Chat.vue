<template>
  <div class="chat">
    <Conversation v-bind:user="user"/>
    <Message v-bind:user="user"/>
  </div>

</template>

<script>
  import storage from '../storage'
  import Conversation from '@/components/Conversation'
  import Message from '@/components/Message'

  export default {
    name: 'Chat',
    components: {Message, Conversation},
    data () {
      return {
        user: {},
      }
    },
    activated () {
    },
    mounted () {
    },
    created () {
      let user = storage.getUser()
      this.user = user
    },
    methods: {
      addConversation (conv) {
        let info = {}
        info.messages = []
        info.showMore = false
        info.requested = false
        info.conversationId = conv.conversationId
        this.messageMap.push(info)
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
      showMore: function () {

      }
    }
  }
</script>

<style scoped>

  .chat {
    height: 100%;
    width: 100%;
  }


</style>
