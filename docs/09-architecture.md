# 09 · 技术架构

> 目标：单机可部署、零外部依赖即可跑起来；代码结构让「换数据库 / 换存储 / 加语言」只改一层。
>
> 所有实现必须服从 02 的需求编号与 04 的设计 token；本文只定技术方案，不写业务代码。

---

## 1. 技术选型与理由

| 层 | 选择 | 版本基线 | 理由 | 放弃的方案 |
| --- | --- | --- | --- | --- |
| 框架 | Next.js（App Router） | 15.x | 同一仓库产出前台与后台；RSC 让展示页默认零客户端 JS；Route Handler 提供清晰 API 契约 | 前后端分离（多一套部署与鉴权）；Astro（后台交互重，仍需另起 SPA） |
| 语言 | TypeScript `strict` | 5.x | Block JSON、API 入参、Prisma 类型三处同源 | JavaScript（内容结构复杂，缺类型易漂移） |
| 样式 | Tailwind CSS | v4 | token 直接映射为 CSS 变量；与 04 的间距/字号刻度一一对应；无运行时 | CSS-in-JS（运行时开销、RSC 支持差） |
| 组件 | Radix Primitives | 最新 | 无头、可访问性到位（弹窗/下拉/开关/Toast）；样式完全自控 | shadcn 整包（会带入不需要的默认视觉）；自研弹窗（焦点管理易错） |
| ORM | Prisma | 6.x | schema 即文档；迁移可审查；SQLite → PostgreSQL 改 datasource 即可 | Drizzle（迁移叙事弱）；裸 SQL（迭代慢） |
| 数据库 | SQLite（WAL） | 3.x | 单管理员、数据量小；单文件备份；零运维 | PostgreSQL（首版过重，但保留切换路径） |
| 校验 | Zod | 3.x | 同一 schema 复用于表单、API、seed；错误可映射到字段 | Yup（TS 推断弱） |
| 会话 | iron-session | 8.x | 加密 Cookie，无需会话表；单管理员够用 | NextAuth（多 provider 过重）；JWT 手写（易错） |
| 密码 | bcryptjs | 2.x | 纯 JS，Alpine 镜像无编译依赖；cost 12 | argon2（原生编译，镜像复杂） |
| 上传 | 本地磁盘 + sharp | sharp 0.33 | 无对象存储也能跑；sharp 转码/裁切/去 EXIF | 直传 S3（首版增加配置门槛，留适配器） |
| 测试 | Vitest + Playwright | 最新 | 单测快；E2E 覆盖登录/发布/前台可见 | Jest（ESM 配置繁琐） |
| 包管理 | pnpm | 9.x | 锁文件稳定、磁盘省 | npm（慢）；yarn（无优势） |
| 部署 | Docker + 单容器 | Node 22 | 一条命令起站；数据卷持久化 | Vercel（本地文件上传不可用）；Serverless（SQLite 不适合） |

**硬约束**：Node ≥ 22；不使用需要原生编译且无预编译包的依赖；前台首屏 JS 预算 120 KB（gzip）。

---

## 2. 目录结构

