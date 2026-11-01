# CODE ARCHIVE — 本地可运行 MVP

这是一个可本地运行的个人 Python 编程学习作品集原型，包含：
- 欢迎页、首页、课堂练习列表、练习详情、管理员工作台
- 练习搜索与分类筛选
- 管理员演示登录、练习新增/编辑/删除（浏览器 localStorage）
- Python 浏览器内运行器（Pyodide + Web Worker）
- 标准输入、多行输入、标准输出、错误输出、运行超时
- 外部平台运行链接入口

## 环境要求
- Node.js 18.17 或更高版本
- npm
- 首次运行需要联网安装依赖；Python 运行器首次启动也需要从 jsDelivr 加载 Pyodide。

## 启动步骤

```bash
npm install
npm run dev
```

浏览器打开 http://localhost:3000

## 页面入口
- `/` 欢迎页
- `/home` 首页
- `/exercises` 课堂练习列表
- `/exercises/hello-python` 练习详情
- `/admin` 管理员工作台

## 演示后台
演示账号：`admin`
演示密码：`demo123`

注意：这是仅用于本地体验的前端原型，演示登录不具备真实安全性。练习数据保存在当前浏览器 localStorage，清理浏览器数据会清除新增内容。

## Python 运行器说明
运行器使用 Pyodide 在浏览器 Worker 中执行 Python，输入区域按行提供给 `input()`。
- 不需要本地安装 Python。
- 首次加载需要联网下载 Pyodide 运行环境。
- 适合基础课堂练习。
- 不支持所有依赖本机系统的第三方库。
- 浏览器 Worker 不是面向不可信任代码的完整安全沙盒。本原型仅用于本人审核后的练习展示和本地体验，正式公开部署前需要进一步增加运行资源限制和隔离策略。

## 正式上线前必须完成
1. 将演示登录替换为 Supabase Auth。
2. 将 localStorage 数据替换为 PostgreSQL/Supabase。
3. 配置 Supabase RLS 和私有资源访问策略。
4. 对公开运行的任意用户代码增加独立执行隔离、网络限制、CPU/内存限制和频率限制。
5. 在后台对外部平台 URL 做域名白名单校验。
6. 配置生产环境变量、域名、备份和日志。

本项目没有接入真实 Supabase 后端，也没有将演示密码作为真实认证使用。
