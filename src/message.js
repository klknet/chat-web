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
  }
}
