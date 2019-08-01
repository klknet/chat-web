<template>
  <div class="left" @click="clear">
    <ul>
      <li>
        <a class="top-1" @click.stop="userDetail($event)">
          <img id="profile" :src="fmtImg(user.profileUrl)">
          <div class="detail-div" v-show="detailShow" @click.stop="" :style="detailStyle">
            <div class="detail-row">
              <div class="detail-left">
                <div>
                  <div>
                    <span class="nickname">{{user.nickname}}</span>
                    <img class="sex" :src="user.gender==0 ? '/web/static/img/female.png' : '/web/static/img/male.png'"/>
                  </div>
                  <div>
                    <span class="chat-num">聊天号: {{user.username}}</span>
                  </div>
                </div>
              </div>
              <div class="detail-right" @click="check">
                <img class="big" :src="fmtImg(user.profileUrl)">
              </div>
            </div>
            <div class="detail-row divisor"></div>
            <div class="detail-row">
              <div class="detail-left">
                <span class="location">地&nbsp&nbsp&nbsp区</span>
                <span class="city">{{user.country}} {{user.city}}</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-right">
                <a></a>
                <a></a>
              </div>
            </div>
          </div>
        </a>
      </li>

      <li class="icon-li" v-for="(m, index) in map" @click="select(index)">
        <a>
          <img :src="format(m, index)">
          <span :class="{'badge': gtZero(index)}"
                v-show="gtZero(index)">
                      {{unreadNum(index)}}
          </span>
        </a>
      </li>

      <li>
        <a id="settings" >
          <img src="/web/static/img/p4.png">
        </a>
      </li>
    </ul>

  </div>
</template>

<script>
  import vm from '@/event'
  import util from '@/util'

  let map = [
    ['p1', 'p1-1'], ['p2', 'p2-1'], ['p3', 'p3-1']
  ]
  let link = [
    {name: 'Chat'}, {name: 'Roster'}, {name: 'Collector'}
  ]

  export default {
    name: 'Left',
    props: ['user'],
    data () {
      return {
        map,
        navIndex: 0,
        chatCount: 0,
        rosterCount: 0,
        collectorCount: 0,
        detailShow: false,
        detail: {},
        detailStyle: {},
        enlarge: false,
      }
    },
    created() {
      let hash = location.hash
      for (let i in link){
        if(hash.endsWith(link[i].name.toLowerCase())){
          this.navIndex = i
        }
      }
    },
    mounted() {
      vm.$on('navIdx', (data) => {
        this.navIndex = data
      })
      vm.$on('left-unread-num', (type, delta) => {
        this.chatCount += delta
      })
      vm.$on('all-clear', () => {
        this.clear()
      })

    },
    methods: {
      format (m, i) {
        return '/web/static/img/' + m[i == this.navIndex ? 0 : 1] + '.png'
      },
      select (i) {
        this.$router.push(link[i])
        this.navIndex = i
      },
      unreadNum(i) {
        if (i == 0){
          return this.chatCount>99?"99+":this.chatCount
        }
        if (i == 1) {
          return this.rosterCount>99?"99+":this.rosterCount
        }
        if (i == 2) {
          return this.collectorCount>99?"99+":this.collectorCount
        }
      },
      gtZero(i) {
        if (i == 0){
          return this.chatCount>0
        }
        if (i == 1) {
          return this.rosterCount>0
        }
        if (i == 2) {
          return this.collectorCount>0
        }
      },
      fmtImg(id) {
        return util.fmtImg(id)
      },
      userDetail(e) {
        this.detailShow = true
        this.detailStyle = {
          left: e.offsetX + 'px',
          top: e.offsetY + 'px',
        }
      },
      clear() {
        this.detailShow = false
        this.detailStyle = {}
      },
      check() {
        this.detailShow = false
        this.$emit('enlargeProfileEvent')
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

  .icon-li {
    position: relative;
  }

  .left {
    width: 60px;
    background-color: rgb(40, 40, 41);
    text-align: center;
    height: 100%;
    float: left;
    display: flex;
    justify-content: center;
    position: relative;
  }

  .left ul {
    width: 100%;
  }

  .left ul li {
    margin-top: 20px;
  }

  .left ul li:hover {
    cursor: pointer;
  }

  .left ul li img {
    width: 29px;
  }

  .big {
    width: 39px;
  }

  #profile {
    width: 35px;
  }

  #settings {
    position: absolute;
    bottom: 10px;
    right: 0;
    display: inline-block;
    width: 100%;
  }

  .badge {
    background-color: #FF3B30;
    z-index: 1000;
    position: absolute;
    top: -5px;
    left: 35px;
    font-weight: 500;
    padding: 3px 6px;
  }

  .detail-div {
    position: absolute;
    width: 290px;
    height: 220px;
    background-color: #fff;
    z-index: 999;
    cursor: default;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    margin: 25px 22px;
  }

  .top-1 {
    position: relative;
  }

  .detail-left {
  }

  .nickname {
    color: #000;
    font-size: 17px;
    font-weight: 600;
  }

  img.sex {
    width: 25px !important;
    padding-bottom: 4px;
  }
  img.big {
    width: 49px !important;
  }
  .chat-num {
    color: #999999;
  }
  .divisor{
    border-top:solid 1px #F4F4F4;
  }
  .location {
    color: #999;
  }
  .city {
    color: #000;
    padding-left: 10px;
  }

</style>
