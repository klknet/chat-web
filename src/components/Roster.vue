<template>
  <div class="roster">
    <div class="median" id="median">
      <div class="search non-drag">
        <div>
          <i class="fa fa-search"></i>
          <input class="search-input" type="text" placeholder="搜索"/>
          <span class="add-friend">+</span>
        </div>
      </div>
      <div class="friend">
        <div class="contact-group">
          <div class="group-title first">
            <span>新的朋友</span>
          </div>
          <div class="group-content">
            <ul>
              <li @click="select(map[newFriendKey], newFriendKey)" :class="{active: cur === map[newFriendKey]}">
                <img class="avatar" src="/web/static/img/newfriend.png"/>
                <span class="notation">新的朋友</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="contact-group friend-group" v-for="(value,key) in user.groupFriend">
          <div class="group-title">
            <span>{{key}}</span>
          </div>
          <div class="group-content">
            <ul>
              <li v-for="(friend, index) in value" @click="select(map[friend.userId], friend.userId)"
                  :class="{active: cur === map[friend.userId]}">
                <img :src="friend.profileUrl" class="avatar"/>
                <span class="notation">{{friend.remark}}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="right">
      <div class="new-friend" v-show="cur==-1">
        <div>
          <div class="title">
            <span>新的朋友</span>
          </div>
        </div>
        <div class="content">

        </div>
      </div>
      <div class="friend-info" v-show="cur>=0">
        <div class="info-chunk top">
          <div>
            <div>
              <span class="nickname">{{friend.username}}</span>
              <template v-if="friend.gender != undefined">
                <img class="sex" :src="friend.gender==0 ? '/web/static/img/female.png' : '/web/static/img/male.png'"/>
              </template>
            </div>
            <div style="padding-top: 5px;">
              <span>{{friend.signature}}</span>
            </div>
          </div>
          <div>
            <img class="info-img" :src="friend.profileUrl"/>
          </div>
        </div>
        <div class="info-chunk">
          <div>
            <div class="detail-row">
              <span class="detail-title">备&nbsp;&nbsp;&nbsp;注</span>
              <span class="detail-value">{{friend.remark}}</span>
            </div>
            <div class="detail-row">
              <span class="detail-title">地&nbsp;&nbsp;&nbsp;区</span>
              <span class="detail-value">{{friend.city}}</span>
            </div>
            <div>
              <span class="detail-title">聊天号</span>
              <span class="detail-value">{{friend.userId}}</span>
            </div>
          </div>
        </div>
        <div class="info-chunk">
          <div class="text-center">
            <button class="info-send" @click="sendMessage">发消息</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from '../request'
  import util from '../util'
  import storage from '../storage'
  import vm from '@/event'

  export default {
    name: 'Roster',
    data () {
      return {
        user: {},
        cur: -2,
        map: {},
        newFriendKey: 'new_friend_key',
        friend: {},
      }
    },
    created () {
      let user = storage.getUser()
      this.user = user
      let li_index = 0
      this.map[this.newFriendKey] = li_index++
      let friendGroup = this.user.groupFriend
      for (let group in friendGroup) {
        let friends = friendGroup[group]
        for (let i in friends) {
          this.map[friends[i].userId] = li_index++
        }
      }

    },
    methods: {
      select (curI, key) {
        this.cur = curI
        for (let i in this.user.friends) {
          if (key === this.user.friends[i].userId) {
            this.friend = this.user.friends[parseInt(i)]
          }
        }
      },
      sendMessage () {
        let destId = this.friend.userId
        var conversations = storage.getConversation()
        for (let i in conversations) {
          if (conversations[i].destId == destId) {
            console.log('已存在的会话')
            this.$router.push({name: 'Chat', params: {idx: i}})
            vm.$emit('navIdx', 0)
            return
          }
        }
        let fd = new FormData()
        fd.set('destId', destId)
        fd.set('userId', this.user.userId)
        axios.post('conversation/build', fd,
          {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).then(res => {
          storage.removeConversation()
          this.$router.push({name: 'Chat', params: {idx: '0'}})
          vm.$emit('navIdx', 0)
        })
      }
    }
  }
</script>

<style scoped>
  .roster {
    height: 100%;
  }

  li, ul, div {
    margin: 0;
    padding: 0
  }

  li {
    list-style: none;
  }

  input, textarea, button {
    outline: none;
  }

  a {
    text-decoration: none;
    color: #000000;
    cursor: default;
  }

  .median {
    width: 250px;
    background-color: #EEEAE8;
    float: left;
    height: 100%;
    text-align: left;
  }

  .right {
    width: calc(100% - 250px - 60px);
    min-width: 300px;
    float: left;
    height: 100%;
    background: #F5F5F5;  /*url("/static/img/wechat.png") no-repeat center;
    background-size: 93px;*/
  }

  .search {
    margin: 25px 0 15px 0px;
    position: relative;
  }

  .search i {
    position: absolute;
    left: 20px;
    top: 8px;
    color: #636363;
    font-size: 10px;
  }

  .search-input {
    background-color: #DBD9D8;
    border-radius: 5px;
    border: 1px solid #DBDBDB;
    height: 25px;
    padding: 8px 0 8px 25px;
    width: 192px;
    font-size: 12px;
    color: #818181;
    margin-left: 10px;
  }

  .search-input:focus {
    background-color: #ffffff;
  }

  .search-input:focus {
    background-color: #ffffff;
  }

  .add-friend {
    width: 20px;
    vertical-align: middle;
    margin-left: 4px;
    padding: 4px 8px;
    border-radius: 5px;
    cursor: pointer;
    /*font-size: 1.2em;*/
    background-color: #DCD9D8;
  }

  .add-friend:hover {
    background-color: #D1D1D1;
  }

  .group-title {
    padding: 12px 12px 0 12px;
    font-size: 0.8em;
    font-weight: 600;
    color: #999999;
  }

  .friend .first {
    font-size: 0.7em;
    font-weight: 600;
  }

  .contact-group:not(:first-child) {
    border-top: solid 1px #DAD9D9;
  }

  .friend li {
    padding: 12px;
    height: 58px;
    position: relative;
  }

  .friend li:hover {
    background-color: #DFDDDB;
  }

  .friend li.active {
    background-color: #CAC8C7;
  }

  .friend .avatar {
    width: 35px;
  }

  .friend .notation {
    padding-left: 8px;
    cursor: default;
  }

  .friend-info .info-img {
    width: 60px;
  }

  .friend-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 50px;
  }

  .info-chunk {
    width: 350px;
    padding: 35px 0;
    text-align: left;
  }

  .top {
    display: flex;
    justify-content: space-between;
  }

  .info-chunk:not(.top) {
    border-top: solid 1px #DAD9D9;
  }

  .friend-info .nickname {
    font-weight: 700;
    font-size: 1.2em;
  }

  .friend-info .sex {
    width: 25px;
  }

  .friend-info .detail-title {
    color: #999999;
    display: inline-block;
    width: 70px;
  }

  .friend-info .detail-value {
  }

  .info-chunk .info-send {
    width: 140px;
    color: #ffffff;
    background-color: #1AAD19;
    border: 0;
    padding: 6px 0;
  }

  button.info-send:hover {
    cursor: pointer;
    background-color: #129611;
  }

  .detail-row {
    margin-bottom: 15px;
  }

</style>
