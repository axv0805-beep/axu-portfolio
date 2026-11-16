# 08 · API 设计

> 版本 v0.1 · 2026-11-09 · 状态：待评审
> 技术栈：Next.js 15 App Router Route Handlers（Node.js runtime）+ Zod + iron-session；请求与响应一律 JSON。

---

## 1. 约定

本节回答：接口长什么样，什么算破坏性变更。

| 项 | 约定 |
| --- | --- |
| 风格 | REST；资源用复数名词；动作仅 `bulk`、`reorder`、`login`、`logout` |
| 前缀 | `/api/auth/*`、`/api/public/*`、`/api/admin/*`、`/api/health` |
| 编码 | `Content-Type: application/json; charset=utf-8`；请求与响应均 UTF-8 |
| 时间 | ISO 8601 UTC，毫秒精度，如 `2026-11-09T00:41:53.000Z`；展示层转 `Asia/Shanghai` |
| ID | cuid 字符串；不暴露自增序号 |
| 版本 | 不加 `/v1`；新增可选字段视为兼容；破坏性变更新增路径 `/api/public/v2/...`，旧路径保留一个版本周期 |
| 方法 | GET 读取、POST 创建或动作、PATCH 局部更新、PUT 整份替换、DELETE 删除 |
| 状态码 | 创建 201；读取、更新、删除 200；不用 204，统一带包络；响应头 `X-Request-Id`（uuid），错误体不含堆栈 |
| 未知字段 | 请求体未知字段拒绝（Zod strict，422）；未知 query 参数忽略 |
| 布尔 | query 只接受 `true`、`false`，不接受 `1`、`0` |
| 分页 | `page` 从 1 开始；公开默认 12、最大 48；后台默认 20、最大 100 |
| 运行时 | 全部 `export const runtime = 'nodejs'`（bcrypt、fs、sharp） |

## 2. 统一响应包络

本节回答：成功、失败、分页三种响应分别长什么样。

- 成功：`{"ok":true,"data":...}`；HTTP 2xx。
- 失败：`{"ok":false,"error":{code,message,fields?}}`；HTTP 与 `code` 对应，禁止 200 包错误。
- `fields` 只在 422 出现，键为点号字段路径（如 `content.0.alt`），值为第一条中文错误。
- 分页：`data` 固定为 `{items,total,page,pageSize,totalPages}`；`totalPages = total === 0 ? 0 : ceil(total / pageSize)`。

```json
{"ok":true,"data":{"id":"clx9k2f3a0000qwer1s2t3u4v"}}
```

```json
{"ok":false,"error":{"code":"VALIDATION_ERROR","message":"有 2 项内容需要修改。","fields":{"title":"标题不能为空。","slug":"链接地址只能使用小写字母、数字和连字符。"}}}
```

## 3. 鉴权

本节回答：管理员怎么登录、会话如何保持、失败如何限流。

| 接口 | 方法 | 鉴权 | 用途 | FR |
| --- | --- | --- | --- | --- |
| `/api/auth/login` | POST | 无 | 用户名密码登录 | FR-12 |
| `/api/auth/logout` | POST | 登录 | 退出并清 Cookie | FR-12 |
| `/api/auth/me` | GET | 登录 | 当前会话信息 | FR-12 |

**登录**

```json
{"username":"admin","password":"your-password"}
```

成功后 `200`，`Set-Cookie: portfolio_session=...`：

```json
{"ok":true,"data":{"user":{"id":"clx...","username":"admin","displayName":"留白","role":"admin"},"expiresAt":"2026-11-16T00:41:53.000Z"}}
```

规则：

- 用户不存在与密码错误返回同一句「用户名或密码不正确。」（401 `UNAUTHORIZED`），比较使用 bcrypt，账号不存在时也执行一次假比较，避免时间侧信道。
- 限流键 `IP + ':' + username.toLowerCase()`，5 次失败 / 15 分钟；成功登录清零；超限 429，`Retry-After: 900`。单进程内存 Map 即可，多实例时换 Redis。
- 登录成功写 `lastLoginAt`，会话封印 7 天；`GET /api/auth/me` 每次比对 `epoch` 与 `User.sessionEpoch`，不一致清 Cookie 并 401。
- `logout` 幂等：无论是否已登录都清 Cookie 并返回 200。
- 修改密码成功后 `sessionEpoch + 1`，重新签发当前 Cookie，其他设备在下一次请求时 401（FR-23）。
- 后台页面未登录 302 到 `/admin/login?next=...`；`/api/admin/**` 未登录一律 401，不重定向。