```
.
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx                # html/body、字体、全局 metadata
│  │  ├─ (site)/
│  │  │  ├─ layout.tsx             # 站点头/尾、skip link
│  │  │  ├─ page.tsx               # 首页
│  │  │  ├─ works/page.tsx         # 列表（searchParams: type/page）
│  │  │  ├─ works/[slug]/page.tsx  # 详情
│  │  │  ├─ about/page.tsx
│  │  │  ├─ not-found.tsx
│  │  │  └─ error.tsx
│  │  ├─ admin/
│  │  │  ├─ login/page.tsx
│  │  │  └─ (protected)/
│  │  │     ├─ layout.tsx          # 侧栏 + 顶栏；服务端 requireAdmin
│  │  │     ├─ page.tsx            # 概览
│  │  │     ├─ works/page.tsx
│  │  │     ├─ works/new/page.tsx
│  │  │     ├─ works/[id]/page.tsx
│  │  │     ├─ categories/page.tsx
│  │  │     ├─ media/page.tsx      # P1
│  │  │     ├─ profile/page.tsx
│  │  │     ├─ settings/page.tsx
│  │  │     └─ account/page.tsx
│  │  ├─ api/
│  │  │  ├─ health/route.ts
│  │  │  ├─ auth/login/route.ts
│  │  │  ├─ auth/logout/route.ts
│  │  │  ├─ auth/me/route.ts
│  │  │  ├─ public/profile/route.ts
│  │  │  ├─ public/categories/route.ts
│  │  │  ├─ public/works/route.ts
│  │  │  ├─ public/works/[slug]/route.ts
│  │  │  ├─ admin/stats/route.ts
│  │  │  ├─ admin/works/route.ts
│  │  │  ├─ admin/works/[id]/route.ts
│  │  │  ├─ admin/works/bulk/route.ts
│  │  │  ├─ admin/works/reorder/route.ts
│  │  │  ├─ admin/categories/route.ts
│  │  │  ├─ admin/categories/[id]/route.ts
│  │  │  ├─ admin/categories/reorder/route.ts
│  │  │  ├─ admin/upload/route.ts
│  │  │  ├─ admin/media/route.ts
│  │  │  ├─ admin/media/[id]/route.ts
│  │  │  ├─ admin/profile/route.ts
│  │  │  ├─ admin/settings/route.ts
│  │  │  └─ admin/account/password/route.ts
│  │  ├─ uploads/[...path]/route.ts # 受控读取上传文件（URL 前缀 /uploads/）
│  │  ├─ sitemap.ts
│  │  └─ robots.ts
│  ├─ components/
│  │  ├─ site/      SiteHeader, SiteFooter, WorkCard, WorkGrid, ArtImage...
│  │  ├─ blocks/    BlockRenderer + 各块展示组件
│  │  ├─ admin/     Sidebar, Topbar, WorkTable, WorkForm, BlockEditor, Uploader...
│  │  └─ ui/        Button, Input, Select, Dialog, Drawer, Toast, Switch, Tabs...
│  ├─ lib/
│  │  ├─ db.ts                     # Prisma 单例
│  │  ├─ db/                       # works.ts, categories.ts, profile.ts（页面与 API 共用）
│  │  ├─ auth.ts                   # session 读写、requireAdmin、限流
│  │  ├─ schemas/                  # work.ts, category.ts, profile.ts, settings.ts
│  │  ├─ blocks/                   # 类型、Zod、normalize、默认值
│  │  ├─ storage.ts                # 校验、sharp 转码、落盘、删除
│  │  ├─ errors.ts                 # 错误码与响应包络
│  │  ├─ publish.ts                # 发布必填校验
│  │  ├─ slug.ts                   # 生成、查重、保留字
│  │  ├─ seo.ts                    # metadata、JSON-LD
│  │  └─ copy.ts                   # 空态/错误文案
│  └─ styles/
│     ├─ tokens.css                # 唯一颜色/字号/间距来源
│     └─ globals.css               # Tailwind 入口与基础排版
├─ middleware.ts                   # 仅做 /admin 未登录重定向；API 仍在 handler 内校验
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  └─ seed.ts                      # 管理员 + 分类 + 示例作品
├─ public/
│  ├─ fonts/                       # 自托管字体子集
│  └─ og-default.png
├─ data/                           # 运行时数据（gitignore）
│  ├─ app.db
│  └─ uploads/
├─ tests/
│  ├─ api/
│  └─ e2e/
├─ scripts/                        # backup.sh, package.sh, reset-password.ts
├─ docs/
├─ Dockerfile
├─ docker-compose.yml
├─ .env.example
├─ next.config.ts
├─ tsconfig.json
└─ package.json
```

**分层规则**：

- `src/app/**/page.tsx` 只做数据读取 + 拼装组件，不写业务规则；查询统一走 `src/lib/db/*`。
- 写操作全部集中在 `src/app/api/admin/**`；前台页面只读。
- `src/lib/schemas` 是唯一校验来源；表单客户端校验复用同一 Zod schema（通过 `safeParse`）。
- `src/components/ui` 不含业务字段；`src/components/admin` 可依赖 ui 与 lib。

