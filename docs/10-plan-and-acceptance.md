# 10 · 开发计划与验收

版本 v0.1 · 2026-11-09 · 状态：待评审 · 上游文档：01–09

> 本文档是编码阶段唯一的排期与验收依据。任务 ID、里程碑与验收编号对应 02 文档的 FR / AC / BR；术语沿用 01 文档第 8 节。

## 1. 排期假设

| 项 | 取值 | 说明 |
| --- | --- | --- |
| 人力 | 1 名开发者（兼设计核对、测试、交付） | 无并行人力 |
| 每日有效工时 | 6 h（09:30–12:00 计 2.5 h；13:30–17:00 计 3.5 h） | 已扣除会议、编译等待、上下文切换 |
| 日历窗口 | 10 个工作日（2026-11-10 至 2026-11-23），跳过周末 | 交付时点 Day 10 18:00 |
| 计划工作量 | 54 h（9 天 × 6 h），产能上限 60 h，见第 3 节合计 | 缓冲日不承担关键路径任务；缓冲耗尽仍超期时按 R-01 处置，不靠加班掩盖 |
| 缓冲 | Day 10 全天 6 h：0.5 h 打包签字 + 5.5 h 净缓冲 | 缓冲只修缺陷、重拍截图，不接新需求 |
| 估算置信度 | ±20%（54 h → 43–65 h） | Day 4 复核一次，偏差 > 20% 触发裁剪 |
| 技术栈 | Next.js 15 App Router + TypeScript strict + Tailwind CSS v4 + Radix + Prisma 6 + SQLite + Zod + iron-session + bcryptjs + pnpm + Vitest + Playwright + Docker；Node.js 22 LTS、pnpm 9+ | 与 09 文档一致；macOS / Windows 均可复现 |

### 1.1 总日历

| 天 | 日期 | 星期 | 里程碑 | 计划工时 | 当日唯一交付 |
| --- | --- | --- | --- | --- | --- |
| Day 0 | 2026-11-09 | 一 | M0 | 2 h（评审，不计入 54 h） | 01–12 文档用户确认 |
| Day 1 | 2026-11-10 | 二 | M1 | 6 h | 可 `pnpm dev` 的空壳站点 + token |
| Day 2 | 2026-11-11 | 三 | M1→M2 | 6 h | 数据库迁移与种子可跑通 |
| Day 3 | 2026-11-12 | 四 | M2 | 6 h | 登录 + 会话守卫可用 |
| Day 4 | 2026-11-13 | 五 | M2→M3 | 6 h | 上传可用；概览显示真实统计 |
| Day 5 | 2026-11-16 | 一 | M3 | 6 h | 作品列表 + 表单落库 |
| Day 6 | 2026-11-17 | 二 | M3 | 6 h | 内容块编辑器可增删排序 |
| Day 7 | 2026-11-18 | 三 | M3→M4 | 6 h | 分类/资料/设置可改；首页完成 |
| Day 8 | 2026-11-19 | 四 | M4→M5 | 6 h | 总览/详情/关于/异常态完成 |
| Day 9 | 2026-11-20 | 五 | M5→M6 | 6 h | SEO、测试、截图、打包脚本就绪 |
| Day 10 | 2026-11-23 | 一 | 缓冲 + 交付 | 0.5 h + 5.5 h 缓冲 | ZIP + 验收记录签字 |

规则：M0 未获用户确认不得开始编码；里程碑退出条件未满足只能返工，不能进入下一阶段；用户确认晚于 2026-11-10 时，日历顺延相同天数，里程碑天数不变。

## 2. 里程碑 M0–M6

| 里程碑 | 目标 | 产出 | 退出条件 | 预计天数 | 工时 |
| --- | --- | --- | --- | --- | --- |
| M0 设计确认 | 锁定范围、术语、验收口径 | 01–12 定稿（含 10/11 评审版）；问题清单清零 | 用户书面确认「可以按此编码」；P0 未决问题 = 0 | 0.5 | 2 h |
| M1 脚手架 + 设计系统 | 能跑、能看、有壳 | 工具链、tokens.css、8 个 UI 原语、前台/后台外壳 | `pnpm build` 通过；`/` 与 `/admin/login` 有导航/页脚/侧栏；无硬编码颜色 | 1.25 | 7.5 h |
| M2 数据层 + 鉴权 + 上传 | 数据可信、入口可信、文件可存 | schema + 迁移 + seed、会话、登录页、上传 API、查询层、发布校验 | `pnpm db:migrate && pnpm db:seed` 幂等；未登录访问 `/admin/works` 302；12 MB 上传被拒 | 2.42 | 14.5 h |
| M3 后台 CRUD | 非技术用户能独立发布 | 列表、表单、块编辑器、批量、分类、资料、设置、概览 | 从零发布一件作品 ≤ 3 分钟；删除有作品的分类被阻止 | 3.00 | 18 h |
| M4 前台页面 | 访客能读完一条完整路径 | 首页、总览/分类、详情、关于、404/500/loading | AC-01…AC-07 手工全过；全部内容来自数据库 | 1.25 | 7.5 h |
| M5 细节 / 响应式 / SEO / 动效 | 能上线、能被搜到 | metadata、OG、JSON-LD、sitemap、robots、五档视口、reduced-motion | 390/768/1024/1280/1920 无破版；sitemap 含全部已发布作品；axe 0 违规 | 0.42 | 2.5 h |
| M6 测试 / 截图 / 打包 | 可交付、可复现 | 单测、API 测试、6 条 E2E、15 张截图、ZIP、README | 五条质量命令全绿；ZIP 在干净机器 5 条命令启动 | 0.67 | 4 h |
| 缓冲 | 吸收估算偏差 | 缺陷修复、截图重拍、验收记录 | P0 缺陷关闭；18 项验收勾选完成 | 1.00 | 6 h |

