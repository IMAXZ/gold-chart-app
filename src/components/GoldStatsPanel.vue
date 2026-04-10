<template>
  <div v-if="items.length" class="stats-panel">
    <div
      v-for="item in items"
      :key="item.key"
      :class="['stat-item', item.tone ? `${item.tone}-stat` : '']"
    >
      <span class="stat-label">{{ item.label }}</span>
      <span :class="['stat-value', item.tone, item.valueClass]">
        {{ item.prefix || '' }}{{ item.value }}{{ item.suffix || '' }}
      </span>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

function getStatsItems(chartType, currency, stats) {
  if (!stats) return []

  if (chartType === 'price' && currency === 'USD') {
    return [
      { key: 'usdMax', label: 'USD 最高', value: stats.usdMax, tone: 'usd' },
      { key: 'usdMin', label: 'USD 最低', value: stats.usdMin, tone: 'usd' },
      { key: 'usdAvg', label: 'USD 平均', value: stats.usdAvg, tone: 'usd' },
      { key: 'usdStart', label: 'USD 起始', value: stats.usdStart, tone: 'usd' },
      { key: 'usdEnd', label: 'USD 最新', value: stats.usdEnd, tone: 'usd' },
      { key: 'usdChange', label: 'USD 涨跌', value: stats.usdChange, suffix: '%', valueClass: stats.usdChangePositive ? 'up' : 'down' }
    ]
  }

  if (chartType === 'price' && currency === 'CNY') {
    return [
      { key: 'cnyMax', label: 'CNY 最高', value: stats.cnyMax, tone: 'cny' },
      { key: 'cnyMin', label: 'CNY 最低', value: stats.cnyMin, tone: 'cny' },
      { key: 'cnyAvg', label: 'CNY 平均', value: stats.cnyAvg, tone: 'cny' },
      { key: 'cnyStart', label: 'CNY 起始', value: stats.cnyStart, tone: 'cny' },
      { key: 'cnyEnd', label: 'CNY 最新', value: stats.cnyEnd, tone: 'cny' },
      { key: 'cnyChange', label: 'CNY 涨跌', value: stats.cnyChange, suffix: '%', valueClass: stats.cnyChangePositive ? 'up' : 'down' }
    ]
  }

  if (chartType === 'trend' && currency === 'USD') {
    return [
      { key: 'usdStart', label: 'USD 起始价', value: stats.usdStart, tone: 'usd' },
      { key: 'usdEnd', label: 'USD 最新价', value: stats.usdEnd, tone: 'usd' },
      { key: 'usdChange', label: 'USD 涨跌', value: stats.usdChange, suffix: '%', valueClass: stats.usdChangePositive ? 'up' : 'down' },
      { key: 'usdMax', label: 'USD 最高', value: stats.usdMax, tone: 'usd' },
      { key: 'usdMin', label: 'USD 最低', value: stats.usdMin, tone: 'usd' },
      { key: 'usdAvg', label: 'USD 平均', value: stats.usdAvg, tone: 'usd' }
    ]
  }

  if (chartType === 'trend' && currency === 'CNY') {
    return [
      { key: 'cnyStart', label: 'CNY 起始价', value: stats.cnyStart, tone: 'cny' },
      { key: 'cnyEnd', label: 'CNY 最新价', value: stats.cnyEnd, tone: 'cny' },
      { key: 'cnyChange', label: 'CNY 涨跌', value: stats.cnyChange, suffix: '%', valueClass: stats.cnyChangePositive ? 'up' : 'down' },
      { key: 'cnyMax', label: 'CNY 最高', value: stats.cnyMax, tone: 'cny' },
      { key: 'cnyMin', label: 'CNY 最低', value: stats.cnyMin, tone: 'cny' },
      { key: 'cnyAvg', label: 'CNY 平均', value: stats.cnyAvg, tone: 'cny' }
    ]
  }

  if (chartType === 'rate') {
    return [
      { key: 'rateStart', label: '起始汇率', value: stats.rateStart, tone: 'rate' },
      { key: 'rateEnd', label: '最新汇率', value: stats.rateEnd, tone: 'rate' },
      { key: 'rateChange', label: '汇率涨跌', value: stats.rateChange, suffix: '%', valueClass: stats.rateChangePositive ? 'up' : 'down' },
      { key: 'usdEnd', label: 'USD 价格', value: stats.usdEnd, tone: 'usd' },
      { key: 'cnyEnd', label: 'CNY 价格', value: stats.cnyEnd, tone: 'cny' },
      { key: 'rateVolatility', label: '汇率波动', value: stats.rateVolatility, suffix: '%', tone: 'rate' }
    ]
  }

  if (chartType === 'compare') {
    return [
      { key: 'usdMax', label: 'USD 最高', value: stats.usdMax, tone: 'usd' },
      { key: 'usdMin', label: 'USD 最低', value: stats.usdMin, tone: 'usd' },
      { key: 'usdVolatility', label: 'USD 波动', value: stats.usdVolatility, tone: 'usd' },
      { key: 'cnyMax', label: 'CNY 最高', value: stats.cnyMax, tone: 'cny' },
      { key: 'cnyMin', label: 'CNY 最低', value: stats.cnyMin, tone: 'cny' },
      { key: 'cnyVolatility', label: 'CNY 波动', value: stats.cnyVolatility, tone: 'cny' }
    ]
  }

  return []
}

export default {
  name: 'GoldStatsPanel',
  props: {
    chartType: { type: String, required: true },
    currency: { type: String, required: true },
    stats: { type: Object, default: null }
  },
  setup(props) {
    const items = computed(() => getStatsItems(props.chartType, props.currency, props.stats))
    return { items }
  }
}
</script>

<style scoped>
.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: transform 0.3s;
}

.stat-item:hover {
  transform: translateY(-3px);
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
}

.stat-value.usd {
  color: #ffd700;
}

.stat-value.cny {
  color: #ff6b6b;
}

.stat-value.rate {
  color: #00d4ff;
}

.stat-value.up {
  color: #4ade80;
}

.stat-value.down {
  color: #ff6b6b;
}

.usd-stat {
  border-left: 3px solid #ffd700;
}

.cny-stat {
  border-left: 3px solid #ff6b6b;
}

.rate-stat {
  border-left: 3px solid #00d4ff;
}

@media (max-width: 768px) {
  .stats-panel {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding: 12px;
    margin-top: 15px;
  }

  .stat-item {
    padding: 10px 8px;
  }

  .stat-label {
    font-size: 11px;
    margin-bottom: 5px;
  }

  .stat-value {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .stats-panel {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 10px;
  }

  .stat-item {
    padding: 8px 6px;
  }

  .stat-label {
    font-size: 10px;
  }

  .stat-value {
    font-size: 14px;
  }
}
</style>
