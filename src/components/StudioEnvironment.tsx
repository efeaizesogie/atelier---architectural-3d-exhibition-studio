import React, { useMemo, useState } from 'react';
import * as THREE from 'three';
import { MaterialConfig, RoomType, LightingConfig } from '../types';

interface StudioEnvironmentProps {
  roomType: RoomType;
  materialConfig: MaterialConfig;
  lightingConfig: LightingConfig;
  isFocusedMode?: boolean;
  onFloorClick?: (point: THREE.Vector3) => void;
  onCycleWallMaterial?: () => void;
  onCycleFloorMaterial?: () => void;
  onCycleAccentColor?: () => void;
  onCycleLightingMood?: () => void;
}

// Procedural texture generators for photorealistic real-world architectural materials
function useArchitecturalTextures(materialConfig: MaterialConfig) {
  // Realistic Floor Texture with Normal/Bump simulation
  const floorTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    if (materialConfig.floor === 'travertine') {
      ctx.fillStyle = '#e8e1cf';
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = '#d6cca2';
      for (let i = 0; i < 400; i++) {
        ctx.globalAlpha = 0.04 + Math.random() * 0.08;
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        ctx.fillRect(x, y, 5 + Math.random() * 20, 1 + Math.random() * 4);
      }
      ctx.strokeStyle = '#c4b595';
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.globalAlpha = 0.12 + Math.random() * 0.2;
        let x = Math.random() * 512;
        let y = (i * 64) % 512;
        ctx.moveTo(x, y);
        for (let j = 0; j < 6; j++) { x += Math.random() * 80 - 40; y += Math.random() * 60 + 10; ctx.lineTo(x, y); }
        ctx.stroke();
      }
      ctx.strokeStyle = '#aba087'; ctx.lineWidth = 2; ctx.globalAlpha = 0.5;
      ctx.strokeRect(0, 0, 256, 256); ctx.strokeRect(256, 0, 256, 256);
      ctx.strokeRect(0, 256, 256, 256); ctx.strokeRect(256, 256, 256, 256);
    } else if (materialConfig.floor === 'microcement') {
      ctx.fillStyle = '#948d82'; ctx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 150; i++) {
        ctx.beginPath();
        ctx.fillStyle = Math.random() > 0.5 ? '#a8a094' : '#7c766d';
        ctx.globalAlpha = 0.03 + Math.random() * 0.04;
        ctx.arc(Math.random() * 512, Math.random() * 512, 20 + Math.random() * 60, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (materialConfig.floor === 'smoked_oak') {
      ctx.fillStyle = '#3d2e22'; ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = '#221912'; ctx.lineWidth = 2;
      for (let y = 0; y < 512; y += 64) {
        ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
        const shiftX = ((y / 64) % 2) * 190;
        ctx.beginPath(); ctx.moveTo(shiftX, y); ctx.lineTo(shiftX, y + 64); ctx.stroke();
        for (let gy = y + 4; gy < y + 60; gy += 4) {
          ctx.beginPath(); ctx.globalAlpha = 0.06 + Math.random() * 0.1;
          ctx.strokeStyle = Math.random() > 0.5 ? '#5c4636' : '#1c130d'; ctx.lineWidth = 1;
          ctx.moveTo(0, gy); ctx.bezierCurveTo(170, gy + (Math.random() - 0.5) * 6, 340, gy + (Math.random() - 0.5) * 6, 512, gy); ctx.stroke();
        }
      }
    } else {
      ctx.fillStyle = '#222528'; ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = '#3a3f44';
      for (let i = 0; i < 1200; i++) { ctx.globalAlpha = 0.05; ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 3); }
      ctx.strokeStyle = '#141618'; ctx.lineWidth = 2; ctx.globalAlpha = 0.6;
      ctx.strokeRect(0, 0, 256, 512); ctx.strokeRect(256, 0, 256, 512);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }, [materialConfig.floor]);

  const wallTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    if (materialConfig.wall === 'venetian_plaster') {
      ctx.fillStyle = '#ede8dd'; ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = '#e2dacb';
      for (let i = 0; i < 200; i++) {
        ctx.globalAlpha = 0.06;
        ctx.beginPath();
        ctx.ellipse(Math.random() * 512, Math.random() * 512, 30 + Math.random() * 60, 15 + Math.random() * 30, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (materialConfig.wall === 'raw_concrete') {
      ctx.fillStyle = '#8a8377'; ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = '#6e675c'; ctx.lineWidth = 2;
      for (let y = 0; y < 512; y += 128) { ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke(); }
      ctx.fillStyle = '#615a50';
      for (let i = 0; i < 1000; i++) { ctx.globalAlpha = 0.05; ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2); }
    } else if (materialConfig.wall === 'walnut_slats') {
      ctx.fillStyle = '#423124'; ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = '#140d08';
      for (let x = 0; x < 512; x += 32) { ctx.globalAlpha = 0.9; ctx.fillRect(x, 0, 6, 512); }
    } else {
      ctx.fillStyle = '#e2dcce'; ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = '#c2baa8'; ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, 256, 256); ctx.strokeRect(256, 0, 256, 256);
      ctx.strokeRect(0, 256, 256, 256); ctx.strokeRect(256, 256, 256, 256);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3);
    return tex;
  }, [materialConfig.wall]);

  const paintingTexture1 = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 256, 256);
      grad.addColorStop(0, '#3a2b20'); grad.addColorStop(0.5, '#9e7340'); grad.addColorStop(1, '#e2ba7e');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, 256, 256);
      ctx.fillStyle = '#1c1510'; ctx.beginPath(); ctx.arc(128, 128, 90, 0, Math.PI * 2); ctx.globalAlpha = 0.6; ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  const paintingTexture2 = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 140);
      grad.addColorStop(0, '#38bdf8'); grad.addColorStop(0.6, '#0369a1'); grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, 256, 256);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  return { floorTexture, wallTexture, paintingTexture1, paintingTexture2 };
}

