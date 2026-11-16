# 11 · 扩展指南

版本 v0.1 · 2026-11-09 · 状态：待评审 · 上游文档：03 / 04 / 07 / 08 / 09 / 10

> 本文档回答一个问题：**交付之后，下一件事怎么加而不破坏已有交付**。每条扩展固定给出「影响文件 / 预计工时 / 风险」三列，工时按 10 文档的 6 h/天口径估算，供排期直接引用。
>
> 本文只描述步骤与契约，不写实现代码；接口名、字段名、文件路径与 07 / 08 文档保持一致。

## 1. 扩展原则

| # | 原则 | 具体要求 | 违反后果 |
| --- | --- | --- | --- |
| 1 | 先改文档与数据，再改代码 | 先更新 03（URL/结构）、07（字段）、08（接口），评审通过后写迁移 | 代码先行必然出现两套术语 |
| 2 | token 优先 | 新颜色/字号先进 `src/styles/tokens.css`，组件只引用变量 | 主题无法整站替换，见第 5 节 |
| 3 | 不破坏 URL | 已发布作品的 `/works/[slug]` 与分类 `?type=` 永久有效 | 外链与搜索引擎收录失效 |
| 4 | 向后兼容 | 内容块带 `version`；新增字段给默认值；接口只增不改 | 旧数据渲染空白或 500 |
| 5 | 一次一个维度 | 同一迭代不同时改主题 + 数据结构 + 存储后端 | 回归问题无法归因 |
| 6 | 可回滚 | 每次扩展附回滚步骤（迁移 down、开关关闭、文件恢复） | 线上故障只能重装 |

## 2. 新增作品分类（0 代码）

分类是数据不是代码，后台操作即可，**不需要发版**。

| 步 | 操作 | 入口 | 结果 |
| --- | --- | --- | --- |
| 1 | 登录后台 | `/admin/login` | 进入概览 |
| 2 | 新建分类：名称、英文 slug、排序、描述 | `/admin/categories` → 新建 | 列表出现新行 |
| 3 | 确认 slug 规则 | 同 BR-01：小写字母数字连字符 2–80 | 与 URL 直接对应 |
| 4 | 决定导航显隐 | `/admin/settings` → 导航显隐 | 前台导航下拉出现该项 |
| 5 | 给作品归类 | `/admin/works/[id]` → 分类 | 分类页出现该作品 |
| 6 | 首页目录（可选） | `/admin/settings` → 目录顺序 | 首页册页目录同步（≤ 8 行） |

检查清单（新增分类后逐项过一遍）：

- 导航：分类下拉最多 8 项（03 文档：展示分类 1–8 个），超出时后台提示「分类已达上限」，不静默截断。
- 首页：目录行显示编号 + 名称 + 件数；件数为 0 时该行不出现（或按设置显示「筹备中」）。
- 分类页：`/works?type=<slug>` 返回该分类已发布作品，分页 12/页；空分类走空态（AC-07）。
- SEO：分类页 title 为「<分类名> · 留白集」，description 取分类描述；`?page≥2` 输出 `noindex,follow`。
- sitemap：`src/app/sitemap.ts` 自动包含新分类页，无需改代码。
- 删除：分类下有作品时禁止删除（BR-03），提示件数。

| 项 | 内容 |
| --- | --- |
| 影响文件 | 无代码改动；数据变更在 `Category` 表；`docs/03`、`docs/07` 记录新分类约定 |
| 预计工时 | 0.2 h（含前台抽查） |
| 风险 | 低。唯一坑：slug 与既有分类或页面路由冲突（如 `works`、`about`），后台需校验保留字 |

## 3. 新增内容块类型（4 步）

现有 10 种块：段落、标题、图片、图集、视频、音频、引用、提示词、链接、分隔线。新增第 11 种（示例：「对比图」`compare`）按固定四步，缺一步就会出现「后台能存、前台不显示」。

