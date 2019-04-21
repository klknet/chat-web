import axios from 'axios'
import config from './config'

const instance = axios.create();
instance.defaults.timeout = config.timeout;
instance.defaults.baseURL = 'http://' + config.host + config.context;


export default instance;
