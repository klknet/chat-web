<template>
    <div>
      <div class="form-group">
        <div class="input">
          <label>用户名</label>
          <input type="text" class="form-control" v-model="user.username"/>
        </div>
      </div>
      <div class="form-group">
        <div class="input">
          <label>密码</label>
          <input type="password" class="form-control" v-model="user.rawPwd"/>
        </div>
      </div>
      <div class="form-group">
        <div class="input">
          <label>昵称</label>
          <input type="text" class="form-control" v-model="user.nickname"/>
        </div>
      </div>
      <div class="form-group">
        <div class="input">
          <label class="radio-inline">
            <input type="radio" v-model="user.gender" value="1"> 男
          </label>
          <label class="radio-inline">
            <input type="radio" v-model="user.gender" value="0"> 女
          </label>
        </div>
      </div>
      <div class="form-group">
        <div class="input">
          <label>所在地</label>
          <input type="text" class="form-control" v-model="user.city"/>
        </div>
      </div>
      <div class="form-group">
        <div class="input">
          <button class="btn btn-primary pull-right" @click="register">注册</button>
          <button class="btn pull-right"  style="margin-right: 10px;" @click="doLogin">
            登录</button>
        </div>
      </div>
    </div>
</template>

<script>
  import axios from '@/request'

  export default {
    name: 'Register',
    data() {
      return {
        user: {
          username: '',
          nickname: '',
          rawPwd: '',
          gender: '1',
          city: ''
        }
      }
    },
    methods: {
      register() {
        if(!this.user.username) {
          alert("用户名不能为空")
          return;
        }
        if(!this.user.nickname) {
          alert("昵称不能为空")
          return;
        }
        if(!this.user.rawPwd) {
          alert("密码不能为空")
          return;
        }
        if(!this.user.city) {
          alert("所在地不能为空")
          return;
        }
        this.user.rawPwd = Buffer.from('konglk'+this.user.rawPwd).toString('base64')
        axios.post('/user/add', this.user, {
          headers: {
            token: '6c766178-4eef-11e9-89c1-40a3cc5c760e',
          }
        }).then(res => {
        })
      },
      doLogin() {
        this.$router.push('/')
      },
    },
  }
</script>

<style scoped>
  .input {
    display: inline-block;
    width: 300px;
  }
</style>