## 3. WBS 任务表

依赖写作 `T-xxx`，「覆盖」列对应 02 文档需求编号；表中「完成定义」只写该任务特有判据，通用判据见第 5 节。

### 3.1 M0 + M1（9.5 h，其中 M0 的 2 h 不计入 54 h）

| ID | 任务 | 覆盖 | 依赖 | 预估(h) | 产出文件 / 路由 | 完成定义 | 优先级 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T-000 | 评审 01–12 与 10/11 评审版，登记并关闭问题 | 全部 | — | 2.0 | `docs/01…12` | 用户书面确认；P0 未决问题为 0 | P0 |
| T-101 | 初始化 Next 15 + TS strict + Tailwind v4 + ESLint/Prettier + pnpm 脚本 | NFR-10 | T-000 | 2.0 | `package.json`、`tsconfig.json`、`next.config.ts`、`.env.example` | `pnpm dev/build/lint/typecheck` 可用；`strict` 与 `noUncheckedIndexedAccess` 开启 | P0 |
| T-102 | 落地设计令牌与全局排版 | NFR-11 | T-101 | 0.5 | `src/styles/tokens.css`、`src/styles/globals.css` | 04 文档第 11 节逐值落地；`@theme` 映射颜色/字号/间距；组件内无 hex | P0 |
| T-103 | 8 个 UI 原语（Button、Input、Textarea、Select、Field、Tag、StatusDot、Line） | FR-08 | T-102 | 2.0 | `src/components/ui/*.tsx` | 每个原语有 focus-visible、disabled、error 三态；只从 token 取值 | P0 |
| T-104 | 前台外壳：SiteHeader（含分类下拉）、SiteFooter、Container、跳过导航 | FR-08 | T-103 | 1.5 | `src/components/site/*.tsx`、`src/app/(site)/layout.tsx` | 三档视口导航不换行；下拉可 Esc 关闭；页脚含邮箱与备案位 | P0 |
| T-105 | 后台外壳：Sidebar、Topbar、受保护布局、登录页壳 | FR-08 | T-103 | 1.5 | `src/app/admin/layout.tsx`、`src/components/admin/*.tsx` | 侧栏 6 项 + 账号安全 + 退出；`/admin/**` 未登录跳转占位生效 | P0 |

### 3.2 M2 数据层 + 鉴权 + 上传（14.5 h）

| ID | 任务 | 覆盖 | 依赖 | 预估(h) | 产出文件 / 路由 | 完成定义 | 优先级 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T-201 | Prisma schema（User、SiteProfile、Category、Work、Media、Setting；AuditLog 为 P1 预留）+ 首次迁移 | FR-01–05、BR-01/11 | T-101 | 3.0 | `prisma/schema.prisma`、`prisma/migrations/**` | 6 个 P0 模型 + 1 个 P1 预留与 07 文档一致（内容块存 `Work.content` JSON）；`Work.slug` 唯一索引；时间字段统一 UTC `DateTime` | P0 |
| T-202 | 种子：1 管理员、6 分类、12 件作品（含 6 种块）、1 套站点设置 | D4 | T-201 | 1.5 | `prisma/seed.ts` | 可重复执行不重复插入；12 件含 3 件 featured、2 件草稿 | P0 |
| T-203 | Zod 契约、错误包络、slug 生成器 | BR-01、FR-15 | T-201 | 1.5 | `src/lib/schemas/*.ts`、`src/lib/errors.ts`、`src/lib/slug.ts` | 写接口共用 `ok/data` 与 `error/code/message/fields`；slug 单测 5 例通过 | P0 |
| T-204 | 查询层：列表分页、分类筛选、精选补齐、相邻作品、统计 | FR-02/03/04/05/13 | T-203 | 2.5 | `src/lib/db/{works,categories,profile}.ts` | 前台每页 12、后台每页 20；精选不足 3 件用最新补齐且不重复；草稿被过滤 | P0 |
| T-205 | 会话与守卫：iron-session、bcrypt 校验、middleware、登录/登出 API | FR-12、NFR-07 | T-203 | 3.0 | `src/lib/auth.ts`、`middleware.ts`、`src/app/api/auth/{login,logout}/route.ts` | cookie httpOnly + SameSite=Lax + 7 天；错误密码文案统一；`?next=` 回跳生效 | P0 |
| T-206 | 上传 API + StorageAdapter 本地实现 | FR-20、BR-07 | T-203 | 2.0 | `src/lib/storage.ts`、`src/app/api/admin/upload/route.ts` | 校验 MIME + 魔数 + 10 MB；拒绝 SVG；返回 url/width/height；落 `data/uploads/YYYY/MM/` | P0 |
| T-207 | 发布校验服务（BR-02 必填项清单） | BR-02、FR-17 | T-204 | 1.0 | `src/lib/publish.ts` | 缺项返回 `{ ok:false, missing:[{field,label}] }`；草稿保存不触发 | P0 |

### 3.3 M3 后台 CRUD（18 h）

