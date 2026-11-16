# 留白集 · LIUBAI

一个 AIGC 作品集个人网站：前台展示作品，后台管理内容。

视觉方向是一本摊开的册页——暖白纸面、宋体大字、朱砂一线。作品是主角，界面退到纸的纹理里。

> **当前状态：PC 版已实现。** 前台展示、后台管理、登录鉴权、作品 CRUD、分类、媒体上传、个人资料与站点设置均可运行；移动端尚未适配，作品图为占位图，可在后台上传替换。

---

## 文档地图

| 文档 | 内容 |
| --- | --- |
| [01 项目概述](docs/01-overview.md) | 目标、用户、范围（P0/P1/不做）、交付物、成功标准、术语 |
| [02 需求规格](docs/02-requirements.md) | 权限矩阵、用户故事、功能/业务/非功能需求、验收标准 |
| [03 信息架构](docs/03-information-architecture.md) | 站点地图、导航、页面清单、用户流程、URL 与 SEO 规则 |
| [04 设计系统](docs/04-design-system.md) | 设计原则、签名元素、色板、字体、间距、组件、动效、无障碍、文案 |
| [05 前台页面](docs/05-frontend-pages.md) | 首页、作品列表、作品详情、关于、错误页的逐段规格 |
| [06 后台管理](docs/06-admin.md) | 登录、概览、作品 CRUD、块编辑器、分类、资料、设置 |
| [07 数据模型](docs/07-data-model.md) | 实体、字段、关系、索引、Block JSON schema |
| [08 API 契约](docs/08-api.md) | 端点、入参、响应、错误码、上传、缓存失效 |
| [09 技术架构](docs/09-architecture.md) | 选型理由、目录结构、渲染与缓存、安全、性能、部署、备份 |
| [10 计划与验收](docs/10-plan-and-acceptance.md) | 里程碑、WBS、测试计划、验收清单、截图清单 |
| [11 扩展指南](docs/11-extension-guide.md) | 新增分类/块/页面、换主题、i18n、换库、换存储 |
| [12 决策记录](docs/12-decisions.md) | ADR：为什么这样选，改动的代价是什么 |

---

## 技术栈

| 层 | 选择 |
| --- | --- |
| 框架 | Next.js 15（App Router）+ TypeScript strict |
| 样式 | Tailwind CSS v4 + CSS 变量 token |
| 组件 | 自研无头组件 + 原生表单 |
| 数据 | Prisma 6 + SQLite（WAL） |
| 校验 | Zod |
| 会话 | iron-session（加密 Cookie）+ bcryptjs |
| 媒体 | 本地磁盘 + sharp（转 WebP；多档由 next/image 按需生成） |
| 测试 | 预留 Vitest + Playwright（本期未接入） |
| 部署 | Node 单进程 + 本地磁盘（Docker 方案见 `docs/09-architecture.md`） |

---

## 目录结构

```
src/app/           前台 (site)、后台 (admin)、API
src/components/    site / blocks / admin / ui
src/lib/           db、auth、schemas、blocks、storage、seo
src/styles/        tokens.css、globals.css
prisma/            schema、migrations、seed
data/              运行时数据库与上传（已随压缩包附带演示数据）
docs/              设计文档
tests/             api 与 e2e 测试
```

---

## 本地运行

本机没有创建 `.env`：数据库地址直接写在 `prisma/schema.prisma`（`file:../data/dev.db`），开发会话密钥有内置 fallback。生产部署请设置 `SESSION_SECRET`、`SITE_URL`、`APP_ORIGIN`。

```bash
corepack pnpm install
corepack pnpm db:migrate     # 首次建库
corepack pnpm db:seed        # 6 个分类、12 件作品、管理员
corepack pnpm dev            # http://localhost:3000
```

如果 pnpm 提示 build scripts 被忽略，先运行 `corepack pnpm approve-builds --all`（`prisma`、`sharp` 需要执行安装脚本）。

生产模式：

```bash
corepack pnpm build
corepack pnpm start
```

后台入口：`/admin`。压缩包内的数据库已保留你当前的管理员密码；若从空数据库重新 seed，默认账号是 `admin` / `liubai-2026`，首次登录后请在「账号安全」里改密。忘记密码可运行 `corepack pnpm reset-password -- <新密码>`。

### 已实现

- 前台：首页、作品列表与分类筛选、作品详情（10 种内容块）、关于、404、sitemap/robots。
- 后台：登录、概览、作品列表与批量操作、新建/编辑（封面上传、块编辑器、草稿/发布、冲突提示）、分类、媒体库、个人资料、站点设置、账号安全。
- 接口：公开读取、鉴权、作品/分类 CRUD、上传、媒体删除、资料/设置/改密。

### 已知边界

- 只适配桌面端（1440 / 1280 验证通过），移动端后续补。
- 作品图是 `public/seed/` 里的占位视觉，后台可替换为真实图片。
- 单管理员、SQLite、本地文件存储；多用户、对象存储、暗色主题不在本期。
- 自动化测试未接入，`pnpm lint` 目前等价于 `tsc --noEmit`。

---

## 设计关键词

- **册页线**：1 px 竖线 + 6×1 px 短刻度，全站统一的装饰母题，一屏最多 3 处。
- **纸与墨**：`#F5F1E8` 纸、`#1D1C19` 墨、`#C05B3C` 陶土。90% 的画面只有前两者。
- **大小对比**：标题 56–88 px 宋体，元信息 11–12 px 等宽。中间地带很少。
- **克制**：无阴影、无渐变、无自动轮播、无 emoji 图标。

---

## 字体与许可

- 正文/界面：Inter（OFL）、系统中文字体兜底。
- 标题：Source Serif 4（OFL）或系统宋体；可选自托管 Noto Serif SC 子集（OFL）。
- 图标：Lucide（ISC）。
- 不使用 Anthropic/Claude 的商标、插画或专有字体。

---

## 交付物

1. 全部设计文档（本仓库 `docs/01`–`docs/12`）。
2. 各界面截图：`docs/screenshots/01`–`23`，均为 1440×900；另有 4 张整页图。
3. 项目源文件压缩包（不含 `node_modules`、`.next`、`.env`；包含 `data/`，解压后可直接看到现有作品与上传素材）。
