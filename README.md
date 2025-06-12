# 🦀 Just Mock - Browser API Response Simulator

> 螃蟹Mock：智能的浏览器网络请求拦截与模拟工具
> An intelligent browser extension for intercepting and simulating network requests

[![Version](https://img.shields.io/badge/version-0.0.5-blue.svg)](https://github.com/botshen/just-mock)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](https://www.typescriptlang.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-green.svg)](https://vuejs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## ✨ 功能特点 | Features

### 🎯 核心功能 | Core Features

- **🔗 智能拦截** | Smart Interception

  - 实时拦截浏览器网络请求
  - 支持多种 HTTP 方法 (GET、POST、PUT、DELETE 等)
  - 基于路径关键字的智能过滤

- **📝 响应模拟** | Response Simulation

  - 自定义 API 响应内容
  - 配置状态码和延迟时间
  - 支持复杂的 JSON 数据结构

- **🎛️ 灵活控制** | Flexible Control

  - 全局开关控制
  - 单标签页独立控制
  - 实时启用/禁用调试器

- **💾 数据管理** | Data Management
  - 持久化存储拦截配置
  - 导入/导出配置数据
  - 请求历史记录管理

### 🚀 高级特性 | Advanced Features

- **🌐 多语言支持** | Internationalization

  - 中文 / English 双语界面
  - 完整的本地化支持

- **🎨 现代化 UI** | Modern Interface

  - 基于 Vue 3 + TypeScript 构建
  - TailwindCSS + DaisyUI 样式系统
  - 响应式设计，适配各种屏幕

- **⚡ 高性能** | High Performance
  - 基于 Chrome Debugger API
  - 优化的内存使用
  - 实时数据同步

## 🛠️ 技术栈 | Tech Stack

### 前端框架 | Frontend

- **Vue 3** - 现代化前端框架
- **TypeScript** - 类型安全的 JavaScript
- **Vue Router** - 路由管理
- **VueUse** - Vue 组合式 API 工具集

### 样式系统 | Styling

- **TailwindCSS** - 实用优先的 CSS 框架
- **DaisyUI** - TailwindCSS 组件库
- **PostCSS** - CSS 后处理器

### 开发工具 | Development Tools

- **WXT** - 现代化 Web 扩展开发框架
- **Vite** - 快速的构建工具
- **ESLint** - 代码质量检查
- **Vitest** - 单元测试框架

### 浏览器 API | Browser APIs

- **Chrome Debugger API** - 网络请求拦截
- **Chrome Side Panel** - 侧边栏界面
- **Chrome Storage** - 数据持久化
- **Chrome Tabs** - 标签页管理

## 📦 安装使用 | Installation & Usage

### 开发环境 | Development

```bash
# 克隆项目
git clone https://github.com/botshen/just-mock.git
cd just-mock

# 安装依赖 (推荐使用 pnpm)
pnpm install

# 开发模式 (Chrome)
pnpm dev

# 开发模式 (Firefox)
pnpm dev:firefox

# 构建生产版本
pnpm build

# 打包扩展
pnpm zip
```

### 浏览器安装 | Browser Installation

1. **Chrome/Edge:**

   ```bash
   pnpm build
   ```

   - 打开 `chrome://extensions/`
   - 启用"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择 `.output/chrome-mv3` 文件夹

2. **Firefox:**
   ```bash
   pnpm build:firefox
   ```
   - 打开 `about:debugging#/runtime/this-firefox`
   - 点击"临时载入附加组件"
   - 选择 `.output/firefox-mv2/manifest.json` 文件

### 使用方法 | How to Use

1. **激活扩展** | Activate Extension

   - 点击浏览器工具栏中的扩展图标
   - 或使用快捷键打开侧边栏

2. **配置拦截** | Configure Interception

   - 在"拦截地址配置"中添加目标 API 路径
   - 设置自定义响应数据和状态码
   - 配置延迟时间模拟网络延迟

3. **启用拦截** | Enable Interception

   - 开启"全局拦截"开关
   - 或针对特定标签页启用拦截

4. **监控请求** | Monitor Requests
   - 在"拦截的接口"面板查看实时请求
   - 查看请求详情和响应数据

## 🎯 使用场景 | Use Cases

### 前端开发 | Frontend Development

- **API Mock** - 在后端接口未完成时进行前端开发
- **错误测试** - 模拟各种错误状态码进行错误处理测试
- **性能测试** - 通过延迟设置测试不同网络条件下的表现

### 测试调试 | Testing & Debugging

- **边界测试** - 测试极端数据情况
- **兼容性测试** - 测试不同数据格式的兼容性
- **回归测试** - 重现特定的数据场景

### 演示展示 | Demo & Presentation

- **产品演示** - 确保演示过程中的数据稳定性
- **培训教学** - 提供可控的学习环境

## 📁 项目结构 | Project Structure

```
just-mock/
├── entrypoints/           # 扩展入口点
│   ├── background.ts      # 后台脚本
│   ├── sidepanel/         # 侧边栏页面
│   └── content/           # 内容脚本
├── components/            # Vue 组件
│   ├── button/            # 按钮组件
│   ├── dialog/            # 对话框组件
│   ├── form/              # 表单组件
│   └── ...
├── utils/                 # 工具函数
│   ├── debugger.ts        # 调试器工具
│   ├── messaging.ts       # 消息通信
│   ├── service.ts         # 数据服务
│   └── storage.ts         # 存储管理
├── locales/               # 国际化文件
│   ├── en.yml             # 英文
│   └── zh_CN.yml          # 中文
├── assets/                # 静态资源
├── router/                # 路由配置
└── share/                 # 共享模块
```

## 🤝 贡献指南 | Contributing

我们欢迎任何形式的贡献！请阅读以下指南：

1. **Fork** 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'feat: 添加了惊人的新功能'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 **Pull Request**

### 开发规范 | Development Guidelines

- 使用 TypeScript 而不是 JavaScript
- 遵循 ESLint 代码规范
- 提交信息请使用中文，格式参考 [约定式提交](https://www.conventionalcommits.org/zh-hans/)
- 确保所有测试通过 (`pnpm test`)

## 📝 更新日志 | Changelog

### v0.0.5 (Latest)

- ✨ 完善了侧边栏界面
- 🐛 修复了多标签页切换的问题
- 🌐 添加了完整的国际化支持
- ⚡ 优化了性能和内存使用

## 📄 许可证 | License

本项目基于 [MIT 许可证](LICENSE) 开源。

## 🔗 相关链接 | Links

- [GitHub 仓库](https://github.com/botshen/just-mock)
- [问题反馈](https://github.com/botshen/just-mock/issues)
- [功能请求](https://github.com/botshen/just-mock/issues/new?template=feature_request.md)

## 💬 交流讨论 | Community

如果您有任何问题或建议，欢迎：

- 提交 [Issue](https://github.com/botshen/just-mock/issues)
- 发起 [Discussion](https://github.com/botshen/just-mock/discussions)

---

<div align="center">

**[⬆ 回到顶部](#-just-mock---browser-api-response-simulator)**

Made with ❤️ by [botshen](https://github.com/botshen)

</div>
