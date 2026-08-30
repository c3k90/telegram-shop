# Telegram Shop

A forkable Telegram Mini App shop with a web admin. One shop per deploy: set your own bot, database, and admin password.

- **Shop** (`/`): catalog, product pages, cart, checkout, and order history inside Telegram
- **Admin** (`/admin`): products, orders, and shop settings in a normal browser
- **Bot**: `/start` opens the Mini App

Payments are pluggable. This MVP creates `PENDING` orders with a manual payment adapter. Telegram Stars or Stripe can be added later without changing the schema.

## Stack

- Next.js (App Router) + React 19 + TypeScript + Tailwind + shadcn/ui
- Prisma + PostgreSQL
- `@telegram-apps/sdk` + grammY

## Quick start

```bash
cp .env.example .env
docker compose up -d
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open:

- Shop (browser mock Telegram user): [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin) — password from `ADMIN_PASSWORD`

Local shop API calls are signed with `DEV_BOT_TOKEN` / `NEXT_PUBLIC_DEV_BOT_TOKEN`. Use a throwaway BotFather token for that, never your production bot token.

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `BOT_TOKEN` | for Telegram | Bot token from [@BotFather](https://t.me/BotFather) |
| `APP_URL` | for Telegram | Public HTTPS URL of this app |
| `ADMIN_PASSWORD` | yes | Admin dashboard password |
| `ADMIN_SESSION_SECRET` | recommended | Signs the admin cookie |
| `WEBHOOK_SECRET` | recommended | Telegram webhook `secret_token` |
| `DEV_BOT_TOKEN` | local only | Signs mock Mini App `initData` |
| `NEXT_PUBLIC_DEV_BOT_TOKEN` | local only | Must match `DEV_BOT_TOKEN` |

## Telegram setup

1. Create a bot with [@BotFather](https://t.me/BotFather) → `/newbot`
2. Create a Mini App → `/newapp` and set the URL to `APP_URL`
3. Optional: `/setmenubutton` so the shop opens from the bot menu
4. Deploy this app (Vercel works) and set the webhook:

```bash
curl "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" \
  -d "url=$APP_URL/api/telegram/webhook" \
  -d "secret_token=$WEBHOOK_SECRET"
```

5. Send `/start` to the bot and open the shop

## Scripts

```bash
npm run dev
npm run build
npm run db:migrate
npm run db:seed
npm run db:studio
```

## Product model

Products can be `DIGITAL`, `PHYSICAL`, or `SERVICE`. Physical products require a shipping address at checkout. Stock is optional (`null` means unlimited).

## License

MIT
