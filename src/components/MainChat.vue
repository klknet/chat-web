<template>
  <div class="box">
    <div class="inner" @click="clear" v-show="display" :class="{'full-screen': max}">
      <Left :user="user" v-on:enlargeProfileEvent="enlargeProfile"/>
      <keep-alive>
        <router-view ></router-view>
      </keep-alive>
      <div class="func-area">
        <div>
          <span class="gray-bg" @click="minWin">-</span>
          <span class="gray-bg" @click="maxWin">□</span>
          <span class="red-bg" @click="closeWin">x</span>
        </div>
      </div>
    </div>
    <div class="thumbnail" v-show="!display" @click="show">
    </div>

    <modal name="createChat" height="auto" :scrollable="true" :draggable="true"
           width="550" :clickToClose="true" style="over-flow-y: scroll; max-height:400px;">
      <CreateGroupChat/>
    </modal>
    <modal name="addFriend" height="auto">
      <AddFriend/>
    </modal>
    <modal name="profile" width="330" height="360">
      <div class="enlarge">
        <div class="close" @click="$modal.hide('profile')"><span>x</span></div>
        <div class="middle-profile">
          <img :src="fmtImg(user.profileUrl)"/>
          <div class="upload">
            <form id='uploadForm'  enctype="multipart/form-data">
              <label for="avatar" class="upload-avatar">修改头像</label>
              <input id="avatar" type="file" style="display: none" name="file" @change="updateProfile" accept="image/*"/>
            </form>
          </div>
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
  import Left from '@/components/Left'
  import storage from '../storage'
  import config from '../config'
  import ws from '../websocket'
  import util from '@/util'
  import vm from '@/event'
  import userRequest  from '@/user'
  import CreateGroupChat from '@/components/CreateGroupChat'
  import AddFriend from '@/components/AddFriend'

  export default {
    name: 'MainChat',
    components: {AddFriend, CreateGroupChat, Left},
    data () {
      return {
        user: {},
        display: true,
        max: false,
      }
    },
    created () {
      util.getAesKey()
      let user = storage.getUser()
      if(!user)
        util.toIndex()
      this.user = user
      ws.connect()
      this.$router.push({name: 'Chat'})

    },
    mounted () {

    },
    methods: {
      clear() {
        vm.$emit('all-clear')
      },
      closeWin: function () {
        userRequest.delTicket(this.user.userId)
        ws.close()
        storage.removeUser()

      },
      maxWin: function () {
        this.max = !this.max
      },
      minWin: function () {
        this.display = false
      },
      show: function () {
        this.display = true
      },
      enlargeProfile() {
        this.$modal.show('profile', {
        })
      },
      fmtImg(id) {
        return util.fmtImg(id)
      },
      updateProfile(e) {
        console.log('hh ', e)
        let fd = new FormData()
        fd.append('file', e.target.files[0])
        fd.append('userId', this.user.userId)
        userRequest.uploadAvatar(fd).then(res=> {
          this.user.profileUrl = res.data
          storage.setUser(this.user)
        })
      }

    }
  }
</script>

<style scoped>
  .box {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .inner {
    width: 870px;
    height: 605px;
    border: solid 1px #d6d6d6;
    display: flex;
  }

  input {
    outline: none;
  }

  .full-screen {
    width: 100%;
    height: 100vh;
  }

  li, ul, div {
    margin: 0;
    padding: 0
  }

  li {
    list-style: none;
  }

  .func-area {
    display: inline;
    position: absolute;
    right: 0;
    top: 0;
    z-index: 1000;
    line-height: 5px;
  }

  .red-bg, .gray-bg {
    padding: 10px;
    cursor: pointer;
    display: inline-block;
    font-size: 1.2em;
  }

  .red-bg:hover {
    background-color: #F45454;
    color: #ffffff;
  }

  .gray-bg:hover {
    background-color: #E3E3E3;
  }

  .thumbnail{
    position: absolute;
    bottom: 5px;
    background: url("/web/static/img/thumbnail.png") center;
    width:65px;
    height: 65px;
  }
  .enlarge {
    background-color: #F5F5F5;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
    width: 100%;
    height: 100%;
  }
  .middle-profile img{
    width: 155px;
  }
  .close {
    position: absolute;
    right: 10px;
    top: 10px;
  }
  .upload {
    width: 155px;
    margin-top: 15px;
  }
  .upload-avatar{
    cursor: pointer;

  }


</style>
