import axios from 'axios'
import config from './config'
import storage from '@/storage'
import util from '@/util'

const instance = axios.create();
instance.defaults.timeout = config.timeout;
instance.defaults.baseURL = 'http://' + config.host + config.context;

instance.interceptors.request.use(config => {
  let user = storage.getUser()
  if(user != null) {
    config.headers.UserId = util.encrypt(user.userId)
    config.headers.Ticket = util.encrypt(user.ticket)
  }
  return config
}, err => {
  console.error(err)
  return Promise.reject(err)
})
export default instance;
