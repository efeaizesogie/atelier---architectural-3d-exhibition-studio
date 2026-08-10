export type RoomType = 'atrium' | 'loft' | 'atelier';

export type FloorMaterialType = 'travertine' | 'microcement' | 'smoked_oak' | 'dark_basalt';
export type WallMaterialType = 'venetian_plaster' | 'raw_concrete' | 'walnut_slats' | 'limestone';
export type PedestalMaterialType = 'bronze' | 'travertine' | 'matte_black' | 'natural_oak';

export interface LightingConfig {
  kelvin: number; // 2500K - 6500K
  sunIntensity: number;
  sunElevation: number; // 10 to 80 degrees
  sunAzimuth: number; // 0 to 360 degrees
  spotlightIntensity: number;
  spotlightAngle: number;
  rimLightIntensity: number;
  coveLightIntensity: number;
  shadowSoftness: number;
  exposure: number;
  accentColor: string; // Studio LED & Accent Glow Color
  wallWashColor: string; // Wall Wash Ambient Color
  pedestalGlowColor: string; // Pedestal Base Halo Ring Color
}

export interface MaterialConfig {
  floor: FloorMaterialType;
  wall: WallMaterialType;
  pedestal: PedestalMaterialType;
  roughness: number;
  metalness: number;
  bumpIntensity: number;
}

export interface CharacterExhibit {
  id: string;
  title: string;
  artist: string;
  year: string;
  medium: string;
  dimensions: string;
  description: string;
  curatorNote: string;
  type: 'bust' | 'figure' | 'bronze' | 'mannequin' | 'custom_glb' | 'full_character';
  customGlbUrl?: string;
  polygonCount: string;
  materialsUsed: string[];
  recommendedLighting: Partial<LightingConfig>;
  position: [number, number, number]; // Position in the studio layout
  pedestalId?: string;
}

export type CameraPreset = 'hero' | 'macro' | 'plan' | 'low_angle' | 'full_room' | 'walkthrough';

export type DisplayMode = 'realistic' | 'blueprint' | 'wireframe';

export interface ModelOptimizerSettings {
  meshDecimationRatio: number; // 0.1 to 1.0 (1.0 = 100% full detail)
  textureResolutionLimit: number; // e.g. 512, 1024, 2048
  enableLOD: boolean;
  weldVertices: boolean;
  recalculateNormals: boolean;
  shadowQuality: 'low' | 'medium' | 'high';
}
