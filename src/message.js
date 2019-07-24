import axios from './request'

export default {
  /*
  当前时间点之前的50条消息，包含当前消息
   */
  historyMessage: function (conversationId, userId, createTime, include) {
    let url = '/message/prev?cid=' + conversationId + '&createtime='
      + encodeURIComponent(createTime) + '&include='+include+"&userId="+userId
    return axios.get(url)
  },
  delUnread: function (userId, id) {
    axios.delete('/message/delUnread?userId='+userId+"&id="+id)
  },
  /*
  撤回消息
   */
  revocation: function (userId, msgId) {
    let url = '/message/revocation?msgId='+msgId+'&userId='+userId
    axios.put(url)
  },
  /*
  删除消息
   */
  delMsg: function (msgId, userId) {
    let url = '/message/delMsg?msgId='+msgId+'&userId='+userId
    axios.delete(url)
  }
}