| 步 | 动作 | 文件 | 要点 |
| --- | --- | --- | --- |
| 1 | 类型定义 + Zod 契约 | `src/lib/blocks/types.ts`、`src/lib/blocks/schema.ts`、`src/lib/blocks/compare.ts` | 导出 `CompareBlockSchema`，字段 `{ left, right, caption }`；`version: 1` |
| 2 | 后台编辑器 | `src/components/admin/blocks/compare-editor.tsx`，并在 `block-editor.tsx` 的块类型下拉注册 | 必填字段就地报错；增加/删除/上移/下移沿用统一壳 |
| 3 | 前台渲染器 | `src/components/blocks/compare-block.tsx`，在 `src/components/blocks/block-renderer.tsx` 的 `switch (type)` 注册 | 未知 type 走降级提示，不抛异常 |
| 4 | 样式 + 测试 | `src/styles/blocks.css`（或 Tailwind 组件类）、`src/components/blocks/block-renderer.test.tsx` | 快照 + 键盘可达；390 视口不横向滚动 |

块注册表的形状（只列契约，不写实现）：

- `BLOCK_TYPES`：`{ type: 'compare', label: '对比图', icon, editor, renderer, version: 1 }`。
- 保存时写入 `{ id, type, version, ...专属字段 }`（扁平结构，与 07 第 5 节一致）；读取时先按 `version` 迁移，再交给 renderer。
- 未知 `type` → 前台渲染占位「此内容块暂不支持」，后台保留原始 JSON 不丢数据。

新增块的自检：`pnpm test`（块渲染单测）→ 后台新建一件作品插入该块 → 保存 → 前台详情页顺序正确 → 390 视口与 axe 抽查。

| 项 | 内容 |
| --- | --- |
| 影响文件 | `src/lib/blocks/*`、`src/components/admin/blocks/*`、`src/components/blocks/*`、块样式文件、`docs/07` 块字段表、`docs/06` 编辑器说明 |
| 预计工时 | 3–4 h（简单文本块 2 h；含图片上传与灯箱 5 h） |
| 风险 | 中。旧作品 JSON 无该字段不受影响；风险集中在「漏注册」与「样式未走 token」，用块渲染单测 + `zh_design_lint` 拦截 |

## 4. 新增页面类型（以「收藏」为例）

| 维度 | 做法 |
| --- | --- |
| 路由 | 新增 `/collections`（列表）与 `/collections/[slug]`（详情）；复用 `(site)` 布局，面包屑「首页 / 收藏 / <名称>」 |
| 导航 | `SiteHeader` 的导航项由站点设置驱动；在 `/admin/settings` 增加「收藏」显隐开关，默认隐藏直到有内容 |
| 数据 | 新增 `Collection` 与 `CollectionWork`（多对多）；不复制作品数据，只存引用与排序 |
| SEO | 列表页 title「收藏 · 留白集」；详情页 description 取收藏描述；无内容时返回 404 而非空页 |
| sitemap | `src/app/sitemap.ts` 增加 `/collections` 与全部已发布收藏；草稿收藏不进入 |
| 后台 | `/admin/collections` 列表 + 抽屉编辑 + 作品多选排序；权限与作品一致 |

页面级自检：URL 可分享还原 → 空态 → 未知 slug 404 → 分页 `noindex` 规则 → OG 图使用第一件作品封面。

| 项 | 内容 |
| --- | --- |
| 影响文件 | `src/app/(site)/collections/**`、`prisma/schema.prisma`、`src/lib/db/collections.ts`、`src/components/site/site-header.tsx`、`src/app/sitemap.ts`、`docs/03`、`docs/05`、`docs/07`、`docs/08` |
| 预计工时 | 12–16 h（数据 2 h、后台 5 h、前台 5 h、SEO/测试 2 h） |
| 风险 | 中高。会改动导航与首页结构，必须先在 03 文档确认信息架构，避免与「分类」概念混淆 |

## 5. 更换视觉主题

主题 = `src/styles/tokens.css` 的一组变量，**不改任何组件**。步骤：改 token → 跑对比度校验 → 三档视口目测 → 截图归档。

暖纸（当前）到冷灰（示例）的映射：

