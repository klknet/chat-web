let host = '127.0.0.1'
host = '39.106.133.40'
const config = {
  protocol: 'http',
  host,
  timeout: 6000,
  context: '/ims',
  ws: 'ws://'+host+':8080/ims/ws/chat'
}

export default config




