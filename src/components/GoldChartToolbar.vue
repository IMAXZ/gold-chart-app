<template>
  <div class="header">
    <div class="header-top">
      <h1 class="title">黄金价格走势图</h1>
      <button class="btn-theme" @click="$emit('toggle-theme')">
        <span class="icon">{{ theme === 'dark' ? '☀️' : '🌙' }}</span>
        {{ theme === 'dark' ? '明亮' : '暗黑' }}
      </button>
    </div>

    <div class="currency-switcher">
      <button
        v-for="option in currencyOptions"
        :key="option.value"
        :class="['btn-currency', { active: currency === option.value }]"
        @click="$emit('switch-currency', option.value)"
      >
        <span class="icon">{{ option.icon }}</span>
        {{ option.label }}
      </button>
    </div>

    <div class="chart-type-switcher">
      <button
        v-for="option in chartTypeOptions"
        :key="option.value"
        :class="['btn-chart-type', { active: chartType === option.value }]"
        @click="$emit('switch-chart-type', option.value)"
      >
        <span class="icon">{{ option.icon }}</span>
        {{ option.label }}
      </button>
    </div>

    <div class="date-controls">
      <div class="date-selector">
        <label>开始日期：</label>
        <input
          type="date"
          :value="startDate"
          :max="today"
          @input="$emit('update:start-date', $event.target.value)"
          @change="$emit('date-change')"
        />
      </div>

      <div class="date-selector">
        <label>结束日期：</label>
        <input
          type="date"
          :value="endDate"
          :max="today"
          @input="$emit('update:end-date', $event.target.value)"
          @change="$emit('date-change')"
        />
      </div>

      <button class="btn-query" :disabled="loading" @click="$emit('fetch')">
        {{ loading ? '加载中...' : '查询' }}
      </button>
    </div>

    <div class="quick-select">
      <button
        v-for="day in quickDays"
        :key="day.value"
        :class="['btn-quick', { active: selectedQuickDay === day.value }]"
        @click="$emit('select-quick-day', day.value)"
      >
        {{ day.label }}
      </button>
    </div>

    <div class="granularity-switcher">
      <span class="granularity-label">粒度：</span>
      <button
        v-for="option in granularityOptions"
        :key="option.value"
        :class="['btn-granularity', { active: granularity === option.value }]"
        @click="$emit('switch-granularity', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script>
import {
  CHART_TYPE_OPTIONS,
  CURRENCY_OPTIONS,
  GRANULARITY_OPTIONS,
  QUICK_DAYS
} from '@/constants/goldChart'

export default {
  name: 'GoldChartToolbar',
  props: {
    chartType: { type: String, required: true },
    currency: { type: String, required: true },
    endDate: { type: String, required: true },
    granularity: { type: Number, required: true },
    loading: { type: Boolean, required: true },
    selectedQuickDay: { type: Number, default: null },
    startDate: { type: String, required: true },
    theme: { type: String, required: true },
    today: { type: String, required: true }
  },
  emits: [
    'date-change',
    'fetch',
    'select-quick-day',
    'switch-chart-type',
    'switch-currency',
    'switch-granularity',
    'toggle-theme',
    'update:end-date',
    'update:start-date'
  ],
  setup() {
    return {
      chartTypeOptions: CHART_TYPE_OPTIONS,
      currencyOptions: CURRENCY_OPTIONS,
      granularityOptions: GRANULARITY_OPTIONS,
      quickDays: QUICK_DAYS
    }
  }
}
</script>

<style scoped>
.header {
  margin-bottom: 20px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  text-align: center;
  color: #e6a23c;
  font-size: 28px;
  text-shadow: 0 2px 4px rgba(230, 162, 60, 0.3);
  flex: 1;
}

.btn-theme,
.btn-currency,
.btn-chart-type {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #2a2a3e;
  color: #ccc;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-theme {
  gap: 6px;
  padding: 8px 16px;
  border: 2px solid #444;
  border-radius: 8px;
  font-size: 14px;
}

.btn-theme:hover,
.btn-currency:hover,
.btn-chart-type:hover,
.btn-quick:hover,
.btn-granularity:hover {
  border-color: #e6a23c;
  color: #e6a23c;
}

