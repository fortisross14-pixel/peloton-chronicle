import { spawnSync } from 'node:child_process';

const groups = [
  '^(creates|advances|simulates|results|renders navigation|end of year|opening the next|Hall|repairs|renders full)',
  '^(uses realistic|career plans|facility|rider and team|rarity|specialists|deterministic|v1.2|rider overview|UCI rankings|consecutive number)'
];

for (const pattern of groups) {
  const result = spawnSync(process.execPath, [
    '--test',
    '--test-concurrency=1',
    '--test-reporter=spec',
    `--test-name-pattern=${pattern}`,
    'tests/engine.test.js'
  ], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
