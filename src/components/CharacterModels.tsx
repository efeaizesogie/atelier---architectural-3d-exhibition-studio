import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useGLTF, Detailed } from '@react-three/drei';
import { CharacterExhibit, DisplayMode, ModelOptimizerSettings, LightingConfig } from '../types';

interface CharacterModelsProps {
  exhibits: CharacterExhibit[];
  selectedExhibitId: string;
  onSelectExhibit: (id: string) => void;
  onDoubleClickExhibit?: (id: string) => void;
  displayMode: DisplayMode;
  turntable: boolean;
  turntableSpeed: number;
  highlightPart?: string | null;
  optimizerSettings: ModelOptimizerSettings;
  lightingConfig: LightingConfig;
  isFocusedMode?: boolean;
}

// Preload all known model URLs so they're cached before render
const PRELOAD_URLS = ['/models/character.glb'];
PRELOAD_URLS.forEach((url) => useGLTF.preload(url));

// Shared low-poly proxy geometry for distant LOD level
const proxyGeo = new THREE.BoxGeometry(0.5, 1.4, 0.5);
const proxyMat = new THREE.MeshStandardMaterial({ color: '#6b6560', roughness: 0.8 });

function buildScene(source: THREE.Group, wireframe: boolean): THREE.Group {
  const clone = source.clone(true);
  clone.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mesh = child as THREE.Mesh;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = true;
    if (mesh.geometry) mesh.geometry.computeBoundingSphere();
    if (wireframe) {
      const applyWF = (m: THREE.Material) => { const c = m.clone() as THREE.MeshStandardMaterial; c.wireframe = true; return c; };
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(applyWF) : applyWF(mesh.material as THREE.Material);
    }
  });
  const box = new THREE.Box3().setFromObject(clone);
  const size = box.getSize(new THREE.Vector3());
  clone.scale.setScalar(1.6 / (Math.max(size.x, size.y, size.z) || 1));
  const sb = new THREE.Box3().setFromObject(clone);
  const c = sb.getCenter(new THREE.Vector3());
  clone.position.set(-c.x, -sb.min.y + 0.02, -c.z);
  return clone;
}

// Optimized GLB loader with correct LOD: full model up close, proxy box at distance
function OptimizedGLTFModel({ url, wireframe }: { url: string; wireframe: boolean }) {
  const { scene } = useGLTF(url);
  const fullScene = useMemo(() => buildScene(scene, wireframe), [scene, wireframe]);

  return (
    <Detailed distances={[0, 14]}>
      <primitive object={fullScene} />
      {/* Cheap proxy beyond 14 units */}
      <mesh geometry={proxyGeo} material={proxyMat} />
    </Detailed>
  );
}