**Cookie 属性**：名 `portfolio_session`；`HttpOnly`；`SameSite=Lax`；生产 `Secure`（开发否）；`Path=/`；`Max-Age=604800`（7 天）。

**Origin 校验**：所有写接口（POST、PATCH、PUT、DELETE）若带 `Origin`，必须等于 `APP_ORIGIN`，否则 403 `FORBIDDEN`。缺少 `Origin` 的请求（curl、服务端调用）放行，浏览器跨站请求必带 Origin，因此不影响防护。v1 不使用 CSRF Token，因为 `SameSite=Lax` + Origin 校验已覆盖目标场景；引入跨站嵌入时再评估。

## 4. 公开接口

本节回答：前台页面需要哪些只读数据，草稿如何隔离。

| 接口 | 方法 | 返回 | 页面 | FR |
| --- | --- | --- | --- | --- |
| `/api/public/profile` | GET | 个人资料、导航、页脚配置 | P-01、P-05 | FR-01、FR-07 |
| `/api/public/categories` | GET | 可见分类与作品数 | P-01、P-02、P-03 | FR-02 |
| `/api/public/works` | GET | 已发布作品分页 | P-02、P-03 | FR-04 |
| `/api/public/works/[slug]` | GET | 详情、内容块、上一件/下一件 | P-04 | FR-05、FR-06 |

公开接口只读 `status = published`；草稿、隐藏分类、未知 slug 一律 404，不泄露存在性。

### 4.1 GET /api/public/profile

无参数。`data` 含 `profile`、`nav`、`footer`；只暴露 `07` 文档 3.6 的白名单键，不返回数据库字段与密钥。

```json
{"ok":true,"data":{"profile":{"siteName":"留白集","siteNameEn":"LIUBAI","ownerName":"留白","roleLine":"AIGC 创作者 · 视觉设计","heroEyebrow":"PORTFOLIO 2026","tagline":"用模型做原画、影像与小说，也记录过程。","bio":"……","avatarUrl":"/uploads/2026/11/avatar.webp","email":"hello@example.com","location":"杭州","availability":"开放合作","socials":[{"label":"GitHub","url":"https://github.com/liubai"}],"footerNote":"作品与过程，都留在这里。","aboutTools":["Midjourney","ComfyUI","Runway","Suno","Cursor"],"timeline":[{"year":2023,"title":"开始用生成模型做原画","description":"从 Midjourney 开始"}]},"nav":{"home":true,"works":true,"about":true},"footer":{"icp":"浙ICP备 2026000000 号"}}}
```

### 4.2 GET /api/public/categories

```json
{"ok":true,"data":{"items":[{"id":"clx...","slug":"ai-painting","name":"AI 原画","nameEn":"AI Painting","description":"以图像模型完成的静帧作品。","sortOrder":1,"workCount":12}]}}
```

- 只返回 `isVisible = true`；`workCount` 统计已发布作品，实时 `groupBy`，不读缓存计数字段。
- 空分类也返回（前台需要展示空态，AC-07）；按 `sortOrder` 升序，相同按 `createdAt` 升序。

### 4.3 GET /api/public/works

| 参数 | 类型 | 默认 | 规则 |
| --- | --- | --- | --- |
| `type` | string | 无 | 分类 slug；不存在或隐藏返回 404，不返回空列表 |
| `page` | int | 1 | ≥ 1 |
| `pageSize` | int | 12 | 1–48；分类页与总览共用 |
| `featured` | boolean | 无 | `true` 只取精选；`false` 只取非精选 |

排序固定 `sortOrder ASC, publishedAt DESC`（BR-04）。响应项不含 `content`，详情才返回块。

