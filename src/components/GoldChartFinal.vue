<template>
  <div class="gold-chart-scene" :class="{ 'light-theme': theme === 'light' }">
    <div class="scene-glow scene-glow--left"></div>
    <div class="scene-glow scene-glow--right"></div>

    <GoldChartToolbarFinal
      :chart-type="chartType"
      :currency="currency"
      :end-date="endDate"
      :granularity="granularity"
      :loading="loading"
      :selected-quick-day="selectedQuickDay"
      :start-date="startDate"
      :theme="theme"
      :today="today"
      :unit-label="unitLabel"
      @date-change="clearQuickSelection"
      @fetch="loadData"
      @select-quick-day="handleQuickDaySelection"
      @switch-chart-type="switchChartType"
      @switch-currency="switchCurrency"
      @switch-granularity="switchGranularity"
      @toggle-theme="toggleTheme"
      @update:end-date="endDate = $event"
      @update:start-date="startDate = $event"
    />

    <section class="chart-panel">
      <div class="chart-panel__meta">
        <div>
          <p class="chart-panel__label">Current View</p>
          <h2 class="chart-panel__title">{{ chartTitle }}</h2>
        </div>
        <div class="chart-panel__badge">{{ unitLabel }}</div>
      </div>

      <div class="chart-wrapper">
        <div ref="chartRef" class="chart"></div>

        <div v-if="loading" class="loading-overlay">
          <div class="spinner"></div>
          <p>数据加载中...</p>
        </div>

        <div v-if="error" class="error-message">
          <p>{{ error }}</p>
          <button @click="loadData">重新加载</button>
        </div>
      </div>
    </section>

    <GoldStatsPanelFinal :chart-type="chartType" :currency="currency" :stats="stats" />
  </div>
</template>

<script>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import GoldChartToolbarFinal from '@/components/GoldChartToolbarFinal.vue'
import GoldStatsPanelFinal from '@/components/GoldStatsPanelFinal.vue'
import { UNIT_LABELS } from '@/constants/goldChartFinal'
import { useGoldChartFinalData } from '@/composables/useGoldChartFinalData'
import { aggregateChartData } from '@/utils/goldChartFinalData'
import { buildChartOption } from '@/utils/goldChartFinalOptions'

const CHART_TITLES = {
  price: '价格走势',
  trend: '涨跌幅趋势',
  rate: '汇率变化',
  compare: '双币种对比'
}

export default {
  name: 'GoldChartFinal',
  components: {
    GoldChartToolbarFinal,
    GoldStatsPanelFinal
  },
  setup() {
    const chartRef = ref(null)
    const chartInstance = ref(null)
    const chartType = ref('price')
    const currency = ref('USD')
    const theme = ref('dark')
    const granularity = ref(1)

    const {
      chartData,
      clearQuickSelection,
      endDate,
      error,
      fetchData,
      loading,
      selectedQuickDay,
      setDateRangeByQuickDay,
      startDate,
      stats,
      today
    } = useGoldChartFinalData()

    const displayData = computed(() => aggregateChartData(chartData.value, granularity.value))
    const unitLabel = computed(() => UNIT_LABELS[currency.value] || UNIT_LABELS.USD)
    const chartTitle = computed(() => CHART_TITLES[chartType.value] || CHART_TITLES.price)

    const renderChart = () => {
      if (!chartInstance.value || !displayData.value) {
        return
      }

      chartInstance.value.setOption(
        buildChartOption({
          chartType: chartType.value,
          currency: currency.value,
          theme: theme.value,
          data: displayData.value
        }),
        true
      )
    }

    const loadData = async () => {
      const data = await fetchData()
      if (data) {
        renderChart()
      } else {
        chartInstance.value?.clear()
      }
    }

    const handleResize = () => {
      chartInstance.value?.resize()
    }

    const handleQuickDaySelection = async (days) => {
      setDateRangeByQuickDay(days)
      await loadData()
    }

    const switchChartType = (nextType) => {
      chartType.value = nextType
      renderChart()
    }

    const switchCurrency = (nextCurrency) => {
      currency.value = nextCurrency
      renderChart()
    }

    const switchGranularity = (minutes) => {
      granularity.value = minutes
      renderChart()
    }

    const toggleTheme = () => {
      theme.value = theme.value === 'dark' ? 'light' : 'dark'
      renderChart()
    }

    watch(displayData, () => {
      renderChart()
    })

    onMounted(async () => {
      if (chartRef.value) {
        chartInstance.value = echarts.init(chartRef.value)
        window.addEventListener('resize', handleResize)
      }

      await handleQuickDaySelection(0)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      chartInstance.value?.dispose()
    })

    return {
      chartRef,
      chartTitle,
      chartType,
      clearQuickSelection,
      currency,
      endDate,
      error,
      granularity,
      handleQuickDaySelection,
      loadData,
      loading,
      selectedQuickDay,
      startDate,
      stats,
      switchChartType,
      switchCurrency,
      switchGranularity,
      theme,
      today,
      toggleTheme,
      unitLabel
    }
  }
}
</script>

<style scoped>
.gold-chart-scene {
  position: relative;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 16px 0 28px;
}

.scene-glow {
  position: absolute;
  pointer-events: none;
  border-radius: 999px;
  filter: blur(70px);
  opacity: 0.8;
}

.scene-glow--left {
  top: 40px;
  left: -60px;
  width: 220px;
  height: 220px;
  background: rgba(255,184,0,0.18);
}

.scene-glow--right {
  right: -40px;
  top: 220px;
  width: 260px;
  height: 260px;
  background: rgba(255,94,98,0.16);
}

.chart-panel {
  position: relative;
  padding: 22px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(13,18,30,0.92), rgba(9,14,24,0.88));
  box-shadow: 0 28px 64px rgba(2,6,23,0.38);
}

.chart-panel__meta {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 18px;
}

.chart-panel__label {
  margin: 0 0 6px;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255,236,194,0.62);
}

.chart-panel__title {
  margin: 0;
  color: #fff7e6;
  font-size: 24px;
}

.chart-panel__badge {
  min-width: 108px;
  padding: 10px 16px;
  border-radius: 999px;
  text-align: center;
  color: #fff1d1;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
}

.chart-wrapper {
  position: relative;
  min-height: 480px;
  padding: 18px;
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02)),
    rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
}

.chart {
  width: 100%;
  height: 480px;
}

.loading-overlay,
.error-message {
  position: absolute;
  inset: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  border-radius: 20px;
  text-align: center;
}

.loading-overlay {
  background: rgba(11,15,25,0.82);
  color: #fff1d1;
  backdrop-filter: blur(10px);
}

.error-message {
  background: rgba(26,12,12,0.84);
  color: #ffd9d6;
}

.spinner {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 3px solid rgba(255,196,80,0.18);
  border-top-color: #ffcf63;
  animation: spin 1s linear infinite;
}

.error-message button {
  padding: 10px 16px;
  border: 0;
  border-radius: 14px;
  background: #ff7a59;
  color: #fff;
  cursor: pointer;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .chart-panel {
    padding: 16px;
    border-radius: 22px;
  }

  .chart-wrapper {
    min-height: 320px;
    padding: 10px;
  }

  .chart {
    height: 320px;
  }

  .chart-panel__meta {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .chart {
    height: 280px;
  }

  .chart-wrapper {
    min-height: 280px;
  }
}
</style>
