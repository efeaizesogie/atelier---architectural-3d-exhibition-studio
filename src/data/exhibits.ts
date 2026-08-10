import { CharacterExhibit, LightingConfig, MaterialConfig, ModelOptimizerSettings } from '../types';

export function kelvinToRGB(kelvin: number): string {
  const temp = kelvin / 100;
  let red: number, green: number, blue: number;

  if (temp <= 66) {
    red = 255;
    green = temp;
    green = 99.4708025861 * Math.log(green) - 161.1195681661;
    if (temp <= 19) {
      blue = 0;
    } else {
      blue = temp - 10;
      blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
    }
  } else {
    red = temp - 60;
    red = 329.698727446 * Math.pow(red, -0.1332047592);
    green = temp - 60;
    green = 288.1221695283 * Math.pow(green, -0.0755148492);
    blue = 255;
  }

  const clamp = (v: number) => Math.min(255, Math.max(0, Math.round(v)));
  const rHex = clamp(red).toString(16).padStart(2, '0');
  const gHex = clamp(green).toString(16).padStart(2, '0');
  const bHex = clamp(blue).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

// Calculate even floor grid positions across room boundaries (X: -6.8 to +6.8, Z: -4.8 to +4.8)
export function calculateGridPosition(index: number, total: number): [number, number, number] {
  if (total <= 1) return [0, 0, 0.2];
  if (total <= 3) {
    const xPositions = [-3.2, 0, 3.2];
    return [xPositions[index] ?? (index - 1) * 2.8, 0, index === 1 ? 0.2 : -0.6];
  }

  // Determine grid dimensions (e.g. for 30 models: 6 columns x 5 rows)
  const cols = Math.min(6, Math.max(3, Math.ceil(Math.sqrt(total * 1.2))));
  const rows = Math.ceil(total / cols);

  const minX = -6.8;
  const maxX = 6.8;
  const minZ = -4.8;
  const maxZ = 4.8;

  const colIndex = index % cols;
  const rowIndex = Math.floor(index / cols);

  const stepX = cols > 1 ? (maxX - minX) / (cols - 1) : 0;
  const stepZ = rows > 1 ? (maxZ - minZ) / (rows - 1) : 0;

  const posX = Number((minX + colIndex * stepX).toFixed(2));
  const posZ = Number((minZ + rowIndex * stepZ).toFixed(2));

  return [posX, 0, posZ];
}

// Re-arrange any list of models into an even spatial floor grid
export function arrangeExhibitsInFloorGrid(exhibitsList: CharacterExhibit[]): CharacterExhibit[] {
  return exhibitsList.map((ex, idx) => ({
    ...ex,
    position: calculateGridPosition(idx, exhibitsList.length),
  }));
}

// Scan public/models directory and auto-generate exhibits from all .glb files
// Add new .glb files to public/models/ and they will appear automatically
const MODEL_FILES = [
  'character.glb',
  // Add more filenames here as you drop them into public/models/
];

function glbNameToTitle(filename: string): string {
  return filename
    .replace(/\.glb$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function generate30SampleExhibits(): CharacterExhibit[] {
  return INITIAL_EXHIBITS;
}

export const INITIAL_EXHIBITS: CharacterExhibit[] = MODEL_FILES.map((filename, i) => ({
  id: `model-${filename.replace(/\.glb$/i, '')}`,
  title: glbNameToTitle(filename),
  artist: 'Studio Upload',
  year: '2026',
  medium: 'GLTF / GLB Asset',
  dimensions: 'Custom',
  description: `3D model loaded from /models/${filename}.`,
  curatorNote: 'Double-click to enter lock-in focus mode for 360° inspection.',
  type: 'custom_glb',
  customGlbUrl: `/models/${filename}`,
  polygonCount: 'Optimized',
  materialsUsed: ['PBR'],
  position: calculateGridPosition(i, MODEL_FILES.length),
  recommendedLighting: { kelvin: 3800, sunIntensity: 2.2 },
}));

export const DEFAULT_LIGHTING: LightingConfig = {
  kelvin: 3200,
  sunIntensity: 1.8,
  sunElevation: 35,
  sunAzimuth: 140,
  spotlightIntensity: 2.4,
  spotlightAngle: 38,
  rimLightIntensity: 1.2,
  coveLightIntensity: 0.8,
  shadowSoftness: 0.6,
  exposure: 1.0,
  accentColor: '#e2ba7e', // Warm Amber Gold
  wallWashColor: '#2b2319', // Deep Amber Warm Wall Wash
  pedestalGlowColor: '#a88d58', // Brass Gold Pedestal Halo
};

export const DEFAULT_MATERIALS: MaterialConfig = {
  floor: 'travertine',
  wall: 'venetian_plaster',
  pedestal: 'bronze',
  roughness: 0.4,
  metalness: 0.1,
  bumpIntensity: 0.5,
};

export const DEFAULT_OPTIMIZER: ModelOptimizerSettings = {
  meshDecimationRatio: 1.0,
  textureResolutionLimit: 2048,
  enableLOD: true,
  weldVertices: true,
  recalculateNormals: true,
  shadowQuality: 'high',
};
