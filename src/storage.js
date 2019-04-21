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
      location.href = '/'
    }
    return JSON.parse(localStorage.user)
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