---

## 3. 渲染与数据流

### 3.1 渲染策略

| 路由 | 模式 | 说明 |
| --- | --- | --- |
| `/` | ISR，`revalidate = 300` | 首页变化不频繁；发布/编辑后主动 `revalidatePath('/')` |
| `/works` | 动态（读 searchParams） | 筛选/分页组合多，按请求渲染；SQLite 本地查询 < 5 ms |
| `/works/[slug]` | ISR + `generateStaticParams`（已发布） | 新作品发布后 `revalidatePath`；草稿不进构建 |
| `/about` | ISR，`revalidate = 300` | 资料变更后 revalidate |
| `/admin/**` | 动态，`no-store` | 永远读最新；`export const dynamic = 'force-dynamic'` |
| `/api/**` | 动态 | 写操作后调用 `revalidatePath` / `revalidateTag` |

- 前台页面默认 Server Component；只有筛选栏下拉、复制链接、加载更多、Toast 是 Client Component。
- `BlockRenderer` 是 Server Component，按 `type` 映射到展示组件；未知类型渲染为占位（开发环境显示类型名）。
- 后台编辑器是 Client Component，初始数据由 Server Component 注入，避免二次请求。

### 3.2 请求链路

```
浏览器 → Next (RSC) → Prisma → SQLite
                ↓
         revalidatePath('/') / ('/works') / ('/works/[slug]')
```

写操作（后台）：

```
Client 表单 → fetch('/api/admin/works/:id', PATCH)
  → Origin 校验 → 会话校验 → Zod 校验 → Prisma 事务 → revalidatePath
  → { ok: true, data } 或 { ok: false, error: { code, message, fields? } }
```

**页面不调自己的 API**：前台页面是 Server Component，直接调用 `src/lib/db/*` 的查询函数；`/api/public/*` 是同一数据契约的 HTTP 出口，供外部调用与契约测试使用，页面不绕一圈发 HTTP 请求。

### 3.3 缓存失效表

| 变更 | 失效 |
| --- | --- |
| 作品新建/编辑/发布/删除 | `/`、`/works`、`/works/{slug}`、`/sitemap.xml` |
| 分类增删改/排序 | `/`、`/works`、所有 `/works/{slug}`（面包屑）、`/sitemap.xml` |
| 个人资料 | `/`、`/about` |
| 站点设置 | `/`、`/about`、所有页面（导航/页脚） |
| 上传文件 | 不失效（URL 含内容哈希或 UUID） |

---

## 4. 数据访问

### 4.1 Prisma 单例

开发环境 HMR 会重复实例化，用 `globalThis` 缓存；生产单例。连接串 `file:./data/app.db`（相对 `prisma/schema.prisma`）。

### 4.2 查询约定

- 列表页只 `select` 卡片需要的字段（id、title、slug、coverUrl、coverAlt、category、year、publishedAt），不取 `content`。
- 详情页一次 `include: { category: true }`；相邻作品用两条 `findFirst`（`publishedAt` 比较）。
- 首页目录用 `groupBy` 统计各分类已发布数量，避免 N+1。
- 所有列表默认过滤 `status = 'published'`；后台不过滤。
- 分页用 `skip/take`；每页 12（前台）/ 20（后台）。
- SQLite 开启 WAL：`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;` 在连接初始化执行。

### 4.3 事务边界

- 作品保存（含 blocks、tags、tools）：单条 `update` 即可，JSON 字段整体写入。
- 分类排序：`$transaction` 批量 update。
- 删除分类：先查关联数，再删；用事务避免竞态。
- 发布：校验 + 更新 `status/publishedAt` 同一事务。

---

## 5. 上传与媒体

### 5.1 流程

```
选择文件 → 前端校验类型/大小 → POST /api/admin/upload (multipart)
  → 会话 + Origin → 大小限制（流式计数）→ magic bytes 校验
  → sharp: 旋转校正、去 EXIF、规范化为 WebP（不放大、不预生成多档）
  → 写入 UPLOAD_DIR/{yyyy}/{mm}/{uuid}.webp
  → 返回 { url, width, height, size }；多档由 next/image 按 sizes 运行时生成
```

