<template>
  <div class="left">
    <ul class="">
      <li>
        <a>
          <img id="profile" :src="user.profileUrl">
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
        // console.log(type, delta)
        this.chatCount += delta
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
</style>
