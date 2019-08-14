import axios from './request'
import config from '@/config'

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
  },
  /*
  上传文件
   */
  uploadFile: function (id, fd, range) {
    let url = '/file/upload?id='+id
    return axios.post(url, fd, {headers:{'Content-Type':'multipart/form-data', 'Range':'bytes='+range+'-'}})
  },
  /*
  done
   */
  uploadDone(id, fileName, messageDO) {
    let url = '/file/uploadDone?id='+id+'&fileName='+fileName
    return axios.post(url, messageDO)
  },
  /*
  下载
   */
  download(id) {
    let url = '/file/download?id='+id
    window.open('http://'+config.host+config.context+url)
  },
  /*
  收藏
   */
  collect(userId, id) {
    let url = '/collect/save'
    let df = new FormData()
    df.set('userId', userId)
    df.set('msgId', id)
    return axios.post(url, df,
      {headers:{'Content-Type': 'application/x-www-form-urlencoded'}})
  },
  /*
  收藏列表
   */
  collectList(userId) {
    return axios.get("/collect/list")
  }


}
