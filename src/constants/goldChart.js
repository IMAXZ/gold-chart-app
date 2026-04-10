export const QUICK_DAYS = [
  { label: '今天', value: 0 },
  { label: '昨天', value: 1 },
  { label: '近3天', value: 3 },
  { label: '近7天', value: 7 },
  { label: '近30天', value: 30 }
]

export const GRANULARITY_OPTIONS = [
  { label: '1分钟', value: 1 },
  { label: '5分钟', value: 5 },
  { label: '10分钟', value: 10 },
  { label: '15分钟', value: 15 },
  { label: '30分钟', value: 30 },
  { label: '1小时', value: 60 }
]

export const CURRENCY_OPTIONS = [
  { label: '美元 (USD)', value: 'USD', icon: '💵' },
  { label: '人民币 (CNY)', value: 'CNY', icon: '💴' }
]

export const CHART_TYPE_OPTIONS = [
  { label: '价格图', value: 'price', icon: '📈' },
  { label: '涨跌幅趋势', value: 'trend', icon: '📉' },
  { label: '汇率走势', value: 'rate', icon: '💱' },
  { label: '价格对比', value: 'compare', icon: '📊' }
]
