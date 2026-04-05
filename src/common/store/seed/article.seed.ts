import { ArticleStatus } from 'src/modules/article/types/article.types';

export const articlesSeedData = [
  {
    title: 'My first article',
    content: 'Hello world...',
    status: ArticleStatus.DRAFT,
    tags: ['tag1', 'tag2'],
  },
  {
    title: 'My second article',
    content: 'Hello world...',
    status: ArticleStatus.PUBLISHED,
    tags: ['tag3', 'tag4'],
  },
  {
    title: 'My third article',
    content: 'Hello world...',
    status: ArticleStatus.ARCHIVED,
    tags: ['tag5', 'tag6'],
  },
  {
    title: 'My fourth article',
    content: 'Hello world...',
    status: ArticleStatus.PUBLISHED,
    tags: ['tag7', 'tag8'],
  },
  {
    title: 'My fifth article',
    content: 'Hello world...',
    status: ArticleStatus.PUBLISHED,
    tags: ['tag9', 'tag10'],
  },
  {
    title: 'My sixth article',
    content: 'Hello world...',
    status: ArticleStatus.PUBLISHED,
    tags: ['tag11', 'tag12'],
  },
  {
    title: 'My seventh article',
    content: 'Hello world...',
    status: ArticleStatus.PUBLISHED,
    tags: ['tag13', 'tag14'],
  },
];
