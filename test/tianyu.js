var axios = require('axios')
var cytpto = require('crypto');

var appId = '8A4B4DEB1919C9805F4B624121C3B378'
appId= 'D634D5FF9966BADB205C36EEAC303344'
var appKey = '57C3739DCB0192E593F78A3935C51AE9'
appKey = 'A112851941D58B7D88096C817CF7839F'


var token = 'cce8f32685d44ea1b44a2f4704325c80'
token = '61d73f241db64b088b0dbb9bc2831708'
var personId = '16aa60879ab34023bc109780e3e788e2'
var orgId = 'd9a78b04e4534814b63f5a57441dcef2'
var ticket = 'cWFhYzIwODU5ZTgwYzQxMzQ5ODBjMDk3ZjViNjEwMDRhMTU1ODA2Mjk2NzkyMQ=='

function getToken() {
  axios.post('http://opengate.nmgjyyun.cn:30002/apigateway/getAccessToken', data).then(res => {
    console.log(res.data)
  })
}

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

// getToken()
validateTicket()
// getUserById()
// getUserList()