| Token | 暖纸（现值） | 冷灰（示例） | 说明 |
| --- | --- | --- | --- |
| `--paper` | `#F5F1E8` | `#F2F3F5` | 页面底色 |
| `--paper-deep` | `#EDE7DB` | `#E7E9ED` | 分区底色 |
| `--surface` | `#FBF8F1` | `#FAFBFC` | 卡片 |
| `--surface-2` | `#F0EBE0` | `#EDEFF2` | 输入框/悬停 |
| `--ink` | `#1D1C19` | `#17191C` | 正文（对比度 ≥ 15:1） |
| `--ink-2` | `#56534B` | `#4E5359` | 次要文字（≥ 7:1） |
| `--ink-3` | `#6E6A5F` | `#686E75` | 辅助文字（≥ 4.5:1） |
| `--line` | `#E1DBCE` | `#DDE0E4` | 分隔线 |
| `--accent` | `#C05B3C` | `#3C6E9E` | 强调色，仅大字与图形 |
| `--accent-ink` | `#9C4527` | `#2E5A83` | 强调文字（≥ 4.5:1） |
| `--deep` | `#23211C` | `#1B1E22` | 深色区 |
| `--on-deep` | `#F4EFE5` | `#F0F2F4` | 深色区文字 |

规则：

- 只改 `src/styles/tokens.css`；组件内出现的 hex 一律视为缺陷（`zh_design_lint` 会报）。
- 每个前景/背景组合必须重新计算对比度；正文 ≥ 4.5:1，大字与图形 ≥ 3:1。
- `--accent` 在两个主题下都只用于 ≥ 24 px 或装饰图形，正文强调一律用 `--accent-ink`。
- 改完必须重拍第 10 文档第 8 节的 15 张截图，否则 D3 与实现不一致。

| 项 | 内容 |
| --- | --- |
| 影响文件 | `src/styles/tokens.css`（唯一）；`docs/04` 记录新主题；截图目录整体重拍 |
| 预计工时 | 2–4 h（含对比度校验与截图） |
| 风险 | 中。浅色 token 改动会连带影响 focus ring、禁用态与图表颜色；必须全量对比度重测，不能只改 4 个主色 |

## 6. 中英双语

| 步 | 内容 |
| --- | --- |
| 1 | 引入 `next-intl`，路由改为 `/`（zh，默认，不加前缀）与 `/en`（前缀）；`middleware.ts` 做 locale 解析 |
| 2 | 文案抽到 `messages/zh.json`、`messages/en.json`；组件内禁止硬编码中文（AGENTS 已约定） |
| 3 | 内容双语：短字段沿用 07 已有的 `*En` 列（`Category.nameEn`、`SiteProfile.siteNameEn`）；长正文（`Work.title/summary/content`、`SiteProfile.bio`）统一按 `locale` 分行（`WorkTranslation` 表或 `locale` 列），**不**继续加 `*En` 列；首版不建 `locale`，迁移时再加 |
| 4 | 迁移：先加可空列 / `locale` 列 → 存量回填 `zh` → 再加唯一索引或非空约束；seed 同时生成中英两条 |
| 5 | SEO：每页输出 `<link rel="alternate" hreflang="zh-CN" / "en" / "x-default">`；sitemap 按语言分组；`/en` 页面 title 用英文 |
| 6 | 后台：作品表单加语言切换 Tab；「复制到另一语言」按钮只复制结构，不复制正文 |

检查清单：`/en/works` 与 `/works` 各自可分享；语言切换保留当前页面；`/en` 下 404 文案为英文；`hreflang` 双向指认；RSS/OG 的 `og:locale` 正确。

| 项 | 内容 |
| --- | --- |
| 影响文件 | `middleware.ts`、`next.config.ts`、`messages/**`、`prisma/schema.prisma`（新增 `locale` 列/翻译表）、`src/lib/db/*`、全部页面路由、`src/app/sitemap.ts`、`docs/03/05/07/08` |
| 预计工时 | 16–24 h |
| 风险 | 高。这是全站级改动：URL 结构、查询条件、缓存 key、后台表单全部受影响；建议单独立项，不在维护窗口内做 |

## 7. 多管理员与角色

