import * as echarts from 'echarts'

function formatAxisTime(time) {
  const date = new Date(time)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}

function createValueAxisRange(value) {
  const range = value.max - value.min
  const padding = range * 0.1 || 1
  return {
    min: Math.floor((value.min - padding) * 100) / 100,
    max: Math.ceil((value.max + padding) * 100) / 100
  }
}

function calculateChangeRate(data) {
  if (!data || data.length < 2) {
    return data
  }

  const baseValue = data[0]
  return data.map((value) => ((value - baseValue) / baseValue) * 100)
}

function getThemeColors(theme) {
  if (theme === 'light') {
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
      downColor: '#e74c3c',
      tooltipStrip: 'rgba(0,0,0,0.05)'
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
    downColor: '#ff6b6b',
    tooltipStrip: 'rgba(255,255,255,0.05)'
  }
}

function createBaseChart(theme, title, subtext, legend) {
  const colors = getThemeColors(theme)
  return {
    backgroundColor: colors.bg,
    title: {
      text: title,
      subtext,
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
    legend: {
      data: legend,
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
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
        throttle: 50
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
    ]
  }
}

function createTooltip(colors, formatter, axisPointer) {
  return {
    trigger: 'axis',
    triggerOn: 'mousemove|click',
    showDelay: 0,
    backgroundColor: colors.tooltipBg,
    borderColor: colors.tooltipBorder,
    borderWidth: 1,
    textStyle: {
      color: colors.tooltipText
    },
    axisPointer,
    formatter
  }
}

export function buildChartOption({ chartType, currency, theme, data }) {
  const colors = getThemeColors(theme)

  if (chartType === 'trend') {
    return buildTrendOption({ currency, theme, data, colors })
  }

  if (chartType === 'rate') {
    return buildRateOption({ theme, data, colors })
  }

  if (chartType === 'compare') {
    return buildCompareOption({ theme, data, colors })
  }

  return buildPriceOption({ currency, theme, data, colors })
}

function buildPriceOption({ currency, theme, data, colors }) {
  const isUSD = currency === 'USD'
  const currencyName = isUSD ? 'USD' : 'CNY'
  const priceData = isUSD ? data.series[0]?.data || [] : data.series[1]?.data || []
  const mainColor = isUSD ? colors.usdColor : colors.cnyColor
  const name = `黄金价格 (${currencyName})`

  return {
    ...createBaseChart(theme, `黄金价格走势 (${currencyName})`, '原始价格数据', [name]),
    tooltip: createTooltip(
      colors,
      (params) => {
        const item = params[0]
        return `<div style="font-weight:bold;margin-bottom:5px;">${item.axisValue}</div>
          <div style="display:flex;align-items:center;margin:5px 0;padding:5px;background:${colors.tooltipStrip};border-radius:4px;">
            <span style="display:inline-block;width:10px;height:10px;background:${mainColor};border-radius:50%;margin-right:8px;"></span>
            <span style="flex:1;">${name}</span>
            <span style="color:${mainColor};font-weight:bold;">${item.value.toFixed(2)}</span>
          </div>`
      },
      {
        type: 'line',
        snap: true,
        lineStyle: {
          color: mainColor,
          width: 1,
          type: 'dashed'
        },
        label: {
          show: true,
          backgroundColor: mainColor
        }
      }
    ),
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.xaxis.map(formatAxisTime),
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
        scale: true,
        min(value) {
          return createValueAxisRange(value).min
        },
        max(value) {
          return createValueAxisRange(value).max
        },
        axisLine: {
          lineStyle: {
            color: mainColor
          }
        },
        axisLabel: {
          color: mainColor,
          formatter(value) {
            return value.toFixed(2)
          }
        },
        splitLine: {
          lineStyle: {
            color: colors.splitLine
          }
        }
      }
    ],
    series: [
      {
        name,
        type: 'line',
        data: priceData,
        smooth: true,
        showSymbol: false,
        symbol: 'circle',
        symbolSize: 8,
        emphasis: {
          scale: true,
          itemStyle: {
            borderWidth: 3,
            borderColor: '#fff',
            shadowBlur: 10,
            shadowColor: mainColor
          }
        },
        lineStyle: {
          width: 3,
          color: mainColor
        },
        itemStyle: {
          color: mainColor
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${mainColor}4D` },
            { offset: 1, color: `${mainColor}0D` }
          ])
        }
      }
    ]
  }
}

function buildTrendOption({ currency, theme, data, colors }) {
  const isUSD = currency === 'USD'
  const currencyName = isUSD ? 'USD' : 'CNY'
  const priceData = isUSD ? data.series[0]?.data || [] : data.series[1]?.data || []
  const changeRate = calculateChangeRate(priceData)
  const mainColor = isUSD ? colors.usdColor : colors.cnyColor
  const seriesName = `${currencyName} 涨跌幅`

  return {
    ...createBaseChart(theme, `${currencyName} 黄金价格涨跌趋势 (%)`, '以时间段起始价格为基准计算涨跌幅', [seriesName]),
    grid: {
      left: 80,
      right: 30,
      bottom: 60,
      top: 100,
      containLabel: false
    },
    tooltip: createTooltip(
      colors,
      (params) => {
        const item = params[0]
        const originalValue = priceData[item.dataIndex]
        const changeIcon = item.value >= 0 ? '↗' : '↘'
        const changeColor = item.value >= 0 ? colors.upColor : colors.downColor
        return `<div style="font-weight:bold;margin-bottom:5px;">${item.axisValue}</div>
          <div style="display:flex;align-items:center;margin:5px 0;padding:5px;background:${colors.tooltipStrip};border-radius:4px;">
            <span style="display:inline-block;width:10px;height:10px;background:${mainColor};border-radius:50%;margin-right:8px;"></span>
            <span style="flex:1;">${currencyName} 黄金价格</span>
            <span style="margin-right:10px;color:${colors.axisLabel};">${originalValue.toFixed(2)}</span>
            <span style="color:${changeColor};font-weight:bold;">${changeIcon} ${item.value >= 0 ? '+' : ''}${item.value.toFixed(3)}%</span>
          </div>`
      },
      {
        type: 'line',
        snap: true,
        lineStyle: {
          color: mainColor,
          width: 1,
          type: 'dashed'
        },
        label: {
          show: true,
          backgroundColor: mainColor
        }
      }
    ),
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.xaxis.map(formatAxisTime),
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
          color: theme === 'light' ? '#333' : '#fff',
          fontSize: 13,
          fontWeight: 'bold',
          formatter(value) {
            return `${value.toFixed(3)}%`
          },
          backgroundColor: `${mainColor}33`,
          borderRadius: 4,
          padding: [4, 8]
        },
        splitLine: {
          lineStyle: {
            color: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.15)',
            type: 'dashed'
          }
        }
      }
    ],
    series: [
      {
        name: seriesName,
        type: 'line',
        data: changeRate,
        smooth: true,
        showSymbol: false,
        symbol: 'circle',
        symbolSize: 8,
        emphasis: {
          scale: true,
          itemStyle: {
            borderWidth: 3,
            borderColor: '#fff',
            shadowBlur: 10,
            shadowColor: mainColor
          }
        },
        lineStyle: {
          width: 4,
          color: mainColor
        },
        itemStyle: {
          color: mainColor
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${mainColor}80` },
            { offset: 1, color: `${mainColor}0D` }
          ])
        },
        markLine: {
          symbol: 'none',
          data: [
            {
              yAxis: 0,
              lineStyle: {
                color: theme === 'light' ? '#666' : '#fff',
                type: 'dashed',
                width: 2
              },
              label: {
                show: true,
                formatter: '基准线 0%',
                color: theme === 'light' ? '#666' : '#fff',
                fontSize: 12,
                fontWeight: 'bold',
                backgroundColor: theme === 'light' ? 'rgba(200, 200, 200, 0.5)' : 'rgba(136, 136, 136, 0.5)',
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
                formatter(params) {
                  return `${params.value.toFixed(3)}%`
                },
                backgroundColor: `${colors.upColor}4D`,
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
                formatter(params) {
                  return `${params.value.toFixed(3)}%`
                },
                backgroundColor: `${colors.downColor}4D`,
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

function buildRateOption({ theme, data, colors }) {
  const rateData = data.prices.map((item) => item.exchangeRate)
  const rateChangeRate = calculateChangeRate(rateData)

  return {
    ...createBaseChart(theme, 'USD/CNY 汇率走势', '通过金价计算的隐含汇率变化（相对起点）', ['汇率涨跌幅']),
    tooltip: createTooltip(
      colors,
      (params) => {
        const item = params[0]
        const rate = rateData[item.dataIndex]
        const changeIcon = item.value >= 0 ? '↗' : '↘'
        const changeColor = item.value >= 0 ? colors.upColor : colors.downColor
        return `<div style="font-weight:bold;margin-bottom:5px;">${item.axisValue}</div>
          <div style="display:flex;align-items:center;margin:5px 0;padding:5px;background:${colors.tooltipStrip};border-radius:4px;">
            <span style="display:inline-block;width:10px;height:10px;background:${colors.rateColor};border-radius:50%;margin-right:8px;"></span>
            <span style="flex:1;">USD/CNY 汇率</span>
            <span style="margin-right:10px;color:${colors.axisLabel};">${rate.toFixed(4)}</span>
            <span style="color:${changeColor};font-weight:bold;">${changeIcon} ${item.value >= 0 ? '+' : ''}${item.value.toFixed(3)}%</span>
          </div>`
      },
      {
        type: 'line',
        snap: true,
        lineStyle: {
          color: colors.rateColor,
          width: 1,
          type: 'dashed'
        },
        label: {
          show: true,
          backgroundColor: colors.rateColor
        }
      }
    ),
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.xaxis.map(formatAxisTime),
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
    series: [
      {
        name: '汇率涨跌幅',
        type: 'line',
        data: rateChangeRate,
        smooth: true,
        showSymbol: false,
        symbol: 'circle',
        symbolSize: 8,
        emphasis: {
          scale: true,
          itemStyle: {
            borderWidth: 3,
            borderColor: '#fff',
            shadowBlur: 10,
            shadowColor: colors.rateColor
          }
        },
        lineStyle: {
          width: 3,
          color: colors.rateColor
        },
        itemStyle: {
          color: colors.rateColor
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${colors.rateColor}66` },
            { offset: 1, color: `${colors.rateColor}0D` }
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

function buildCompareOption({ theme, data, colors }) {
  const usdData = data.series[0]?.data || []
  const cnyData = data.series[1]?.data || []
  const sampleCount = Math.max(1, Math.min(12, usdData.length))
  const step = Math.max(1, Math.floor(usdData.length / sampleCount))
  const sampledData = []

  for (let i = 0; i < sampleCount; i += 1) {
    const index = Math.min(i * step, usdData.length - 1)
    const time = new Date(data.xaxis[index])
    sampledData.push({
      time: `${time.getHours()}:${time.getMinutes().toString().padStart(2, '0')}`,
      usd: usdData[index],
      cny: cnyData[index]
    })
  }

  return {
    ...createBaseChart(theme, '黄金价格时段对比', '抽样展示不同时间点的 USD / CNY 价格', ['USD 价格', 'CNY 价格']),
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
        throttle: 50
      }
    ],
    tooltip: createTooltip(
      colors,
      (params) => {
        let result = `<div style="font-weight:bold;margin-bottom:5px;">${params[0].axisValue}</div>`
        params.forEach((item) => {
          const color = item.seriesName.includes('USD') ? colors.usdColor : colors.cnyColor
          result += `<div style="display:flex;align-items:center;margin:5px 0;padding:5px;background:${colors.tooltipStrip};border-radius:4px;">
            <span style="display:inline-block;width:10px;height:10px;background:${color};border-radius:50%;margin-right:8px;"></span>
            <span style="flex:1;">${item.seriesName}</span>
            <span style="color:${color};font-weight:bold;">${item.value.toFixed(2)}</span>
          </div>`
        })
        return result
      },
      {
        type: 'shadow'
      }
    ),
    xAxis: {
      type: 'category',
      data: sampledData.map((item) => item.time),
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
        scale: true,
        min(value) {
          return createValueAxisRange(value).min
        },
        max(value) {
          return createValueAxisRange(value).max
        },
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
        scale: true,
        min(value) {
          return createValueAxisRange(value).min
        },
        max(value) {
          return createValueAxisRange(value).max
        },
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
    series: [
      {
        name: 'USD 价格',
        type: 'bar',
        data: sampledData.map((item) => item.usd),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colors.usdColor },
            { offset: 1, color: '#b8860b' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '30%'
      },
      {
        name: 'CNY 价格',
        type: 'bar',
        yAxisIndex: 1,
        data: sampledData.map((item) => item.cny),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colors.cnyColor },
            { offset: 1, color: '#c0392b' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '30%'
      }
    ]
  }
}
