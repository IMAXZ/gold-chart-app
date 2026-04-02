# IIS 部署快速指南

## 前置要求
1. IIS 7.5 或更高版本
2. URL Rewrite Module 2.0 扩展（必须安装）
3. .NET Framework 4.5 或更高版本

## 安装 URL Rewrite Module
下载地址：https://www.iis.net/downloads/microsoft/url-rewrite

## 部署步骤

### 1. 构建项目
打开 PowerShell，进入项目目录，执行：

```powershell
# 方法 1：使用默认地址（localhost:41736）
npm run build

# 方法 2：指定后端服务器地址
$env:VUE_APP_API_BASE_URL="http://your-server-ip:41736"; npm run build
```

### 2. 创建 IIS 网站
1. 打开 IIS 管理器
2. 右键"网站" -> "添加网站"
3. 填写网站信息：
   - 网站名称：GoldChartApp
   - 物理路径：选择项目的 `dist` 目录
   - 端口：80 或其他端口
4. 点击"确定"

### 3. 配置应用程序池
1. 在左侧树形菜单中选择刚创建的网站
2. 点击右侧"基本设置"
3. 确保".NET CLR 版本"设置为"无托管代码"
4. 点击"确定"

### 4. 验证 web.config
web.config 文件已自动生成，包含：
- API 请求代理规则（转发到后端服务器）
- Vue Router history 模式支持
- MIME 类型配置
- 静态资源压缩

### 5. 测试访问
在浏览器中访问：http://localhost 或 http://your-domain

## 修改后端地址（无需重新构建）

如果部署后需要修改后端地址，有两种方法：

### 方法 1：修改 config.json
1. 编辑 `dist/config.json` 文件
2. 修改 `apiUrl` 为新的后端地址
3. 保存文件
4. 在 IIS 中重启网站

```json
{
  "apiUrl": "http://new-backend-server:41736"
}
```

### 方法 2：修改 web.config
1. 编辑 `dist/web.config` 文件
2. 找到 `<rule name="API Proxy">` 部分
3. 修改 `url` 属性中的后端地址
4. 保存文件
5. 在 IIS 中重启网站

## 常见问题

### 问题 1：访问页面显示空白
**解决方案：**
- 检查浏览器控制台是否有错误
- 确认已安装 URL Rewrite Module
- 检查 IIS 日志文件

### 问题 2：API 请求失败（404 或 500 错误）
**解决方案：**
- 检查后端服务是否运行
- 确认 web.config 中的后端地址正确
- 检查防火墙设置，确保端口 41736 开放

### 问题 3：刷新页面出现 404 错误
**解决方案：**
- 这是 Vue Router history 模式的正常现象
- web.config 已配置重写规则，自动重定向到 index.html
- 确保 URL Rewrite Module 已正确安装

### 问题 4：跨域错误（CORS）
**解决方案：**
- web.config 已配置 API 代理，应该不会出现跨域问题
- 如果仍有问题，检查后端服务的 CORS 配置

## 高级配置

### 配置 HTTPS
1. 获取 SSL 证书
2. 在 IIS 中绑定 HTTPS 端口（443）
3. 修改 web.config 中的后端地址为 HTTPS

### 负载均衡
如果需要配置负载均衡，在 web.config 中添加多个后端服务器：

```xml
<rule name="API Proxy" stopProcessing="true">
  <match url="^api/(.*)" />
  <action type="Rewrite" url="http://load-balancer:41736/api/{R:1}" />
</rule>
```

## 技术支持
如有其他问题，请参考：
- Vue.js 官方文档：https://vuejs.org/
- IIS 官方文档：https://docs.microsoft.com/en-us/iis/
- URL Rewrite 文档：https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/
