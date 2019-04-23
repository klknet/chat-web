import util from './util'

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
    util.toIndex()
  },
  setConversation: function (conversations) {
    if(!window.user)
      window.user = this.getUser()
    window.user.conversations = conversations
  },
  getConversation: function () {
    if(!window.user)
      window.user = this.getUser()
    return window.user.conversations
  }
}

export default storage