| ID | 任务 | 覆盖 | 依赖 | 预估(h) | 产出文件 / 路由 | 完成定义 | 优先级 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T-301 | 概览页：4 个统计 + 最近编辑 5 条 + 快捷入口 | FR-13 | T-204、T-105 | 1.0 | `/admin` | 数字与库一致；空站显示 0 与建作品入口；无假数据 | P0 |
| T-302 | 作品列表：表格、标题搜索、分类/状态筛选、分页 20、多选 | FR-14 | T-204 | 3.0 | `/admin/works` | 筛选条件写入 URL query；空结果保留表头；行可点进编辑 | P0 |
| T-303 | 作品表单：双栏、字段组、封面选择、slug 冲突就地提示、离开确认 | FR-15/16 | T-203、T-206 | 3.0 | `/admin/works/new`、`/admin/works/[id]` | 字数上限生效；slug 冲突建议 `-2`；未保存离开有确认 | P0 |
| T-304 | 内容块编辑器：10 种块统一表单、增删、上下移、拖拽排序 | FR-16 | T-303 | 4.0 | `src/components/admin/blocks/*.tsx` | 10 种块均可增删排序；键盘可用「上移/下移」完成排序；保存前本地校验 | P0 |
| T-305 | 保存 / 发布动作 + toast + 错误定位 | FR-17 | T-207、T-304 | 1.5 | 同 T-303 路由 | 「保存草稿」「发布」两个动作；失败定位首个错误字段；成功 toast 含「查看前台」 | P0 |
| T-306 | 批量操作：批量发布 / 转草稿 / 删除 + 二次确认 | FR-18 | T-302 | 1.5 | `/api/admin/works/bulk` | 删除需输入「删除」；toast 按 `{ succeeded, failed }` 汇总；未选中时按钮 disabled | P0 |
| T-307 | 分类管理：列表、抽屉编辑、排序、显隐、删除受阻 | FR-19、BR-03 | T-204 | 2.0 | `/admin/categories` | 排序落库；有作品时提示「该分类下还有 N 件作品」且确认禁用 | P0 |
| T-308 | 个人资料 + 站点设置（头像、社交链接、导航显隐、备案号） | FR-21/22 | T-204 | 2.0 | `/admin/profile`、`/admin/settings` | 保存后前台 revalidate 生效；URL 字段校验协议；备案号可空 | P0 |

### 3.4 M4 + M5 前台与细节（10 h）

| ID | 任务 | 覆盖 | 依赖 | 预估(h) | 产出文件 / 路由 | 完成定义 | 优先级 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T-401 | 首页：Hero（署名/身份行/介绍/头像/社交）、目录、精选区 | FR-01/02/03 | T-104、T-204 | 2.0 | `/`、`src/components/home/*.tsx` | 目录最多 8 行（BR-05）；精选 3 件；册页线一屏 ≤ 3 处 | P0 |
| T-402 | 作品总览与分类页：封面网格 4:5、筛选 chip、分页、计数 | FR-04、AC-02/04 | T-204 | 1.5 | `/works`、`src/components/works/*.tsx` | `?type=` 与 `?page=` 可分享还原；筛选状态与页头标题一致 | P0 |
| T-403 | 详情页：元信息导轨、10 种块渲染、提示词折叠复制、上一件/下一件 | FR-05/06、AC-05 | T-204、T-304 | 2.5 | `/works/[slug]`、`src/components/blocks/*.tsx` | 未知或草稿 slug 返回定制 404；块顺序与后台一致；图集灯箱 Esc 关闭 | P0 |
| T-404 | 关于页：简介 Markdown、工具清单、时间线、联系 | FR-07、AC-06 | T-204 | 1.0 | `/about` | 空字段整段隐藏；Markdown 链接白名单渲染 | P0 |
| T-405 | 404 / 500 / loading / 列表空态 | FR-09、AC-07 | T-104 | 0.5 | `src/app/not-found.tsx`、`src/app/error.tsx`、`src/app/loading.tsx` | 空态含一句事实 + 一个动作；错误页含重试与回首页 | P0 |
| T-501 | metadata、OG、JSON-LD（CreativeWork）、sitemap、robots、canonical、分页 noindex | FR-10、AC-08 | T-401–T-404 | 1.5 | `src/app/**/layout.tsx`、`src/app/sitemap.ts`、`src/app/robots.ts` | 每页独立 title/description；sitemap 仅含已发布；`?page≥2` 输出 noindex,follow | P0 |
| T-502 | 响应式回归 + 动效 + `prefers-reduced-motion` | NFR-04/06 | T-401–T-405 | 0.5 | `src/styles/*.css`、各页面类名 | 五档视口无横向滚动；reduced-motion 下无 transition | P0 |
| T-503 | 图片优化与 alt 校验：`next/image` sizes、priority、占位、alt 必填 | FR-11、AC-09 | T-403 | 0.5 | `src/components/ui/art-image.tsx` | 首屏图带 priority；其余懒加载；alt 为空时后台保存被阻止 | P0 |

### 3.5 M6 测试 / 截图 / 打包（4 h）与 P1 任务

| ID | 任务 | 覆盖 | 依赖 | 预估(h) | 产出文件 / 路由 | 完成定义 | 优先级 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T-601 | 单元测试补全（slug、publish、块渲染、分页、权限） | NFR-10 | T-203–T-405 | 1.0 | `src/**/*.test.ts(x)` | 核心模块语句覆盖 ≥ 70%；`pnpm test` 全绿 | P0 |
| T-602 | API 集成测试 10 条（登录限流、CRUD、409、上传） | FR-12–FR-20 | T-205–T-308 | 1.0 | `tests/api/*.test.ts` | 401/403/409/413/422/429 均有断言；测试库 `data/test.db` 独立 | P0 |
| T-603 | Playwright 6 条 E2E | AC-01–AC-16 | T-401–T-405 | 1.5 | `tests/e2e/*.spec.ts`、`playwright.config.ts` | 串行跑完 ≤ 3 分钟；失败留存 trace 与截图 | P0 |
| T-604 | 截图 15 张 + ZIP 打包 + README 校对 | D2/D3 | 全部 | 0.5 | `docs/screenshots/*.png`、`scripts/package.sh` | 1440×900；命名与第 8 节一致；ZIP 不含 node_modules/.next/data/uploads | P0 |
| T-701 | 修改密码（旧密码校验、≥ 10 位、其他会话失效） | FR-23、AC-18 | T-205 | 2.0 | `/admin/account`、`api/admin/account/password` | 成功 toast；其他设备 401；`User.sessionEpoch` +1 | P1 |
| T-702 | 媒体库列表与复制链接 | FR-24 | T-206 | 3.0 | `/admin/media` | 被引用文件删除前提示；分页 24 | P1 |
| T-703 | 草稿自动保存（改动后 3 s） | FR-25 | T-304 | 3.0 | `src/components/admin/autosave.ts` | 显示「已保存 hh:mm」；冲突提示 | P1 |

