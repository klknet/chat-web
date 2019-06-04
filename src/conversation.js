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
    return axios.post('conversation/build', fd,
      {headers: {'Content-Type': 'application/x-www-form-urlencoded'}})
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
  }
}
