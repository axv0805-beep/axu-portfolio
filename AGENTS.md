# AGENTS.md · 留白集

「留白集」是一个人的 AIGC 作品集：前台展示作品，后台让创作者不写代码就能发布。技术栈 Next.js 15 App Router + TypeScript strict + Tailwind CSS v4 + Prisma 6 + SQLite，单管理员，本地文件存储。

本文件是给开发者和 AI 代理的**执行约定**：命令、结构、约束、禁止事项。与文档冲突时，以 `docs/` 为准并当场修正文档。

## 文档索引

| 文档 | 内容 | 何时读 |
| --- | --- | --- |
| [01-overview](docs/01-overview.md) | 目标、角色、范围、术语、文档地图 | 接手项目第一份 |
| [02-requirements](docs/02-requirements.md) | FR-01…FR-25、BR、NFR、AC-01…AC-18 | 写任何功能前 |
| [03-information-architecture](docs/03-information-architecture.md) | 路由、导航、页面结构、状态 | 改 URL 或页面结构前 |
| [04-design-system](docs/04-design-system.md) | 颜色/字号/间距/组件/册页线 | 写任何 UI 前 |
| [05-frontend-pages](docs/05-frontend-pages.md) | 前台逐页信息块与交互 | 做前台页面时 |
| [06-admin](docs/06-admin.md) | 后台逐页规格、表单、块编辑器 | 做后台页面时 |
| [07-data-model](docs/07-data-model.md) | 模型、字段、索引、约束 | 改 schema 前 |
| [08-api](docs/08-api.md) | 接口、错误码、响应包络 | 改接口前 |
| [09-architecture](docs/09-architecture.md) | 分层、缓存、部署、备份 | 定方案时 |
| [10-plan-and-acceptance](docs/10-plan-and-acceptance.md) | 里程碑、WBS、测试计划、验收 | 排期与验收时 |
| [11-extension-guide](docs/11-extension-guide.md) | 后续扩展的步骤与成本 | 加功能前 |
| [12-decisions](docs/12-decisions.md) | 关键取舍与变更记录 | 有争议时 |

## 常用命令

| 命令 | 作用 | 何时用 |
| --- | --- | --- |
| `pnpm install` | 安装依赖 | 首次、切分支后 |
| `pnpm dev` | 本地开发（http://localhost:3000） | 日常 |
| `pnpm build` | 生产构建 | 提交前必须通过 |
| `pnpm start` | 运行生产构建 | 验证 LCP / E2E |
| `pnpm lint` | ESLint（0 error 0 warning） | 提交前 |
| `pnpm typecheck` | `tsc --noEmit` | 提交前 |
| `pnpm test` | Vitest 单测 + API 测试 | 每次改逻辑 |
| `pnpm test:e2e` | Playwright（串行，共享 SQLite） | 改页面/流程 |
| `pnpm db:migrate` | 创建并应用迁移 | 改 schema 后 |
| `pnpm db:seed` | 写入 6 分类 / 12 作品 / 1 管理员 | 重置演示数据 |
| `pnpm db:studio` | Prisma Studio 查看数据 | 排查数据问题 |
| `pnpm reset-password -- <新密码>` | 忘记密码时重置 | 无法登录 |

五条命令跑起来：`pnpm install` → `cp .env.example .env` → `pnpm db:migrate` → `pnpm db:seed` → `pnpm dev`。

## 目录结构

```
src/app/            (site)/ 前台路由；admin/ 后台；api/ 接口；sitemap.ts、robots.ts
src/components/     ui/ 原语；site/ 前台外壳；admin/ 后台；blocks/ 内容块渲染
src/lib/            auth.ts、db/、schemas/、blocks/、storage.ts、slug.ts、publish.ts、errors.ts
src/styles/         tokens.css（唯一颜色来源）、globals.css
prisma/             schema.prisma、migrations/、seed.ts
data/uploads/       本地文件存储（YYYY/MM/），不提交
docs/screenshots/   交付截图（1440×900）；响应式补充在 responsive/
tests/              api/、e2e/
```

## 编码约定