**合计**：P0 = 54.0 h（M1 7.5 + M2 14.5 + M3 18 + M4/M5 10 + M6 4）；P1 = 8.0 h（改密 2 + 媒体库 3 + 自动保存 3），默认顺延；P2 暗色主题、回收站本期不做。

## 4. 关键路径与并行机会

### 4.1 关键路径

```
T-101(2h) → T-201(3h) → T-204(2.5h) → T-302(3h) → T-304(4h) → T-403(2.5h) → T-501(1.5h) → T-603(1.5h)
```

长度 20 h，占计划工作量 37%，链上任何一环延误 1 h 即交付延后 1 h。次级链 `T-203 → T-303 → T-305 → T-401 → T-402 → T-601`（13 h），总时差 2 h。

### 4.2 并行机会（单开发者下的交错执行）

| 机会 | 做法 | 可省 |
| --- | --- | --- |
| 等待窗口 | `pnpm build`、`prisma migrate`、Playwright 安装各 30–90 s，用于回写文档或写测试骨架 | 0.5 h |
| 测试前置 | T-203/T-204 的纯函数在 M2 内联单测，不留到 M6 集中补 | 0.5 h |
| 素材前置 | Day 1 向用户索取 3 件真实作品图与简介；seed 先用占位图，Day 7 替换 | 0.5 h |
| 文案复用 | 前后台共用 `src/lib/copy.ts` 的空态/错误文案，避免两套措辞 | 0.3 h |

不可并行：`prisma generate` 与 `next dev` 同时改写 `.next` 会互相阻塞；同一文件（`tokens.css`、`schema.prisma`）不可双开编辑。

### 4.3 每日建议安排

| Day | 计划任务 | 工时 | 当日检查点 |
| --- | --- | --- | --- |
| 1 | T-101、T-102、T-103、T-104 | 6.0 | 首页见导航与页脚；`zh_design_lint` 无 hex 告警 |
| 2 | T-105、T-201、T-202 | 6.0 | seed 后 Studio 可见 6 分类 12 作品 |
| 3 | T-203、T-204、T-205（前 2 h） | 6.0 | `curl` 登录取到 cookie；未登录 `/admin` 302 |
| 4 | T-205（余 1 h）、T-206、T-207、T-301、T-302（前 1 h） | 6.0 | 上传返回 url；概览数字正确；M2 工时复核 |
| 5 | T-302（余 2 h）、T-303、T-304（前 1 h） | 6.0 | 新建作品落库；slug 冲突提示可见 |
| 6 | T-304（余 3 h）、T-305、T-306 | 6.0 | 10 种块可增删排序；发布按钮按必填项启停 |
| 7 | T-307、T-308、T-401 | 6.0 | 删除有作品的分类被阻止；首页目录 6 行；M3 自检 |
| 8 | T-402、T-403、T-404、T-405、T-501（前 0.5 h） | 6.0 | 走通「首页→分类→详情→上一件」；定制 404 可见 |
| 9 | T-501（余 1 h）、T-502、T-503、T-601–T-604 | 6.0 | 五条质量命令全绿；ZIP 可在干净目录启动 |
| 10 | 终验、重拍截图、打包签字；其余为缓冲 | 0.5 + 5.5 | 18 项验收勾选；D1–D5 签字 |

## 5. 完成定义（DoD）

任务级判据（每条任务完成即核对）：无 `any` / `@ts-ignore` / 死代码（`pnpm typecheck`）；新增逻辑有单测或 API 测试，bug 修复附回归用例（`pnpm test`）；颜色、字号、间距全部取自 `tokens.css`（`zh_design_lint`）；loading / empty / error / disabled 四态齐全；组件内无硬编码中文（aria-label 除外）；相关文档同步（见 11.3）。

### 5.1 发布级

| 维度 | 标准 | 命令 / 证据 |
| --- | --- | --- |
| 代码 | `pnpm lint` 0 error 0 warning；`pnpm typecheck` 0 error | CI 输出 |
| 构建 | `pnpm build` 成功；首屏 JS ≤ 120 KB gzip（前台）、≤ 250 KB（后台） | build 报告 |
| 测试 | 单测全绿且核心覆盖 ≥ 70%；API 10 条；E2E 6 条 | `pnpm test && pnpm test:e2e` |
| 无障碍 | axe 0 违规；键盘完成导航/筛选/详情/弹窗/后台表单；正文对比度 ≥ 4.5:1 | axe 报告 + 手工记录 |
| 响应式 | 390/768/1024/1280/1920 五档截图无破版 | 第 8 节截图 |
| 性能 | 公开页 Performance ≥ 90、Accessibility ≥ 95；LCP ≤ 2.0 s、CLS ≤ 0.05、INP ≤ 200 ms | Lighthouse JSON |
| 内容与文档 | 每件作品有封面、alt、分类、年份、≥ 1 个块；01–12 与 AGENTS 与实现一致、截图与最终界面一致 | 发布校验 + 第 7 节 D1–D5 |
| 交付 | ZIP 解压后 5 条命令启动；演示账号可登录 | 干净目录复现 |