export const StudioEnvironment: React.FC<StudioEnvironmentProps> = ({
  roomType,
  materialConfig,
  lightingConfig,
  isFocusedMode = false,
  onFloorClick,
  onCycleWallMaterial,
  onCycleFloorMaterial,
  onCycleAccentColor,
  onCycleLightingMood,
}) => {
  const { floorTexture, wallTexture, paintingTexture1, paintingTexture2 } = useArchitecturalTextures(materialConfig);
  const [clickIndicator, setClickIndicator] = useState<THREE.Vector3 | null>(null);

  const accentColorHex = lightingConfig.accentColor || '#e2ba7e';

  // Floor Material
  const floorMat = useMemo(() => {
    let roughness = materialConfig.roughness;
    let metalness = materialConfig.metalness;

    if (materialConfig.floor === 'travertine') {
      roughness = 0.32;
      metalness = 0.05;
    } else if (materialConfig.floor === 'microcement') {
      roughness = 0.42;
      metalness = 0.02;
    } else if (materialConfig.floor === 'smoked_oak') {
      roughness = 0.52;
      metalness = 0.0;
    } else if (materialConfig.floor === 'dark_basalt') {
      roughness = 0.22;
      metalness = 0.15;
    }

    return new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness,
      metalness,
    });
  }, [floorTexture, materialConfig.floor, materialConfig.roughness, materialConfig.metalness]);

  // Wall Material
  const wallMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: wallTexture,
      roughness: materialConfig.wall === 'walnut_slats' ? 0.6 : 0.78,
      metalness: 0.02,
    });
  }, [wallTexture, materialConfig.wall]);

  const handlePointerDownFloor = (e: any) => {
    if (isFocusedMode) return;
    e.stopPropagation();
    if (e.point) {
      setClickIndicator(e.point.clone());
      if (onFloorClick) {
        onFloorClick(e.point.clone());
      }
    }
  };

  return (
    <group>
      {/* INTERACTIVE GALLERY FLOOR - Single click target camera, double click cycle material */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onPointerDown={handlePointerDownFloor}
        onDoubleClick={(e) => {
          if (isFocusedMode) return;
          e.stopPropagation();
          if (onCycleFloorMaterial) onCycleFloorMaterial();
        }}
        onPointerOver={() => {
          if (!isFocusedMode) document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <planeGeometry args={[28, 28]} />
        <primitive object={floorMat} attach="material" />
      </mesh>

      {/* DYNAMIC CLICK INTERACTION FLOOR FOCUS RIPPLE RING */}
      {clickIndicator && (
        <mesh position={[clickIndicator.x, 0.02, clickIndicator.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.25, 0.42, 32]} />
          <meshBasicMaterial color={accentColorHex} transparent opacity={0.85} />
        </mesh>
      )}

      {/* REALISTIC BASEBOARD / SKIRTING TRIMS ALONG WALL JUNCTIONS */}
      {/* Rear Wall Baseboard */}
      <mesh position={[0, 0.1, -6.94]} castShadow receiveShadow>
        <boxGeometry args={[28, 0.2, 0.06]} />
        <meshStandardMaterial color="#22201d" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Left Wall Baseboard */}
      <mesh position={[-8.94, 0.1, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[28, 0.2, 0.06]} />
        <meshStandardMaterial color="#22201d" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Right Wall Baseboard */}
      <mesh position={[8.94, 0.1, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[28, 0.2, 0.06]} />
        <meshStandardMaterial color="#22201d" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* AMBIENT GLOW LED EDGE TRIMS ALONG BASEBOARDS */}
      <group position={[0, 0.21, -6.91]}>
        <mesh>
          <boxGeometry args={[26, 0.03, 0.04]} />
          <meshBasicMaterial color={accentColorHex} />
        </mesh>
      </group>

      <group position={[-8.91, 0.21, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[26, 0.03, 0.04]} />
          <meshBasicMaterial color={accentColorHex} />
        </mesh>
      </group>

      <group position={[8.91, 0.21, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[26, 0.03, 0.04]} />
          <meshBasicMaterial color={accentColorHex} />
        </mesh>
      </group>

      {/* REAR MAIN EXHIBITION WALL - Click wall to cycle wall materials */}
      <mesh
        position={[0, 3.8, -7]}
        receiveShadow
        castShadow
        onClick={(e) => {
          e.stopPropagation();
          if (onCycleWallMaterial) onCycleWallMaterial();
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <planeGeometry args={[28, 8]} />
        <primitive object={wallMat} attach="material" />
      </mesh>

      {/* GALLERY FRAMED ARTWORK ON REAR WALL */}
      <group position={[-4.5, 4.2, -6.92]} castShadow receiveShadow>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.8, 2.4, 0.08]} />
          <meshStandardMaterial color="#1a1816" roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[1.6, 2.2]} />
          <meshStandardMaterial map={paintingTexture1} roughness={0.4} />
        </mesh>
      </group>

      <group position={[4.5, 4.2, -6.92]} castShadow receiveShadow>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.8, 2.4, 0.08]} />
          <meshStandardMaterial color="#1a1816" roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[1.6, 2.2]} />
          <meshStandardMaterial map={paintingTexture2} roughness={0.4} />
        </mesh>
      </group>

      {/* INTERACTIVE WALL SCONCES (3D Light Fixtures) - Click to cycle studio color */}
      <group
        position={[-8.8, 3.5, -2.5]}
        rotation={[0, Math.PI / 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          if (onCycleAccentColor) onCycleAccentColor();
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.15, 0.8, 0.22]} />
          <meshStandardMaterial color="#383028" roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh position={[0.08, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.82, 16]} />
          <meshBasicMaterial color={accentColorHex} />
        </mesh>
        <pointLight color={accentColorHex} intensity={2.0} distance={4} />
      </group>

      <group
        position={[8.8, 3.5, -2.5]}
        rotation={[0, -Math.PI / 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          if (onCycleAccentColor) onCycleAccentColor();
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.15, 0.8, 0.22]} />
          <meshStandardMaterial color="#383028" roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh position={[0.08, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.82, 16]} />
          <meshBasicMaterial color={accentColorHex} />
        </mesh>
        <pointLight color={accentColorHex} intensity={2.0} distance={4} />
      </group>

      {/* INTERACTIVE LIGHT SWITCH PANEL ON WALL - Click to cycle studio lighting atmosphere */}
      <group
        position={[8.88, 1.4, 2.5]}
        rotation={[0, -Math.PI / 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          if (onCycleLightingMood) onCycleLightingMood();
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.3, 0.45, 0.04]} />
          <meshStandardMaterial color={accentColorHex} roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.05, 0.025]}>
          <boxGeometry args={[0.08, 0.12, 0.03]} />
          <meshStandardMaterial color="#222" roughness={0.3} />
        </mesh>
      </group>

      {/* MODERN MINIMALIST GALLERY LEATHER BENCH */}
      <group position={[0, 0, 3.8]} rotation={[0, 0, 0]}>
        {/* Bench Cushion */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 0.18, 1.1]} />
          <meshStandardMaterial color="#2d2621" roughness={0.65} />
        </mesh>
        {/* Bench Metal Legs */}
        <mesh position={[-1.3, 0.22, -0.4]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 0.44, 0.08]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh position={[1.3, 0.22, -0.4]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 0.44, 0.08]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh position={[-1.3, 0.22, 0.4]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 0.44, 0.08]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh position={[1.3, 0.22, 0.4]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 0.44, 0.08]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.9} />
        </mesh>
      </group>

      {/* LEFT ARCHITECTURAL WALL */}
      <mesh
        position={[-9, 3.8, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
        castShadow
        onClick={(e) => {
          if (isFocusedMode) return;
          e.stopPropagation();
          if (onCycleWallMaterial) onCycleWallMaterial();
        }}
      >
        <planeGeometry args={[28, 8]} />
        <primitive object={wallMat} attach="material" />
      </mesh>

      {/* RIGHT WALL */}
      <mesh
        position={[9, 3.8, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
        castShadow
        onClick={(e) => {
          if (isFocusedMode) return;
          e.stopPropagation();
          if (onCycleWallMaterial) onCycleWallMaterial();
        }}
      >
        <planeGeometry args={[28, 8]} />
        <primitive object={wallMat} attach="material" />
      </mesh>

      {/* CEILING WITH ARCHITECTURAL RECESSED LIGHT CHANNEL */}
      <mesh position={[0, 7.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[28, 28]} />
        <meshStandardMaterial color="#eae5db" roughness={0.8} />
      </mesh>

      {/* RECESSED CEILING COVE FRAME WITH ACCENT COLOR INSIDE */}
      <mesh position={[0, 7.35, -1]} castShadow receiveShadow>
        <boxGeometry args={[14, 0.15, 10]} />
        <meshStandardMaterial color="#ded8cc" roughness={0.7} />
      </mesh>

      {/* WINDOW MULLIONS / GLASS WALL */}
      <group position={[-8.9, 3.8, 0]}>
        {[-5, -2, 1, 4, 7].map((zPos, idx) => (
          <mesh key={idx} position={[0, 0, zPos]} castShadow receiveShadow>
            <boxGeometry args={[0.15, 7.5, 0.1]} />
            <meshStandardMaterial color="#2a2826" roughness={0.2} metalness={0.8} />
          </mesh>
        ))}
        <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.15, 0.12, 16]} />
          <meshStandardMaterial color="#2a2826" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>

      {/* ROOM SPECIFIC ARCHITECTURAL ACCENTS */}
      {roomType === 'atrium' && (
        <group position={[0, 3.8, -6.9]}>
          {Array.from({ length: 22 }).map((_, i) => (
            <mesh key={i} position={[(i - 10.5) * 0.3, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.14, 7.5, 0.08]} />
              <meshStandardMaterial color="#4a3628" roughness={0.5} />
            </mesh>
          ))}
        </group>
      )}

      {roomType === 'loft' && (
        <group position={[0, 6.8, 0]}>
          <mesh position={[0, 0, -3]} castShadow receiveShadow>
            <boxGeometry args={[14, 0.08, 0.08]} />
            <meshStandardMaterial color="#1f1f1f" roughness={0.2} metalness={0.9} />
          </mesh>
          <mesh position={[0, 0, 3]} castShadow receiveShadow>
            <boxGeometry args={[14, 0.08, 0.08]} />
            <meshStandardMaterial color="#1f1f1f" roughness={0.2} metalness={0.9} />
          </mesh>
        </group>
      )}

      {roomType === 'atelier' && (
        <group position={[5.2, 0, -4.5]} rotation={[0, -0.4, 0]}>
          <mesh position={[-0.3, 1.4, -0.2]} rotation={[0.12, 0, -0.1]} castShadow receiveShadow>
            <boxGeometry args={[0.06, 2.8, 0.06]} />
            <meshStandardMaterial color="#7a5533" roughness={0.6} />
          </mesh>
          <mesh position={[0.3, 1.4, -0.2]} rotation={[0.12, 0, 0.1]} castShadow receiveShadow>
            <boxGeometry args={[0.06, 2.8, 0.06]} />
            <meshStandardMaterial color="#7a5533" roughness={0.6} />
          </mesh>
          <mesh position={[0, 1.3, 0.4]} rotation={[-0.22, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.06, 2.7, 0.06]} />
            <meshStandardMaterial color="#7a5533" roughness={0.6} />
          </mesh>
          <mesh position={[0, 1.6, 0.02]} rotation={[-0.1, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.0, 1.3, 0.04]} />
            <meshStandardMaterial color="#f0ece1" roughness={0.8} />
          </mesh>
        </group>
      )}
    </group>
  );
};