### 5.2 规则

| 项 | 规则 |
| --- | --- |
| 图片类型 | JPG/PNG/WebP/AVIF；以文件头为准，不信任 `Content-Type` |
| 图片大小 | ≤ 10 MB（原图）；解码后像素 ≤ 40 MP（防 decompression bomb） |
| 视频 | ≤ 100 MB；MP4/WebM；首版只存原文件，不转码 |
| 音频 | 首版不提供上传；音频块只填外链 URL，文件托管在播客/云盘 |
| 文件名 | `uuid.webp`；原始文件名只存 DB 供后台显示 |
| 目录 | `data/uploads/YYYY/MM/`；按日期分桶，避免单目录过大 |
| 读取 | `/uploads/[...path]` Route Handler：规范化路径、限制在 `UPLOAD_DIR` 内、`Content-Type` 白名单、`Cache-Control: public, max-age=31536000, immutable` |
| 删除 | 先查 Media 引用；被引用返回 409；删除文件失败只记日志，不阻塞 DB 删除 |
| 清理 | P1：每周任务删除 `Media` 中未被引用的孤儿文件（保守：30 天前） |

### 5.3 存储适配器

`src/lib/storage.ts` 暴露 `put/get/delete/publicUrl` 四个方法；首版本地实现。切换 S3 时只替换实现，DB 中存相对 key，不存绝对 URL。

---

## 6. 环境变量

| 变量 | 必填 | 示例 | 说明 |
| --- | --- | --- | --- |
| `DATABASE_URL` | 是 | `file:./data/app.db` | Prisma SQLite 路径 |
| `SESSION_SECRET` | 是 | 32 字节以上随机串 | iron-session 加密密钥；轮换会使所有会话失效 |
| `SITE_URL` | 是 | `https://liubai.example.com` | canonical、sitemap、OG 绝对地址 |
| `APP_ORIGIN` | 是 | `https://liubai.example.com` | 写操作 Origin 校验的允许来源；与 `SITE_URL` 同值，分开命名便于以后拆域名 |
| `UPLOAD_DIR` | 否 | `./data/uploads` | 默认 `data/uploads` |
| `ADMIN_USERNAME` | 首次 | `admin` | 仅 seed 使用 |
| `ADMIN_PASSWORD` | 首次 | 强密码 | 仅 seed 使用；seed 后从环境移除 |
| `OWNER_EMAIL` | 否 | `hello@example.com` | 仅 seed 写入 SiteProfile.email；后台可改 |
| `MAX_IMAGE_MB` | 否 | `10` | 与前端提示保持一致 |
| `MAX_VIDEO_MB` | 否 | `100` | 同上 |
| `NODE_ENV` | 是 | `production` | 控制 secure cookie、错误细节 |

- `.env` 不入库；提供 `.env.example`。
- 启动时校验：缺失必填项直接退出并打印缺哪一项，不进入半可用状态。
- `SESSION_SECRET` 长度 < 32 时拒绝启动。

---

## 7. 安全

