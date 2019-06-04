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
        <ul>
          <li v-for="(user, index) in users">
            <img v-bind:src="user.profileUrl"/>
            <span class="nickname">{{user.nickname}}</span>
            <input type="radio" v-bind:id="user.userId" v-bind:value="user.userId"
                   v-model="pickedUser" class="checkbox"/>
          </li>
        </ul>
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

  export default {
    name: 'AddFriend',
    data () {
      return {
        users: [],
        username: '',
        pickedUser: '',
        user: storage.getUser()
      }
    },
    created () {

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
        console.log(this.pickedUser)
        if (this.pickedUser == this.user.userId) {
          alert('Cannot add yourself')
          return
        }
        if (this.user.friends && this.user.friends.length > 0) {
          for (let friend of this.user.friends) {
            if (friend.userId == this.pickedUser) {
              alert('already friends')
              return
            }
          }
        }
        if (this.pickedUser) {
          userRequest.requestFriend(this.user.userId, this.pickedUser)
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
