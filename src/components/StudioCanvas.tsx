import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { CameraPreset, CharacterExhibit, DisplayMode, LightingConfig, MaterialConfig, ModelOptimizerSettings, RoomType } from '../types';
import { StudioEnvironment } from './StudioEnvironment';
import { LightingRig } from './LightingRig';
import { CharacterModels } from './CharacterModels';
import { CADBlueprintOverlay } from './CADBlueprintOverlay';

interface StudioCanvasProps {
  exhibits: CharacterExhibit[];
  currentExhibit: CharacterExhibit;
  onSelectExhibit: (id: string) => void;
  onDoubleClickExhibit?: (id: string) => void;
  roomType: RoomType;
  lightingConfig: LightingConfig;
  materialConfig: MaterialConfig;
  cameraPreset: CameraPreset;
  displayMode: DisplayMode;
  turntable: boolean;
  turntableSpeed: number;
  highlightPart: string | null;
  showLightGizmos: boolean;
  roomName: string;
  optimizerSettings: ModelOptimizerSettings;
  onCycleWallMaterial?: () => void;
  onCycleFloorMaterial?: () => void;
  onCycleAccentColor?: () => void;
  onCycleLightingMood?: () => void;
}

// Room bounding box constants to strictly enforce staying within physical room walls
const ROOM_BOUNDS = {
  minX: -8.4,
  maxX: 8.4,
  minY: 0.2,
  maxY: 6.8,
  minZ: -7.4,
  maxZ: 7.4,
};

// Global screen drag interaction handler for rotating focused model in model lock-in view
function FocusedModelInteractionHandler({ isFocusedMode }: { isFocusedMode: boolean }) {
  const isDragging = useRef(false);
  const previousMouseX = useRef(0);

  useEffect(() => {
    if (!isFocusedMode) return;

    const handlePointerDown = (e: PointerEvent) => {
      // Ignore clicks on UI controls or overlay buttons
      if ((e.target as HTMLElement)?.closest('button, input, textarea, .pointer-events-auto')) return;
      isDragging.current = true;
      previousMouseX.current = e.clientX;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging.current) {
        const deltaX = e.clientX - previousMouseX.current;
        previousMouseX.current = e.clientX;
        window.dispatchEvent(new CustomEvent('rotate-focused-model', { detail: { deltaX } }));
      }
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isFocusedMode]);

  return null;
}

// Warm-toned interactive spotlight that dynamically tracks user's cursor across character in lock-in view
function CursorSpotlight({
  currentExhibit,
  isFocusedMode,
  lightingConfig,
}: {
  currentExhibit: CharacterExhibit;
  isFocusedMode: boolean;
  lightingConfig: LightingConfig;
}) {
  const lightRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Group>(null);
  const smoothTarget = useRef(new THREE.Vector3());

  const ex = currentExhibit.position ? currentExhibit.position[0] : 0;
  const ey = currentExhibit.position ? currentExhibit.position[1] : 0;
  const ez = currentExhibit.position ? currentExhibit.position[2] : 0;

  useEffect(() => {
    if (lightRef.current && targetRef.current) {
      lightRef.current.target = targetRef.current;
    }
  }, [currentExhibit, isFocusedMode]);

  useFrame((state, delta) => {
    if (!isFocusedMode || !targetRef.current || !lightRef.current) return;

    // Follow mouse cursor smoothly relative to character's 3D center
    const desiredX = ex + state.pointer.x * 1.6;
    const desiredY = ey + 1.2 + state.pointer.y * 1.1;
    const desiredZ = ez + state.pointer.x * 0.4;

    smoothTarget.current.lerp(new THREE.Vector3(desiredX, desiredY, desiredZ), delta * 7.0);
    targetRef.current.position.copy(smoothTarget.current);
    lightRef.current.target.updateMatrixWorld();
  });

  if (!isFocusedMode) return null;

  return (
    <group>
      <group ref={targetRef} position={[ex, ey + 1.2, ez]} />
      <spotLight
        ref={lightRef}
        position={[ex, ey + 4.8, ez + 2.2]}
        intensity={lightingConfig.sunIntensity * 5.0 + 8.0}
        color="#ffdfa9"
        angle={0.42}
        penumbra={0.8}
        distance={14}
        castShadow
        shadow-bias={-0.0001}
      />
    </group>
  );
}

