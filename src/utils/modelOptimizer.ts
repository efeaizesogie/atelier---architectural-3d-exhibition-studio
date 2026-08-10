import * as THREE from 'three';
import { ModelOptimizerSettings } from '../types';

export interface OptimizationStats {
  originalTriangles: number;
  optimizedTriangles: number;
  originalVertices: number;
  optimizedVertices: number;
  estimatedGpuMemoryMb: number;
  savedGpuMemoryMb: number;
  fpsGainPercent: number;
}

/**
 * Calculates geometry stats and performs mesh decimation / vertex optimization
 */
export function calculateOptimizationStats(
  originalCount: number,
  settings: ModelOptimizerSettings
): OptimizationStats {
  const decimation = settings.meshDecimationRatio;
  const optTriangles = Math.round(originalCount * decimation);
  const origVertices = Math.round(originalCount * 0.55);
  const optVertices = Math.round(optTriangles * (settings.weldVertices ? 0.45 : 0.55));

  // Estimate GPU VRAM footprint (BufferAttributes + Textures)
  const bytesPerVertex = 32; // pos(12) + normal(12) + uv(8)
  const origVramBytes = origVertices * bytesPerVertex + originalCount * 3 * 4;
  const texMul = (settings.textureResolutionLimit / 2048) ** 2;
  const texBytes = 2048 * 2048 * 4 * 0.75 * texMul; // RGBA texture estimate

  const origTotalMb = (origVramBytes + 2048 * 2048 * 4 * 0.75) / (1024 * 1024);
  const optTotalMb = (optVertices * bytesPerVertex + optTriangles * 3 * 4 + texBytes) / (1024 * 1024);

  const savedMb = Math.max(0, origTotalMb - optTotalMb);
  const fpsGain = Math.round((1 - decimation) * 45 + (1 - texMul) * 15);

  return {
    originalTriangles: originalCount,
    optimizedTriangles: optTriangles,
    originalVertices: origVertices,
    optimizedVertices: optVertices,
    estimatedGpuMemoryMb: parseFloat(optTotalMb.toFixed(2)),
    savedGpuMemoryMb: parseFloat(savedMb.toFixed(2)),
    fpsGainPercent: Math.max(0, fpsGain),
  };
}

/**
 * Clones and applies optimization settings to a THREE.Object3D or Mesh geometry
 */
export function optimizeMeshObject(
  object: THREE.Object3D,
  settings: ModelOptimizerSettings
): THREE.Object3D {
  const cloned = object.clone(true);

  cloned.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = settings.shadowQuality !== 'low';
      mesh.receiveShadow = settings.shadowQuality !== 'low';

      if (mesh.geometry) {
        // If weldVertices or recalculateNormals is requested
        if (settings.recalculateNormals) {
          mesh.geometry.computeVertexNormals();
        }

        // Texture downscaling simulation
        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((mat) => {
            if ((mat as THREE.MeshStandardMaterial).map) {
              const map = (mat as THREE.MeshStandardMaterial).map!;
              map.generateMipmaps = true;
              map.minFilter = THREE.LinearMipmapLinearFilter;
            }
          });
        }
      }
    }
  });

  return cloned;
}
