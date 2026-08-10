/**
 * optimize-models.mjs
 *
 * Optimizes .glb files in public/models/.
 * - Already meshopt/draco-compressed: skipped (already optimal, re-writing inflates them)
 * - Uncompressed models: prune + dedup + weld + simplify + join
 *
 * Run: npm run optimize-models
 *
 * Install deps once:
 *   npm install --save-dev @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions meshoptimizer
 */

import { NodeIO } from '@gltf-transform/core';
import {
  KHRONOS_EXTENSIONS,
  EXTMeshoptCompression,
  EXTTextureWebP,
  EXTTextureAVIF,
} from '@gltf-transform/extensions';
import {
  dedup,
  flatten,
  join,
  prune,
  resample,
  simplify,
  sparse,
  weld,
} from '@gltf-transform/functions';
import { MeshoptSimplifier, MeshoptDecoder } from 'meshoptimizer';
import { readdirSync, statSync } from 'fs';
import { join as pathJoin, extname, basename } from 'path';

const MODELS_DIR = './public/models';
const SIMPLIFY_RATIO = 0.75; // Keep 75% of triangles
const SIMPLIFY_ERROR = 0.001;

function formatBytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

const COMPRESSED_EXTENSIONS = [
  'EXT_meshopt_compression',
  'KHR_draco_mesh_compression',
];

async function optimizeFile(inputPath) {
  await MeshoptDecoder.ready;
  await MeshoptSimplifier.ready;

  const io = new NodeIO()
    .registerExtensions([
      ...KHRONOS_EXTENSIONS,
      EXTMeshoptCompression,
      EXTTextureWebP,
      EXTTextureAVIF,
    ])
    .registerDependencies({ 'meshopt.decoder': MeshoptDecoder });

  const beforeSize = statSync(inputPath).size;
  console.log(`\n⚙  Processing: ${basename(inputPath)} (${formatBytes(beforeSize)})`);

  const document = await io.read(inputPath);

  const usedExtensions = document.getRoot().listExtensionsUsed().map((e) => e.extensionName);
  const isAlreadyCompressed = usedExtensions.some((name) => COMPRESSED_EXTENSIONS.includes(name));

  if (isAlreadyCompressed) {
    console.log(`   ✓ Already compressed (${usedExtensions.filter(n => COMPRESSED_EXTENSIONS.includes(n)).join(', ')}) — skipping to preserve file size.`);
    return;
  }

  // Uncompressed model — apply full optimization pipeline
  await document.transform(
    prune(),
    dedup(),
    flatten(),
    weld({ tolerance: 0.0001 }),
    resample(),
    simplify({ simplifier: MeshoptSimplifier, ratio: SIMPLIFY_RATIO, error: SIMPLIFY_ERROR }),
    join(),
    sparse(),
  );

  await io.write(inputPath, document);

  const afterSize = statSync(inputPath).size;
  const pct = ((1 - afterSize / beforeSize) * 100).toFixed(1);
  console.log(`✅ Optimized: ${basename(inputPath)} → ${formatBytes(afterSize)} (-${pct}%)`);
}

async function main() {
  const files = readdirSync(MODELS_DIR).filter(
    (f) => extname(f).toLowerCase() === '.glb' && statSync(pathJoin(MODELS_DIR, f)).isFile()
  );

  if (files.length === 0) {
    console.log('No .glb files found in public/models/');
    return;
  }

  console.log(`Found ${files.length} model(s)...`);
  for (const file of files) {
    await optimizeFile(pathJoin(MODELS_DIR, file));
  }

  console.log('\n🎉 Done. Add new .glb filenames to MODEL_FILES in src/data/exhibits.ts to display them.');
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
