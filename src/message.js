import axios from './request'

export default {
  /*
  当前时间点之前的50条消息，包含当前消息
   */
  historyMessage: function (conversationId, createTime, include) {
    let url = '/message/prev?cid=' + conversationId + '&createtime='
      + encodeURIComponent(createTime) + '&include='+include
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
  delMsg: function (msgId) {
    let url = '/message/delMsg?msgId='+msgId
    axios.delete(url)
  }
}
