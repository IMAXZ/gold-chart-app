<template>
  <div class="app">
    <div class="logo-container">
      <img src="./assets/logo.svg" alt="黄金价格走势图" class="logo" />
      <h1 class="app-title">黄金价格走势图</h1>
    </div>
    <GoldChart />
  </div>
</template>

<script>
import GoldChart from './components/GoldChartRefactor.vue'

export default {
  name: 'AppRefactor',
  components: {
    GoldChart
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
  min-height: 100vh;
}

.app {
  padding: 20px;
  min-height: 100vh;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 15px;
  filter: drop-shadow(0 4px 8px rgba(230, 162, 60, 0.3));
}

.app-title {
  color: #e6a23c;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(230, 162, 60, 0.3);
  margin: 0;
}

@media (max-width: 768px) {
  .app {
    padding: 10px;
  }

  .logo-container {
    margin-bottom: 10px;
    padding: 10px;
  }

  .logo {
    width: 50px;
    height: 50px;
    margin-bottom: 10px;
  }

  .app-title {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .app {
    padding: 8px;
  }

  .logo-container {
    margin-bottom: 8px;
    padding: 8px;
  }

  .logo {
    width: 40px;
    height: 40px;
    margin-bottom: 8px;
  }

  .app-title {
    font-size: 16px;
  }
}
</style>