## 6. 测试计划

### 6.1 单元测试（Vitest，`pnpm test`）

| 模块 | 用例 | 断言要点 |
| --- | --- | --- |
| `src/lib/slug.ts` | 中文「潮汐」→ `chao-xi`；`Hello World`；重复追加 `-2`；超 80 字截断；纯符号回退 `work-<timestamp>` | 输出匹配 `^[a-z0-9-]{2,80}$`；并发两次不同值 |
| `src/lib/publish.ts` | 缺封面 / 缺分类 / 缺块 / 全填 | 缺失数组顺序稳定（标题、slug、分类、封面、摘要、年份、块） |
| `src/components/blocks/block-renderer.tsx` | 10 种块各 1 个快照；未知 `type` | 未知类型降级提示不抛异常；顺序与输入一致 |
| `src/lib/auth.ts` | 会话解析、过期、role 非 admin | 过期返回 null；role 错误返回 403 语义 |
| `src/lib/db/works.ts` | 第 1/2/末页；`type` 过滤；featured 补齐；prev/next 首尾 | 每页 12；补齐不重复；首件 prev 为 null、末件 next 为 null |
| `src/lib/storage.ts` | PNG/JPEG/WebP 魔数；`.svg`；9.99 / 10.01 MB 边界 | SVG 拒绝；超限抛 `PAYLOAD_TOO_LARGE`；伪造扩展名被拒 |

### 6.2 集成 / API 测试

| 端点 | 场景 | 期望 |
| --- | --- | --- |
| `POST /api/auth/login` | 正确 / 错误密码 / 第 6 次失败 | 200 + Set-Cookie；401 文案与「账号不存在」一致；429 `RATE_LIMITED` 含 `Retry-After` |
| `GET /api/admin/works` | 无 cookie / 带 cookie | 401 `UNAUTHORIZED`；200 `{ items, total, page, pageSize, totalPages }` |
| `POST /api/admin/works` | 缺字段 / 完整 / slug 重复 | 422 `VALIDATION_ERROR` + `fields`；201；409 `SLUG_CONFLICT` |
| `PATCH /api/admin/works/[id]` | `updatedAt` 不匹配 | 409 `STALE_UPDATE`，返回服务端当前 `updatedAt` |
| `DELETE /api/admin/works/[id]` | 已发布 / 不存在 | 200 + 包络；404 `NOT_FOUND` |
| `DELETE /api/admin/categories/[id]` | 有 2 件作品 | 409 `CATEGORY_IN_USE`，`message` 含件数 |
| `POST /api/admin/upload` | 12 MB PNG / `.svg` / 正常 JPEG | 413 / 415 / 201 + `{ url, width, height }` |
| `POST /api/admin/works/bulk` | 3 件转草稿 / 空选择 | 200 `{ succeeded, failed }`；空选择由 UI 禁用按钮，不发请求 |
| `GET /works/[slug]` | 草稿 slug | 404 定制页，不泄露标题 |
| `GET /sitemap.xml` | 含 2 件草稿 | 仅含已发布作品 URL |

### 6.3 Playwright E2E（6 条，`pnpm test:e2e`）

| ID | 场景 | 关键步骤 | 断言 |
| --- | --- | --- | --- |
| E2E-01 | 访客浏览 | `/` → 目录第 1 行 → 首张卡片 → 详情 | 详情 `h1` 与卡片标题一致；面包屑含分类名 |
| E2E-02 | 筛选与分页 | `/works` → 点「原画」→ 第 2 页 → 后退 | URL 含 `type` 与 `page=2`；后退恢复第 1 页；计数与条数一致 |
| E2E-03 | 详情与内容块 | 展开提示词 → 复制 → 下一件 → 未知 slug | 提示词可展开、复制有反馈；下一件标题变化；404 文案正确 |
| E2E-04 | 登录 | 未登录 `/admin/works` → 登录 → 错误密码 → 5 次失败 | 302 带 `next`；回跳列表；错误不区分账号；第 6 次 429 |
| E2E-05 | 新建并发布 | 填标题/分类/年份/摘要 → 上传封面 → 加段落块 → 发布 | toast 出现；状态「已发布」；前台 `/works/<slug>` 200 含标题 |
| E2E-06 | 分类删除受阻 | `/admin/categories` → 删除「AI 原画」 | 弹窗含「该分类下还有 N 件作品」；确认禁用；分类仍在 |

运行规则：`workers: 1`（共享 SQLite）；每条用例前重置 `data/test.db` 并 seed；失败保存 trace、video、screenshot 到 `test-results/`。

### 6.4 手动测试矩阵

浏览器：Chrome / Edge / Safari 最近两个大版本。`●` 必测，`○` 抽查。

| 页面 | 390 | 768 | 1024 | 1280 | 1440 | 1920 |
| --- | --- | --- | --- | --- | --- | --- |
| `/` 首页 | ● | ○ | ● | ● | ● | ● |
| `/works` 总览 / `?type=` 分类 | ● | ○ | ● | ● | ● | ○ |
| `/works/[slug]` 详情 | ● | ● | ● | ● | ● | ● |
| `/about` 关于 | ● | ○ | ● | ● | ○ | ○ |
| `/admin/works` 列表 / `[id]` 编辑 | — | — | ○ | ● | ● | ○ |
| 404 / 500 | ● | ○ | ○ | ● | ○ | ○ |

每格检查 5 项：无横向滚动、无孤字、图片不变形、导航可达、焦点可见。后台 < 1280 允许横向滚动但不阻断操作。

