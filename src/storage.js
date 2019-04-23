import util from './util'
import pinyin from 'js-pinyin'
import lodash from 'lodash'

let storage = {
  setUser: function (user) {
    window.user = user
    localStorage.user = JSON.stringify(user)
  },
  getUser: function () {
    let user = window.user
    if (user == null) {
      user = localStorage.user
    }
    if (user == null) {
      util.toIndex()
    }
    return JSON.parse(localStorage.user)
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
  getConversation: function () {
    if(!window.user)
      window.user = this.getUser()
    return window.user.conversations
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
