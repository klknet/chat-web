import axios from './request'


export default {
  token: "6c766178-4eef-11e9-89c1-40a3cc5c760e",
  /*
  登录
   */
  login: function (username, pwd) {
    var fd = new FormData()
    fd.set('unique', username)
    fd.set('pwd', Buffer.from('konglk' + pwd).toString('base64'))
    return axios.post('/user/login', fd, {
      headers: {
        token: this.token,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  },
  /*
  获取用户信息
   */
  findById: function (userId) {
    return axios.get('/user/findById?userId='+userId, {
      headers: {
        token: this.token
      }
    })
  },
  /*
  模糊查询用户
   */
  findUsers: function (username) {
    return axios.get('/user/find?username=' + username, {
      headers: {
        token: this.token
      }
    })
  },
  /*
  申请添加好友
   */
  requestFriend: function (userId, pickedUser, note) {
    var fd = new FormData()
    fd.set('userId', userId)
    fd.set('destId', pickedUser)
    fd.set('note', note || '')
    return axios.post('/relation/requestFriend', fd, {headers:{'Content-Type': 'multipart/form-data'}})
  },
  /*
  好友添加列表
   */
  requestList: function (userId) {
    return axios.get('/relation/requestList?userId=' + userId)
  },
  /*
  通过好友
   */
  agreeFriendRequest: function (objectId, userId) {
    let df = new FormData()
    df.set('objectId', objectId)
    df.set('userId', userId)
    return axios.post('/relation/agreeRequest', df,
      {headers:{'Content-Type': 'application/x-www-form-urlencoded'}})
  },
  /*
  删除好友
   */
  delFriend: function (userId, friendId) {
    return axios.delete('/relation/delFriend?userId='+userId+'&friendId='+friendId)

  }
}
