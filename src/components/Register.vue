<template>
    <div class="register">
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
          <label>手机号</label>
          <input type="text" class="form-control" v-model="user.cellphone"/>
        </div>
      </div>
      <div class="form-group">
        <div class="input">
          <label>邮箱</label>
          <input type="text" class="form-control" v-model="user.mailbox"/>
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
      <v-dialog/>
    </div>
</template>

<script>
  import axios from '@/request'
  import util from '@/util'

  export default {
    name: 'Register',
    data() {
      return {
        user: {
          username: '',
          nickname: '',
          cellphone: '',
          mailbox:'',
          rawPwd: '',
          gender: '1',
          city: ''
        }
      }
    },
    methods: {
      register() {
        if(!this.user.username) {
          this.warn('用户名不能为空')
          return;
        }
        if(!this.user.nickname) {
          this.warn("昵称不能为空")
          return;
        }
        if(!this.user.cellphone) {
          this.warn("手机号不能为空")
          return;
        }
        if(!this.user.mailbox) {
          this.warn("邮箱不能为空")
          return;
        }
        if(!this.user.rawPwd) {
          this.warn("密码不能为空")
          return;
        }
        if(!this.user.city) {
          this.warn("所在地不能为空")
          return;
        }
        this.user.rawPwd = util.encrypt(this.user.rawPwd)
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
      warn(msg) {
        this.$modal.show('dialog', {title:'错误', text:msg, buttons: [{title:'关闭'}]})
      }
    },
  }
</script>

<style scoped>
  .register {
    text-align: center;
    margin-top: 50px;
  }

  .input {
    display: inline-block;
    width: 300px;
  }
</style>
