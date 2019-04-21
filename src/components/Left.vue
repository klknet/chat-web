<template>
  <div class="left">
    <ul class="">
      <li>
        <a>
          <img id="profile" :src="user.profileUrl">
        </a>
      </li>

      <li v-for="(m, index) in map" @click="select(index)">
        <a>
          <img :src="format(m, index)">
        </a>
      </li>

      <li>
        <a>
          <img id="settings" src="/static/img/p4.png">
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
        navIndex: 0
      }
    },
    created() {
      let hash = location.hash
      // debugger
      // this.$router.push(link[this.navIndex])
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
    },
    methods: {
      format (m, i) {
        return 'static/img/' + m[i == this.navIndex ? 0 : 1] + '.png'
      },
      select (i) {
        this.$router.push(link[i])
        this.navIndex = i
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

  .left {
    width: 60px;
    background-color: rgb(40, 40, 41);
    text-align: center;
    height: 100%;
    float: left;
    display: flex;
    justify-content: center;
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
    margin-top:335px;
  }
</style>
