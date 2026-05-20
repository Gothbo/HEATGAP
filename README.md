# HeatGap — 热量差追踪 PWA

记录每日饮食摄入与训练消耗，科学计算热量缺口。

## 功能

- **饮食记录** — 自然语言输入 `250g熟米饭 100g鸡胸肉`，自动匹配营养数据库
- **训练记录** — 选择推/拉/腿日，填写重量，自动按 MET 公式计算消耗
- **热量缺口仪表盘** — 每日摄入 vs 消耗 vs 目标缺口可视化
- **历史趋势** — 近 14 天热量差数据

## 技术栈

Next.js 16 · Tailwind CSS v4 · Prisma 5 · SQLite · Vercel · PWA

## 本地运行

```bash
npm install
npm run dev
```

打开 http://localhost:3000
