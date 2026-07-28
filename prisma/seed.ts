import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ROLES = [
  {
    slug: "junior-fullstack",
    title: "Junior Full-Stack Engineer",
    description: "Entry-level web development across frontend and backend.",
  },
  {
    slug: "frontend-engineer",
    title: "Frontend Engineer",
    description: "UI engineering with React and modern web platforms.",
  },
  {
    slug: "backend-engineer",
    title: "Backend Engineer",
    description: "APIs, data modeling, and service reliability.",
  },
  {
    slug: "fullstack-engineer",
    title: "Full-Stack Engineer",
    description: "End-to-end product features across the stack.",
  },
  {
    slug: "data-engineer",
    title: "Data Engineer",
    description: "Pipelines, warehousing, and data quality.",
  },
  {
    slug: "mobile-engineer",
    title: "Mobile Engineer",
    description: "Native or cross-platform mobile applications.",
  },
  {
    slug: "devops-engineer",
    title: "DevOps / Platform Engineer",
    description: "CI/CD, infrastructure, and developer experience.",
  },
  {
    slug: "ml-engineer",
    title: "ML Engineer",
    description: "Model training, evaluation, and production ML systems.",
  },
];

async function main() {
  for (const role of ROLES) {
    await prisma.roleCatalogEntry.upsert({
      where: { slug: role.slug },
      update: { title: role.title, description: role.description },
      create: role,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