.currency-switcher,
.chart-type-switcher,
.quick-select {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.currency-switcher {
  gap: 15px;
  margin-bottom: 20px;
}

.btn-currency,
.btn-chart-type {
  padding: 10px 24px;
  border: 2px solid #444;
  border-radius: 8px;
  font-size: 15px;
}

.btn-currency.active,
.btn-chart-type.active,
.btn-query,
.btn-quick.active,
.btn-granularity.active {
  background: linear-gradient(135deg, #e6a23c 0%, #d4a017 100%);
  border-color: #e6a23c;
  color: #1a1a2e;
  font-weight: bold;
}

.chart-type-switcher {
  gap: 15px;
  margin-bottom: 20px;
}

.btn-chart-type .icon {
  font-size: 18px;
}

.date-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.date-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-selector label {
  color: #ccc;
  font-size: 14px;
}

.date-selector input[type="date"] {
  padding: 8px 12px;
  border: 1px solid #444;
  border-radius: 6px;
  background: #2a2a3e;
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.date-selector input[type="date"]:focus {
  border-color: #e6a23c;
}

.btn-query {
  padding: 8px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-query:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(230, 162, 60, 0.4);
}

.btn-query:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quick-select {
  gap: 10px;
}

.btn-quick,
.btn-granularity {
  background: #2a2a3e;
  border: 1px solid #444;
  color: #ccc;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-quick {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
}

.granularity-switcher {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.granularity-label {
  color: #999;
  font-size: 13px;
  margin-right: 4px;
}

.btn-granularity {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
}

@media (max-width: 768px) {
  .header-top {
    flex-direction: column;
    gap: 10px;
  }

  .title {
    font-size: 20px;
    margin-bottom: 0;
  }

  .btn-theme {
    padding: 6px 12px;
    font-size: 12px;
  }

  .currency-switcher {
    gap: 10px;
    margin-bottom: 15px;
  }

  .btn-currency {
    padding: 8px 16px;
    font-size: 13px;
    flex: 1;
  }

  .chart-type-switcher {
    gap: 8px;
    margin-bottom: 15px;
  }

  .btn-chart-type {
    padding: 8px 12px;
    font-size: 13px;
    flex: 1;
    min-width: 70px;
    justify-content: center;
  }

  .btn-chart-type .icon {
    font-size: 14px;
  }

  .date-controls {
    flex-direction: column;
    gap: 10px;
    margin-bottom: 12px;
  }

  .date-selector {
    width: 100%;
    justify-content: space-between;
  }

  .date-selector label {
    font-size: 13px;
    white-space: nowrap;
  }

  .date-selector input[type="date"] {
    flex: 1;
    max-width: 160px;
    padding: 6px 10px;
    font-size: 13px;
  }

  .btn-query {
    width: 100%;
    padding: 10px;
    font-size: 14px;
  }

  .quick-select {
    gap: 6px;
  }

  .btn-quick {
    padding: 5px 12px;
    font-size: 12px;
  }

  .granularity-switcher {
    gap: 6px;
    margin-top: 10px;
  }

  .granularity-label {
    font-size: 12px;
  }

  .btn-granularity {
    padding: 3px 10px;
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 18px;
  }

  .btn-theme {
    padding: 5px 10px;
    font-size: 11px;
  }

  .currency-switcher {
    gap: 8px;
  }

  .btn-currency {
    padding: 6px 10px;
    font-size: 11px;
  }

  .chart-type-switcher {
    gap: 6px;
  }

  .btn-chart-type {
    padding: 6px 8px;
    font-size: 12px;
    min-width: 60px;
  }

  .btn-chart-type .icon {
    font-size: 12px;
    margin-right: 4px;
  }

  .date-selector label {
    font-size: 12px;
  }

  .date-selector input[type="date"] {
    max-width: 140px;
    padding: 5px 8px;
    font-size: 12px;
  }

  .granularity-switcher {
    gap: 4px;
    margin-top: 8px;
  }

  .granularity-label {
    font-size: 11px;
    width: 100%;
    text-align: center;
    margin-bottom: 2px;
  }

  .btn-granularity {
    padding: 3px 8px;
    font-size: 10px;
  }
}
</style>
