import moment from 'moment'
import lodash from 'lodash'
import pinyin from 'js-pinyin'
import CryptoJS from 'crypto-js'
import axios from '@/request'
import storage from '@/storage'


export default {
  getKey() {
    let aes = storage.getAes()
    return CryptoJS.enc.Utf8.parse(aes.key)
  },
  getIV() {
    let aes = storage.getAes()
    return CryptoJS.enc.Utf8.parse(aes.iv)
  },
  /*
    格式化日期
     */
  formatDate: function (c, fmt) {
    c = new Date(c)
    let curM = moment(c), copyM = moment(c)
    let now = moment().startOf('d')
    let diffNum = now.diff(copyM.startOf('d'), 'd')
    let format
    switch (diffNum) {
      case 0:
        format = curM.format('HH:mm')
        break
      case 1:
        format = '昨天 ' + curM.format('HH:mm')
        break
      default:
        let form = fmt || 'YY/M/D'
        format = curM.format(form)
    }
    return format
  },
  /*
    将好友按拼音首字母分组
     */
  groupFriend(user) {
    if(user.friends) {
      user.friends.forEach(f => f.firstLetter = pinyin.getCamelChars(f.remark).charAt(0))
      let groupFriend = lodash.groupBy(user.friends, friend => friend['firstLetter'])
      let friends = []
      for (let letter in groupFriend) {
        let friend = {letter: letter, groups: groupFriend[letter]}
        friends.push(friend)
      }
      friends.sort((obj1, obj2) => {
        return obj1.letter.charCodeAt()-obj2.letter.charCodeAt()
      })
      user.groupFriend = friends
    }

  },
  /*
  跳转到首页
   */
  toIndex() {
    location.href = '/web'
  },
  /*
  获取aes key
   */
  getAesKey() {
    if (!storage.getAes())
      axios.get('/util/aesKey').then(res => storage.setAes(res.data))
  },
  /*
  aes加密
   */
  encrypt(word) {
    let srcs = CryptoJS.enc.Utf8.parse(word);
    let encrypted = CryptoJS.AES.encrypt(srcs, this.getKey(),
      { iv: this.getIV(), mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.ciphertext.toString().toUpperCase();
  },
  /*
  aes解密
   */
  decrypt(word) {
    let encryptedHexStr = CryptoJS.enc.Hex.parse(word);
    let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    let decrypt = CryptoJS.AES.decrypt(srcs, this.getKey(),
      { iv: this.getIV(), mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedStr.toString();
  },


}
