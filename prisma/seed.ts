import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const adminUsername = (process.env.ADMIN_USERNAME ?? "admin").toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD ?? "liubai-2026";
const ownerEmail = process.env.OWNER_EMAIL ?? "hello@liubai.studio";

const categories = [
  { slug: "ai-painting", name: "AI 原画", nameEn: "AI Painting", description: "静帧、角色与场景。", sortOrder: 10 },
  { slug: "ai-video", name: "AI 视频", nameEn: "AI Video", description: "短片、循环影像与分镜。", sortOrder: 20 },
  { slug: "ai-novel", name: "AI 小说", nameEn: "AI Novel", description: "短篇、连载与世界观。", sortOrder: 30 },
  { slug: "ai-music", name: "AI 音乐", nameEn: "AI Music", description: "配乐与声音实验。", sortOrder: 40 },
  { slug: "ai-app", name: "AI 应用", nameEn: "AI App", description: "工具与小型产品。", sortOrder: 50 },
  { slug: "ai-agent", name: "AI 智能体", nameEn: "AI Agent", description: "角色、流程与工作流。", sortOrder: 60 },
];

function id(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return `b_${hash.toString(16).padStart(8, "0").slice(0, 8)}`;
}

const p = (slug: string, text: string, index: number): Prisma.InputJsonValue => ({
  id: id(`${slug}-p-${index}`), type: "paragraph", version: 1, text,
});
const heading = (slug: string, text: string, index: number): Prisma.InputJsonValue => ({
  id: id(`${slug}-h-${index}`), type: "heading", version: 1, level: 2, text,
});
const image = (slug: string, url: string, alt: string, caption: string, index: number, width = 1200, height = 1500): Prisma.InputJsonValue => ({
  id: id(`${slug}-i-${index}`), type: "image", version: 1, url, alt, caption, width, height,
});
const gallery = (slug: string, images: { url: string; alt: string; caption?: string }[], index: number): Prisma.InputJsonValue => ({
  id: id(`${slug}-g-${index}`), type: "gallery", version: 1, images,
});
const quote = (slug: string, text: string, cite: string, index: number): Prisma.InputJsonValue => ({
  id: id(`${slug}-q-${index}`), type: "quote", version: 1, text, cite,
});
const prompt = (slug: string, model: string, text: string, negative: string, params: Record<string, string | number>, index: number): Prisma.InputJsonValue => ({
  id: id(`${slug}-pr-${index}`), type: "prompt", version: 1, model, text, negative, params, collapsed: true,
});
const video = (slug: string, provider: "youtube" | "bilibili" | "file", url: string, title: string, poster: string, index: number): Prisma.InputJsonValue => ({
  id: id(`${slug}-v-${index}`), type: "video", version: 1, provider, url, title, poster,
});
const audio = (slug: string, url: string, title: string, duration: number, index: number): Prisma.InputJsonValue => ({
  id: id(`${slug}-a-${index}`), type: "audio", version: 1, url, title, duration,
});
const link = (slug: string, url: string, title: string, description: string, index: number): Prisma.InputJsonValue => ({
  id: id(`${slug}-l-${index}`), type: "link", version: 1, url, title, description,
});
const divider = (slug: string, index: number): Prisma.InputJsonValue => ({
  id: id(`${slug}-d-${index}`), type: "divider", version: 1,
});

type SeedWork = {
  title: string;
  slug: string;
  category: string;
  summary: string;
  cover: string;
  coverAlt: string;
  year: number;
  status: "draft" | "published";
  featured: boolean;
  sortOrder: number;
  publishedAt: string | null;
  tools: string[];
  tags: string[];
  role?: string;
  content: Prisma.InputJsonValue[];
};