### 6.5 无障碍检查

| 项 | 方法 | 通过标准 |
| --- | --- | --- |
| 自动扫描 | `@axe-core/playwright` 覆盖 `/`、`/works`、`/works/[slug]`、`/about`、`/admin/login`、`/admin/works`、`/admin/works/[id]`、`/admin/categories` | `wcag2a`、`wcag2aa`、`wcag21aa` 违规数 = 0 |
| 键盘路径 | 只用 Tab / Shift+Tab / Esc / Enter / 方向键 | 导航下拉 → 筛选 → 详情 → 灯箱 → 后台表单 → 删除弹窗全可达；焦点不丢失 |
| 对比度抽查 | axe color-contrast + 手工 | `--ink` 15.8:1、`--ink-2` 7.0:1、`--ink-3` 4.8:1、`--accent-ink` 5.7:1、`--on-deep-2` 7.6:1；`--accent` 仅用于 ≥ 24 px 或图形 |
| 语义结构 | 手工 + axe landmarks | 每页 1 个 `h1`；`header/nav/main/footer` 齐全；跳过导航为首个可聚焦元素；`label` 关联；错误 `aria-describedby`；触控目标 ≥ 44 × 44（移动）/ ≥ 40 × 40（桌面） |

### 6.6 性能检查（Lighthouse，4G 模拟 + 中端机降速）

| 页面 | Performance | Accessibility | LCP | CLS | INP | 首屏 JS(gzip) |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | ≥ 90 | ≥ 95 | ≤ 2.0 s | ≤ 0.05 | ≤ 200 ms | ≤ 120 KB |
| `/works` | ≥ 90 | ≥ 95 | ≤ 2.0 s | ≤ 0.05 | ≤ 200 ms | ≤ 120 KB |
| `/works/[slug]` | ≥ 88 | ≥ 95 | ≤ 2.2 s | ≤ 0.05 | ≤ 200 ms | ≤ 140 KB |
| `/admin/works` | ≥ 80 | ≥ 95 | ≤ 2.5 s | ≤ 0.05 | ≤ 250 ms | ≤ 250 KB |

测量规则：`pnpm build && pnpm start` 后测生产构建；每页取 3 次中位数；报告存 `docs/screenshots/lighthouse-<page>.json`；未达标须记录原因与后续动作，不允许只写「已优化」。

## 7. 验收清单

P0 全通过才可交付；P1 通过则勾选，未做标「顺延」并注明排期。验证人 D = 开发者，O = 创作者。

### 7.1 AC-01 … AC-18

| 编号 | 验收要点 | 验证方式 | 证据 | D | O |
| --- | --- | --- | --- | --- | --- |
| AC-01 | 首页显示署名/身份行/介绍/头像、6 行目录、≥ 3 件精选、页脚邮箱 | 手工 + E2E-01 | `01-home.png` | [ ] | [ ] |
| AC-02 | 点目录第 01 行 → `/works?type=ai-painting`，8 件、标签高亮、计数 8 | E2E-01 + SQL 计数 | 截图 | [ ] | [ ] |
| AC-03 | 仅 2 件 featured 时补齐到 3 件且不重复 | 单测 + 改数据实测 | 单测输出 | [ ] | [ ] |
| AC-04 | `?page=2` 显示 13–24；URL 可分享还原；后退恢复 | E2E-02 | 截图 | [ ] | [ ] |
| AC-05 | 图片/视频/提示词块按序渲染；提示词可展开复制；上下篇可点；未知 slug 定制 404 | E2E-03 | 截图 | [ ] | [ ] |
| AC-06 | 关于页顺序为简介 → 工具 → 时间线 → 联系；Markdown 链接安全 | 手工 | 截图 | [ ] | [ ] |
| AC-07 | 空分类显示「这个分类还没有作品。」+ 查看全部按钮 | 手工（seed 空分类） | `05-works-empty.png` | [ ] | [ ] |
| AC-08 | title 为「潮汐 · 留白集」；OG 用封面；JSON-LD `CreativeWork`；sitemap 含该 URL | view-source + Rich Results | 源码截图 | [ ] | [ ] |
| AC-09 | 4000×5000 JPEG 在 600 px 容器下 ≤ 1200 px WebP/AVIF；无抖动；alt 来自后台 | DevTools Network | 截图 | [ ] | [ ] |
| AC-10 | 未登录 `/admin/works` 302 带 `next`；第 6 次失败 429 | E2E-04 | 截图 | [ ] | [ ] |
| AC-11 | 42/38/4/6 正确；最近编辑按更新时间倒序 5 条 | 手工 + 集成测试 | `07-admin-dashboard.png` | [ ] | [ ] |
| AC-12 | 「潮」+ 草稿筛选只返回匹配项；清空恢复 | 手工 + 集成测试 | `08-admin-works.png` | [ ] | [ ] |
| AC-13 | 新建后发布成功、状态 published、前台可见、有 toast | E2E-05 | `09-admin-work-edit.png` | [ ] | [ ] |
| AC-14 | 勾选 3 件转草稿，前台立即不可见，toast「已更新 3 件作品」 | 手工 + 集成测试 | 截图 | [ ] | [ ] |
| AC-15 | 删除有 2 件作品的分类被阻止并提示件数 | E2E-06 | `11-admin-categories.png` | [ ] | [ ] |
| AC-16 | 选 12 MB PNG 前端立即提示「图片不能超过 10 MB」，不发请求 | 手工 + 集成测试 | DevTools 截图 | [ ] | [ ] |
| AC-17 | 改站点名与介绍后首页/导航/页脚/title 同步，无需重启 | 手工 | 前后截图 | [ ] | [ ] |
| AC-18 | 旧密码正确 + 新密码 12 位 → 成功；当前会话保留、其他会话失效 | 手工（双浏览器） | 截图 | [ ] | [ ]（P1） |

