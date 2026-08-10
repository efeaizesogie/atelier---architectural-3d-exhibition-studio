import { NodeIO } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS, EXTMeshoptCompression, EXTTextureWebP, EXTTextureAVIF } from '@gltf-transform/extensions';
import { dedup, prune, weld, simplify, flatten, join } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import { statSync } from 'fs';

const INPUT  = './src/models/character.glb';   // original — never modified
const OUTPUT = './public/models/character.glb'; // optimized output
const RATIO  = 0.2;   // keep 20% of triangles → ~96K from 481K
const ERROR  = 0.005; // max allowed geometric error

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

async function main() {
  await MeshoptDecoder.ready;
  await MeshoptEncoder.ready;
  await MeshoptSimplifier.ready;

  const io = new NodeIO()
    .registerExtensions([...KHRONOS_EXTENSIONS, EXTMeshoptCompression, EXTTextureWebP, EXTTextureAVIF])
    .registerDependencies({
      'meshopt.decoder': MeshoptDecoder,
      'meshopt.encoder': MeshoptEncoder,
    });

  const beforeSize = statSync(INPUT).size;
  console.log(`Reading original... (${(beforeSize / 1024 / 1024).toFixed(2)} MB)`);

  const doc = await io.read(INPUT);

  const trisBefore = countTris(doc);
  console.log(`Triangles before: ${trisBefore.toLocaleString()}`);

  // Strip existing meshopt extension — it will be re-applied fresh on write
  doc.getRoot().listExtensionsUsed().forEach(ext => {
    if (ext.extensionName === 'EXT_meshopt_compression') ext.dispose();
  });

  // Re-enable meshopt compression for the output
  doc.createExtension(EXTMeshoptCompression).setRequired(true);

  console.log('Running optimisation pipeline...');
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
  console.log(`Triangles after:  ${trisAfter.toLocaleString()} (${((1 - trisAfter / trisBefore) * 100).toFixed(1)}% reduction)`);

  console.log('Writing output...');
  await io.write(OUTPUT, doc);

  const afterSize = statSync(OUTPUT).size;
  console.log(`File size: ${(beforeSize / 1024 / 1024).toFixed(2)} MB → ${(afterSize / 1024 / 1024).toFixed(2)} MB`);
  console.log('Done.');
}

main().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
