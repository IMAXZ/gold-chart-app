<template>
  <div v-if="items.length" class="stats-grid">
    <article
      v-for="item in items"
      :key="item.key"
      :class="['stat-card', item.tone ? `stat-card--${item.tone}` : '']"
    >
      <p class="stat-label">{{ item.label }}</p>
      <p :class="['stat-value', item.valueClass]">
        {{ item.prefix || '' }}{{ item.value }}{{ item.suffix || '' }}
      </p>
      <p v-if="item.helper" class="stat-helper">{{ item.helper }}</p>
    </article>
  </div>
</template>

<script>
import { computed } from 'vue'
import { getUnitLabel } from '@/utils/goldChartFinalData'

function priceHelper(currency) {
  return `单位：${getUnitLabel(currency)}`
}

function buildItems(chartType, currency, stats) {
  if (!stats) {
    return []
  }

  if (chartType === 'rate') {
    return [
      { key: 'rateStart', label: '起始汇率', value: stats.rateStart, tone: 'rate', helper: 'USD/CNY' },
      { key: 'rateEnd', label: '最新汇率', value: stats.rateEnd, tone: 'rate', helper: 'USD/CNY' },
      { key: 'rateChange', label: '汇率涨跌', value: stats.rateChange, suffix: '%', valueClass: stats.rateChangePositive ? 'up' : 'down', helper: '红涨绿跌' },
      { key: 'usdEnd', label: '美元黄金', value: stats.usdEnd, tone: 'usd', helper: '单位：美元/盎司' },
      { key: 'cnyEnd', label: '人民币黄金', value: stats.cnyEnd, tone: 'cny', helper: '单位：元/克' },
      { key: 'rateVolatility', label: '汇率振幅', value: stats.rateVolatility, suffix: '%', tone: 'rate', helper: '区间波动' }
    ]
  }

  if (chartType === 'compare') {
    return [
      { key: 'usdMax', label: 'USD 最高', value: stats.usdMax, tone: 'usd', helper: '单位：美元/盎司' },
      { key: 'usdMin', label: 'USD 最低', value: stats.usdMin, tone: 'usd', helper: '单位：美元/盎司' },
      { key: 'usdVolatility', label: 'USD 振幅', value: stats.usdVolatility, tone: 'usd', helper: '区间波动' },
      { key: 'cnyMax', label: 'CNY 最高', value: stats.cnyMax, tone: 'cny', helper: '单位：元/克' },
      { key: 'cnyMin', label: 'CNY 最低', value: stats.cnyMin, tone: 'cny', helper: '单位：元/克' },
      { key: 'cnyVolatility', label: 'CNY 振幅', value: stats.cnyVolatility, tone: 'cny', helper: '区间波动' }
    ]
  }

  const isUsd = currency === 'USD'
  const tone = isUsd ? 'usd' : 'cny'
  const keyPrefix = isUsd ? 'usd' : 'cny'

  return [
    { key: `${keyPrefix}Max`, label: '最高价', value: stats[`${keyPrefix}Max`], tone, helper: priceHelper(currency) },
    { key: `${keyPrefix}Min`, label: '最低价', value: stats[`${keyPrefix}Min`], tone, helper: priceHelper(currency) },
    { key: `${keyPrefix}Avg`, label: '平均价', value: stats[`${keyPrefix}Avg`], tone, helper: priceHelper(currency) },
    { key: `${keyPrefix}Start`, label: '起始价', value: stats[`${keyPrefix}Start`], tone, helper: priceHelper(currency) },
    { key: `${keyPrefix}End`, label: '最新价', value: stats[`${keyPrefix}End`], tone, helper: priceHelper(currency) },
    { key: `${keyPrefix}Change`, label: chartType === 'trend' ? '累计涨跌' : '区间涨跌', value: stats[`${keyPrefix}Change`], suffix: '%', valueClass: stats[`${keyPrefix}ChangePositive`] ? 'up' : 'down', helper: '红涨绿跌' }
  ]
}

export default {
  name: 'GoldStatsPanelFinal',
  props: {
    chartType: { type: String, required: true },
    currency: { type: String, required: true },
    stats: { type: Object, default: null }
  },
  setup(props) {
    const items = computed(() => buildItems(props.chartType, props.currency, props.stats))
    return { items }
  }
}
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.stat-card {
  padding: 18px;
  border-radius: 22px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05);
}

.stat-card--usd {
  background: linear-gradient(180deg, rgba(255,204,77,0.12), rgba(255,255,255,0.04));
}

.stat-card--cny {
  background: linear-gradient(180deg, rgba(255,122,89,0.12), rgba(255,255,255,0.04));
}

.stat-card--rate {
  background: linear-gradient(180deg, rgba(69,208,227,0.14), rgba(255,255,255,0.04));
}

.stat-label {
  margin: 0 0 10px;
  color: rgba(255,245,225,0.7);
  font-size: 13px;
}

.stat-value {
  margin: 0;
  font-size: 28px;
  line-height: 1.05;
  color: #fff7e6;
  font-weight: 800;
}

.stat-helper {
  margin: 10px 0 0;
  color: rgba(255,245,225,0.56);
  font-size: 12px;
}

.stat-value.up {
  color: #ff6b6b;
}

.stat-value.down {
  color: #38c172;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-value {
    font-size: 22px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