| 面 | 措施 |
| --- | --- |
| 认证 | 单管理员；bcrypt cost 12；登录成功签发 iron-session（httpOnly、secure(prod)、sameSite=lax、path=/、7 天） |
| 会话 | 服务端每次校验 `user.id` 与 `sessionEpoch`；改密后 `sessionEpoch + 1` 使旧会话失效 |
| 授权 | `/admin/**` 在 layout 服务端 `requireAdmin()`；所有 `/api/admin/**` 入口再校验一次（不依赖中间件） |
| CSRF | sameSite=lax + 写操作校验 `Origin`/`Referer` 与 `APP_ORIGIN` 同源；不接受 `text/plain` 表单 |
| 限流 | 登录：IP+用户名 5 次/15 分钟，内存 Map，滑动窗口；超限 429 并 `Retry-After` |
| 注入 | Prisma 参数化；禁止拼接 SQL；`$queryRaw` 仅允许带 tagged template |
| XSS | 不渲染用户 HTML；Markdown 只支持白名单语法并转为 React 节点；禁止 `dangerouslySetInnerHTML` |
| 上传 | 类型/大小/像素三重校验；随机文件名；禁止 SVG（可含脚本）；读取路由防目录穿越 |
| 路径 | `path.resolve` 后必须以 `UPLOAD_DIR + sep` 开头，否则 400 |
| 响应头 | `Content-Security-Policy`（default-src 'self'；img-src 'self' data:；frame-src 白名单视频域）、`X-Content-Type-Options: nosniff`、`Referrer-Policy: strict-origin-when-cross-origin`、`frame-ancestors 'self'` |
| 错误 | 生产环境不返回堆栈；日志记录 `requestId`；API 错误统一 `{ ok: false, error: { code, message, fields? } }` |
| 依赖 | 锁定版本；CI 跑 `pnpm audit --prod`；高危可升级项 7 天内处理 |

**明确不做**：多角色权限、OAuth、注册、找回密码邮件（单管理员，密码通过 CLI 重置）。

---

## 8. 性能

### 8.1 预算

| 指标 | 目标（桌面 4G） |
| --- | --- |
| LCP | < 2.0 s |
| CLS | < 0.05 |
| INP | < 200 ms |
| 首屏 JS（前台） | < 120 KB gzip |
| 首页 HTML | < 60 KB |
| 图片 | 单张 ≤ 300 KB（列表卡） |

### 8.2 手段

- 字体：`next/font/local` 自托管；中文子集按 GB2312 常用字 + 站点文案生成；`font-display: swap`；标题字体预加载 1 个 woff2。
- 图片：`next/image`；固定宽高比占位防 CLS；列表 `sizes="(max-width: 768px) 100vw, 33vw"`；首屏 1 张 `priority`。
- JS：展示页不引入客户端库；Radix 仅在后台打包（路由级 code split）。
- 查询：索引见 07；列表不取大字段；首页计数 `groupBy`。
- 缓存：ISR + 主动失效；静态资源 immutable。
- 动画：只动 `transform/opacity`；`prefers-reduced-motion` 直接关闭。

### 8.3 索引（与 07 对齐）

- `Work.slug` unique；`Work(status, publishedAt desc)`；`Work(categoryId, sortOrder)`；`Work(isFeatured, sortOrder)`；`Work(updatedAt)`。
- `Category.slug` unique；`Category(isVisible, sortOrder)`。
- `Media.createdAt desc`。

---

## 9. SEO

| 项 | 实现 |
| --- | --- |
| title | 模板 `%s · 留白集`；首页用站点名 + 身份行 |
| description | 页面级；作品用摘要；关于用简介前 120 字 |
| canonical | 每页绝对 URL；`/works?type=x` 指向自身（保留筛选可索引），`page>1` 指向自身并 `noindex,follow` |
| OG | 作品用封面 1200×630 裁切；其余用 `og-default.png`；`twitter:card=summary_large_image` |
| sitemap | 静态页 + 已发布作品 + 可见分类；`lastModified` 用 `updatedAt` |
| robots | 允许前台；`Disallow: /admin`、`/api`、`/uploads`；`Sitemap:` 绝对地址 |
| JSON-LD | 首页/关于 `Person`；详情 `CreativeWork` + `BreadcrumbList`；不含虚假评分 |
| 语义 | 每页一个 `h1`；作品卡用 `article`；导航 `nav[aria-label]` |
| 404 | 返回 404 状态；提供搜索/返回作品 |

---

## 10. 部署（Docker）

### 10.1 镜像

```dockerfile
# 多阶段：deps → builder → runner
FROM node:22-alpine AS base
# pnpm via corepack
# builder: pnpm install --frozen-lockfile && pnpm prisma generate && pnpm build
# runner: 仅 standalone + public + prisma
```

