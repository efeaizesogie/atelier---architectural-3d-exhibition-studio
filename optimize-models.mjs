/**
 * optimize-models.mjs
 * 
 * Optimizes all .glb files in public/models/ using @gltf-transform/core + extensions.
 * Run: node optimize-models.mjs
 * 
 * Install deps once:
 *   npm install --save-dev @gltf-transform/core @gltf-transform/functions @gltf-transform/extensions
 */

import { NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, EXTTextureWebP, KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
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
const SIMPLIFY_RATIO = 0.75;
const SIMPLIFY_ERROR = 0.001;

async function optimizeFile(inputPath) {
  await MeshoptDecoder.ready;
  await MeshoptSimplifier.ready;

  const io = new NodeIO()
    .registerExtensions([...KHRONOS_EXTENSIONS, EXTMeshoptCompression, EXTTextureWebP])
    .registerDependencies({
      'meshopt.decoder': MeshoptDecoder,
      'meshopt.encoder': MeshoptSimplifier,
    });

  console.log(`\n⚙  Optimizing: ${basename(inputPath)}`);
  const document = await io.read(inputPath);

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
  console.log(`✅ Done: ${basename(inputPath)}`);
}

async function main() {
  await MeshoptSimplifier.ready;

  const files = readdirSync(MODELS_DIR).filter(
    (f) => extname(f).toLowerCase() === '.glb' && statSync(pathJoin(MODELS_DIR, f)).isFile()
  );

  if (files.length === 0) {
    console.log('No .glb files found in public/models/');
    return;
  }

  console.log(`Found ${files.length} model(s) to optimize...`);

  for (const file of files) {
    await optimizeFile(pathJoin(MODELS_DIR, file));
  }

  console.log('\n🎉 All models optimized. Drop new .glb files into public/models/ and re-run this script.');
}

main().catch((err) => {
  console.error('Optimization failed:', err.message);
  process.exit(1);
});
