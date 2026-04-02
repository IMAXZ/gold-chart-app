<template>
  <div class="gold-chart-container" :class="{ 'light-theme': theme === 'light' }">
    <div class="header">
      <div class="header-top">
        <h1 class="title">黄金价格走势图</h1>
        <button class="btn-theme" @click="toggleTheme">
          <span class="icon">{{ theme === 'dark' ? '☀️' : '🌙' }}</span>
          {{ theme === 'dark' ? '明亮' : '暗黑' }}
        </button>
      </div>

      <div class="currency-switcher">
        <button
          :class="['btn-currency', { active: currency === 'USD' }]"
          @click="switchCurrency('USD')"
        >
          <span class="icon">💵</span>
          美元 (USD)
        </button>
        <button
          :class="['btn-currency', { active: currency === 'CNY' }]"
          @click="switchCurrency('CNY')"
        >
          <span class="icon">💴</span>
          人民币 (CNY)
        </button>
      </div>

      <div class="chart-type-switcher">
        <button
          :class="['btn-chart-type', { active: chartType === 'price' }]"
          @click="switchChartType('price')"
        >
          <span class="icon">💰</span>
          价格图
        </button>
        <button
          :class="['btn-chart-type', { active: chartType === 'trend' }]"
          @click="switchChartType('trend')"
        >
          <span class="icon">📈</span>
          涨跌幅趋势
        </button>
        <button
          :class="['btn-chart-type', { active: chartType === 'rate' }]"
          @click="switchChartType('rate')"
        >
          <span class="icon">💱</span>
          汇率走势
        </button>
        <button
          :class="['btn-chart-type', { active: chartType === 'compare' }]"
          @click="switchChartType('compare')"
        >
          <span class="icon">📊</span>
          价格对比
        </button>
      </div>
      
      <div class="date-controls">
        <div class="date-selector">
          <label>开始日期：</label>
          <input 
            type="date" 
            v-model="startDate" 
            :max="today"
            @change="onDateChange"
          />
        </div>
        <div class="date-selector">
          <label>结束日期：</label>
          <input 
            type="date" 
            v-model="endDate" 
            :max="today"
            @change="onDateChange"
          />
        </div>
        <button class="btn-query" @click="fetchData" :disabled="loading">
          {{ loading ? '加载中...' : '查询' }}
        </button>
      </div>
      <div class="quick-select">
        <button 
          v-for="day in quickDays" 
          :key="day.value"
          :class="['btn-quick', { active: selectedQuickDay === day.value }]"
          @click="selectQuickDay(day.value)"
        >
          {{ day.label }}
        </button>
      </div>
    </div>
    
    <div class="chart-wrapper">
      <div ref="chartRef" class="chart"></div>
      <div v-if="loading" class="loading-overlay">
        <div class="spinner"></div>
        <p>数据加载中...</p>
      </div>
      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="fetchData">重试</button>
      </div>
    </div>
    
    <div class="stats-panel" v-if="stats">
      <!-- USD 价格图统计 -->
      <template v-if="chartType === 'price' && currency === 'USD'">
        <div class="stat-item usd-stat">
          <span class="stat-label">USD 最高</span>
          <span class="stat-value usd">{{ stats.usdMax }}</span>
        </div>
        <div class="stat-item usd-stat">
          <span class="stat-label">USD 最低</span>
          <span class="stat-value usd">{{ stats.usdMin }}</span>
        </div>
        <div class="stat-item usd-stat">
          <span class="stat-label">USD 平均</span>
          <span class="stat-value usd">{{ stats.usdAvg }}</span>
        </div>
        <div class="stat-item usd-stat">
          <span class="stat-label">USD 起始</span>
          <span class="stat-value usd">{{ stats.usdStart }}</span>
        </div>
        <div class="stat-item usd-stat">
          <span class="stat-label">USD 最新</span>
          <span class="stat-value usd">{{ stats.usdEnd }}</span>
        </div>
        <div class="stat-item usd-stat">
          <span class="stat-label">USD 涨跌</span>
          <span class="stat-value" :class="stats.usdChangePositive ? 'up' : 'down'">
            {{ stats.usdChangePositive ? '+' : '' }}{{ stats.usdChange }}%
          </span>
        </div>
      </template>

      <!-- CNY 价格图统计 -->
      <template v-else-if="chartType === 'price' && currency === 'CNY'">
        <div class="stat-item cny-stat">
          <span class="stat-label">CNY 最高</span>
          <span class="stat-value cny">{{ stats.cnyMax }}</span>
        </div>
        <div class="stat-item cny-stat">
          <span class="stat-label">CNY 最低</span>
          <span class="stat-value cny">{{ stats.cnyMin }}</span>
        </div>
        <div class="stat-item cny-stat">
          <span class="stat-label">CNY 平均</span>
          <span class="stat-value cny">{{ stats.cnyAvg }}</span>
        </div>
        <div class="stat-item cny-stat">
          <span class="stat-label">CNY 起始</span>
          <span class="stat-value cny">{{ stats.cnyStart }}</span>
        </div>
        <div class="stat-item cny-stat">
          <span class="stat-label">CNY 最新</span>
          <span class="stat-value cny">{{ stats.cnyEnd }}</span>
        </div>
        <div class="stat-item cny-stat">
          <span class="stat-label">CNY 涨跌</span>
          <span class="stat-value" :class="stats.cnyChangePositive ? 'up' : 'down'">
            {{ stats.cnyChangePositive ? '+' : '' }}{{ stats.cnyChange }}%
          </span>
        </div>
      </template>

      <!-- USD 涨跌幅趋势统计 -->
      <template v-else-if="chartType === 'trend' && currency === 'USD'">
        <div class="stat-item usd-stat">
          <span class="stat-label">USD 起始价</span>
          <span class="stat-value usd">{{ stats.usdStart }}</span>
        </div>
        <div class="stat-item usd-stat">
          <span class="stat-label">USD 最新价</span>
          <span class="stat-value usd">{{ stats.usdEnd }}</span>
        </div>
        <div class="stat-item usd-stat">
          <span class="stat-label">USD 涨跌</span>
          <span class="stat-value" :class="stats.usdChangePositive ? 'up' : 'down'">
            {{ stats.usdChangePositive ? '+' : '' }}{{ stats.usdChange }}%
          </span>
        </div>
        <div class="stat-item usd-stat">
          <span class="stat-label">USD 最高</span>
          <span class="stat-value usd">{{ stats.usdMax }}</span>
        </div>
        <div class="stat-item usd-stat">
          <span class="stat-label">USD 最低</span>
          <span class="stat-value usd">{{ stats.usdMin }}</span>
        </div>
        <div class="stat-item usd-stat">
          <span class="stat-label">USD 平均</span>
          <span class="stat-value usd">{{ stats.usdAvg }}</span>
        </div>
      </template>

      <!-- CNY 涨跌幅趋势统计 -->
      <template v-else-if="chartType === 'trend' && currency === 'CNY'">
        <div class="stat-item cny-stat">
          <span class="stat-label">CNY 起始价</span>
          <span class="stat-value cny">{{ stats.cnyStart }}</span>
        </div>
        <div class="stat-item cny-stat">
          <span class="stat-label">CNY 最新价</span>
          <span class="stat-value cny">{{ stats.cnyEnd }}</span>
        </div>
        <div class="stat-item cny-stat">
          <span class="stat-label">CNY 涨跌</span>
          <span class="stat-value" :class="stats.cnyChangePositive ? 'up' : 'down'">
            {{ stats.cnyChangePositive ? '+' : '' }}{{ stats.cnyChange }}%
          </span>
        </div>
        <div class="stat-item cny-stat">
          <span class="stat-label">CNY 最高</span>
          <span class="stat-value cny">{{ stats.cnyMax }}</span>
        </div>
        <div class="stat-item cny-stat">
          <span class="stat-label">CNY 最低</span>
          <span class="stat-value cny">{{ stats.cnyMin }}</span>
        </div>
        <div class="stat-item cny-stat">
          <span class="stat-label">CNY 平均</span>
          <span class="stat-value cny">{{ stats.cnyAvg }}</span>
        </div>
      </template>

      <!-- 汇率走势统计 -->
      <template v-else-if="chartType === 'rate'">
        <div class="stat-item rate-stat">
          <span class="stat-label">起始汇率</span>
          <span class="stat-value rate">{{ stats.rateStart }}</span>
        </div>
        <div class="stat-item rate-stat">
          <span class="stat-label">最新汇率</span>
          <span class="stat-value rate">{{ stats.rateEnd }}</span>
        </div>
        <div class="stat-item rate-stat">
          <span class="stat-label">汇率涨跌</span>
          <span class="stat-value" :class="stats.rateChangePositive ? 'up' : 'down'">
            {{ stats.rateChangePositive ? '+' : '' }}{{ stats.rateChange }}%
          </span>
        </div>
        <div class="stat-item usd-stat">
          <span class="stat-label">USD 价格</span>
          <span class="stat-value usd">{{ stats.usdEnd }}</span>
        </div>
        <div class="stat-item cny-stat">
          <span class="stat-label">CNY 价格</span>
          <span class="stat-value cny">{{ stats.cnyEnd }}</span>
        </div>
        <div class="stat-item rate-stat">
          <span class="stat-label">汇率波动</span>
          <span class="stat-value rate">{{ stats.rateVolatility }}%</span>
        </div>
      </template>

      <!-- 价格对比统计 -->
      <template v-else-if="chartType === 'compare'">
        <div class="stat-item usd-stat">
          <span class="stat-label">USD 最高</span>
          <span class="stat-value usd">{{ stats.usdMax }}</span>
        </div>
        <div class="stat-item usd-stat">
          <span class="stat-label">USD 最低</span>
          <span class="stat-value usd">{{ stats.usdMin }}</span>
        </div>
        <div class="stat-item usd-stat">
          <span class="stat-label">USD 波动</span>
          <span class="stat-value usd">{{ stats.usdVolatility }}</span>
        </div>
        <div class="stat-item cny-stat">
          <span class="stat-label">CNY 最高</span>
          <span class="stat-value cny">{{ stats.cnyMax }}</span>
        </div>
        <div class="stat-item cny-stat">
          <span class="stat-label">CNY 最低</span>
          <span class="stat-value cny">{{ stats.cnyMin }}</span>
        </div>
        <div class="stat-item cny-stat">
          <span class="stat-label">CNY 波动</span>
          <span class="stat-value cny">{{ stats.cnyVolatility }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import axios from 'axios'
import apiConfig from '@/config/api.js'

export default {
  name: 'GoldChart',
  setup() {
    const chartRef = ref(null)
    const chartInstance = ref(null)
    const startDate = ref('')
    const endDate = ref('')
    const loading = ref(false)
    const error = ref('')
    const selectedQuickDay = ref(0)
    const chartData = ref(null)
    const chartType = ref('price')
    const currency = ref('USD')
    const theme = ref('dark')
    
    const today = computed(() => {
      return new Date().toISOString().split('T')[0]
    })
    
    const quickDays = [
      { label: '今天', value: 0 },
      { label: '昨天', value: 1 },
      { label: '近3天', value: 3 },
      { label: '近7天', value: 7 },
      { label: '近30天', value: 30 }
    ]
    
    const stats = computed(() => {
      if (!chartData.value || !chartData.value.prices) return null
      
      const prices = chartData.value.prices
      if (prices.length === 0) return null
      
      const first = prices[0]
      const last = prices[prices.length - 1]
      
      const usdPrices = prices.map(p => p.priceUsd)
      const cnyPrices = prices.map(p => p.priceCny)
      const rates = prices.map(p => p.exchangeRate)
      
      return {
        // USD 统计
        usdMax: Math.max(...usdPrices).toFixed(2),
        usdMin: Math.min(...usdPrices).toFixed(2),
        usdAvg: (usdPrices.reduce((a, b) => a + b, 0) / usdPrices.length).toFixed(2),
        usdStart: first.priceUsd.toFixed(2),
        usdEnd: last.priceUsd.toFixed(2),
        usdChange: ((last.priceUsd - first.priceUsd) / first.priceUsd * 100).toFixed(3),
        usdChangePositive: last.priceUsd >= first.priceUsd,
        usdVolatility: (Math.max(...usdPrices) - Math.min(...usdPrices)).toFixed(2),
        // CNY 统计
        cnyMax: Math.max(...cnyPrices).toFixed(2),
        cnyMin: Math.min(...cnyPrices).toFixed(2),
        cnyAvg: (cnyPrices.reduce((a, b) => a + b, 0) / cnyPrices.length).toFixed(2),
        cnyStart: first.priceCny.toFixed(2),
        cnyEnd: last.priceCny.toFixed(2),
        cnyChange: ((last.priceCny - first.priceCny) / first.priceCny * 100).toFixed(3),
        cnyChangePositive: last.priceCny >= first.priceCny,
        cnyVolatility: (Math.max(...cnyPrices) - Math.min(...cnyPrices)).toFixed(2),
        // 汇率统计
        rateStart: first.exchangeRate.toFixed(4),
        rateEnd: last.exchangeRate.toFixed(4),
        rateChange: ((last.exchangeRate - first.exchangeRate) / first.exchangeRate * 100).toFixed(3),
        rateChangePositive: last.exchangeRate >= first.exchangeRate,
        rateVolatility: (Math.max(...rates) - Math.min(...rates)).toFixed(4)
      }
    })
    
    const initChart = () => {
      if (chartRef.value) {
        chartInstance.value = echarts.init(chartRef.value)
        window.addEventListener('resize', handleResize)
      }
    }
    
    const handleResize = () => {
      chartInstance.value?.resize()
    }
    
    const formatDate = (date) => {
      return date.toISOString().split('T')[0]
    }
    
    const getDateByOffset = (offset) => {
      const date = new Date()
      date.setDate(date.getDate() - offset)
      return formatDate(date)
    }
    
    const selectQuickDay = (days) => {
      selectedQuickDay.value = days
      if (days === 0) {
        startDate.value = today.value
        endDate.value = today.value
      } else if (days === 1) {
        startDate.value = getDateByOffset(1)
        endDate.value = getDateByOffset(1)
      } else {
        startDate.value = getDateByOffset(days - 1)
        endDate.value = today.value
      }
      fetchData()
    }
    
    const onDateChange = () => {
      selectedQuickDay.value = null
    }
    
    const fetchData = async () => {
      if (!startDate.value || !endDate.value) {
        error.value = '请选择日期范围'
        return
      }
      
      if (startDate.value > endDate.value) {
        error.value = '开始日期不能晚于结束日期'
        return
      }
      
      loading.value = true
      error.value = ''
      
      try {
        const response = await axios.get(
          `${apiConfig.baseURL}${apiConfig.endpoints.prices}`,
          {
            params: {
              startDate: startDate.value,
              endDate: endDate.value
            }
          }
        )
        
        // 转换接口数据为图表格式
        const prices = response.data
        if (prices && prices.length > 0) {
          chartData.value = {
            series: [
              {
                name: '黄金价格 (USD)',
                type: 'line',
                data: prices.map(p => p.priceUsd),
                yaxisIndex: 0
              },
              {
                name: '黄金价格 (CNY)',
                type: 'line',
                data: prices.map(p => p.priceCny),
                yaxisIndex: 1
              }
            ],
            xaxis: prices.map(p => p.createdAt),
            prices: prices
          }
          updateChart(chartData.value)
        } else {
          chartData.value = null
          error.value = '暂无数据'
        }
      } catch (err) {
        error.value = '数据加载失败：' + (err.message || '未知错误')
        console.error('Fetch data error:', err)
      } finally {
        loading.value = false
      }
    }
    
    const calculateChangeRate = (data) => {
      if (!data || data.length < 2) return data
      const baseValue = data[0]
      return data.map(value => ((value - baseValue) / baseValue * 100))
    }
    
    const getThemeColors = () => {
      if (theme.value === 'light') {
        return {
          bg: 'transparent',
          title: '#d4a017',
          subtext: '#666',
          tooltipBg: 'rgba(255, 255, 255, 0.95)',
          tooltipBorder: '#d4a017',
          tooltipText: '#333',
          legend: '#666',
          axisLine: '#ccc',
          axisLabel: '#666',
          splitLine: 'rgba(0, 0, 0, 0.1)',
          usdColor: '#d4a017',
          cnyColor: '#e74c3c',
          rateColor: '#3498db',
          upColor: '#27ae60',
          downColor: '#e74c3c'
        }
      }
      return {
        bg: 'transparent',
        title: '#e6a23c',
        subtext: '#888',
        tooltipBg: 'rgba(30, 30, 40, 0.95)',
        tooltipBorder: '#e6a23c',
        tooltipText: '#fff',
        legend: '#ccc',
        axisLine: '#666',
        axisLabel: '#999',
        splitLine: 'rgba(255, 255, 255, 0.1)',
        usdColor: '#ffd700',
        cnyColor: '#ff6b6b',
        rateColor: '#00d4ff',
        upColor: '#4ade80',
        downColor: '#ff6b6b'
      }
    }

    const getPriceOption = (data) => {
      const usdData = data.series[0]?.data || []
      const cnyData = data.series[1]?.data || []
      const colors = getThemeColors()
      const isUSD = currency.value === 'USD'
      const priceData = isUSD ? usdData : cnyData
      const currencyName = isUSD ? 'USD' : 'CNY'
      const mainColor = isUSD ? colors.usdColor : colors.cnyColor

      return {
        backgroundColor: colors.bg,
        title: {
          text: `黄金价格走势 (${currencyName})`,
          subtext: '原始价格数据',
          left: 'center',
          top: 10,
          textStyle: {
            color: colors.title,
            fontSize: 18,
            fontWeight: 'bold'
          },
          subtextStyle: {
            color: colors.subtext,
            fontSize: 12
          }
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: colors.tooltipBg,
          borderColor: colors.tooltipBorder,
          borderWidth: 1,
          textStyle: {
            color: colors.tooltipText
          },
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: colors.axisLabel
            }
          },
          formatter: function(params) {
            const item = params[0]
            return `<div style="font-weight:bold;margin-bottom:5px;">${item.axisValue}</div>
              <div style="display:flex;align-items:center;margin:5px 0;padding:5px;background:${theme.value === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'};border-radius:4px;">
                <span style="display:inline-block;width:10px;height:10px;background:${mainColor};border-radius:50%;margin-right:8px;"></span>
                <span style="flex:1;">黄金价格 (${currencyName})</span>
                <span style="color:${mainColor};font-weight:bold;">${item.value.toFixed(2)}</span>
              </div>`
          }
        },
        legend: {
          data: [`黄金价格 (${currencyName})`],
          top: 60,
          textStyle: {
            color: colors.legend
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: 60,
          top: 100,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: data.xaxis.map(time => {
            const date = new Date(time)
            return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
          }),
          axisLine: {
            lineStyle: {
              color: colors.axisLine
            }
          },
          axisLabel: {
            color: colors.axisLabel,
            rotate: 45,
            fontSize: 11
          }
        },
        yAxis: [
          {
            type: 'value',
            name: currencyName,
            position: 'left',
            axisLine: {
              lineStyle: {
                color: mainColor
              }
            },
            axisLabel: {
              color: mainColor,
              formatter: '{value}'
            },
            splitLine: {
              lineStyle: {
                color: colors.splitLine
              }
            }
          }
        ],
        dataZoom: [
          {
            type: 'inside',
            start: 0,
            end: 100
          },
          {
            start: 0,
            end: 100,
            height: 20,
            bottom: 10,
            handleSize: '80%',
            textStyle: {
              color: colors.axisLabel
            }
          }
        ],
        series: [
          {
            name: `黄金价格 (${currencyName})`,
            type: 'line',
            data: priceData,
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              width: 3,
              color: mainColor
            },
            itemStyle: {
              color: mainColor
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: mainColor + (theme.value === 'light' ? '4D' : '4D') },
                { offset: 1, color: mainColor + (theme.value === 'light' ? '0D' : '0D') }
              ])
            }
          }
        ]
      }
    }
    
    const getTrendOption = (data) => {
      const isUSD = currency.value === 'USD'
      const priceData = isUSD ? (data.series[0]?.data || []) : (data.series[1]?.data || [])
      const changeRate = calculateChangeRate(priceData)
      const colors = getThemeColors()
      const mainColor = isUSD ? colors.usdColor : colors.cnyColor
      const currencyName = isUSD ? 'USD' : 'CNY'

      return {
        backgroundColor: colors.bg,
        title: {
          text: `${currencyName} 黄金价格涨跌趋势 (%)`,
          subtext: '以时间段起始价格为基准计算涨跌幅',
          left: 'center',
          top: 10,
          textStyle: {
            color: colors.title,
            fontSize: 18,
            fontWeight: 'bold'
          },
          subtextStyle: {
            color: colors.subtext,
            fontSize: 12
          }
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: colors.tooltipBg,
          borderColor: colors.tooltipBorder,
          borderWidth: 1,
          textStyle: {
            color: colors.tooltipText
          },
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: colors.axisLabel
            }
          },
          formatter: function(params) {
            const item = params[0]
            const originalValue = priceData[item.dataIndex]
            const changeIcon = item.value >= 0 ? '↗' : '↘'
            const changeColor = item.value >= 0 ? colors.upColor : colors.downColor
            return `<div style="font-weight:bold;margin-bottom:5px;">${item.axisValue}</div>
              <div style="display:flex;align-items:center;margin:5px 0;padding:5px;background:${theme.value === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'};border-radius:4px;">
                <span style="display:inline-block;width:10px;height:10px;background:${mainColor};border-radius:50%;margin-right:8px;"></span>
                <span style="flex:1;">${currencyName} 黄金价格</span>
                <span style="margin-right:10px;color:${colors.axisLabel};">${originalValue.toFixed(2)}</span>
                <span style="color:${changeColor};font-weight:bold;">${changeIcon} ${item.value >= 0 ? '+' : ''}${item.value.toFixed(3)}%</span>
              </div>`
          }
        },
        legend: {
          data: [`${currencyName} 涨跌幅`],
          top: 60,
          textStyle: {
            color: colors.legend
          }
        },
        grid: {
          left: 80,
          right: 30,
          bottom: 60,
          top: 100,
          containLabel: false
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: data.xaxis.map(time => {
            const date = new Date(time)
            return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
          }),
          axisLine: {
            lineStyle: {
              color: colors.axisLine
            }
          },
          axisLabel: {
            color: colors.axisLabel,
            rotate: 45,
            fontSize: 11
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '涨跌幅 (%)',
            nameTextStyle: {
              color: mainColor,
              fontSize: 14,
              fontWeight: 'bold',
              padding: [0, 0, 0, 10]
            },
            position: 'left',
            axisLine: {
              show: true,
              lineStyle: {
                color: mainColor,
                width: 2
              }
            },
            axisLabel: {
              color: theme.value === 'light' ? '#333' : '#fff',
              fontSize: 13,
              fontWeight: 'bold',
              formatter: function(value) {
                return value.toFixed(3) + '%'
              },
              backgroundColor: mainColor + (theme.value === 'light' ? '33' : '33'),
              borderRadius: 4,
              padding: [4, 8]
            },
            splitLine: {
              lineStyle: {
                color: theme.value === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.15)',
                type: 'dashed'
              }
            }
          }
        ],
        dataZoom: [
          {
            type: 'inside',
            start: 0,
            end: 100
          },
          {
            start: 0,
            end: 100,
            height: 20,
            bottom: 10,
            handleSize: '80%',
            textStyle: {
              color: colors.axisLabel
            }
          }
        ],
        series: [
          {
            name: `${currencyName} 涨跌幅`,
            type: 'line',
            data: changeRate,
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: {
              width: 4,
              color: mainColor
            },
            itemStyle: {
              color: mainColor
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: mainColor + '80' },
                { offset: 1, color: mainColor + '0D' }
              ])
            },
            markLine: {
              symbol: 'none',
              data: [
                {
                  yAxis: 0,
                  lineStyle: {
                    color: theme.value === 'light' ? '#666' : '#fff',
                    type: 'dashed',
                    width: 2
                  },
                  label: {
                    show: true,
                    formatter: '基准线 0%',
                    color: theme.value === 'light' ? '#666' : '#fff',
                    fontSize: 12,
                    fontWeight: 'bold',
                    backgroundColor: theme.value === 'light' ? 'rgba(200, 200, 200, 0.5)' : 'rgba(136, 136, 136, 0.5)',
                    padding: [4, 8],
                    borderRadius: 4
                  }
                }
              ]
            },
            markPoint: {
              data: [
                {
                  type: 'max',
                  name: '最大涨幅',
                  itemStyle: { color: colors.upColor },
                  label: {
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 'bold',
                    formatter: function(params) {
                      return params.value.toFixed(3) + '%'
                    },
                    backgroundColor: colors.upColor + '4D',
                    padding: [4, 8],
                    borderRadius: 4
                  }
                },
                {
                  type: 'min',
                  name: '最大跌幅',
                  itemStyle: { color: colors.downColor },
                  label: {
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 'bold',
                    formatter: function(params) {
                      return params.value.toFixed(3) + '%'
                    },
                    backgroundColor: colors.downColor + '4D',
                    padding: [4, 8],
                    borderRadius: 4
                  }
                }
              ]
            }
          }
        ]
      }
    }
    
    const getRateOption = (data) => {
      const rateData = data.prices.map(p => p.exchangeRate)
      const rateChangeRate = calculateChangeRate(rateData)
      const colors = getThemeColors()

      return {
        backgroundColor: colors.bg,
        title: {
          text: 'USD/CNY 汇率走势',
          subtext: '通过金价计算的隐含汇率变化 (×100)',
          left: 'center',
          top: 10,
          textStyle: {
            color: colors.title,
            fontSize: 18,
            fontWeight: 'bold'
          },
          subtextStyle: {
            color: colors.subtext,
            fontSize: 12
          }
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: colors.tooltipBg,
          borderColor: colors.tooltipBorder,
          borderWidth: 1,
          textStyle: {
            color: colors.tooltipText
          },
          formatter: function(params) {
            const item = params[0]
            const rate = rateData[item.dataIndex]
            const changeIcon = item.value >= 0 ? '↗' : '↘'
            const changeColor = item.value >= 0 ? colors.upColor : colors.downColor
            return `<div style="font-weight:bold;margin-bottom:5px;">${item.axisValue}</div>
              <div style="display:flex;align-items:center;margin:5px 0;padding:5px;background:${theme.value === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'};border-radius:4px;">
                <span style="display:inline-block;width:10px;height:10px;background:${colors.rateColor};border-radius:50%;margin-right:8px;"></span>
                <span style="flex:1;">USD/CNY 汇率</span>
                <span style="margin-right:10px;color:${colors.axisLabel};">${rate.toFixed(4)}</span>
                <span style="color:${changeColor};font-weight:bold;">${changeIcon} ${item.value >= 0 ? '+' : ''}${item.value.toFixed(3)}%</span>
              </div>`
          }
        },
        legend: {
          data: ['汇率涨跌幅'],
          top: 60,
          textStyle: {
            color: colors.legend
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: 60,
          top: 100,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: data.xaxis.map(time => {
            const date = new Date(time)
            return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
          }),
          axisLine: {
            lineStyle: {
              color: colors.axisLine
            }
          },
          axisLabel: {
            color: colors.axisLabel,
            rotate: 45,
            fontSize: 11
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '汇率变化 (%)',
            position: 'left',
            axisLine: {
              lineStyle: {
                color: colors.rateColor
              }
            },
            axisLabel: {
              color: colors.rateColor,
              formatter: '{value}%'
            },
            splitLine: {
              lineStyle: {
                color: colors.splitLine
              }
            }
          }
        ],
        dataZoom: [
          {
            type: 'inside',
            start: 0,
            end: 100
          },
          {
            start: 0,
            end: 100,
            height: 20,
            bottom: 10,
            handleSize: '80%',
            textStyle: {
              color: colors.axisLabel
            }
          }
        ],
        series: [
          {
            name: '汇率涨跌幅',
            type: 'line',
            data: rateChangeRate,
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              width: 3,
              color: colors.rateColor
            },
            itemStyle: {
              color: colors.rateColor
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: colors.rateColor + '66' },
                { offset: 1, color: colors.rateColor + '0D' }
              ])
            },
            markLine: {
              symbol: 'none',
              data: [
                {
                  yAxis: 0,
                  lineStyle: {
                    color: colors.axisLabel,
                    type: 'dashed',
                    width: 1
                  },
                  label: {
                    show: false
                  }
                }
              ]
            }
          }
        ]
      }
    }
    
    const getCompareOption = (data) => {
      const usdData = data.series[0]?.data || []
      const cnyData = data.series[1]?.data || []
      const colors = getThemeColors()

      const sampleCount = Math.min(12, usdData.length)
      const step = Math.floor(usdData.length / sampleCount)

      const sampledData = []
      for (let i = 0; i < sampleCount; i++) {
        const index = Math.min(i * step, usdData.length - 1)
        const time = new Date(data.xaxis[index])
        sampledData.push({
          time: `${time.getHours()}:${time.getMinutes().toString().padStart(2, '0')}`,
          usd: usdData[index],
          cny: cnyData[index]
        })
      }

      return {
        backgroundColor: colors.bg,
        title: {
          text: '黄金价格时段对比',
          subtext: '采样显示不同时段的价格对比',
          left: 'center',
          top: 10,
          textStyle: {
            color: colors.title,
            fontSize: 18,
            fontWeight: 'bold'
          },
          subtextStyle: {
            color: colors.subtext,
            fontSize: 12
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          backgroundColor: colors.tooltipBg,
          borderColor: colors.tooltipBorder,
          borderWidth: 1,
          textStyle: {
            color: colors.tooltipText
          },
          formatter: function(params) {
            let result = `<div style="font-weight:bold;margin-bottom:5px;">${params[0].axisValue}</div>`
            params.forEach((item) => {
              const color = item.seriesName.includes('USD') ? colors.usdColor : colors.cnyColor
              result += `<div style="display:flex;align-items:center;margin:5px 0;padding:5px;background:${theme.value === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'};border-radius:4px;">
                <span style="display:inline-block;width:10px;height:10px;background:${color};border-radius:50%;margin-right:8px;"></span>
                <span style="flex:1;">${item.seriesName}</span>
                <span style="color:${color};font-weight:bold;">${item.value.toFixed(2)}</span>
              </div>`
            })
            return result
          }
        },
        legend: {
          data: ['USD 价格', 'CNY 价格'],
          top: 60,
          textStyle: {
            color: colors.legend
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: 60,
          top: 100,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: sampledData.map(d => d.time),
          axisLine: {
            lineStyle: {
              color: colors.axisLine
            }
          },
          axisLabel: {
            color: colors.axisLabel,
            fontSize: 11
          }
        },
        yAxis: [
          {
            type: 'value',
            name: 'USD',
            position: 'left',
            axisLine: {
              lineStyle: {
                color: colors.usdColor
              }
            },
            axisLabel: {
              color: colors.usdColor
            },
            splitLine: {
              lineStyle: {
                color: colors.splitLine
              }
            }
          },
          {
            type: 'value',
            name: 'CNY',
            position: 'right',
            axisLine: {
              lineStyle: {
                color: colors.cnyColor
              }
            },
            axisLabel: {
              color: colors.cnyColor
            },
            splitLine: {
              show: false
            }
          }
        ],
        dataZoom: [
          {
            type: 'inside',
            start: 0,
            end: 100
          }
        ],
        series: [
          {
            name: 'USD 价格',
            type: 'bar',
            data: sampledData.map(d => d.usd),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: colors.usdColor },
                { offset: 1, color: theme.value === 'light' ? '#b8860b' : '#b8860b' }
              ]),
              borderRadius: [4, 4, 0, 0]
            },
            barWidth: '30%'
          },
          {
            name: 'CNY 价格',
            type: 'bar',
            yAxisIndex: 1,
            data: sampledData.map(d => d.cny),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: colors.cnyColor },
                { offset: 1, color: theme.value === 'light' ? '#c0392b' : '#c0392b' }
              ]),
              borderRadius: [4, 4, 0, 0]
            },
            barWidth: '30%'
          }
        ]
      }
    }
    
    const updateChart = (data) => {
      if (!chartInstance.value || !data) return
      
      let option
      switch (chartType.value) {
        case 'price':
          option = getPriceOption(data)
          break
        case 'trend':
          option = getTrendOption(data)
          break
        case 'rate':
          option = getRateOption(data)
          break
        case 'compare':
          option = getCompareOption(data)
          break
        default:
          option = getPriceOption(data)
      }
      chartInstance.value.setOption(option, true)
    }
    
    const switchChartType = (type) => {
      chartType.value = type
      if (chartData.value) {
        updateChart(chartData.value)
      }
    }

    const switchCurrency = (curr) => {
      currency.value = curr
      if (chartData.value) {
        updateChart(chartData.value)
      }
    }

    const toggleTheme = () => {
      theme.value = theme.value === 'dark' ? 'light' : 'dark'
      if (chartData.value) {
        updateChart(chartData.value)
      }
    }

    onMounted(() => {
      initChart()
      selectQuickDay(0)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      chartInstance.value?.dispose()
    })

    return {
      chartRef,
      startDate,
      endDate,
      today,
      loading,
      error,
      quickDays,
      selectedQuickDay,
      chartType,
      currency,
      theme,
      stats,
      selectQuickDay,
      onDateChange,
      fetchData,
      switchChartType,
      switchCurrency,
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

.light-theme .title {
  color: #d4a017;
  text-shadow: 0 2px 4px rgba(212, 161, 23, 0.2);
}

.btn-theme {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #2a2a3e;
  border: 2px solid #444;
  border-radius: 8px;
  color: #ccc;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-theme:hover {
  border-color: #e6a23c;
  color: #e6a23c;
}

.light-theme .btn-theme {
  background: #fff;
  border-color: #ddd;
  color: #666;
}

.light-theme .btn-theme:hover {
  border-color: #d4a017;
  color: #d4a017;
}

.currency-switcher {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.btn-currency {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: #2a2a3e;
  border: 2px solid #444;
  border-radius: 8px;
  color: #ccc;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-currency:hover {
  border-color: #e6a23c;
  color: #e6a23c;
}

.btn-currency.active {
  background: linear-gradient(135deg, #e6a23c 0%, #d4a017 100%);
  border-color: #e6a23c;
  color: #1a1a2e;
  font-weight: bold;
}

.light-theme .btn-currency {
  background: #fff;
  border-color: #ddd;
  color: #666;
}

.light-theme .btn-currency:hover {
  border-color: #d4a017;
  color: #d4a017;
}

.light-theme .btn-currency.active {
  background: linear-gradient(135deg, #d4a017 0%, #b8860b 100%);
  border-color: #d4a017;
  color: #fff;
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

.light-theme .date-selector label {
  color: #666;
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

.light-theme .date-selector input[type="date"] {
  background: #fff;
  border-color: #ddd;
  color: #333;
}

.light-theme .date-selector input[type="date"]:focus {
  border-color: #d4a017;
}

.btn-query {
  padding: 8px 24px;
  background: linear-gradient(135deg, #e6a23c 0%, #d4a017 100%);
  border: none;
  border-radius: 6px;
  color: #1a1a2e;
  font-weight: bold;
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

.chart-type-switcher {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.btn-chart-type {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: #2a2a3e;
  border: 2px solid #444;
  border-radius: 8px;
  color: #ccc;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-chart-type:hover {
  border-color: #e6a23c;
  color: #e6a23c;
}

.btn-chart-type.active {
  background: linear-gradient(135deg, #e6a23c 0%, #d4a017 100%);
  border-color: #e6a23c;
  color: #1a1a2e;
  font-weight: bold;
}

.light-theme .btn-chart-type {
  background: #fff;
  border-color: #ddd;
  color: #666;
}

.light-theme .btn-chart-type:hover {
  border-color: #d4a017;
  color: #d4a017;
}

.light-theme .btn-chart-type.active {
  background: linear-gradient(135deg, #d4a017 0%, #b8860b 100%);
  border-color: #d4a017;
  color: #fff;
}

.btn-chart-type .icon {
  font-size: 18px;
}

.quick-select {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-quick {
  padding: 6px 16px;
  background: #2a2a3e;
  border: 1px solid #444;
  border-radius: 20px;
  color: #ccc;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 13px;
}

.btn-quick:hover {
  border-color: #e6a23c;
  color: #e6a23c;
}

.btn-quick.active {
  background: #e6a23c;
  border-color: #e6a23c;
  color: #1a1a2e;
  font-weight: bold;
}

.light-theme .btn-quick {
  background: #fff;
  border-color: #ddd;
  color: #666;
}

.light-theme .btn-quick:hover {
  border-color: #d4a017;
  color: #d4a017;
}

.light-theme .btn-quick.active {
  background: #d4a017;
  border-color: #d4a017;
  color: #fff;
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  to { transform: rotate(360deg); }
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

.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
}

.light-theme .stats-panel {
  background: rgba(255, 255, 255, 0.5);
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

.light-theme .stat-item {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-item:hover {
  transform: translateY(-3px);
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.light-theme .stat-label {
  color: #666;
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
  .gold-chart-container {
    padding: 12px;
    border-radius: 12px;
  }

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
    flex-wrap: wrap;
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

  .chart-wrapper {
    padding: 10px;
    min-height: 300px;
  }

  .chart {
    height: 300px;
  }

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
  .gold-chart-container {
    padding: 10px;
  }

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

  .chart-wrapper {
    padding: 8px;
    min-height: 250px;
  }

  .chart {
    height: 250px;
  }

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
