import util from './util'
import pinyin from 'js-pinyin'
import lodash from 'lodash'

let storage = {
  setAes: function(aes) {
    localStorage.aes = JSON.stringify(aes)
  },
  getAes: function() {
    let aes = window.aes
    if(aes)
      return aes
    aes = localStorage.aes
    if(!aes)
      return null
    window.aes = JSON.parse(aes)
    return window.aes
  },
  setUser: function (user) {
    window.user = user
    localStorage.user = JSON.stringify(user)
  },
  getUser: function () {
    let user = window.user
    if (user)
      return user
    user = localStorage.user
    if (!user) {
      return null
    }
    window.user = JSON.parse(user)
    return window.user
  },
  removeUser: function() {
    localStorage.removeItem('user')
    window.user = null
    util.toIndex()
  },
  setConversation: function (conversations) {
    if(!window.user)
      window.user = this.getUser()
    window.user.conversations = conversations
    this.setUser(window.user)
  },
  insertConversation: function(conv) {
    if(!window.user)
      window.user = this.getUser()
    window.user.conversations.unshift(conv, 0)
  },
  getConversation: function () {
    if(!window.user)
      window.user = this.getUser()
    return window.user.conversations
  },
  spliceConversation: function(idx) {
    if(!window.user)
      window.user = this.getUser()
    window.user.conversations.splice(idx, 1)
    this.setUser(window.user)
  },
  removeMapRef: function() {
    if(!window.user)
      window.user = this.getUser()
    if(window.user.conversations && window.user.conversations.length > 0) {
      window.user.conversations = null
      this.setUser(window.user)
    }
  },
  setGroupFriend(user) {
    if(user.friends) {
      user.friends.forEach(f => f.firstLetter = pinyin.getCamelChars(f.remark).charAt(0))
      let groupFriend = lodash.groupBy(user.friends, friend => friend['firstLetter'])
      user.groupFriend = groupFriend
      this.setUser(user)
    }
  }
}

export default storage
