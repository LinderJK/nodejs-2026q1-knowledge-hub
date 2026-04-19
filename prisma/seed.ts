import { ArticleStatus, PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.POSTGRES_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const [adminPassword, editorPassword] = await Promise.all([
    bcrypt.hash('admin123', 10),
    bcrypt.hash('editor123', 10),
  ]);

  await prisma.comment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      login: 'admin',
      password: adminPassword,
      role: 'admin',
    },
  });

  const editor = await prisma.user.create({
    data: {
      login: 'editor',
      password: editorPassword,
      role: 'editor',
    },
  });

  const [backend, frontend, devops] = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Backend',
        description: 'Backend development',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Frontend',
        description: 'Frontend development',
      },
    }),
    prisma.category.create({
      data: {
        name: 'DevOps',
        description: 'DevOps development',
      },
    }),
  ]);

  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'nestjs' } }),
    prisma.tag.create({ data: { name: 'typescript' } }),
    prisma.tag.create({ data: { name: 'postgres' } }),
    prisma.tag.create({ data: { name: 'docker' } }),
    prisma.tag.create({ data: { name: 'testing' } }),
  ]);

  const [tNest, tTs, tPg, tDocker, tTesting] = tags;

  const articles = await Promise.all([
    prisma.article.create({
      data: {
        title: 'nestjs',
        content: 'nestjs content',
        status: ArticleStatus.DRAFT,
        authorId: admin.id,
        categoryId: backend.id,
        tags: {
          create: [
            { tag: { connect: { id: tNest.id } } },
            { tag: { connect: { id: tTs.id } } },
          ],
        },
      },
    }),
    prisma.article.create({
      data: {
        title: 'postgresql',
        content: 'postgresql content',
        status: ArticleStatus.PUBLISHED,
        authorId: admin.id,
        categoryId: backend.id,
        tags: {
          create: [
            { tag: { connect: { id: tPg.id } } },
            { tag: { connect: { id: tTesting.id } } },
          ],
        },
      },
    }),
    prisma.article.create({
      data: {
        title: 'frontend',
        content: 'frontend content',
        status: ArticleStatus.ARCHIVED,
        authorId: editor.id,
        categoryId: frontend.id,
        tags: {
          create: [{ tag: { connect: { id: tTs.id } } }],
        },
      },
    }),
    prisma.article.create({
      data: {
        title: 'docker',
        content: 'docker content',
        status: ArticleStatus.PUBLISHED,
        authorId: editor.id,
        categoryId: devops.id,
        tags: {
          create: [
            { tag: { connect: { id: tDocker.id } } },
            { tag: { connect: { id: tNest.id } } },
          ],
        },
      },
    }),
    prisma.article.create({
      data: {
        title: 'testing',
        content: 'testing content',
        status: ArticleStatus.DRAFT,
        authorId: admin.id,
        categoryId: backend.id,
        tags: {
          create: [
            { tag: { connect: { id: tTesting.id } } },
            { tag: { connect: { id: tTs.id } } },
          ],
        },
      },
    }),
  ]);

  await prisma.comment.createMany({
    data: [
      {
        content: 'comment 1',
        articleId: articles[0].id,
        authorId: editor.id,
      },
      {
        content: 'comment 2',
        articleId: articles[1].id,
        authorId: admin.id,
      },
      {
        content: 'comment 3',
        articleId: articles[3].id,
        authorId: editor.id,
      },
    ],
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