const works: SeedWork[] = [
  {
    title: "潮汐", slug: "chaoxi", category: "ai-painting",
    summary: "一张潮汐表长成的海。",
    cover: "/seed/work-01.webp", coverAlt: "暖灰色海面与一轮陶土色落日", year: 2026,
    status: "published", featured: true, sortOrder: 10, publishedAt: "2026-09-12T04:00:00.000Z",
    tools: ["Midjourney", "Photoshop"], tags: ["海", "生成", "潮汐"], role: "概念 / 生成",
    content: [
      p("chaoxi", "这张图从一张潮汐表开始。第一版只保留了岸线的形状，把涨落画成了几层颜色。", 1),
      image("chaoxi", "/seed/detail-01.webp", "暖灰色海面与层叠的岸线", "初稿，1600 × 1000", 2, 1600, 1000),
      prompt("chaoxi", "Midjourney v6.1", "a quiet shoreline at low tide, muted warm grey, soft overcast light, layered paper texture --ar 4:5", "text, watermark, oversaturation", { ar: "4:5", stylize: 250, seed: 184271 }, 3),
      quote("chaoxi", "海面没有一处是重复的。", "创作笔记", 4),
    ],
  },
  {
    title: "山纹", slug: "shanwen", category: "ai-painting",
    summary: "把山的轮廓压成几道折线。",
    cover: "/seed/work-02.webp", coverAlt: "米色山峦与一轮小太阳", year: 2026,
    status: "published", featured: false, sortOrder: 20, publishedAt: "2026-08-20T04:00:00.000Z",
    tools: ["Midjourney", "Photoshop"], tags: ["山", "折线", "地形"], role: "概念 / 生成",
    content: [
      p("shanwen", "想试试只用折线能不能说清一座山。颜色压到三种，留出纸的底色。", 1),
      gallery("shanwen", [
        { url: "/seed/work-02.webp", alt: "山纹成品，米色山峦" },
        { url: "/seed/detail-04.webp", alt: "山纹局部，纸面折线" },
      ], 2),
      prompt("shanwen", "Midjourney v6.1", "minimal folded mountain ridges, warm beige and clay palette, paper texture, editorial illustration --ar 4:5", "photo, realistic, noise", { ar: "4:5", stylize: 180 }, 3),
    ],
  },
  {
    title: "静物练习", slug: "jingwu", category: "ai-painting",
    summary: "一只陶瓶，一枝叶子，和一整个下午。",
    cover: "/seed/work-03.webp", coverAlt: "陶土色花瓶与一枝灰绿叶子", year: 2026,
    status: "published", featured: false, sortOrder: 30, publishedAt: "2026-07-08T04:00:00.000Z",
    tools: ["Midjourney"], tags: ["静物", "陶土", "光"], role: "生成 / 后期",
    content: [
      p("jingwu", "静物练习不追求像，只追求光落在哪一边。花瓶的轮廓改了四次，最后留下来的是最钝的那一版。", 1),
      image("jingwu", "/seed/work-03.webp", "陶土色花瓶与灰绿叶子", "静物练习 03，1200 × 1500", 2),
      divider("jingwu", 3),
      p("jingwu", "素材会在之后的工作里继续用。它不是一个系列，只是一次手的练习。", 4),
    ],
  },
  {
    title: "长夜漫游", slug: "changye", category: "ai-video",
    summary: "一段没有目的地的夜间行车。",
    cover: "/seed/work-04.webp", coverAlt: "深色夜色中的月亮与公路", year: 2026,
    status: "published", featured: true, sortOrder: 40, publishedAt: "2026-09-28T04:00:00.000Z",
    tools: ["Runway", "Premiere"], tags: ["夜", "公路", "循环"], role: "分镜 / 生成 / 剪辑",
    content: [
      p("changye", "镜头从一个固定的机位开始，车灯是唯一移动的东西。想让画面保持安静，所以把音乐也压得很低。", 1),
      video("changye", "youtube", "https://www.youtube.com/watch?v=aqz-KE-bpKQ", "长夜漫游 · 42 秒片段", "/seed/work-04.webp", 2),
      quote("changye", "夜里开车，路比目的地更像答案。", "旁白", 3),
    ],
  },
  {
    title: "城市呼吸", slug: "chengshi", category: "ai-video",
    summary: "楼群在雾里缓慢地起伏。",
    cover: "/seed/work-05.webp", coverAlt: "米灰色楼群与一轮淡色太阳", year: 2025,
    status: "published", featured: false, sortOrder: 50, publishedAt: "2026-06-18T04:00:00.000Z",
    tools: ["Runway", "After Effects"], tags: ["城市", "雾", "循环"], role: "生成 / 合成",
    content: [
      p("chengshi", "把城市当成一个会呼吸的物体。楼群的起伏只有 6 像素，但循环起来之后，画面就不再是静止的。", 1),
      video("chengshi", "youtube", "https://www.youtube.com/watch?v=ScMzIvxBSi4", "城市呼吸 · 18 秒循环", "/seed/work-05.webp", 2),
      link("chengshi", "https://example.com/city-notes", "城市观察笔记", "拍摄期间记下的颜色与天气。", 3),
    ],
  },
  {
    title: "纸上的城市", slug: "zhishang", category: "ai-novel",
    summary: "一座城市被折叠进一张纸里。",
    cover: "/seed/work-06.webp", coverAlt: "浅色纸面上的折纸山峦与房屋", year: 2026,
    status: "published", featured: true, sortOrder: 60, publishedAt: "2026-10-02T04:00:00.000Z",
    tools: ["Claude", "Midjourney"], tags: ["小说", "城市", "纸"], role: "文本 / 图像",
    content: [
      p("zhishang", "城市是从一张地图开始折的。先折出河，再折出桥，最后把人也折进去。", 1),
      heading("zhishang", "第一章 · 折痕", 2),
      p("zhishang", "她第一次发现城市可以折叠，是在一个没有风的下午。地图的边缘翘起来，像一张被反复打开又合上的纸。", 3),
      image("zhishang", "/seed/detail-04.webp", "纸面折出的山与房屋", "纸上的城市 · 内页插图", 4, 1600, 1000),
      prompt("zhishang", "Midjourney v6.1", "a city folded from paper, warm cream tones, soft shadows, editorial still life --ar 4:5", "text, people, clutter", { ar: "4:5" }, 5),
    ],
  },
  {
    title: "第七次涨潮", slug: "diqici", category: "ai-novel",
    summary: "第七次涨潮之后，岛就不见了。",
    cover: "/seed/work-07.webp", coverAlt: "暗色海面上的陶土色月亮", year: 2025,
    status: "published", featured: false, sortOrder: 70, publishedAt: "2026-05-22T04:00:00.000Z",
    tools: ["Claude", "Suno"], tags: ["小说", "海", "声音"], role: "文本 / 声音",
    content: [
      p("diqici", "岛上的人把每次涨潮都记在墙上。第七道线之后，墙也不见了。", 1),
      quote("diqici", "潮水退去的时候，岛还在。只是我们不再站在上面。", "第七次涨潮", 2),
      audio("diqici", "/seed/audio-seventh.wav", "第七次涨潮 · 环境声", 9, 3),
    ],
  },
  {
    title: "低频海", slug: "dipinhai", category: "ai-music",
    summary: "用很低的频率，模拟一次退潮。",
    cover: "/seed/work-08.webp", coverAlt: "深色背景上的同心圆与声波", year: 2026,
    status: "published", featured: false, sortOrder: 80, publishedAt: "2026-08-08T04:00:00.000Z",
    tools: ["Suno", "Ableton"], tags: ["环境", "低频", "海"], role: "作曲 / 混音",
    content: [
      p("dipinhai", "整首曲子只有四个音。低频负责水，高频负责光。", 1),
      audio("dipinhai", "/seed/audio-low-tide.wav", "低频海 · 试听", 7, 2),
      prompt("dipinhai", "Suno v4", "slow ambient drone, low tide, warm analog noise, no percussion", "vocals, drums, climax", { bpm: 52 }, 3),
    ],
  },
  {
    title: "采样练习", slug: "caoyang", category: "ai-music",
    summary: "把一张唱片拆成十六段。",
    cover: "/seed/work-09.webp", coverAlt: "米色背景上的黑胶唱片与同心纹", year: 2025,
    status: "published", featured: false, sortOrder: 90, publishedAt: "2026-04-14T04:00:00.000Z",
    tools: ["Ableton", "Suno"], tags: ["采样", "拼贴", "练习"], role: "采样 / 编排",
    content: [
      p("caoyang", "把同一张唱片拆成十六段，每段只留一个瞬间。最后再拼回去，听它变成另一张唱片。", 1),
      audio("caoyang", "/seed/audio-low-tide.wav", "采样练习 · 片段", 7, 2),
    ],
  },
  {
    title: "留白清单", slug: "liubai-qingdan", category: "ai-app",
    summary: "一个只记「不做什么」的清单。",
    cover: "/seed/work-10.webp", coverAlt: "纸面上的清单横线与一个陶土色圆点", year: 2026,
    status: "published", featured: false, sortOrder: 100, publishedAt: "2026-03-30T04:00:00.000Z",
    tools: ["Cursor", "Claude"], tags: ["工具", "清单", "留白"], role: "设计 / 开发",
    content: [
      p("liubai-qingdan", "大部分清单都在催你做事。这个反过来：每天只写三件今天不做的事。", 1),
      image("liubai-qingdan", "/seed/work-10.webp", "留白清单的纸面界面", "界面草图，1200 × 1500", 2),
      link("liubai-qingdan", "https://example.com/liubai-list", "项目说明", "一个很小的浏览器工具。", 3),
    ],
  },
  {
    title: "字体试衣间", slug: "ziti-shiyijian", category: "ai-app",
    summary: "给一段中文，换十种字体看看。",
    cover: "/seed/work-11.webp", coverAlt: "纸面上的巨大宋体「永」字", year: 2026,
    status: "draft", featured: false, sortOrder: 110, publishedAt: null,
    tools: ["Cursor"], tags: ["字体", "工具"], role: "设计 / 开发",
    content: [
      p("ziti-shiyijian", "还在做。想解决的是：选字体的时候，总是要先把整段文字复制到另一个页面。", 1),
      image("ziti-shiyijian", "/seed/work-11.webp", "字体试衣间的主界面", "草稿，1200 × 1500", 2),
    ],
  },
  {
    title: "值班编辑", slug: "zhiban-bianji", category: "ai-agent",
    summary: "一个只负责挑错的编辑。",
    cover: "/seed/work-12.webp", coverAlt: "深色界面上的圆形智能体与编辑提示", year: 2026,
    status: "draft", featured: false, sortOrder: 120, publishedAt: null,
    tools: ["Claude", "Cursor"], tags: ["智能体", "编辑", "工作流"], role: "设计 / 提示词",
    content: [
      p("zhiban-bianji", "它不改稿，只指出哪里读起来不对。像一个值夜班的编辑，话不多。", 1),
      prompt("zhiban-bianji", "Claude", "你是一名值班编辑。只指出事实错误、逻辑跳跃和语气不一致，不改写原文。每条意见不超过两句话。", "", { temperature: 0.3 }, 2),
    ],
  },
];