当前只有 1 个管理员（`User` 单行）。扩展时：

| 角色 | 作品 | 分类 | 站点设置 | 用户管理 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `admin` | 全权 | 全权 | 全权 | 全权 | v1 唯一角色（07 已预留 enum）；创始账号不可删 |
| `editor` | 增删改发 | 增删改 | 只读 | 无 | 日常发布；07 枚举已含此值 |
| `viewer`（可选） | 只读 | 只读 | 只读 | 无 | 审阅/演示；新增前先改 07 的 Role 枚举 |

- 数据：`User.role`（CHECK `admin`、`editor`，07 第 4 节）；如需停用账号，新增 `User.status`（`active` / `disabled`）并同步 07，不要复用 `role` 表达停用。
- 权限：`src/lib/auth.ts` 输出 `requireRole(session, ['admin','editor'])`，API 层统一调用，不在页面里判断。
- 审计日志：按 07 第 3.8 节字段 `AuditLog { id, actorId, action, entityType, entityId, meta, ip, createdAt }`；写操作在同一事务内追加，失败不阻断主操作。
- 会话失效：`User.sessionEpoch` +1（07 已定义），Cookie 内 `epoch` 不匹配即 401 并跳登录。
- 密码策略：bcrypt cost ≥ 12；首登强制改密；连续失败沿用限流 5 次/15 分钟（按账号 + IP）。

| 项 | 内容 |
| --- | --- |
| 影响文件 | `prisma/schema.prisma`、`src/lib/auth.ts`、`src/app/api/admin/**`、`/admin/settings/users`（新）、`docs/07/08` |
| 预计工时 | 8–12 h |
| 风险 | 中。最易漏的是「页面隐藏了按钮但 API 未鉴权」，权限必须落在 API 层并有集成测试 |

## 8. SQLite → PostgreSQL

| 步 | 动作 | 注意 |
| --- | --- | --- |
| 1 | `provider = "postgresql"`，`DATABASE_URL` 换连接串 | 备份 SQLite 文件后再动 |
| 2 | JSON 字段改 `Json` / `Jsonb`（块数据、社交链接） | SQLite 存字符串，迁移脚本需解析后再写入 |
| 3 | 枚举字段（状态、角色）改 Prisma `enum` | 先建枚举类型，再改列，最后加默认值 |
| 4 | 大小写与排序规则 | PostgreSQL 的 `LIKE` 区分大小写，搜索改 `mode: 'insensitive'` |
| 5 | 迁移顺序 | 建库 → `prisma migrate deploy` → 数据导入脚本 → 校验行数 → 切连接串 |
| 6 | 并发 | 连接池上限按容器内存设；`prisma.$transaction` 替代 SQLite 的手工事务；开 `statement_timeout` |
| 7 | 备份 | 每日 `pg_dump` + uploads 归档；保留 7 天 |
| 8 | 回滚 | 保留 SQLite 只读副本与旧连接串，48 h 内可切回；切换前冻结写入 |

| 项 | 内容 |
| --- | --- |
| 影响文件 | `prisma/schema.prisma`、`prisma/migrations/**`、`src/lib/db/*`（类型差异）、`.env.example`、Docker compose、`docs/09`、`docs/07` 第 10 节 |
| 预计工时 | 6–10 h（含演练与回滚验证） |
| 风险 | 中高。风险点是「布尔/日期/JSON 的隐式转换」与「本地文件路径」；必须先在副本库完整演练一次并记录耗时 |

## 9. 本地存储 → S3 / R2

`StorageAdapter` 抽象已预留，实现替换即可：

| 方法 | 契约 | 说明 |
| --- | --- | --- |
| `put(key, buffer, meta)` | 返回 `{ key, url }` | key 由 `YYYY/MM/<hash>.<ext>` 生成，不由用户输入 |
| `get(key)` | 返回可读流或 `null` | 仅后台预览与备份使用 |
| `delete(key)` | 幂等，不存在也返回成功 | 被作品引用时由上层先拦截 |
| `publicUrl(key)` | 返回对外 URL | 本地实现返回 `/uploads/...`；S3 返回 CDN 域名 |