function ExhibitNode({
  exhibit,
  isSelected,
  onSelect,
  onDoubleClick,
  displayMode,
  turntable,
  turntableSpeed,
  lightingConfig,
  isFocusedMode = false,
}: {
  exhibit: CharacterExhibit;
  isSelected: boolean;
  onSelect: () => void;
  onDoubleClick?: () => void;
  displayMode: DisplayMode;
  turntable: boolean;
  turntableSpeed: number;
  lightingConfig: LightingConfig;
  isFocusedMode?: boolean;
}) {
  const modelGroupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const isDragging = useRef(false);
  const previousMouseX = useRef(0);

  const isWireframe = displayMode === 'wireframe';
  const glowHex = isSelected
    ? lightingConfig.accentColor || '#e2ba7e'
    : lightingConfig.pedestalGlowColor || '#a88d58';

  useFrame((_, delta) => {
    if (turntable && modelGroupRef.current && !isDragging.current) {
      modelGroupRef.current.rotation.y += delta * 0.35 * turntableSpeed;
    }
  });

  useEffect(() => {
    if (!isFocusedMode || !isSelected) return;
    const handleRotateEvent = (e: Event) => {
      const ev = e as CustomEvent<{ deltaX: number }>;
      if (modelGroupRef.current && ev.detail) {
        modelGroupRef.current.rotation.y += ev.detail.deltaX * 0.012;
      }
    };
    window.addEventListener('rotate-focused-model', handleRotateEvent);
    return () => window.removeEventListener('rotate-focused-model', handleRotateEvent);
  }, [isFocusedMode, isSelected]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (isFocusedMode && !isSelected) return;
    e.stopPropagation();
    onSelect();
    isDragging.current = true;
    previousMouseX.current = e.clientX;
    (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (isDragging.current && modelGroupRef.current) {
      modelGroupRef.current.rotation.y += (e.clientX - previousMouseX.current) * 0.012;
      previousMouseX.current = e.clientX;
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    isDragging.current = false;
    (e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
  };

  const marbleMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: hovered ? '#ffffff' : '#f5f3ee',
        roughness: 0.35,
        metalness: 0.05,
        wireframe: isWireframe,
      }),
    [isWireframe, hovered]
  );

  const pos = exhibit.position || [0, 0, 0];
  const disableNonSelectedEvents = isFocusedMode && !isSelected;

  return (
    <group position={pos}>
      {/* Pedestal */}
      <group
        onClick={(e) => { if (disableNonSelectedEvents) return; e.stopPropagation(); onSelect(); }}
        onDoubleClick={(e) => { if (disableNonSelectedEvents) return; e.stopPropagation(); onDoubleClick?.(); }}
      >
        <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 0.12, 1.4]} />
          <meshStandardMaterial color={isSelected ? '#3a342b' : '#28241e'} roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.05, 0.78, 1.05]} />
          <meshStandardMaterial color={isSelected ? '#2e2922' : '#201d18'} roughness={0.4} metalness={0.5} />
        </mesh>

        {/* Accent halo ring */}
        <mesh position={[0, 0.865, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.52, 0.62, 32]} />
          <meshBasicMaterial color={glowHex} transparent opacity={isSelected ? 0.95 : hovered ? 0.6 : 0.25} side={THREE.DoubleSide} />
        </mesh>

        <pointLight position={[0, 0.9, 0]} color={glowHex} intensity={isSelected ? 1.8 : 0.4} distance={2.5} />

        {/* Brass plaque */}
        <mesh position={[0, 0.48, 0.54]} castShadow receiveShadow>
          <boxGeometry args={[0.38, 0.1, 0.012]} />
          <meshStandardMaterial color={glowHex} roughness={0.2} metalness={0.9} />
        </mesh>
      </group>

      {/* Model container at pedestal top */}
      <group
        ref={modelGroupRef}
        position={[0, 0.88, 0]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={(e) => { if (disableNonSelectedEvents) return; e.stopPropagation(); onDoubleClick?.(); }}
        onPointerOver={(e) => { if (disableNonSelectedEvents) return; e.stopPropagation(); setHovered(true); document.body.style.cursor = 'grab'; }}
        onPointerOut={() => { if (disableNonSelectedEvents) return; setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        {exhibit.customGlbUrl ? (
          <React.Suspense
            fallback={
              <mesh position={[0, 0.6, 0]}>
                <cylinderGeometry args={[0.3, 0.4, 1.0, 16]} />
                <meshStandardMaterial color="#c2b8aa" roughness={0.5} />
              </mesh>
            }
          >
            <OptimizedGLTFModel url={exhibit.customGlbUrl} wireframe={isWireframe} />
          </React.Suspense>
        ) : (
          // Fallback placeholder for exhibits without a GLB URL
          <mesh position={[0, 0.7, 0]} castShadow receiveShadow material={marbleMat}>
            <boxGeometry args={[0.8, 1.4, 0.8]} />
          </mesh>
        )}
      </group>
    </group>
  );
}

export const CharacterModels: React.FC<CharacterModelsProps> = ({
  exhibits,
  selectedExhibitId,
  onSelectExhibit,
  onDoubleClickExhibit,
  displayMode,
  turntable,
  turntableSpeed,
  lightingConfig,
  isFocusedMode = false,
}) => (
  <group>
    {exhibits.map((exhibit) => (
      <ExhibitNode
        key={exhibit.id}
        exhibit={exhibit}
        isSelected={exhibit.id === selectedExhibitId}
        onSelect={() => onSelectExhibit(exhibit.id)}
        onDoubleClick={() => onDoubleClickExhibit?.(exhibit.id)}
        displayMode={displayMode}
        turntable={turntable}
        turntableSpeed={turntableSpeed}
        lightingConfig={lightingConfig}
        isFocusedMode={isFocusedMode}
      />
    ))}
  </group>
);
