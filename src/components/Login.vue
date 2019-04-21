<template>
  <div>
    <div class="form-group">
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
        pwd: ''
      }
    },
    created () {
    },
    methods: {
      doLogin () {
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

          }
        })
      }
    }
  }
</script>

<style scoped>
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
