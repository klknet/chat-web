<template>
  <div class="login">
    <div class="form-group">
      <div class="error-info" v-show="error">
        <em>用户名密码不正确</em>
      </div>
      <div class="input">
        <label>用户名</label>
        <input type="text" class="form-control" name="username" v-model="username"/>
      </div>
    </div>
    <div class="form-group">

      <div class="input">
        <label>密码</label>
        <input type="password" class="form-control" name="pwd" v-model="pwd"/>
      </div>
    </div>
    <div class="form-group">
      <div class="input">
        <button class="btn pull-right" @click="doLogin">登录</button>
        <button class="btn btn-primary pull-right"  style="margin-right: 10px;" @click="register">
          注册</button>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from '../request'
  import storage from '../storage'
  import util from '../util'

  export default {
    name: 'Login',
    data () {
      return {
        username: '',
        pwd: '',
        error: false
      }
    },
    created () {
    },
    methods: {
      doLogin () {
        if(!this.username) {
          alert("用户名不能为空")
          return;
        }
        if(!this.pwd) {
          alert("密码不能为空")
          return;
        }
        var fd = new FormData()
        fd.set('unique', this.username)
        fd.set('pwd', Buffer.from('konglk' + this.pwd).toString('base64'))
        axios.post('/user/login', fd, {
          headers: {
            token: '6c766178-4eef-11e9-89c1-40a3cc5c760e',
            'Content-Type': 'multipart/form-data'
          }
        }).then(res => {
          if (res.data) {
            let user = res.data
            util.groupFriend(user)
            storage.setUser(user)
            this.$router.push('/main/chat')
          } else {
            this.error = true
          }
        })
      },
      register() {
        this.$router.push({name: 'Register'})
      },
    }
  }
</script>

<style scoped>
  .login {
    text-align: center;
    margin-top: 50px;
  }

  .error-info {
    margin: 10px 0;
  }

  .error-info em{
    color: red;
  }

  .input {
    display: inline-block;
    width: 300px;
  }

  .input label {
    display: inline-block;
    width: 80px;
  }

  input.form-control{
    display: inline-block;
    width: 210px;
  }

  .input button{
    /*float: right;*/
  }
</style>
