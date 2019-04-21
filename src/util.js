import moment from 'moment'
import lodash from 'lodash'
import pinyin from 'js-pinyin'


export default {
  /*
    格式化日期
     */
  formatDate: function (c) {
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
        format = curM.format('YY/M/D')
    }
    return format
  },
  /*
    将好友按拼音首字母分组
     */
  groupFriend(user) {
    user.friends.forEach(f => f.firstLetter = pinyin.getCamelChars(f.remark).charAt(0))
    let groupFriend = lodash.groupBy(user.friends, friend => friend['firstLetter'])
    user.groupFriend = groupFriend
  },
}
