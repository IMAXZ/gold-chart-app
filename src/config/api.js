// API 配置文件
// 后端地址可以通过以下方式配置：
// 1. 构建时：npm run build -- VUE_APP_API_BASE_URL=http://your-server:41736
// 2. 修改 dist/config.json 文件，设置 apiUrl 或 apiPort
// 3. 默认使用当前域名 + 41736 端口

// 尝试从多个来源获取 API 地址
let baseURL = ''

// 优先级 1: 构建时注入的环境变量
if (process.env.VUE_APP_API_BASE_URL) {
  baseURL = process.env.VUE_APP_API_BASE_URL
}
// 优先级 2: 运行时从 config.json 读取（浏览器环境）
else if (typeof window !== 'undefined' && window.APP_CONFIG) {
  // 如果配置了完整的 apiUrl，直接使用
  if (window.APP_CONFIG.apiUrl) {
    baseURL = window.APP_CONFIG.apiUrl
  }
  // 或者只配置端口号 apiPort
  else if (window.APP_CONFIG.apiPort) {
    const currentHost = window.location.host
    const protocol = window.location.protocol
    const serverIp = currentHost.split(':')[0]
    baseURL = `${protocol}//${serverIp}:${window.APP_CONFIG.apiPort}`
  }
}

// 优先级 3: 动态获取当前服务器地址 + 默认端口 41736
if (!baseURL && typeof window !== 'undefined') {
  const currentHost = window.location.host
  const protocol = window.location.protocol
  
  // 如果是本地开发环境，使用相对路径
  if (currentHost.includes('localhost') || currentHost.includes('127.0.0.1')) {
    baseURL = ''  // 相对路径
  } else {
    // 生产环境：使用当前访问的服务器地址 + 41736 端口
    const serverIp = currentHost.split(':')[0]
    baseURL = `${protocol}//${serverIp}:41736`
  }
}

const config = {
  baseURL: baseURL,
  
  endpoints: {
    prices: '/api/prices'
  }
}

export default config
