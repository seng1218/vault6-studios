#!/usr/bin/env node
// Post-build patch: replace @prisma/client-hash symlink with a shim that
// directly loads .prisma/client/wasm.js (bypassing the #main-entry-point
// conditional that nodejs_compat forces to pick the native engine).

const fs = require('fs');
const path = require('path');

const dotNextNodeModules = path.join(
  __dirname,
  '.open-next/server-functions/default/.next/node_modules'
);

// Find the hashed @prisma/client symlink
const prismaDir = path.join(dotNextNodeModules, '@prisma');
if (!fs.existsSync(prismaDir)) {
  console.log('No @prisma dir found in .next/node_modules — skipping');
  process.exit(0);
}

const entries = fs.readdirSync(prismaDir, { withFileTypes: true });
const clientEntries = entries.filter(e => e.name.startsWith('client-'));

if (clientEntries.length === 0) {
  console.log('No hashed @prisma/client entry found — skipping');
  process.exit(0);
}

for (const entry of clientEntries) {
  const entryPath = path.join(prismaDir, entry.name);
  console.log(`Patching ${entry.name} (${entry.isSymbolicLink() ? 'symlink' : 'dir'})`);

  // Remove the symlink or existing directory
  if (entry.isSymbolicLink()) {
    fs.unlinkSync(entryPath);
  } else if (entry.isDirectory()) {
    fs.rmSync(entryPath, { recursive: true, force: true });
  }

  // Create shim directory
  fs.mkdirSync(entryPath, { recursive: true });

  // package.json
  fs.writeFileSync(
    path.join(entryPath, 'package.json'),
    JSON.stringify({ name: entry.name, version: '1.0.0', main: 'index.js' }, null, 2)
  );

  // index.js — direct load of .prisma/client/wasm (no conditional resolution)
  // Path: ../{hash-dir}/index.js -> ../../../node_modules/.prisma/client/wasm
  fs.writeFileSync(
    path.join(entryPath, 'index.js'),
    `// Shim: force wasm engine, bypassing nodejs_compat "node" condition
module.exports = require('../../../node_modules/.prisma/client/wasm');
`
  );

  console.log(`  Created shim at ${entryPath}`);
}

console.log('Prisma WASM shim patch done.');
