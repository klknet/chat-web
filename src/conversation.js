import axios from './request'


export default {
  /*
  获取会话列表
   */
  getConversation: function (userId) {
    return axios.get('/conversation/list?userId=' + userId)
  },
  /*
  创建会话
   */
  buildConversation: function(userId, destId) {
    let fd = new FormData()
    fd.set('destId', destId)
    fd.set('userId', userId)
    return axios.post('conversation/build', fd)
  },
  /*
  删除会话
   */
  delConversation: function (userId, conversationId) {
    let data = {
      'userId': userId,
      'conversationId': conversationId
    }
    return axios.delete('/conversation/delete', {params: data})
  },
  /*
  置顶会话
   */
  top: function (userId, conversationId, top) {
    let fd = new FormData()
    fd.set('conversationId', conversationId)
    fd.set('userId', userId)
    fd.set('top', top)
    return axios.post('/conversation/top', fd)
  },
  /*
  免打扰
   */
  dnd: function (userId, conversationId, dnd) {
    let fd = new FormData()
    fd.set('conversationId', conversationId)
    fd.set('userId', userId)
    fd.set('dnd', dnd)
    return axios.post('/conversation/dnd', fd)
  },
}
