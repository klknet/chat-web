<template>
    <div class="add-friend">
      <div class="left">
        <div class="search">
          <div class="text-center">
            <i class="fa fa-search"></i>
            <input class="search-input" type="text" onfocus="true"
                   v-model="username" v-on:input="search"/>
          </div>
        </div>
        <div class="friend-list">
          <div class="contact-group friend-group" v-for="(value) in users">
            <div class="group-title">
              <span>{{value.letter}}</span>
            </div>
            <div class="group-content">
              <ul>
                <li v-for="(friend) in value.groups">
                  <img :src="friend.profileUrl" class="avatar"/>
                  <span class="nickname">{{friend.remark}}</span>
                  <input type="checkbox" v-bind:id="friend.userId" v-bind:value="friend.userId"
                         v-model="pickedUsers" class="checkbox"/>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="clear"></div>
      <div class="right">
        <div class="close" @click="$modal.hide($parent.name)"><span>x</span></div>
        <div class="wrapper">
          <div class="txt">
            <span>请勾选需要添加的联系人</span>
          </div>
          <div class="btn-group">
            <button class="confirm" @click="confirm">确定</button>
            <button class="cancel" @click="$modal.hide($parent.name)">取消</button>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
  import lodash from 'lodash'
  import storage from '../storage'
  import util from '../util'
  import userRequest from '../user'
  import convRequest from '../conversation'

  export default {
    name: 'CreateGroupChat',
    created () {
      let user = storage.getUser()
      this.users = user.groupFriend
    },
    data () {
      return {
        users: [],
        username: '',
        pickedUsers: [],
        user: storage.getUser()
      }
    },
    methods: {
      search: lodash.debounce(function () {
        if (!this.username) {
          return
        }
        userRequest.findUsers(this.username).then(res => {
          this.users = res.data
        })
      }, 1000),
      confirm () {
        console.log(this.pickedUsers)
        if (this.users) {
          this.pickedUsers.unshift(this.user.userId)
          convRequest.groupConversation(this.user.userId, this.pickedUsers).then(res => {
            console.log(res.data)
          })
          this.$modal.hide(this.$parent.name)
        }
      },
    }
  }
</script>

<style scoped>
  li, ul, div {
    margin: 0;
    padding: 0
  }

  li {
    list-style: none;
  }

  button {
    border: none;
  }

  input, textarea, button {
    outline: none;
  }

  .add-friend {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
  }

  .left {
    width: 50%;
    border-right: solid 1px #F1F1F1;
    height: 485px;
  }

  .right {
    width: 50%;
    position: relative;
  }

  .clear {
    clear: both;
  }

  .search {
    padding: 25px 0 15px 0px;
    position: relative;
  }

  .search i {
    position: absolute;
    left: 35px;
    top: 33px;
    color: #636363;
    font-size: 10px;
  }

  .search-input {
    background-color: #FAFAFA;
    border-radius: 5px;
    margin-left: 10px;
    border: 1.2px solid #DEDDDC;
    height: 25px;
    padding: 8px 0 8px 25px;
    width: 230px;
    font-size: 12px;
    color: #818181
  }

  .search-input:focus {
    background-color: #ffffff;
  }

  .search-input:focus {
    background-color: #ffffff;
  }

  .friend-list {
    /*margin-left: 10px;*/
  }

  .friend-list img {
    width: 40px;
  }

  .nickname {
    padding-left: 5px;
  }

  .contact-group:not(:first-child) {
    /*border-top: solid 1px #DAD9D9;*/
  }

  .group-title {
    padding-left: 16px;
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

  .friend-list li:hover {
    background-color: #E8E7E7;
  }

  .friend-list li {
    /*width: 200px;*/
    padding: 10px 10px 10px 30px;
    position: relative;
  }

  .checkbox {
    position: absolute;
    right: 18px;
    top: 20px;
  }

  .confirm {
    /*background-color: #8CD58C;*/
    background-color: #1AAD19;
    color: white;
  }

  .confirm, .cancel {
    color: white;
    width: 62px;
    text-align: center;
    font-size: 13px;
    padding: 5px 0;
  }

  .txt {
    margin-top: 30px;
    margin-left: 30px;
  }

  .cancel {
    color: black;
  }

  .btn-group {
    position: absolute;
    right: 15px;
    bottom: 15px;
  }

  .close {
    position: absolute;
    right: 10px;
    top: 10px;
  }

</style>
