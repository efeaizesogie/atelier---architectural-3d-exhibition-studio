import React, { useMemo } from 'react';
import * as THREE from 'three';

interface CADBlueprintOverlayProps {
  active: boolean;
  roomName: string;
}

export const CADBlueprintOverlay: React.FC<CADBlueprintOverlayProps> = ({ active }) => {
  const gridGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const size = 12;
    const step = 0.8;

    // Floor grid lines
    for (let i = -size; i <= size; i += step) {
      points.push(new THREE.Vector3(i, 0.01, -size));
      points.push(new THREE.Vector3(i, 0.01, size));

      points.push(new THREE.Vector3(-size, 0.01, i));
      points.push(new THREE.Vector3(size, 0.01, i));
    }

    // Rear wall CAD wireframe outline
    const wallZ = -5.95;
    for (let y = 0; y <= 6.5; y += 1.0) {
      points.push(new THREE.Vector3(-10, y, wallZ));
      points.push(new THREE.Vector3(10, y, wallZ));
    }
    for (let x = -10; x <= 10; x += 1.5) {
      points.push(new THREE.Vector3(x, 0, wallZ));
      points.push(new THREE.Vector3(x, 6.5, wallZ));
    }

    // Ceiling Recessed Coves
    const ceilingY = 6.9;
    points.push(new THREE.Vector3(-5, ceilingY, -4));
    points.push(new THREE.Vector3(5, ceilingY, -4));
    points.push(new THREE.Vector3(5, ceilingY, -4));
    points.push(new THREE.Vector3(5, ceilingY, 2));
    points.push(new THREE.Vector3(5, ceilingY, 2));
    points.push(new THREE.Vector3(-5, ceilingY, 2));
    points.push(new THREE.Vector3(-5, ceilingY, 2));
    points.push(new THREE.Vector3(-5, ceilingY, -4));

    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  if (!active) return null;

  return (
    <group>
      {/* Pure 3D Blueprint Line Grid without Text overlays */}
      <lineSegments geometry={gridGeometry}>
        <lineBasicMaterial color="#e2c992" opacity={0.65} transparent linewidth={1.5} />
      </lineSegments>

      {/* Pedestal Pedestal Axis Bounds */}
      <lineSegments>
        <bufferGeometry
          attach="geometry"
          {...new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-0.8, 0.02, -0.8), new THREE.Vector3(0.8, 0.02, -0.8),
            new THREE.Vector3(0.8, 0.02, -0.8), new THREE.Vector3(0.8, 0.02, 0.8),
            new THREE.Vector3(0.8, 0.02, 0.8), new THREE.Vector3(-0.8, 0.02, 0.8),
            new THREE.Vector3(-0.8, 0.02, 0.8), new THREE.Vector3(-0.8, 0.02, -0.8),
          ])}
        />
        <lineBasicMaterial color="#d4a359" linewidth={2} />
      </lineSegments>
    </group>
  );
};