### 7.2 交付物 D1–D5

| 编号 | 交付物 | 检查内容 | 验收方式 | 勾选 |
| --- | --- | --- | --- | --- |
| D1 | 设计文档 | `docs/01–12` 齐全；编号与术语一致；AGENTS 与 README 存在 | `ls docs/*.md \| wc -l` = 12 | [ ] |
| D2 | 项目源码 | 含 `pnpm-lock.yaml`、`.env.example`、迁移、seed；5 条命令启动 | 干净目录复现 | [ ] |
| D3 | 界面截图 | 15 张 1440×900；命名合规；空态/错误态各 ≥ 1 | 第 8 节逐行核对 | [ ] |
| D4 | 演示数据 | 6 分类、12 作品、1 管理员 | seed 后核对概览数字 | [ ] |
| D5 | 验收记录 | 7.1/7.2 全部勾选并签名 | 签字 + 日期 | [ ] |

### 7.3 签署

开发者 D：______　日期 ______　　创作者 O：______　日期 ______　　结论：通过 / 有条件通过 / 不通过

## 8. 截图清单

统一规格：1440×900、DPR 2、浅色、真实 seed 数据、隐藏书签栏与扩展、光标移出视口、无 toast 遮挡（除专门展示反馈的图）。

| 文件名 | 页面 | 状态 / 前置数据 |
| --- | --- | --- |
| `docs/screenshots/01-home.png` | `/` | 6 分类、3 件精选，首屏完整 |
| `docs/screenshots/02-works.png` | `/works` | 第 1 页 12 件，无筛选 |
| `docs/screenshots/03-work-detail.png` | `/works/chao-xi` | 含图片、视频外链、提示词块 |
| `docs/screenshots/04-about.png` | `/about` | 简介、工具、时间线、联系齐全 |
| `docs/screenshots/05-works-empty.png` | `/works?type=ai-music` | 空态（该分类 0 件） |
| `docs/screenshots/06-admin-login.png` | `/admin/login` | 默认态，无错误 |
| `docs/screenshots/07-admin-dashboard.png` | `/admin` | 42 / 38 / 4 / 6，最近编辑 5 条 |
| `docs/screenshots/08-admin-works.png` | `/admin/works` | 全量列表，含发布/草稿两种状态 |
| `docs/screenshots/09-admin-work-edit.png` | `/admin/works/[id]` | 已填满的双栏表单 |
| `docs/screenshots/10-admin-blocks.png` | `/admin/works/[id]` | 滚到块编辑器，展示 4 种块 |
| `docs/screenshots/11-admin-categories.png` | `/admin/categories` | 6 行分类 + 删除受阻弹窗 |
| `docs/screenshots/12-admin-profile.png` | `/admin/profile` | 头像、简介、社交链接已填 |
| `docs/screenshots/13-admin-settings.png` | `/admin/settings` | SEO 字段、导航显隐、备案号 |
| `docs/screenshots/14-404.png` | `/works/not-exist` | 定制 404 |
| `docs/screenshots/15-admin-empty.png` | `/admin/works` | 搜索无结果空表（保留表头） |

补充：响应式另拍 390/768/1024/1280/1920 五档，存 `docs/screenshots/responsive/`，不计入 D3 的 15 张；交付主图尺寸只有 1440×900 一套。

## 9. 打包与提交

### 9.1 ZIP 结构

```
liubai-20261123.zip
├── README.md  AGENTS.md  package.json  pnpm-lock.yaml  .env.example  next.config.ts
├── prisma/  schema.prisma  migrations/  seed.ts
├── src/  app/  components/  lib/  styles/    tests/  api/  e2e/  playwright.config.ts
├── docs/  01…12-*.md  screenshots/*.png
└── scripts/  package.sh  backup.sh  reset-password.ts
```

排除：`node_modules/`、`.next/`、`data/uploads/*`（保留 `.gitkeep` 与 3 张示例图）、`data/*.db`、`.env`、`test-results/`、`playwright-report/`、`*.log`、`.DS_Store`。打包命令 `bash scripts/package.sh`（`git archive` + 排除校验 + 生成 SHA256 清单）。

### 9.2 README 必填项

| # | 内容 | 判据 |
| --- | --- | --- |
| 1 | 一句话说明 + 截图 1 张 + 后台入口 `/admin`、`/admin/login` | 与 01 文档一致；可访问 |
| 2 | 环境与技术栈（Node 22、pnpm 9、Next 15、Prisma 6、SQLite） | 与 09 文档一致 |
| 3 | 5 条启动命令（install → env → migrate → seed → dev） | 干净机器可跑 |
| 4 | 演示账号与改密提醒 | 见 9.3 |
| 5 | 目录结构说明 + 文档索引（`docs/`、`AGENTS.md`） | 与 9.1 节一致 |
| 6 | 数据重置与备份命令 | `pnpm db:reset`、`scripts/backup.sh` |
| 7 | 已知限制（P1 未做、单管理员、SQLite） | 逐条列出 |

### 9.3 演示账号与命令

| 项 | 值 |
| --- | --- |
| 演示账号 | `admin` |
| 演示密码 | 由 `.env` 的 `ADMIN_PASSWORD` 提供；未设置时 seed 退出并提示，不写默认密码；演示值写入 README「演示账号」段，首次登录后必须修改 |
| 重置 | `pnpm db:reset && pnpm db:seed`；改密 `pnpm reset-password -- <新密码>` |
| 备份 | `bash scripts/backup.sh` → `backups/app-<date>.db` + `uploads-<date>.tar.gz` |