```json
{"ok":true,"data":{"items":[{"id":"clx...","slug":"chaoxi","title":"潮汐","summary":"一张潮汐表长成的海。","coverUrl":"/uploads/2026/11/cover-01.webp","coverAlt":"暖灰色海面与一道白色浪线","year":2026,"category":{"id":"clx...","slug":"ai-painting","name":"AI 原画"},"tags":["海","生成"],"isFeatured":true,"publishedAt":"2026-09-12T04:00:00.000Z"}],"total":30,"page":2,"pageSize":12,"totalPages":3}}
```

### 4.4 GET /api/public/works/[slug]

返回完整作品与相邻作品。`prev` / `next` 按全站已发布作品的 `sortOrder ASC, publishedAt DESC` 取相邻项，边界为 `null`；不跨草稿。

```json
{"ok":true,"data":{"work":{"id":"clx...","slug":"chaoxi","title":"潮汐","summary":"一张潮汐表长成的海。","coverUrl":"/uploads/2026/11/cover-01.webp","coverAlt":"暖灰色海面与一道白色浪线","year":2026,"tools":["Midjourney","Photoshop"],"tags":["海","生成"],"role":"概念 / 生成","client":null,"category":{"id":"clx...","slug":"ai-painting","name":"AI 原画"},"content":[{"id":"b_01","type":"paragraph","version":1,"text":"这张图从一张潮汐表开始。"}],"viewCount":128,"publishedAt":"2026-09-12T04:00:00.000Z","updatedAt":"2026-10-02T09:30:00.000Z"},"prev":{"slug":"shanwen","title":"山纹"},"next":{"slug":"changye","title":"长夜漫游"}}}
```

- `viewCount` 在响应返回后异步 `+1`；页面缓存命中不计数，因此是近似值，不在 UI 标注「精确阅读量」。
- 404 文案：「没有找到这件作品，它可能已被删除或尚未发布。」

## 5. 后台接口

本节回答：管理员的每个操作调用哪个接口，请求与响应长什么样。

除 `/api/auth/*` 外均需登录；全部写接口做 Origin 校验。

| 接口 | 方法 | 用途 | FR |
| --- | --- | --- | --- |
| `/api/admin/stats` | GET | 概览统计与最近编辑 | FR-13 |
| `/api/admin/works` | GET、POST | 列表、新建 | FR-14、FR-15 |
| `/api/admin/works/[id]` | GET、PATCH、DELETE | 读取、更新、硬删除 | FR-15 |
| `/api/admin/works/bulk` | POST | 批量发布、转草稿、删除 | FR-18 |
| `/api/admin/works/reorder` | POST | 保存作品排序 | FR-15 |
| `/api/admin/categories` | GET、POST | 分类列表、新建 | FR-19 |
| `/api/admin/categories/[id]` | PATCH、DELETE | 改名、显隐、删除 | FR-19 |
| `/api/admin/categories/reorder` | POST | 分类排序 | FR-19 |
| `/api/admin/upload` | POST | 上传图片或视频 | FR-20 |
| `/api/admin/media` | GET、DELETE | 媒体库列表、删除 | FR-24 |
| `/api/admin/profile` | GET、PUT | 个人资料 | FR-21 |
| `/api/admin/settings` | GET、PUT | 站点设置 | FR-22 |
| `/api/admin/account/password` | POST | 修改密码 | FR-23 |
| `/api/health` | GET | 健康检查（公开） | — |

### 5.1 作品列表与新建

`GET /api/admin/works` 参数：`q`（标题或摘要 contains，≤ 80）、`categoryId`、`status`（draft 或 published）、`page`、`pageSize`（默认 20，最大 100）。按 `updatedAt DESC` 排序，项含 `id`、`title`、`slug`、`status`、`isFeatured`、`sortOrder`、`coverUrl`、`category`、`updatedAt`。

`POST /api/admin/works`：`slug` 可省略，由标题转拼音生成；`status` 默认 `draft`，传 `published` 时按发布校验。

```json
{"title":"潮汐","slug":"chaoxi","categoryId":"clx...","summary":"一张潮汐表长成的海。","coverUrl":"/uploads/2026/11/cover-01.webp","coverAlt":"暖灰色海面与一道白色浪线","year":2026,"tools":["Midjourney"],"tags":["海","生成"],"role":"概念 / 生成","client":null,"status":"draft","isFeatured":false,"sortOrder":10,"content":[{"id":"b_01","type":"paragraph","version":1,"text":"这张图从一张潮汐表开始。"}]}
```

