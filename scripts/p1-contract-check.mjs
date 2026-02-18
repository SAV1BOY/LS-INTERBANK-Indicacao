import fs from 'node:fs';
import assert from 'node:assert/strict';

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

const statusUtils = read('lib/utils/status.ts');
const schema = read('prisma/schema.prisma');

const reasonKeys = [...statusUtils.matchAll(/^\s{2}([A-Z_]+):\s*'/gm)].map((m) => m[1]);
const closeReasonBlock = schema.match(/enum CloseReason \{([\s\S]*?)\n\}/m)?.[1] ?? '';
const enumKeys = [...closeReasonBlock.matchAll(/^\s{2}([A-Z_]+)/gm)].map((m) => m[1]);

for (const key of ['VENDA_REALIZADA','SEM_INTERESSE','SEM_FIT','SEM_CONTATO','JA_CLIENTE','CONCORRENTE','TIMING','DUPLICADA','SEM_CONSENTIMENTO','DADOS_INCORRETOS','NAO_ATENDE_TELEFONE','OUTRO']) {
  assert.ok(enumKeys.includes(key), `CloseReason ausente no schema: ${key}`);
  assert.ok(reasonKeys.includes(key), `CloseReason ausente em status.ts: ${key}`);
}

const guardedRoutes = [
  'app/api/leads/route.ts',
  'app/api/leads/[id]/route.ts',
  'app/api/leads/[id]/status/route.ts',
  'app/api/leads/[id]/assign/route.ts',
  'app/api/leads/[id]/interactions/route.ts',
  'app/api/users/route.ts',
  'app/api/users/[id]/route.ts',
  'app/api/dashboard/stats/route.ts',
  'app/api/dashboard/performance/route.ts',
  'app/api/reports/export/route.ts',
];

for (const route of guardedRoutes) {
  const content = read(route);
  assert.ok(content.includes('requireUser') || content.includes('requireRoles'), `Guard de auth ausente em ${route}`);
}

console.log('P1 contract checks passed');