async function main() {
  if (process.env.SEED_RESET === "1") {
    await prisma.work.deleteMany();
    await prisma.media.deleteMany();
  }

  const hash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { username: adminUsername },
    update: { displayName: "留白", role: "admin" },
    create: { username: adminUsername, passwordHash: hash, displayName: "留白", role: "admin" },
  });

  await prisma.siteProfile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      siteName: "留白集",
      siteNameEn: "LIUBAI",
      ownerName: "留白",
      roleLine: "AIGC 创作者 · 视觉设计",
      heroEyebrow: "AIGC PORTFOLIO · 2026",
      tagline: "把生成模型当作笔，画一些安静的东西。",
      bio: "我是留白，一名 AIGC 创作者。用生成模型做图像、影像和文字，也做一些能跑起来的小工具。\n\n这里按媒介陈列作品，保留过程、提示词和失败稿。它们不是终点，只是某一刻的切片。",
      avatarUrl: "/seed/portrait.webp",
      email: ownerEmail,
      location: "杭州",
      availability: "开放合作",
      socials: [
        { label: "Instagram", url: "https://instagram.com" },
        { label: "小红书", url: "https://xiaohongshu.com" },
        { label: "Bilibili", url: "https://bilibili.com" },
      ],
      footerNote: "有一个想法，或只是想聊聊。",
      aboutTools: ["Midjourney", "ComfyUI", "Runway", "Suno", "Cursor", "Claude"],
      timeline: [
        { year: 2026, title: "开始整理留白集", description: "把散落的作品收进一个地方。" },
        { year: 2024, title: "转向影像与叙事", description: "从单张图走向分镜和声音。" },
        { year: 2022, title: "第一次用生成模型做原画", description: "从 Midjourney 开始。" },
      ],
    },
  });

  const categoryIds = new Map<string, string>();
  for (const category of categories) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, nameEn: category.nameEn, description: category.description, sortOrder: category.sortOrder, isVisible: true },
      create: category,
    });
    categoryIds.set(category.slug, row.id);
  }

  for (const work of works) {
    const categoryId = categoryIds.get(work.category);
    if (!categoryId) throw new Error(`missing category ${work.category}`);
    const data = {
      categoryId,
      title: work.title,
      summary: work.summary,
      coverUrl: work.cover,
      coverAlt: work.coverAlt,
      year: work.year,
      tools: work.tools,
      tags: work.tags,
      role: work.role ?? null,
      client: null,
      status: work.status,
      isFeatured: work.featured,
      sortOrder: work.sortOrder,
      content: work.content,
      publishedAt: work.publishedAt ? new Date(work.publishedAt) : null,
    };
    await prisma.work.upsert({
      where: { slug: work.slug },
      update: data,
      create: { ...data, slug: work.slug },
    });
  }

  const settings: Record<string, Prisma.InputJsonValue> = {
    "site.description": "留白集的 AIGC 作品集：原画、影像、小说、音乐与小型工具。",
    "seo.keywords": ["AIGC", "作品集", "AI 原画", "AI 视频", "AI 小说"],
    "seo.ogImage": "/seed/og-default.png",
    nav: { home: true, works: true, about: true },
    "footer.icp": "浙ICP备00000000号",
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }

  const counts = await prisma.work.groupBy({ by: ["status"], _count: true });
  console.log(`seeded ${works.length} works, ${categories.length} categories, admin "${adminUsername}"`);
  console.log(`works by status: ${counts.map((c) => `${c.status}=${c._count}`).join(", ")}`);
  console.log(`login: ${adminUsername} / ${adminPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
