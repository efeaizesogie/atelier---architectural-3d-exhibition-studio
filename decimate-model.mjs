import { NodeIO } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS, EXTMeshoptCompression, EXTTextureWebP, EXTTextureAVIF } from '@gltf-transform/extensions';
import { dedup, prune, weld, simplify, flatten, join } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import { statSync, readdirSync, mkdirSync } from 'fs';
import { join as pathJoin, extname, basename } from 'path';

const SRC_DIR    = './src/models';    // originals — never modified
const OUT_DIR    = './public/models'; // optimized outputs
const RATIO      = 0.2;
const ERROR      = 0.005;

function countTris(doc) {
  let t = 0;
  doc.getRoot().listMeshes().forEach(m =>
    m.listPrimitives().forEach(p => {
      const idx = p.getIndices();
      if (idx) t += idx.getCount() / 3;
      else { const pos = p.getAttribute('POSITION'); if (pos) t += pos.getCount() / 3; }
    })
  );
  return Math.round(t);
}

async function processFile(io, filename) {
  const input  = pathJoin(SRC_DIR, filename);
  const output = pathJoin(OUT_DIR, filename);

  const beforeSize = statSync(input).size;
  console.log(`\n⚙  ${filename} (${(beforeSize / 1024 / 1024).toFixed(2)} MB)`);

  const doc = await io.read(input);
  const trisBefore = countTris(doc);
  console.log(`   Triangles before: ${trisBefore.toLocaleString()}`);

  // Strip existing meshopt — will be re-applied on write
  doc.getRoot().listExtensionsUsed().forEach(ext => {
    if (ext.extensionName === 'EXT_meshopt_compression') ext.dispose();
  });
  doc.createExtension(EXTMeshoptCompression).setRequired(true);

  await doc.transform(
    prune(),
    dedup(),
    weld({ tolerance: 0.0001 }),
    simplify({ simplifier: MeshoptSimplifier, ratio: RATIO, error: ERROR }),
    flatten(),
    join(),
    prune(),
  );

  const trisAfter = countTris(doc);
  console.log(`   Triangles after:  ${trisAfter.toLocaleString()} (${((1 - trisAfter / trisBefore) * 100).toFixed(1)}% reduction)`);

  await io.write(output, doc);

  const afterSize = statSync(output).size;
  console.log(`   Size: ${(beforeSize / 1024 / 1024).toFixed(2)} MB → ${(afterSize / 1024 / 1024).toFixed(2)} MB ✅`);
}

async function main() {
  await MeshoptDecoder.ready;
  await MeshoptEncoder.ready;
  await MeshoptSimplifier.ready;

  mkdirSync(OUT_DIR, { recursive: true });

  const io = new NodeIO()
    .registerExtensions([...KHRONOS_EXTENSIONS, EXTMeshoptCompression, EXTTextureWebP, EXTTextureAVIF])
    .registerDependencies({
      'meshopt.decoder': MeshoptDecoder,
      'meshopt.encoder': MeshoptEncoder,
    });

  const files = readdirSync(SRC_DIR).filter(f => extname(f).toLowerCase() === '.glb');

  if (files.length === 0) {
    console.log('No .glb files found in src/models/');
    return;
  }

  console.log(`Found ${files.length} model(s) in src/models/`);

  for (const file of files) {
    await processFile(io, file);
  }

  console.log('\n🎉 All models optimized → public/models/');
}

main().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