成功 `201`，`data.work` 为完整对象（含 `id`、最终 `slug`、`createdAt`、`updatedAt`）。slug 冲突 409 `SLUG_CONFLICT`；校验失败 422。

### 5.2 读取、更新、删除单件

- `GET /api/admin/works/[id]`：返回完整作品（含草稿与内容块），供编辑器回填。
- `PATCH /api/admin/works/[id]`：局部更新，`updatedAt` 必填（ISO 字符串），其余字段可选；服务端比较毫秒级时间戳，不一致返回 409 `STALE_UPDATE`，消息带服务器当前时间。状态改为 `published` 时，用「现有值 + 本次补丁」做完整发布校验。slug 修改成功后旧链接立即 404，后台需二次确认。
- `DELETE /api/admin/works/[id]`：硬删除，返回 `{"ok":true,"data":{"id":"clx...","deleted":true}}`；不存在 404。不删除封面媒体，避免误伤复用。

### 5.3 批量操作

`POST /api/admin/works/bulk`：

```json
{"ids":["clx1","clx2","clx3"],"action":"draft"}
```

- `ids` 1–100 个、去重；`action` 为 `publish`、`draft`、`delete`。
- 逐条独立事务，允许部分成功；HTTP 200，`data` 为 `{succeeded:["clx1"],failed:[{"id":"clx2","code":"VALIDATION_ERROR","message":"缺少封面，无法发布。"}]}`。
- 发布失败的项保持原状态；删除失败的项保持存在。UI 按 `failed` 明细提示，不整批回滚。

### 5.4 作品排序

`POST /api/admin/works/reorder`：

```json
{"items":[{"id":"clx1","sortOrder":10},{"id":"clx2","sortOrder":20}]}
```

- 1–200 项，id 不得重复，`sortOrder` 0–9999；整批事务，任一项不存在返回 404 且全部不生效。
- 成功 `{"ok":true,"data":{"updated":2}}`。

### 5.5 分类

- `GET /api/admin/categories`：含隐藏分类，返回 `workCount`（全部）与 `publishedCount`，按 `sortOrder` 升序。
- `POST /api/admin/categories`：`slug` 必填且创建后不可改；`name`、`nameEn` 必填；`description`、`sortOrder`、`isVisible` 可选。201。
- `PATCH /api/admin/categories/[id]`：只接受 `name`、`nameEn`、`description`、`sortOrder`、`isVisible`；传 `slug` 返回 422「分类链接创建后不可修改」。
- `DELETE /api/admin/categories/[id]`：先 count 全部作品（含草稿），大于 0 返回 409 `CATEGORY_IN_USE`；成功返回 `{id,deleted:true}`。
- `POST /api/admin/categories/reorder`：结构同 5.4，1–100 项。

### 5.6 上传

`POST /api/admin/upload`，`multipart/form-data`，字段名 `file`，单请求一个文件。详见第 9 节。

```json
{"ok":true,"data":{"id":"clx...","url":"/uploads/2026/11/9f3c2a1b.webp","storageKey":"2026/11/9f3c2a1b.webp","originalName":"tide.webp","mime":"image/webp","size":482133,"width":1600,"height":2000}}
```

### 5.7 媒体库

- `GET /api/admin/media`：`page`、`pageSize`（默认 24）、`type`（image 或 video），按 `createdAt DESC`；每项含 `url`、`originalName`、`mime`、`size`、`width`、`height`、`createdAt`、`usageCount`（扫描作品封面与块引用，≤ 500 件可接受）。`DELETE /api/admin/media/[id]`：被任何作品封面或块引用时 409 `MEDIA_IN_USE`，消息带引用数；未引用则删记录后删文件，返回 `{id,deleted:true}`。

### 5.8 个人资料

- `GET /api/admin/profile`：返回完整资料，含 `aboutTools`、`timeline`、`availability`。`PUT /api/admin/profile`：整份提交；可空字段缺省视为 `null`，`socials`、`aboutTools`、`timeline` 缺省视为 `[]`；校验长度与 URL，成功返回更新后的资料。

### 5.9 站点设置

