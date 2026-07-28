This is a [Next.js](https://nextjs.org) project for the **AI Interview Preparation Platform**, using **BMAD Method** and **GitHub Spec Kit** for planning and delivery.

## Governance

Non-negotiable engineering principles live in [`.specify/memory/constitution.md`](.specify/memory/constitution.md) (type safety, security/privacy, test-first, AI reliability, accessibility, simplicity, traceability).

Agent implementation rules: [`_bmad-output/project-context.md`](_bmad-output/project-context.md).

## Getting Started

```bash
cp .env.example .env   # fill secrets locally — never commit `.env`
npm install
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Authentication (feature `001-user-auth`)

Local Auth.js setup (Google + Resend magic link, Prisma sessions, Vitest/Playwright checks): see [`specs/001-user-auth/quickstart.md`](specs/001-user-auth/quickstart.md).

```bash
npm test          # Vitest domain/ownership helpers
npm run test:e2e  # Playwright auth flows (needs app + env)
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
