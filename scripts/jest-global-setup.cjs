require('dotenv').config();

if (
  process.env.DATABASE_URL?.startsWith('prisma+') &&
  process.env.POSTGRES_URL
) {
  process.env.DATABASE_URL = process.env.POSTGRES_URL;
}

require('tsconfig-paths/register');
require('ts-node/register/transpile-only');

const seed = require('../test/setup/seedAdmin.ts').default;

module.exports = seed;
