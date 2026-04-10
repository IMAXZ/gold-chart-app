<template>
  <div class="gold-chart-container" :class="{ 'light-theme': theme === 'light' }">
    <GoldChartToolbar
      :chart-type="chartType"
      :currency="currency"
      :end-date="endDate"
      :granularity="granularity"
      :loading="loading"
      :selected-quick-day="selectedQuickDay"
      :start-date="startDate"
      :theme="theme"
      :today="today"
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

    <div class="chart-wrapper">
      <div ref="chartRef" class="chart"></div>

      <div v-if="loading" class="loading-overlay">
        <div class="spinner"></div>
        <p>数据加载中...</p>
      </div>

      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="loadData">重试</button>
      </div>
    </div>

    <GoldStatsPanel :chart-type="chartType" :currency="currency" :stats="stats" />
  </div>
</template>

<script>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import GoldChartToolbar from '@/components/GoldChartToolbar.vue'
import GoldStatsPanel from '@/components/GoldStatsPanel.vue'
import { useGoldChartData } from '@/composables/useGoldChartData'
import { aggregateChartData } from '@/utils/goldChartData'
import { buildChartOption } from '@/utils/goldChartOptions'

export default {
  name: 'GoldChartRefactor',
  components: {
    GoldChartToolbar,
    GoldStatsPanel
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
    } = useGoldChartData()

    const displayData = computed(() => aggregateChartData(chartData.value, granularity.value))

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
      toggleTheme
    }
  }
}
</script>

<style scoped>
.gold-chart-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.gold-chart-container.light-theme {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.chart-wrapper {
  position: relative;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 15px;
  min-height: 450px;
}

.light-theme .chart-wrapper {
  background: rgba(255, 255, 255, 0.5);
}

.chart {
  width: 100%;
  height: 450px;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(26, 26, 46, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: #e6a23c;
}

.light-theme .loading-overlay {
  background: rgba(245, 247, 250, 0.9);
  color: #d4a017;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(230, 162, 60, 0.3);
  border-top-color: #e6a23c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

.light-theme .spinner {
  border-color: rgba(212, 160, 23, 0.3);
  border-top-color: #d4a017;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #ff6b6b;
}

.error-message button {
  margin-top: 15px;
  padding: 8px 20px;
  background: #ff6b6b;
  border: none;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
}

.light-theme :deep(.title) {
  color: #d4a017;
  text-shadow: 0 2px 4px rgba(212, 161, 23, 0.2);
}

.light-theme :deep(.btn-theme),
.light-theme :deep(.btn-currency),
.light-theme :deep(.btn-chart-type),
.light-theme :deep(.btn-quick),
.light-theme :deep(.btn-granularity) {
  background: #fff;
  border-color: #ddd;
  color: #666;
}

.light-theme :deep(.btn-theme:hover),
.light-theme :deep(.btn-currency:hover),
.light-theme :deep(.btn-chart-type:hover),
.light-theme :deep(.btn-quick:hover),
.light-theme :deep(.btn-granularity:hover) {
  border-color: #d4a017;
  color: #d4a017;
}

.light-theme :deep(.btn-currency.active),
.light-theme :deep(.btn-chart-type.active),
.light-theme :deep(.btn-quick.active),
.light-theme :deep(.btn-granularity.active) {
  background: linear-gradient(135deg, #d4a017 0%, #b8860b 100%);
  border-color: #d4a017;
  color: #fff;
}

.light-theme :deep(.date-selector label),
.light-theme :deep(.granularity-label),
.light-theme :deep(.stat-label) {
  color: #666;
}

.light-theme :deep(.date-selector input[type='date']) {
  background: #fff;
  border-color: #ddd;
  color: #333;
}

.light-theme :deep(.date-selector input[type='date']:focus) {
  border-color: #d4a017;
}

.light-theme :deep(.stats-panel) {
  background: rgba(255, 255, 255, 0.5);
}

.light-theme :deep(.stat-item) {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .gold-chart-container {
    padding: 12px;
    border-radius: 12px;
  }

  .chart-wrapper {
    padding: 10px;
    min-height: 300px;
  }

  .chart {
    height: 300px;
  }
}

@media (max-width: 480px) {
  .gold-chart-container {
    padding: 10px;
  }

  .chart-wrapper {
    padding: 8px;
    min-height: 250px;
  }

  .chart {
    height: 250px;
  }
}
</style>
