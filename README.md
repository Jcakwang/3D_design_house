# 3D看房工具

一个基于 Vue 3 + Three.js + Vite 的在线 3D/VR 看房工具。用户可以在浏览器中沉浸式浏览户型，切换装修风格，并收藏心仪的户型。

## ✨ 功能特性

- 🗺️ **地图找房** — 基于高德地图的小区定位与筛选
- 🏠 **3D 看房** — Three.js 驱动的沉浸式户型体验
- 🎨 **装修切换** — 毛坯 / 现代简约 / 北欧 / 新中式 / 日式原木 5 种风格
- ❤️ **户型收藏** — 本地存储的收藏夹功能
- 📱 **PWA 支持** — 可安装为独立应用，支持离线缓存
- 🎭 **响应式设计** — 适配桌面端和移动端

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Vue 3 (Composition API) |
| 构建工具 | Vite 8 |
| 3D 引擎 | Three.js |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| 地图 | 高德地图 JS API 2.0 |
| PWA | Service Worker |
| 代码规范 | ESLint + Prettier |

## 📋 项目结构

```
3D-design house/
├── config/                  # 部署配置文件
│   ├── nginx.conf           # Nginx 配置示例
│   └── apache.conf          # Apache 配置示例 (.htaccess)
├── public/                  # 静态资源
│   ├── favicon.svg
│   ├── manifest.json        # PWA 应用清单
│   ├── sw.js                # Service Worker
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── assets/              # 静态资源 (SVG 等)
│   ├── components/          # 可复用组件 (可扩展)
│   ├── router/              # Vue Router 配置
│   ├── services/            # API & 第三方服务
│   │   ├── amap.js          # 高德地图服务
│   │   └── api.js           # HTTP 请求封装
│   ├── stores/              # Pinia 状态管理
│   ├── views/               # 页面组件
│   ├── App.vue
│   └── main.js
├── .env                     # 环境变量（默认）
├── .env.development         # 开发环境变量
├── .env.production          # 生产环境变量
├── .env.example             # 环境变量模板
├── .env.local               # 本地敏感配置（被 .gitignore 排除）
├── .eslintrc.cjs            # ESLint 配置
├── .prettierrc              # Prettier 配置
├── .gitignore
├── package.json
├── vite.config.js
└── index.html
```

## 🚀 快速开始

### 前置条件

- Node.js >= 18.0.0
- npm >= 9.0.0（或 yarn / pnpm）

### 安装依赖

```bash
npm install
```

### 环境变量配置

复制示例文件并填入实际值：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的高德地图密钥：

```
VITE_AMAP_SECURITY_KEY=你的安全密钥
VITE_AMAP_KEY=你的地图Key
```

### 开发

```bash
npm run dev
```

本地访问: http://localhost:5173

### 构建

```bash
npm run build
```

输出目录: `dist/`

### 预览生产构建

```bash
npm run preview
```

## 🌐 生产部署

### 方案一：Nginx 部署

1. 构建项目后，将 `dist/` 目录上传到服务器
2. 配置 Nginx：

```bash
# 复制 Nginx 配置到服务器
sudo cp config/nginx.conf /etc/nginx/sites-available/3d-house-viewer
sudo ln -s /etc/nginx/sites-available/3d-house-viewer /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

3. 使用 SSL 证书（推荐 Let's Encrypt）：

```bash
sudo certbot --nginx -d yourdomain.com
```

### 方案二：Vercel 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

> Vercel 自动识别 Vite 项目，`dist/` 作为输出目录。

### 方案三：GitHub Pages 部署

```bash
# 修改 vite.config.js 中的 base 为仓库名
# base: '/your-repo-name/'

# 安装 gh-pages
npm install --save-dev gh-pages

# 添加部署脚本到 package.json
# "deploy": "npm run build && gh-pages -d dist"

# 部署
npm run deploy
```

### 方案四：Docker 部署

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY config/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

构建与运行：

```bash
docker build -t 3d-house-viewer .
docker run -p 80:80 3d-house-viewer
```

## 📝 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_APP_TITLE` | 应用标题 | 3D看房工具 |
| `VITE_APP_DESCRIPTION` | 应用描述 | 在线3D/VR看房体验工具 |
| `VITE_APP_VERSION` | 应用版本 | 0.1.0 |
| `VITE_API_BASE_URL` | API 基础地址 | http://localhost:3000/api |
| `VITE_AMAP_SECURITY_KEY` | 高德地图安全密钥 | — |
| `VITE_AMAP_KEY` | 高德地图 API Key | — |

## 🔧 代码规范

```bash
# ESLint 检查
npx eslint src/

# Prettier 格式化
npx prettier --write src/
```

## 📄 License

MIT License - 详见 [LICENSE](./LICENSE)文件。
