var axios = require('axios')
var cytpto = require('crypto');

var appId = '8A4B4DEB1919C9805F4B624121C3B378'
var appKey = '57C3739DCB0192E593F78A3935C51AE9'

// axios.post('http://opengate.nmgjyyun.cn:30002/apigateway/getAccessToken', data).then(res => {
//     console.log(res.data)
// })

var token = 'cce8f32685d44ea1b44a2f4704325c80'
var personId = '16aa60879ab34023bc109780e3e788e2'
var orgId = 'd9a78b04e4534814b63f5a57441dcef2'
var ticket = 'azBlMDc5MTczOTA2YTQ0OTQ5M2M1YzJhM2M0ZTViYmYzMTU1NzE0MDg2NjAwMQ=='

function validateTicket () {
  axios.post('http://opengate.nmgjyyun.cn:30002/userSession/validaTicket?accessToken='+token,{ticket}).then(res=>{
    console.log(res.data)
  })
}

function getUserById() {
//获取用户基本信息
  axios.post('http://opengate.nmgjyyun.cn:30002/baseInfo/user/getUserById?accessToken='+token, {personId}).then(res=>{
    console.log(res.data)
    // console.log(JSON.parse(res.data.relList))
  })
}

function getUserList() {
  //获取用户列表
  axios.post('http://opengate.nmgjyyun.cn:30002/baseInfo/user/getUserList?accessToken='+token, {
    'start':1,
    'end': 3,
    'orgId':orgId
  }).then(res=>{
    console.log(res.data)
  })
}

validateTicket()
// getUserById()
// getUserList()
