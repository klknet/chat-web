import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import MainChat from '@/components/MainChat'
import Chat from '@/components/Chat'
import Roster from '@/components/Roster'
import Collector from '@/components/Collector'
import Register from '@/components/Register'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: '/web',
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
      path: '/register',
      name: 'Register',
      component: Register,
    },
    {
      path: '/',
      name: 'Login',
      component: Login
    }

  ]
})