- TypeScript `strict` + `noUncheckedIndexedAccess`；**禁止 `any`**、禁止 `@ts-ignore`、禁止注释掉的死代码。
- 默认 Server Component；只有需要状态/事件/浏览器 API 时才加 `'use client'`，且边界尽量下沉到叶子组件。
- 所有外部输入（表单、query、route params）先过 Zod；schema 与类型放 `src/lib/schemas/`，前后端共用。
- 接口统一包络：成功 `{ ok: true, data }`，失败 `{ ok: false, error: { code, message, fields? } }`；错误码见 08 文档，不新造。
- 数据读取集中在 `src/lib/db/`，页面与组件不直接写 `prisma.*`（`src/app/api/**` 除外，且要复用同一查询函数）。
- 禁止硬编码颜色、字号、间距：一律引用 `src/styles/tokens.css` 的变量；新增取值先进 token 再加使用处。
- 日期时间：存 UTC，展示按 `Asia/Shanghai` 格式化；不在数据库存本地时间字符串。

## 设计约定

- 只用 04 文档的 token 与组件规格；不引入第二套 UI 库或图标库，图标统一 Lucide，**禁止 emoji 当图标**。
- 中文排版：中英文与数字之间留空格；正文行高 ≥ 1.7；段首不缩进；标题用衬线字体栈，正文用无衬线。
- 文案：面向访客，短句陈述事实；禁用词见 04 文档（赋能、一站式、全方位、无缝、轻松搞定、极致体验、重新定义等）。
- 册页线是唯一签名元素：1 px 竖线 + 短刻度，用于 Logo、Hero 左侧、目录行、详情侧栏、页脚、空态、后台 Logo/登录/空态；**一屏最多 3 处**，不扩散成装饰。
- 每个交互元素必须有 hover / focus-visible / disabled 三态；四态页面（loading / empty / error / disabled）齐全。

## 数据约定

- slug：小写字母数字与连字符，2–80 字符；中文转拼音；冲突追加 `-2`、`-3`；发布后允许修改，但旧链接会 404，后台必须二次确认并提示失效链接（不做 301）。
- 发布校验（BR-02）：标题、slug、分类、封面、摘要、年份、≥ 1 个内容块缺一不可；草稿保存不校验。
- 分类下有作品时禁止删除（BR-03）；删除作品为硬删除，需二次确认（BR-12）。
- 上传：图片 ≤ 10 MB（JPEG/PNG/WebP/AVIF），视频 ≤ 100 MB，**禁 SVG**；校验 MIME + 魔数，不只信扩展名。
- 时间戳字段统一 `createdAt` / `updatedAt`（UTC）；并发编辑用 `updatedAt` 比对，冲突返回 409。
- 不提交 `data/uploads/` 与 `data/*.db`；备份走 `scripts/backup.sh`。

## 测试与提交

- 每个 FR 至少一条对应测试：纯逻辑进 Vitest，接口进 `tests/api/`，用户路径进 Playwright；bug 修复必须附回归用例。
- 提交前跑：`pnpm lint && pnpm typecheck && pnpm test`；改页面时再加 `pnpm test:e2e`。
- 提交信息：`feat: 作品批量发布`、`fix: 分类删除未拦截`、`docs: 同步 07 字段`、`chore: 升级 prisma`；正文写「为什么」，不写「改了什么」。
- PR 检查清单：① 关联需求编号 ② 截图/录屏 ③ 移动端与 1440 视口自查 ④ axe 无新增违规 ⑤ 文档已同步 ⑥ 无调试代码与 `console.log`。

## 文档同步规则

| 改动 | 必须同步 |
| --- | --- |
| 模型/字段/索引 | 07-data-model（字段表）+ 09（若影响查询或迁移） |
| 接口/错误码/包络 | 08-api（端点表、错误码表） |
| 页面结构/信息块/交互 | 05-frontend-pages、06-admin |
| URL/导航/筛选参数 | 03-information-architecture |
| 颜色/字号/组件规格 | 04-design-system |
| 排期/验收/测试 | 10-plan-and-acceptance |
| 关键取舍与新决策 | 12-decisions（一条一段：背景、选项、结论、回滚） |

## 禁止事项

- 不引入第二套主题或组件库；不绕过 token 直接写 hex、px 字号。
- 不复制 Claude 或其他产品的商标、字体、文案与界面；不使用未授权字体文件。
- 不提交 `.env`、`data/uploads/`、`data/*.db`、`test-results/`、`.next/`。
- 不在客户端组件里直连数据库，不把 `DATABASE_URL`、密钥暴露到 `NEXT_PUBLIC_*`。
- 不做「边做边改文档」：需求变更先写 12-decisions，再改代码。
- 不在未获用户对 01–12 全部文档的书面确认前开始编码（10 文档 M0 门禁）。