// Interactive Camera controller with smooth transition + strictly room-bounded user pan/zoom/orbit
function CameraRig({
  preset,
  currentExhibit,
  floorTarget,
  isFocusedMode,
}: {
  preset: CameraPreset;
  currentExhibit: CharacterExhibit;
  floorTarget: THREE.Vector3 | null;
  isFocusedMode: boolean;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const isTransitioning = useRef<boolean>(true);

  const targetPos = useRef(new THREE.Vector3(0, 1.8, 3.8));
  const targetLookAt = useRef(new THREE.Vector3(0, 1.2, 0));

  useEffect(() => {
    isTransitioning.current = true;
    const ex = currentExhibit.position ? currentExhibit.position[0] : 0;
    const ey = currentExhibit.position ? currentExhibit.position[1] : 0;
    const ez = currentExhibit.position ? currentExhibit.position[2] : 0;

    switch (preset) {
      case 'macro':
        targetPos.current.set(ex, ey + 1.35, ez + 2.2);
        targetLookAt.current.set(ex, ey + 1.15, ez);
        break;
      case 'low_angle':
        targetPos.current.set(ex, ey + 0.4, ez + 3.4);
        targetLookAt.current.set(ex, ey + 1.15, ez);
        break;
      case 'plan':
        targetPos.current.set(0, 6.8, 0.01);
        targetLookAt.current.set(0, 0, 0);
        break;
      case 'full_room':
        targetPos.current.set(0, 3.6, 6.8);
        targetLookAt.current.set(0, 1.2, 0);
        break;
      case 'walkthrough':
        targetPos.current.set(ex - 1.8, ey + 1.35, ez + 3.4);
        targetLookAt.current.set(ex, ey + 1.15, ez);
        break;
      case 'hero':
      default:
        targetPos.current.set(ex, ey + 1.35, ez + 3.6);
        targetLookAt.current.set(ex, ey + 1.15, ez);
        break;
    }
  }, [preset, currentExhibit]);

  // Handle direct floor click to move camera focus (only in room view)
  useEffect(() => {
    if (floorTarget && !isFocusedMode) {
      isTransitioning.current = true;
      targetLookAt.current.set(
        THREE.MathUtils.clamp(floorTarget.x, ROOM_BOUNDS.minX + 1, ROOM_BOUNDS.maxX - 1),
        floorTarget.y + 1.0,
        THREE.MathUtils.clamp(floorTarget.z, ROOM_BOUNDS.minZ + 1, ROOM_BOUNDS.maxZ - 1)
      );
      targetPos.current.set(
        THREE.MathUtils.clamp(floorTarget.x, ROOM_BOUNDS.minX, ROOM_BOUNDS.maxX),
        floorTarget.y + 2.2,
        THREE.MathUtils.clamp(floorTarget.z + 3.2, ROOM_BOUNDS.minZ, ROOM_BOUNDS.maxZ)
      );
    }
  }, [floorTarget, isFocusedMode]);

  useFrame((_, delta) => {
    if (isTransitioning.current && controlsRef.current) {
      camera.position.lerp(targetPos.current, delta * 4.5);
      controlsRef.current.target.lerp(targetLookAt.current, delta * 4.5);
      controlsRef.current.update();

      if (
        camera.position.distanceTo(targetPos.current) < 0.03 &&
        controlsRef.current.target.distanceTo(targetLookAt.current) < 0.03
      ) {
        isTransitioning.current = false;
      }
    }

    // STRICT ROOM BOUNDARY CLAMPING
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, ROOM_BOUNDS.minX, ROOM_BOUNDS.maxX);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, ROOM_BOUNDS.minY, ROOM_BOUNDS.maxY);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, ROOM_BOUNDS.minZ, ROOM_BOUNDS.maxZ);

    if (controlsRef.current) {
      if (isFocusedMode) {
        // Enforce lock on focused exhibit position
        const ex = currentExhibit.position ? currentExhibit.position[0] : 0;
        const ey = currentExhibit.position ? currentExhibit.position[1] : 0;
        const ez = currentExhibit.position ? currentExhibit.position[2] : 0;
        controlsRef.current.target.set(ex, ey + 1.15, ez);
      } else {
        controlsRef.current.target.x = THREE.MathUtils.clamp(controlsRef.current.target.x, ROOM_BOUNDS.minX + 0.5, ROOM_BOUNDS.maxX - 0.5);
        controlsRef.current.target.y = THREE.MathUtils.clamp(controlsRef.current.target.y, ROOM_BOUNDS.minY, ROOM_BOUNDS.maxY - 0.5);
        controlsRef.current.target.z = THREE.MathUtils.clamp(controlsRef.current.target.z, ROOM_BOUNDS.minZ + 0.5, ROOM_BOUNDS.maxZ - 0.5);
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.06}
      enableRotate={!isFocusedMode}
      enablePan={!isFocusedMode}
      screenSpacePanning={!isFocusedMode}
      minDistance={isFocusedMode ? 1.8 : 0.8}
      maxDistance={isFocusedMode ? 5.5 : 13.5}
      maxPolarAngle={Math.PI - 0.04}
      minPolarAngle={0.01}
      target={[0, 1.2, 0]}
      onStart={() => {
        isTransitioning.current = false;
      }}
    />
  );
}

