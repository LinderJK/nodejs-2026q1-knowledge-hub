import path from 'node:path';
import { defineConfig } from 'vitest/config';

const root = process.cwd();
const p = (rel: string) => path.join(root, rel) + path.sep;
const f = (rel: string) => path.join(root, rel);

export default defineConfig({
  resolve: {
    alias: [
      { find: /^src\//, replacement: p('src') },
      { find: /^generated\//, replacement: p('generated') },
      { find: /^@prisma\/client\/runtime\//, replacement: p(path.join('node_modules', '@prisma', 'client', 'runtime')) },
      { find: '@prisma/client', replacement: f('generated/prisma/client') },
      { find: '@generated', replacement: f('generated') },
      { find: '@', replacement: f('src') },
    ],
  },
  test: {
    name: 'unit',
    root,
    globals: true,
    environment: 'node',
    pool: 'forks',
    setupFiles: [path.join(root, 'vitest.setup.ts')],
    include: [
      'src/**/*.unit.spec.ts',
      'src/**/*.unit.test.ts',
      'src/**/__tests__/unit/**/*.[jt]s',
    ],
    exclude: ['node_modules', 'dist', 'test'],
    server: {
      deps: { inline: [/^@nestjs\//] },
    },
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reportOnFailure: true,
      include: ['src/**/*.ts'],
      exclude: [
        '**/*.unit.spec.ts',
        '**/*.unit.test.ts',
        '**/__tests__/**',
        'src/main.ts',
        '**/*.module.ts',
        '**/*.types.ts',
        '**/node_modules/**',
      ],
      thresholds: {
        lines: 90,
        branches: 85,
      },
    },
  },
});
