# 黄金价格走势图 (Gold Chart App)

## 项目简介
这是一个用于展示黄金价格走势的 Vue.js 应用，支持部署在 IIS 服务器上。

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### 自定义后端地址构建

#### 方法 1：使用 PowerShell（推荐）
```powershell
# 使用默认地址 http://localhost:41736
npm run build

# 指定后端地址
$env:VUE_APP_API_BASE_URL="http://your-server:41736"; npm run build
```

#### 方法 2：使用 PowerShell 脚本
```powershell
# 使用默认地址
.\build.ps1

# 指定后端地址
.\build.ps1 -apiUrl "http://your-server:41736"
```

#### 方法 3：使用 npm 脚本
```bash
# 开发环境
npm run build:dev

# 生产环境（默认 localhost:41736）
npm run build:prod
```

### Lints and fixes files
```
npm run lint
```

## 部署说明 (IIS)

### 1. 构建项目
```powershell
# 修改为你的后端服务器地址
$env:VUE_APP_API_BASE_URL="http://your-server:41736"; npm run build
```

### 2. 部署到 IIS
将 `dist` 目录下的所有文件复制到 IIS 网站根目录。

### 3. 配置文件说明

构建后会自动生成以下配置文件：

- **config.json** - 运行时配置文件，包含后端 API 地址
  - 位置：`dist/config.json`
  - 可以在不重新构建的情况下修改后端地址
  
- **web.config** - IIS 配置文件
  - 位置：`dist/web.config`
  - 包含 URL 重写规则、MIME 类型等配置
  - 自动代理 API 请求到后端服务器

### 4. 修改后端地址（无需重新构建）
直接编辑 `dist/config.json` 文件：
```json
{
  "apiUrl": "http://your-new-server:41736"
}
```
然后重启 IIS 网站即可。

### 5. IIS 要求
- 需要安装 **URL Rewrite Module** 扩展
- 确保启用静态内容和 MIME 类型支持

## 技术栈
- Vue 3
- ECharts 6
- Axios
- Vue CLI 5

## 目录结构
```
gold-chart-app/
├── public/              # 静态资源
├── src/                 # 源代码
│   ├── components/      # Vue 组件
│   ├── config/          # 配置文件
│   ├── assets/          # 资源文件
│   ├── App.vue          # 根组件
│   └── main.js          # 入口文件
├── dist/                # 构建输出目录
├── vue.config.js        # Vue CLI 配置
├── webpack-hook.js      # Webpack 钩子插件
├── build-config.js      # 构建配置脚本
└── build.ps1            # PowerShell 构建脚本
```

## 注意事项
1. 默认后端端口为 41736
2. 本地开发时使用相对路径，自动跟随当前域名
3. 生产环境部署时会自动使用配置的服务器地址
4. web.config 已配置 Vue Router history 模式支持