export const StudioCanvas: React.FC<StudioCanvasProps> = ({
  exhibits,
  currentExhibit,
  onSelectExhibit,
  onDoubleClickExhibit,
  roomType,
  lightingConfig,
  materialConfig,
  cameraPreset,
  displayMode,
  turntable,
  turntableSpeed,
  highlightPart,
  showLightGizmos,
  roomName,
  optimizerSettings,
  onCycleWallMaterial,
  onCycleFloorMaterial,
  onCycleAccentColor,
  onCycleLightingMood,
}) => {
  const [floorTarget, setFloorTarget] = useState<THREE.Vector3 | null>(null);
  const isFocusedMode = true;

  return (
    <div className="w-full h-full relative select-none bg-[#171614] overflow-hidden">
      <Canvas
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ position: [0, 1.8, 3.8], fov: 45, near: 0.1, far: 60 }}
        dpr={[1, 1.5]}
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: lightingConfig.exposure,
          antialias: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
      >
        {/* Global Mouse Drag Handler for Rotating Focused Model */}
        <FocusedModelInteractionHandler isFocusedMode={isFocusedMode} />

        {/* Interactive Camera Controller with Free Pan/Zoom strictly constrained inside room */}
        <CameraRig
          preset={cameraPreset}
          currentExhibit={currentExhibit}
          floorTarget={floorTarget}
          isFocusedMode={isFocusedMode}
        />

        {/* Studio Lighting Physics Rig */}
        <LightingRig config={lightingConfig} showGizmos={showLightGizmos} />

        {/* Architectural Room Environment with Floor Click Navigation & 3D Environment Interactions */}
        <StudioEnvironment
          roomType={roomType}
          materialConfig={materialConfig}
          lightingConfig={lightingConfig}
          isFocusedMode={isFocusedMode}
          onFloorClick={(pt) => setFloorTarget(pt)}
          onCycleWallMaterial={onCycleWallMaterial}
          onCycleFloorMaterial={onCycleFloorMaterial}
          onCycleAccentColor={onCycleAccentColor}
          onCycleLightingMood={onCycleLightingMood}
        />

        {/* High-fidelity Contact Soft Shadows */}
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.75}
          scale={16}
          blur={1.4}
          far={3.0}
          resolution={512}
          color="#100e0c"
          frames={1}
        />

        {/* Lined Up 3D Character Model Exhibits */}
        <CharacterModels
          exhibits={exhibits}
          selectedExhibitId={currentExhibit.id}
          onSelectExhibit={onSelectExhibit}
          onDoubleClickExhibit={onDoubleClickExhibit}
          displayMode={displayMode}
          turntable={turntable}
          turntableSpeed={turntableSpeed}
          highlightPart={highlightPart}
          optimizerSettings={optimizerSettings}
          lightingConfig={lightingConfig}
          isFocusedMode={isFocusedMode}
        />

        {/* Dynamic Warm-Toned Cursor-Tracking Spotlight in Hero Lock-In View */}
        <CursorSpotlight
          currentExhibit={currentExhibit}
          isFocusedMode={isFocusedMode}
          lightingConfig={lightingConfig}
        />

        {/* CAD Blueprint Wireframe Overlay */}
        <CADBlueprintOverlay active={displayMode === 'blueprint'} roomName={roomName} />
      </Canvas>
    </div>
  );
};
