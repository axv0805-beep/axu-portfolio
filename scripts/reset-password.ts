import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

async function main() {
  const password = process.argv.slice(2).filter((arg) => arg !== "--")[0];

  if (!password || password.length < 8) {
    console.error("用法：corepack pnpm reset-password -- <至少 8 位的新密码>");
    process.exitCode = 1;
    return;
  }

  const prisma = new PrismaClient();

  try {
    const hash = await bcrypt.hash(password, 12);
    const result = await prisma.user.updateMany({
      data: { passwordHash: hash, sessionEpoch: { increment: 1 } },
    });

    if (result.count === 0) {
      console.error("没有找到管理员账号，请先运行 db:seed。");
      process.exitCode = 1;
    } else {
      console.log(`已重置 ${result.count} 个账号的密码。其他设备的登录已失效。`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