- `GET /api/admin/settings`：返回 `{"site.description":"...","seo.keywords":[],"seo.ogImage":"/og-default.png","nav":{...},"footer.icp":""}`。`PUT /api/admin/settings`：按键局部 upsert，未提供的键不变（与严格 PUT 语义不同，换取表单分块保存）；未知键 422，值类型不符 422 `fields` 指向键名。

### 5.10 修改密码

`POST /api/admin/account/password`，请求体 `{"oldPassword":"old-password","newPassword":"new-password-12"}`。旧密码错误 422（`fields.oldPassword`），新密码 10–72 位且不得与旧密码相同；成功后 `sessionEpoch + 1`，当前会话续签，其他会话失效。

### 5.11 概览与健康检查

- `GET /api/admin/stats`：`{total,published,drafts,categories,recent:[{id,title,status,updatedAt}]}`，`recent` 取最近编辑 5 条（A-02）。`GET /api/health`：公开、无鉴权、`no-store`；数据库可用返回 200 `{"ok":true,"data":{"status":"ok","db":"ok","uptime":1234,"version":"0.1.0","time":"..."}}`，不可用返回 503 `INTERNAL_ERROR`，不返回路径、连接串与环境变量。

## 6. 写接口校验规则

本节回答：每个字段的边界由谁定义、返回什么错误。

| 接口 | 字段 | 规则 |
| --- | --- | --- |
| 登录 | `username`、`password` | username 1–32，trim 后转小写；password 1–72；错误不区分账号不存在与密码错误 |
| 作品新建/更新 | `title` | 1–80 字符，trim，不可全空白 |
| 作品新建/更新 | `slug` | 可省略；提供时 `^[a-z0-9]+(?:-[a-z0-9]+)*$`，2–80，非保留字 |
| 作品新建/更新 | `summary` | ≤ 120 字符 |
| 作品新建/更新 | `categoryId` | cuid，必须存在 |
| 作品新建/更新 | `coverUrl`、`coverAlt`、`featuredCoverUrl` | URL 白名单；`coverAlt` 1–120；`featuredCoverUrl` 可空，仅首页精选使用；发布时 `coverUrl`/`coverAlt` 必填 |
| 作品新建/更新 | `year` | 整数 1990–2100 |
| 作品新建/更新 | `tools`、`tags` | 数组 ≤ 8；单条 ≤ 24（tags ≤ 20）；去重，去首尾空格 |
| 作品新建/更新 | `role`、`client`、`status`、`isFeatured`、`sortOrder` | role/client ≤ 40 可空；status 枚举；isFeatured 布尔；sortOrder 0–9999 |
| 作品新建/更新 | `content` | 数组 ≤ 100；序列化 ≤ 256 KB；按 07 文档第 5 节逐块校验；未知块原样回传才允许 |
| 作品更新 | `updatedAt` | 必填 ISO 8601；与服务端毫秒值相等，否则 409 `STALE_UPDATE` |
| 批量 | `ids`、`action` | 1–100 个唯一 id；action 为 publish、draft、delete |
| 排序 | `items` | 1–200 项；id 唯一且存在；sortOrder 0–9999 |
| 分类新建/更新 | `slug`、`name`、`nameEn` | 新建 slug 2–40 且不重复；更新时提交 slug 即 422；name 1–20；nameEn ≤ 40 |
| 分类更新 | `name`、`nameEn`、`description`、`sortOrder`、`isVisible` | 长度同 07 文档；sortOrder 0–9999 |
| 上传 | `file` | 恰好 1 个；图片 ≤ 10 MB，视频 ≤ 100 MB；MIME 与魔数双检 |
| 资料 | 文本字段、`socials`、`aboutTools`、`timeline` | 长度按 07 文档 3.2；`aboutTools` ≤ 12；`timeline` ≤ 8；`availability` ≤ 20；socials 的 url 为 https 或 mailto；timeline 的 year 为数字 |
| 设置 | 键与值 | 仅 07 文档 3.6 的 5 个键；类型与长度按表 |
| 改密 | `oldPassword`、`newPassword` | 10–72 字符；新密码不得等于旧密码 |

**URL 白名单**：