步骤：新增 `src/lib/storage/s3.ts` 实现同一接口 → 环境变量 `STORAGE_DRIVER=s3`、`S3_ENDPOINT`、`S3_BUCKET`、`S3_ACCESS_KEY`、`S3_SECRET_KEY`、`S3_PUBLIC_BASE` → 迁移已有文件（按 key 前缀批量上传，校验数量与总字节）→ 切换驱动 → 回滚保留本地 `data/uploads` 30 天。

上传成功仍写 `Media` 行（`url`、`storageKey`、`mime`、`size`、`width`、`height`，07 第 3.5 节）；换驱动只改变 `url` 前缀与 `storageKey` 的解析方式，表结构不动。

缓存头：图片 `Cache-Control: public, max-age=31536000, immutable`（key 含内容 hash）；下载类附件 `private, max-age=0`。上传 MIME 与魔数校验逻辑不变，仍拒绝 SVG。

| 项 | 内容 |
| --- | --- |
| 影响文件 | `src/lib/storage.ts`（接口）、`src/lib/storage/s3.ts`（新）、`src/app/api/admin/upload/route.ts`、`.env.example`、`docs/09` |
| 预计工时 | 4–6 h（不含 CDN 配置） |
| 风险 | 中。迁移中断会产生「数据库有记录、桶里没文件」的悬挂引用；迁移后要跑一次全量 `HEAD` 校验并输出缺失清单 |

## 10. 评论 / 点赞（当前明确不做）

本期不做，原因是无人力做审核与反垃圾，且单人作品集不需要社区功能。若将来做，按下表设计：

| 表 | 字段 | 说明 |
| --- | --- | --- |
| `Comment` | `id, workId, authorName, email, body, status, ipHash, createdAt` | `status`: `pending / approved / rejected / spam` |
| `Like` | `workId, visitorHash, createdAt`（唯一） | 不存个人身份，只按哈希去重 |

规则：默认关闭（站点设置开关）；开启后所有评论先 `pending`，后台审核通过才展示；限流按 IP 哈希 3 条/10 分钟；关键词与链接数量过滤，命中即 `spam`；后台可一键关闭并隐藏全部已有评论。隐私：不存明文 IP，只存哈希；提供删除单条与删除全部。

| 项 | 内容 |
| --- | --- |
| 影响文件 | `prisma/schema.prisma`、`src/app/api/comments/**`、`src/components/blocks/comments.tsx`、`/admin/comments`、`docs/05/07/08/12` |
| 预计工时 | 10–14 h |
| 风险 | 中。审核队列与垃圾过滤是长期成本，不是一次性开发成本；开启前需确认有人值守 |

## 11. 备份、恢复与版本升级

| 场景 | 命令 / 步骤 | 验证 |
| --- | --- | --- |
| 每日备份 | `bash scripts/backup.sh` → `backups/app-<date>.db` + `uploads-<date>.tar.gz` | 文件大小非 0；`ls` 计数 |
| 恢复 | 停服务 → 替换 `.db` 与 `uploads/` → `pnpm start` | 登录成功；随机抽查 3 件作品图片可加载 |
| 结构升级 | `pnpm db:migrate`（部署时 `prisma migrate deploy`） | 迁移后 `pnpm db:seed` 幂等 |
| 回滚 | `prisma migrate resolve --rolled-back` + 恢复上一份备份 | 旧版本代码可启动 |
| 内容导出 | `scripts/export.ts` 输出 `works.json` + `uploads/` 清单 | JSON 可被 `import` 复原；数量一致 |

版本升级（Next / Prisma / Tailwind 大版本）顺序：读升级说明 → 新建分支 → 升级单一依赖 → `pnpm typecheck && pnpm test && pnpm build` → E2E 全绿 → 合并。禁止一次升级多个大版本。

| 项 | 内容 |
| --- | --- |
| 影响文件 | `scripts/backup.sh`、`scripts/restore.sh`、`scripts/export.ts`、`package.json`、`docs/09` |
| 预计工时 | 备份脚本 2 h；单次大版本升级 3–6 h |
| 风险 | 中。恢复演练必须真的做过一次，未演练的备份等于没有备份 |

