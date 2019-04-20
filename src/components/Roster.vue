<template>
  <div class="roster">
    <div class="median" id="median">
      roster
    </div>
    <div class="right"></div>
  </div>
</template>

<script>
  export default {
    name: 'Roster'
  }
</script>

<style scoped>
  .roster{
    height: 100%;
  }

  .median {
    width: 250px;
    background-color: #EEEAE8;
    float: left;
    height: 100%;
  }

  .right {
    width: calc(100% - 250px - 60px);
    min-width: 300px;
    float: left;
    height: 100%;
    background: #F5F5F5 url("/static/img/wechat.png") no-repeat center;
    background-size: 93px;
  }
</style>