| 场景 | 允许 | 拒绝 |
| --- | --- | --- |
| 封面、图片、音频、海报 | 以 `/uploads/` 开头的站内路径，或 `https://` | `http://`、`data:`、`javascript:`、`file:`、协议相对 `//` |
| 视频外链 | `bilibili.com`、`youtube.com`、`youtu.be` 的页面 URL | 其他域名、直链 iframe、带 `javascript:` 的 URL |
| 链接块 | `https://` | 非 https、内网地址（10./172.16./192.168./127.） |
| 社交链接 | `https://` 或 `mailto:` | 其他协议 |

文本块（`paragraph`、`quote`）存 Markdown 原文，写入时拒绝 `<script>`、`<iframe>`、`<style>`、`on*=`；渲染时再过一次白名单清洗（BR-09）。

## 7. 错误码总表

本节回答：前端拿到错误后该展示什么、该不该重试。

| code | HTTP | 用户可读 message 示例 | 典型场景 | 可重试 |
| --- | --- | --- | --- | --- |
| `UNAUTHORIZED` | 401 | 请先登录后再操作。 | 未登录、会话过期、epoch 不符 | 登录后 |
| `FORBIDDEN` | 403 | 没有权限执行此操作。 | Origin 不匹配、角色不足 | 否 |
| `NOT_FOUND` | 404 | 没有找到这件作品，它可能已被删除或尚未发布。 | 作品、分类、媒体不存在 | 否 |
| `VALIDATION_ERROR` | 422 | 有 2 项内容需要修改。 | 字段缺失、超长、类型错、发布校验失败 | 修正后 |
| `SLUG_CONFLICT` | 409 | 链接地址「chaoxi」已被占用，请换一个。 | 作品或分类 slug 重复 | 改名后 |
| `CATEGORY_IN_USE` | 409 | 该分类下还有 3 件作品，先移动或删除后再试。 | 删除非空分类 | 否 |
| `MEDIA_IN_USE` | 409 | 这张图片正被 2 件作品使用，先移除引用后再删除。 | 删除被引用媒体 | 否 |
| `PAYLOAD_TOO_LARGE` | 413 | 图片不能超过 10 MB，请压缩后重试。 | 上传超限 | 压缩后 |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | 不支持 SVG 或该文件格式，请上传 JPEG、PNG、WebP 或 AVIF。 | MIME 或魔数不符 | 换文件 |
| `RATE_LIMITED` | 429 | 尝试次数过多，请 15 分钟后再试。 | 登录失败超限 | 15 分钟后 |
| `INTERNAL_ERROR` | 500 | 服务暂时不可用，请稍后重试。 | 未捕获异常、数据库不可用 | 是 |
| `STALE_UPDATE` | 409 | 这件作品已在 2026-11-09T08:41:53.000Z 被更新，请刷新后再保存。 | 乐观锁冲突 | 刷新后 |

补充：409 的 `STALE_UPDATE` 是 07 文档乐观锁的配套码，不在原始错误码清单内，但前端必须处理。所有 5xx 记录 `X-Request-Id` 到服务端日志，响应不返回堆栈。

## 8. 缓存与失效

本节回答：哪些响应可以缓存、写操作后如何让前台立刻更新。

| 接口 | Cache-Control | 缓存标签 | 失效时机 |
| --- | --- | --- | --- |
| `GET /api/public/profile` | `public, s-maxage=300, stale-while-revalidate=600` | `profile` | 资料、设置保存后 |
| `GET /api/public/categories` | `public, s-maxage=300, stale-while-revalidate=600` | `categories` | 分类增删改、作品发布状态变化 |
| `GET /api/public/works` | `public, s-maxage=60, stale-while-revalidate=300` | `works` | 作品增删改、发布、排序 |
| `GET /api/public/works/[slug]` | `public, s-maxage=300, stale-while-revalidate=600` | `work:<slug>`、`works` | 该作品更新或删除 |
| `GET /api/admin/**` | `private, no-store` | 无 | 不缓存 |
| `/uploads/**` | `public, max-age=31536000, immutable` | 无 | 文件名含 uuid，不覆盖 |

