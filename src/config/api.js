// API 配置文件
// 可以根据部署环境修改 baseURL

const config = {
  // API 基础路径
  // 使用相对路径，自动跟随当前域名
  // 如需指定后端服务器，可改为: 'http://192.168.1.100:41736'
  baseURL: '',
  
  // 接口地址
  endpoints: {
    prices: '/api/prices'
  }
}

export default config