- `next.config.ts` 设 `output: 'standalone'`。
- 运行用户非 root（`node`）。
- 暴露 3000；`HEALTHCHECK` 请求 `/api/health`。
- 时区 `TZ=Asia/Shanghai`（展示层仍显式格式化）。

### 10.2 启动

```
docker compose up -d
  → entrypoint: prisma migrate deploy
  → 若 User 表为空且提供 ADMIN_*：执行 seed
  → node server.js
```

### 10.3 卷与备份

| 挂载 | 内容 |
| --- | --- |
| `./data` → `/app/data` | `app.db`、`uploads/` |

备份（每日 cron）：

```
sqlite3 data/app.db ".backup 'backup/app-$(date +%F).db'"
tar -czf backup/uploads-$(date +%F).tar.gz data/uploads
find backup -mtime +30 -delete
```

恢复：停容器 → 还原 db 与 uploads → 起容器 → 抽查首页/详情/后台登录。备份文件异地保存一份。

### 10.4 反向代理

Caddy 自动 HTTPS：

```
liubai.example.com {
  encode zstd gzip
  reverse_proxy app:3000
}
```

- 代理层限制请求体 110 MB（略高于视频上限）。
- 静态资源可加 `Cache-Control`；`/uploads` 已由应用设置。

---

## 11. 日志与可观测

- 应用日志：JSON 行，字段 `ts/level/msg/requestId/route/status/durationMs`；写 stdout，由 Docker 收集。
- 错误：`error.tsx` 上报到 `/api/log`（P1）或仅控制台；生产隐藏细节。
- 健康检查：`GET /api/health` 返回 `{ ok, db, uptime }`；DB 查询 `SELECT 1`。
- 审计：P1 的 `AuditLog` 记录登录、发布、删除、设置变更；保留 90 天。

---

## 12. 测试策略（与 10 呼应）

| 层 | 工具 | 覆盖 |
| --- | --- | --- |
| 单元 | Vitest | slug 生成/校验、Block schema 解析、上传类型判断、日期格式化、密码策略 |
| API | Vitest + 测试库 | 未登录 401、校验 422、slug 冲突 409、删除分类 409、上传超限 413 |
| 组件 | Testing Library | 表单错误展示、块编辑器增删、弹窗焦点 |
| E2E | Playwright | 登录 → 新建 → 发布 → 前台可见 → 编辑 → 删除；筛选；键盘路径 |
| 视觉 | Playwright 截图 | 首页/列表/详情/关于/后台 5 页，1440×900；另拍 390/768/1024/1280/1920 响应式 |
| 可访问性 | axe-core | 上述页面 critical 为 0 |

---

## 13. 风险与对策

| 风险 | 影响 | 对策 |
| --- | --- | --- |
| SQLite 单写 | 并发保存排队 | WAL + busy_timeout；单管理员场景足够；预留 PostgreSQL 迁移 |
| 本地磁盘 | 容器重建丢文件 | 强制挂载卷；备份脚本；文档写明 |
| 中文字体体积 | 首屏慢 | 子集化；系统字体兜底；只预加载标题字重 |
| 图片体积 | LCP 差 | 上传即转 WebP；`next/image` 按需多档；列表用缩略图 |
| 单管理员 | 无法协作 | 明确范围；P1 可加多用户，schema 已留 `role` |
| 无 CDN | 异地访问慢 | 首版可接受；P1 接 CDN 只需改 `SITE_URL` 与媒体域名 |
| 视频大文件 | 磁盘与带宽 | 默认引导外链；本地上传仅 ≤100 MB |
| 依赖升级 | 破坏构建 | 锁定 minor；每季度升级一次并跑全量测试 |

---

## 14. 架构决策记录索引

详细 ADR 见 `12-decisions.md`。本文涉及的关键决策：

- ADR-002 Next.js 全栈单体
- ADR-003 SQLite + Prisma
- ADR-004 内容用 Block JSON
- ADR-005 写操作走 Route Handler
- ADR-006 本地存储 + 适配器
- ADR-007 单管理员加密 Cookie 会话
- ADR-009 RSC 优先、最小水合
- ADR-011 视频外链优先