写操作成功后按标签失效：作品写 `revalidateTag('works')` + `revalidateTag('work:' + slug)`，分类写 `revalidateTag('categories')` + `revalidateTag('profile')`（导航含分类），资料写 `revalidateTag('profile')`，设置写 `revalidateTag('profile')` 与 `revalidateTag('categories')`。同时 `revalidatePath('/')`、`revalidatePath('/works')` 与受影响的详情页。

公开 Route Handler 用 `unstable_cache` 或 `fetch` 标签；后台路由 `export const dynamic = 'force-dynamic'`，避免 Next 在构建期静态化。CDN 若另接一层，部署脚本按 URL 前缀清缓存，不依赖客户端。

## 9. 上传协议

本节回答：文件如何传、如何验、落在哪里、失败怎么清理。

| 项 | 规则 |
| --- | --- |
| 方法与路径 | `POST /api/admin/upload` |
| Content-Type | `multipart/form-data` |
| 字段名 | `file`，单请求恰好 1 个；批量由客户端循环 |
| 图片上限 | 10 MB（10 × 1024 × 1024 字节）；先看 `Content-Length`，超限直接 413，不读流 |
| 视频上限 | 100 MB；仍优先外链 |
| 允许图片 | `image/jpeg`、`image/png`、`image/webp`、`image/avif` |
| 允许视频 | `video/mp4`、`video/webm` |
| 禁止 | SVG（即使 MIME 伪装也拒绝）、GIF、TIFF、可执行文件、双扩展名 |
| 存储路径 | `data/uploads/YYYY/MM/{uuid}.{ext}`；`ext` 由魔数推断，不采用原始文件名 |
| 原文件名 | 去路径、去控制字符，截 255 字符，只写 `originalName` 字段 |
| 图片处理 | `sharp` 读取方向、剥离 EXIF、重编码后写盘；不改尺寸，多尺寸交给 `next/image` 运行时生成 |
| 视频处理 | 不转码；`ffprobe` 可用则读宽高，失败写 null |
| 写入方式 | 先写临时文件并校验，再原子 `rename` 到目标路径；失败删除临时文件 |
| 返回 | 201，含 `id`、`url`、`storageKey`、`originalName`、`mime`、`size`、`width`、`height` |

**魔数校验**（读取前 12 字节）：JPEG `FF D8 FF`；PNG `89 50 4E 47 0D 0A 1A 0A`；WebP 以 `RIFF` 开头且第 8–11 字节为 `WEBP`；AVIF 第 4–11 字节含 `ftyp` 与 `avif` 品牌；MP4 第 4–7 字节为 `ftyp`、品牌 isom/mp42 等；WebM `1A 45 DF A3`。MIME 与魔数任一不符即 415；图片魔数通过后再用 `sharp` 解码，解码失败同样 415。`Content-Length` 缺失时边读边计数，超限立即断开并 413。

## 10. 并发与幂等

本节回答：两个人同时改一件作品、重复点击、部分失败时，服务端如何保证可预期。

- **乐观锁**：`PATCH /api/admin/works/[id]` 必须带客户端读取到的 `updatedAt`；服务端在事务内 `WHERE id = ? AND updatedAt = ?` 更新，影响行数 0 返回 409 `STALE_UPDATE`。编辑器冲突时暂停自动保存（FR-25），提供「刷新并丢弃我的修改」与「另存为新作品」两个动作，不做自动合并。
- **批量部分失败**：逐条事务，返回 `succeeded` 与 `failed` 明细；HTTP 仍是 200，因为请求本身被正确处理。UI 汇总「成功 2 件，失败 1 件」并列出原因。
- **排序**：整批事务，任一 id 不存在则全部回滚并 404；避免前台出现半套顺序。
- **删除**：重复删除同一 id 第二次返回 404；UI 可把 404 当作「已经不存在」继续刷新列表。删除不可撤销，二次确认只在 UI 层，服务端不要求确认字符串。
- **创建与上传**：均非幂等；slug 唯一约束阻止重复提交产生两条相同链接，冲突返回 409，前端提示改名而不是自动重试；重复上传产生两个文件，v1 不做内容哈希去重。
- **重试策略**：GET 可自动重试；写请求网络超时后先 `GET` 核对结果，再决定是否重发；不对 4xx 自动重试。

## 11. 接口与页面、FR 的映射

本节回答：每个页面对应哪些数据契约，避免出现「页面有区域但没有数据来源」。