### 9.4 三分钟演示脚本

| 时间 | 画面 | 台词要点 |
| --- | --- | --- |
| 0:00–0:30 | 首页 | 「这是一个人的作品展厅：目录说明我做什么，精选告诉你看哪几件。」 |
| 0:30–1:10 | 分类 → 网格 → 详情 | 「筛选与分页都在 URL 里，可以直接把分类链接发给别人。」 |
| 1:10–1:40 | 详情内容块 | 「每件作品都能讲清制作过程：图、视频、提示词在同一条阅读线上。」 |
| 1:40–2:20 | 登录 → 新建 → 上传封面 → 加段落 | 「发布三步：填元信息、传封面、加内容块。」 |
| 2:20–2:50 | 点发布 → 前台作品页 → 回首页看精选 | 「发布即刻上线，不需要开发介入；校验会拦住缺项；精选顺序在后台调一下即可。」 |

## 10. 风险与缓解

| ID | 风险 | 触发条件 | 影响 | 概率 | 应对 |
| --- | --- | --- | --- | --- | --- |
| R-01 | 排期零余量 | Day 4 复核 M2 > 14.5 h，或 Day 8 未进入 M5 | 交付延后 1–3 天 | 高 | 冻结 P1；按「关于页时间线 → 拖拽改上下移按钮 → 卡片悬停动效」裁剪；缺口 > 6 h 与用户改期，不靠加班掩盖 |
| R-02 | 中文衬线字体跨系统差异 | Windows（SimSun）与 macOS（Songti SC）并排对比 | 首屏观感不一致 | 高 | 标题只用 500–600 字重；差异写入 README 已知限制；若要求一致，自托管 Noto Serif SC 子集（≤ 180 KB，仅 H1/H2） |
| R-03 | 拖拽排序成本与可达性 | 引入 dnd-kit 后需补键盘方案 | 超时 2 h 或键盘不可用 | 中 | 「上移/下移」按钮为唯一排序入口，拖拽仅作增强，两者改同一接口 |
| R-04 | SQLite 写锁并发 | 后台保存时前台同时写 | `SQLITE_BUSY` 500 | 中 | 开 WAL；写操作包事务并设 `busy_timeout=5000`；P0 不做访问计数 |
| R-05 | 上传目录在部署中丢失 | Docker 未挂 volume 或重建容器 | 封面全部 404 | 中 | compose 显式挂载 `./data`；README 写明备份 uploads；部署前 `ls data/uploads` 自检 |
| R-06 | 内容块 schema 演进 | 新增块类型或改字段 | 旧作品正文空白或报错 | 中 | 块存 `{ id, type, version, ...专属字段 }`；未知 type 只读降级；迁移脚本随版本提供 |
| R-07 | Next 15 缓存语义误用 | 后台保存后前台不更新，或误用 `force-cache` | AC-17 失败 | 中 | 统一走 `unstable_cache` + `revalidateTag('works')`；写后显式 revalidate；E2E 覆盖「保存后立即可见」 |
| R-08 | 图片体积拖垮 LCP | 首屏封面 > 300 KB 或未设 sizes | LCP > 2.0 s，Performance < 90 | 中 | 封面输出 600/900/1200 三档；首屏 priority；上传记录宽高避免 CLS；每次发版必测 Lighthouse |

## 11. 评审检查点

### 11.1 M0 门禁（硬性）

**用户明确要求：先看设计文档，确认后才编码。** M0 未通过时，任何代码提交视为违规。

| # | 检查项 | 通过标准（均需书面回复） |
| --- | --- | --- |
| 1 | 01 目标 / 02 需求与 AC | 认可 P0 与「不做」清单；18 条 AC 无异议；P1 接受顺延 |
| 2 | 03 IA 与 URL | 路由、筛选用 query、导航结构、面包屑认可 |
| 3 | 04 设计系统 | 颜色、字号、册页线、组件规格认可 |
| 4 | 05 / 06 页面规格 | 每页信息块与交互无缺项 |
| 5 | 07 / 08 数据与接口 | 字段、错误码、响应包络一致 |
| 6 | 09 架构 / 10 排期 / 11 扩展 / 12 决策 | 技术栈与部署认可；54 h 计划与缓冲认可；接受本期不做的扩展项；关键取舍无反对 |

未通过处理：登记问题 → 当日修订文档 → 重新确认；不得「边做边改」跳过门禁。

### 11.2 过程检查点

| 检查点 | 时点 | 检查内容 | 不通过的处理 |
| --- | --- | --- | --- |
| CP-1 | Day 4 结束 | M2 退出条件 + 工时复核（实际 vs 14.5 h） | 偏差 > 20% 触发 R-01 裁剪 |
| CP-2 | Day 6 结束 | 后台能完成一次完整发布（E2E-05 雏形） | 顺延 0.5 天，占用 Day 10 缓冲 |
| CP-3 | Day 8 结束 | 前台 5 个页面走通 + 三档视口 | 冻结动效与 P1，保 P0 |
| CP-4 | Day 9 结束 | 五条质量命令全绿 + ZIP 可启动 | Day 10 只修缺陷，不加功能 |
| CP-5 | Day 10 | 18 项验收 + D1–D5 签字 | 未通过项列出责任人与补做日期 |

### 11.3 变更控制

- 编码期新增需求一律写入 `docs/12-decisions.md`「变更」段，评估工时后再决定是否纳入；口头需求不进入开发。
- 字段、接口、页面结构变更必须同步 07（数据）、08（接口）、05/06（页面）、03（URL），提交信息注明文档编号；里程碑退出条件变更需用户确认，不允许开发者单方面下调。
