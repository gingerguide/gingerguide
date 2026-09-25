#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { realpathSync } from 'node:fs';

export const API_BASE = 'https://gingerguide.app/api/v1';

const HELP = `Gingerguide CLI — public city catalog (no auth)

Usage:
  gingerguide cities              List covered cities
  gingerguide city <id>           One city and its narrated sights (e.g. rome)
  gingerguide countries           Countries and city counts
  gingerguide health              API health and catalog totals
  gingerguide --help              Show this help

Docs: https://gingerguide.app/developers/
OpenAPI: https://gingerguide.app/openapi.json
MCP: https://gingerguide.app/mcp
`;

export function parseArgs(argv) {
  const args = argv.slice(2).filter((a) => a !== '--json');
  if (args.length === 0 || args[0] === '-h' || args[0] === '--help') {
    return { cmd: 'help' };
  }
  const cmd = args[0];
  if (cmd === 'cities' || cmd === 'countries' || cmd === 'health') {
    return { cmd };
  }
  if (cmd === 'city') {
    const id = (args[1] || '').trim().toLowerCase();
    if (!id) return { cmd: 'error', message: 'city requires an id, e.g. gingerguide city rome' };
    return { cmd: 'city', id };
  }
  return { cmd: 'error', message: `Unknown command "${cmd}". Try gingerguide --help.` };
}

export function urlFor(parsed) {
  switch (parsed.cmd) {
    case 'cities':
      return `${API_BASE}/cities.json`;
    case 'countries':
      return `${API_BASE}/countries.json`;
    case 'health':
      return `${API_BASE}/health.json`;
    case 'city':
      return `${API_BASE}/cities/${encodeURIComponent(parsed.id)}.json`;
    default:
      return null;
  }
}

async function main(argv = process.argv) {
  const parsed = parseArgs(argv);
  if (parsed.cmd === 'help') {
    process.stdout.write(HELP);
    return 0;
  }
  if (parsed.cmd === 'error') {
    process.stderr.write(parsed.message + '\n');
    return 1;
  }
  const url = urlFor(parsed);
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  const text = await res.text();
  process.stdout.write(text.endsWith('\n') ? text : text + '\n');
  return res.ok ? 0 : 1;
}

// Run main() when invoked as a script/bin. process.argv[1] is often a symlink
// (npm/npx put a link in node_modules/.bin), and import.meta.url is the real
// file, so resolve the symlink with realpathSync before comparing.
function isInvokedAsScript() {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return import.meta.url === pathToFileURL(realpathSync(entry)).href;
  } catch {
    return false;
  }
}

if (isInvokedAsScript()) {
  main().then((code) => process.exit(code));
}