前台页面是 RSC，直接调用 `src/lib/db/*` 查询函数；下表接口是同一数据契约，供客户端交互、外部调用与契约测试使用，页面不通过 HTTP 调自己的 API。

| 页面 | 路由 | 数据契约 / 接口 | 对应 FR |
| --- | --- | --- | --- |
| 首页 | `/` | `GET /api/public/profile`、`GET /api/public/categories`、`GET /api/public/works?featured=true&pageSize=3` | FR-01、FR-02、FR-03 |
| 作品总览 | `/works` | `GET /api/public/works`、`GET /api/public/categories` | FR-04 |
| 分类展示 | `/works?type=x` | `GET /api/public/works?type=x`、`GET /api/public/categories` | FR-04 |
| 作品详情 | `/works/[slug]` | `GET /api/public/works/[slug]` | FR-05、FR-06、FR-10 |
| 关于 | `/about` | `GET /api/public/profile`（含 `aboutTools`、`timeline`） | FR-07 |
| 登录 | `/admin/login` | `POST /api/auth/login` | FR-12 |
| 概览 | `/admin` | `GET /api/admin/stats` | FR-13 |
| 作品列表 | `/admin/works` | `GET /api/admin/works`、`POST /api/admin/works/bulk`、`POST /api/admin/works/reorder` | FR-14、FR-18 |
| 新建作品 | `/admin/works/new` | `GET /api/admin/categories`、`POST /api/admin/works`、`POST /api/admin/upload` | FR-15、FR-16、FR-20 |
| 编辑作品 | `/admin/works/[id]` | `GET /api/admin/works/[id]`、`PATCH /api/admin/works/[id]`、`POST /api/admin/upload` | FR-15、FR-16、FR-17 |
| 分类管理 | `/admin/categories` | `GET /api/admin/categories`、`POST`、`PATCH`、`DELETE`、`POST /api/admin/categories/reorder` | FR-19 |
| 媒体库 | `/admin/media` | `GET /api/admin/media`、`DELETE /api/admin/media/[id]` | FR-24 |
| 个人资料 | `/admin/profile` | `GET /api/admin/profile`、`PUT /api/admin/profile` | FR-21 |
| 站点设置 | `/admin/settings` | `GET /api/admin/settings`、`PUT /api/admin/settings`、`PUT /api/admin/profile`（`footerNote`） | FR-22 |
| 账号安全 | `/admin/account` | `POST /api/admin/account/password` | FR-23 |
| 站点地图 | `/sitemap.xml` | 服务端直接查库，不走 API | FR-10 |

说明：站点设置页的「页脚文字」编辑入口在设置页，但字段 `footerNote` 存在 `SiteProfile`，所以保存时同时调用资料接口（07 文档 3.2）。`settings.nav` 控制导航显隐，「作品」始终保留（03 文档 2.1）。预览签名链接为 P1，预留 `/api/admin/works/[id]/preview-token`，本期不实现。

## 12. curl 示例

本节回答：不打开浏览器如何完成登录、建作品、上传三件事。

**登录并保存 Cookie**：

```bash
curl -i -c cookies.txt -X POST http://localhost:3000/api/auth/login  -H 'Content-Type: application/json'  -H 'Origin: http://localhost:3000'  -d '{"username":"admin","password":"your-password"}'
```

**创建作品**：

```bash
curl -i -b cookies.txt -X POST http://localhost:3000/api/admin/works  -H 'Content-Type: application/json'  -H 'Origin: http://localhost:3000'  -d '{"title":"潮汐","categoryId":"clx...","coverUrl":"/uploads/2026/11/cover-01.webp","coverAlt":"暖灰色海面","year":2026,"summary":"一张潮汐表长成的海。","status":"draft","content":[{"id":"b_01","type":"paragraph","version":1,"text":"从一张潮汐表开始。"}]}'
```

**上传封面**：

```bash
curl -i -b cookies.txt -X POST http://localhost:3000/api/admin/upload  -H 'Origin: http://localhost:3000'  -F 'file=@./tide.webp;type=image/webp'
```

三个示例都带 `Origin`；缺少 Origin 的 curl 请求会被放行，但建议显式携带以模拟浏览器行为。
