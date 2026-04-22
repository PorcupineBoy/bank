<template>
  <div class="security-center-page">
    <van-nav-bar title="安全中心" left-arrow @click-left="$router.back()" />

    <van-cell-group>
      <van-cell title="交易密码" is-link @click="$router.push('/security/trade-password')" />
      <van-cell title="交易限额" is-link @click="$router.push('/security/limit')" />
    </van-cell-group>
  </div>
</template>

<script>
export default {
  name: 'SecurityCenter'
}
</script>

<style scoped>
.security-center-page {
  min-height: 100%;
  background: #f5f5f5;
}
</style>