## 12. 性能扩展（作品量 500+ / 图片多）

| 触发条件 | 手段 | 备注 |
| --- | --- | --- |
| 列表 > 200 件 | 保持 12/页；后台 20/页；加「加载更多」或严格分页 | 不做无限滚动（URL 不可分享） |
| 首页查询变慢 | 精选 + 目录走 `unstable_cache`，写操作 `revalidateTag('works')` | 缓存 key 含 locale 与筛选条件 |
| 图片请求多 | CDN 前置 + 三档尺寸（600/900/1200）+ AVIF 优先 | `next/image` 的 loader 指向 CDN |
| 搜索需求出现 | SQLite 用 FTS5 虚表，或 PostgreSQL `tsvector` + GIN 索引 | 先做标题+摘要，再考虑全文 |
| 详情页块多 | 内容块分页或懒加载，首屏只渲染前 3 块 | 首屏 JS 预算不变（120 KB） |
| 数据库锁 | 读写分离或换 PostgreSQL（第 8 节） | SQLite 单写者在 500+ 时开始排队 |

| 项 | 内容 |
| --- | --- |
| 影响文件 | `src/lib/db/*`、`src/app/**/page.tsx`（缓存指令）、`next.config.ts`（图片 loader）、`docs/09` |
| 预计工时 | 6–10 h |
| 风险 | 中。缓存与实时编辑冲突是最大坑：保存后必须立即可见，每个缓存点都要配一个「写后失效」 |

## 13. 迁移检查清单

任何一次结构、路由或域名迁移，交付前逐项打勾：

- [ ] 旧域名 / 旧路由 301 到新 URL，保留 query；作品 slug 默认不改，若必须改，旧链接 404（首版不做 slug 301 映射，见 08）。
- [ ] `sitemap.xml` 只含新 URL；提交搜索引擎并验证抓取。
- [ ] OG / Twitter Card 图片仍可访问；`og:url` 指向新域名。
- [ ] 站内链接与页脚外链无 404（跑一次站内爬取）。
- [ ] 统计代码（如接入）只保留一套，避免重复计数。
- [ ] 备份已完成，并在一台干净机器上恢复验证。
- [ ] 旧域名保留至少 90 天 301。
- [ ] 文档 03 / 05 / 07 / 08 同步更新，README 的启动命令仍可照做。

## 14. 扩展成本汇总

| 扩展 | 影响文件（主要） | 预计工时 | 风险 | 建议时点 |
| --- | --- | --- | --- | --- |
| 新增分类 | 无代码（数据） | 0.2 h | 低 | 随时 |
| 新增内容块 | `src/lib/blocks/*`、`src/components/{admin,}/blocks/*` | 3–4 h | 中 | 有明确内容需求时 |
| 新增页面类型 | `src/app/(site)/**`、schema、导航、sitemap | 12–16 h | 中高 | 第二迭代 |
| 更换主题 | `src/styles/tokens.css` | 2–4 h | 中 | 随时（需重拍截图） |
| 中英双语 | 路由、messages、schema、全部页面 | 16–24 h | 高 | 单独立项 |
| 多管理员 | auth、schema、审计日志、后台用户页 | 8–12 h | 中 | 第二位作者加入前 |
| 换 PostgreSQL | schema、迁移、Docker、查询层 | 6–10 h | 中高 | 并发或多实例前 |
| 换 S3 / R2 | storage 适配器、上传 API、环境变量 | 4–6 h | 中 | 部署到无持久盘平台前 |
| 评论 / 点赞 | schema、API、审核后台 | 10–14 h | 中 | 当前不做 |
| 性能扩展 | 查询层、缓存、CDN、图片 | 6–10 h | 中 | 作品 > 300 件时评估 |

排期提醒：上表工时与 10 文档同口径（6 h/天有效工作），且**不含**测试、截图、文档同步与回归；实际报价按 1.4 倍系数估算。任何扩展开工前，先在 12 文档记一条决策（为什么做、替代方案、回滚方式）。
