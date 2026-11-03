# CODE ARCHIVE 2.0

## 本次升级
- 注册/登录：每位访客使用自己的邮箱和密码创建账号。
- 所有作品集页面默认需要登录；未登录访问会跳转 `/login`。
- 登录后进入 `/home`；支持退出登录和邮箱验证回调。
- `/admin` 可通过 `ADMIN_EMAIL` 限制为指定管理员邮箱。
- 全新深色登录界面、交互状态和移动端适配。
- 保留原有 Python 练习和 Pyodide 运行器。

## 必须完成 Supabase 配置后才能真正注册登录
1. 在 https://supabase.com 创建项目。
2. Project Settings > API，复制 Project URL 和 anon/public key。
3. Authentication > URL Configuration：
   - Site URL 设置为你的 Vercel 域名。
   - Redirect URLs 添加 `https://你的域名/auth/callback`。
4. SQL Editor 执行 `supabase/schema.sql`。
5. Vercel > Project > Settings > Environment Variables 添加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ADMIN_EMAIL`（你的管理员注册邮箱）
6. 重新部署项目。

本地运行：复制 `.env.example` 为 `.env.local`，填入 Supabase 配置后执行 `npm install`、`npm run dev`。

## 当前限制
练习内容仍使用浏览器 localStorage，尚未实现跨设备云端同步。个人账号认证已接入 Supabase，但用户资料、收藏和练习数据的完整云端管理属于下一阶段。浏览器 Pyodide 不是完整安全沙盒。

## 公共体验账号（2.1）

登录页增加“进入体验账号”入口。体验账号通过服务端 API 登录 Supabase Auth，账号密码只保存在 Vercel 服务端环境变量中，不会发送到浏览器。

配置步骤：
1. 在 Supabase Authentication → Users 中手动创建一个专用体验用户，使用专门的体验邮箱和强密码，并完成邮箱验证（如项目开启邮箱确认）。不要使用管理员账号作为体验账号。
2. 在 Vercel → Project → Settings → Environment Variables 添加 `DEMO_ACCOUNT_EMAIL` 和 `DEMO_ACCOUNT_PASSWORD`，值填写上一步体验用户的邮箱和密码。两项都不要加 `NEXT_PUBLIC_` 前缀，选择 Secret 存储类型（如果 Vercel 提供该选项），仅勾选 Production。
3. 保留 `ADMIN_EMAIL` 为你自己的管理员邮箱。体验账号不得与管理员邮箱相同。
4. Redeploy 后，在登录页点击“进入体验账号”测试。

安全说明：体验账号是所有访客共用的身份，任何使用者都可能共享该账号下的云端数据和会话行为。因此不要在体验账号中保存个人隐私、真实用户资料或敏感学习记录；体验账号不应拥有后台管理权限。当前练习内容仍沿用项目现有的数据存储实现，尚未迁移为 Supabase 云端共享内容库；收藏/学习记录也尚未实现完整的个人隔离。在线 Python 执行仅适用于受控的学习代码，不能视为强隔离安全沙盒。
