import React, { useMemo, useState } from 'react';
import * as THREE from 'three';
import { LightingConfig } from '../types';
import { kelvinToRGB } from '../data/exhibits';

interface LightingRigProps {
  config: LightingConfig;
  showGizmos?: boolean;
  onSelectColorPreset?: (presetHex: string) => void;
}

export const LightingRig: React.FC<LightingRigProps> = ({ config, showGizmos = false }) => {
  // Convert Kelvin temperature to RGB hexadecimal color string
  const lightColorHex = useMemo(() => kelvinToRGB(config.kelvin), [config.kelvin]);
  const lightColor = useMemo(() => new THREE.Color(lightColorHex), [lightColorHex]);

  const accentColor = useMemo(() => new THREE.Color(config.accentColor || '#e2ba7e'), [config.accentColor]);
  const wallWashColor = useMemo(() => new THREE.Color(config.wallWashColor || '#2b2319'), [config.wallWashColor]);

  // Sun position calculation from elevation and azimuth degrees
  const sunPosition = useMemo(() => {
    const elevRad = (config.sunElevation * Math.PI) / 180;
    const aziRad = (config.sunAzimuth * Math.PI) / 180;
    const distance = 14;

    const y = distance * Math.sin(elevRad);
    const x = distance * Math.cos(elevRad) * Math.sin(aziRad);
    const z = distance * Math.cos(elevRad) * Math.cos(aziRad);

    return new THREE.Vector3(x, Math.max(1.5, y), z);
  }, [config.sunElevation, config.sunAzimuth]);

  // Spotlight positions
  const keySpotPosition = useMemo(() => new THREE.Vector3(-2.8, 4.2, 3.2), []);
  const rimSpotPosition = useMemo(() => new THREE.Vector3(2.5, 3.5, -3.0), []);

  return (
    <>
      {/* Soft Ambient Light for bounced lighting */}
      <ambientLight color={lightColor} intensity={0.45 * config.exposure} />

      {/* Main Directional Sun / Window Daylight with Contact Shadows */}
      <directionalLight
        position={sunPosition}
        color={lightColor}
        intensity={config.sunIntensity * config.exposure}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-bias={-0.00015}
        shadow-radius={config.shadowSoftness * 4}
      />

      {/* Studio Key Spotlight */}
      <spotLight
        position={keySpotPosition}
        target-position={[0, 1.2, 0]}
        color={lightColor}
        intensity={config.spotlightIntensity * 4.0 * config.exposure}
        angle={(config.spotlightAngle * Math.PI) / 180}
        penumbra={0.7}
        decay={1.8}
        distance={14}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0002}
      />

      {/* Back / Rim Light with Accent Tint for Silhouette Definition */}
      <spotLight
        position={rimSpotPosition}
        target-position={[0, 1.0, 0]}
        color={accentColor}
        intensity={config.rimLightIntensity * 3.5 * config.exposure}
        angle={0.65}
        penumbra={0.8}
        decay={2.0}
        distance={12}
      />

      {/* Architectural Recessed LED Ceiling Strip in Accent Color */}
      <rectAreaLight
        position={[0, 6.7, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={14}
        height={10}
        color={accentColor}
        intensity={config.coveLightIntensity * 3.0 * config.exposure}
      />

      {/* Rear Wall Vibrant Color Wash Light */}
      <pointLight
        position={[0, 3.5, -5.2]}
        color={wallWashColor}
        intensity={config.coveLightIntensity * 4.0 * config.exposure}
        distance={12}
        decay={1.5}
      />

      {/* Left Wall Color Glow */}
      <pointLight
        position={[-7.2, 3.0, 0]}
        color={accentColor}
        intensity={config.coveLightIntensity * 2.0 * config.exposure}
        distance={10}
        decay={2.0}
      />

      {/* Right Wall Color Glow */}
      <pointLight
        position={[7.2, 3.0, 0]}
        color={accentColor}
        intensity={config.coveLightIntensity * 2.0 * config.exposure}
        distance={10}
        decay={2.0}
      />

      {/* Optional Light Source Indicators / Interactive Gizmos */}
      {showGizmos && (
        <group>
          {/* Sun Vector Indicator */}
          <mesh position={sunPosition}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshBasicMaterial color={lightColorHex} />
          </mesh>

          {/* Key Spot Light Fixture Indicator */}
          <mesh position={keySpotPosition} rotation={[0.4, -0.6, 0]}>
            <coneGeometry args={[0.18, 0.35, 16]} />
            <meshStandardMaterial color="#333333" roughness={0.2} metalness={0.9} />
          </mesh>

          {/* Rim Spot Light Fixture Indicator */}
          <mesh position={rimSpotPosition} rotation={[-0.4, 0.6, 0]}>
            <coneGeometry args={[0.18, 0.35, 16]} />
            <meshStandardMaterial color={config.accentColor || '#e2ba7e'} roughness={0.2} metalness={0.9} />
          </mesh>
        </group>
      )}
    </>
  );
};
