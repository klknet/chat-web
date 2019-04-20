import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import MainChat from '@/components/MainChat'
import Chat from '@/components/Chat'
import Roster from '@/components/Roster'
import Collector from '@/components/Collector'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/main',
      name: 'MainChat',
      component: MainChat,
      children: [
        {
          path: 'chat',
          name: 'Chat',
          component: Chat
        },
        {
          path: 'roster',
          name: 'Roster',
          component: Roster
        },
        {
          path: 'collector',
          name: 'Collector',
          component: Collector
        }
      ]
    },
    {
      path: '/',
      name: 'Login',
      component: Login
    }

  ]
})
