import React, { useState } from 'react';
import {
  RoomType,
  DisplayMode,
  CameraPreset,
  CharacterExhibit,
  LightingConfig,
  MaterialConfig,
  ModelOptimizerSettings,
  FloorMaterialType,
  WallMaterialType,
} from './types';
import { INITIAL_EXHIBITS, DEFAULT_LIGHTING, DEFAULT_MATERIALS, DEFAULT_OPTIMIZER, arrangeExhibitsInFloorGrid } from './data/exhibits';
import { StudioCanvas } from './components/StudioCanvas';
import { LightingControlPanel } from './components/LightingControlPanel';
import { MaterialControlPanel } from './components/MaterialControlPanel';
import { ModelOptimizerPanel } from './components/ModelOptimizerPanel';
import { ModelInspectorPanel } from './components/ModelInspectorPanel';
import { CustomModelModal } from './components/CustomModelModal';
import { CatalogueOverlay } from './components/CatalogueOverlay';
import { toggleStudioAmbiance } from './utils/audioAmbiance';
import { Sun, Palette, Cpu, Volume2, VolumeX, Upload, RefreshCw, SlidersHorizontal, X, Lock } from 'lucide-react';

export default function App() {
  // Main Exhibition State
  const [roomType, setRoomType] = useState<RoomType>('atrium');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('realistic');
  const [exhibits, setExhibits] = useState<CharacterExhibit[]>(INITIAL_EXHIBITS);
  const [currentExhibit, setCurrentExhibit] = useState<CharacterExhibit>(INITIAL_EXHIBITS[0]);
  const [lightingConfig, setLightingConfig] = useState<LightingConfig>(DEFAULT_LIGHTING);
  const [materialConfig, setMaterialConfig] = useState<MaterialConfig>(DEFAULT_MATERIALS);
  const [optimizerSettings, setOptimizerSettings] = useState<ModelOptimizerSettings>(DEFAULT_OPTIMIZER);

  // Inspector & Camera state
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('hero');
  const [turntable, setTurntable] = useState<boolean>(true);
  const [turntableSpeed, setTurntableSpeed] = useState<number>(1.0);
  const [highlightPart, setHighlightPart] = useState<string | null>(null);
  const [showLightGizmos, setShowLightGizmos] = useState<boolean>(false);

  // UI Panel visibility toggles (Default to CLOSED for clean text-free canvas)
  const [showUIOverlay, setShowUIOverlay] = useState<boolean>(false);
  const [leftTab, setLeftTab] = useState<'lighting' | 'materials' | 'optimizer' | 'none'>('none');
  const [showRightPanel, setShowRightPanel] = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [isCatalogueOpen, setIsCatalogueOpen] = useState<boolean>(false);

  // Room Name Map
  const roomNames: Record<RoomType, string> = {
    atrium: 'The Grand Atrium',
    loft: 'The Brutalist Loft',
    atelier: "The Sculptor's Atelier",
  };

  // Environment 3D Interaction Handlers (Click directly on walls/floor/lights/switches in 3D)
  const handleCycleWallMaterial = () => {
    const wallOptions: WallMaterialType[] = ['venetian_plaster', 'raw_concrete', 'walnut_slats', 'limestone'];
    const currentIndex = wallOptions.indexOf(materialConfig.wall);
    const nextWall = wallOptions[(currentIndex + 1) % wallOptions.length];
    setMaterialConfig((prev) => ({ ...prev, wall: nextWall }));
  };

  const handleCycleFloorMaterial = () => {
    const floorOptions: FloorMaterialType[] = ['travertine', 'microcement', 'smoked_oak', 'dark_basalt'];
    const currentIndex = floorOptions.indexOf(materialConfig.floor);
    const nextFloor = floorOptions[(currentIndex + 1) % floorOptions.length];
    setMaterialConfig((prev) => ({ ...prev, floor: nextFloor }));
  };

  const handleCycleAccentColor = () => {
    const colors = ['#e2ba7e', '#38bdf8', '#34d399', '#a855f7', '#f43f5e'];
    const currentIndex = colors.indexOf(lightingConfig.accentColor || '#e2ba7e');
    const nextColor = colors[(currentIndex + 1) % colors.length];
    setLightingConfig((prev) => ({ ...prev, accentColor: nextColor, pedestalGlowColor: nextColor }));
  };

  const handleCycleLightingMood = () => {
    const kelvins = [3400, 5400, 2800, 4200];
    const currentIndex = kelvins.indexOf(lightingConfig.kelvin);
    const nextKelvin = kelvins[(currentIndex + 1) % kelvins.length];
    setLightingConfig((prev) => ({ ...prev, kelvin: nextKelvin }));
  };

  // Handle exhibit selection by click on 3D model or pedestal
  const handleSelectExhibitById = (id: string) => {
    const found = exhibits.find((e) => e.id === id);
    if (found) {
      handleSelectExhibit(found);
    }
  };

  // Handle double click on model to enter character space (camera preset 'hero')
  const handleDoubleClickExhibitById = (id: string) => {
    const found = exhibits.find((e) => e.id === id);
    if (found) {
      handleSelectExhibit(found);
    }
  };

  // Handle exhibit selection & zoom focus into model space
  const handleSelectExhibit = (ex: CharacterExhibit) => {
    setCurrentExhibit(ex);
    setCameraPreset('hero');
    if (ex.recommendedLighting) {
      setLightingConfig((prev) => ({
        ...prev,
        ...ex.recommendedLighting,
      }));
    }
  };

  // Global Keyboard Listener: Press ESC or 'x'/'X' to reset camera to hero view
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea') return;
      if (e.key === 'Escape' || e.key === 'x' || e.key === 'X') {
        setCameraPreset('hero');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle GLB File Upload Pipeline with automatic spatial grid placement
  const handleUploadGlbFile = (file: File) => {
    const blobUrl = URL.createObjectURL(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

    const newEx: CharacterExhibit = {
      id: `custom-glb-${Date.now()}`,
      title: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
      artist: 'User Imported Asset',
      year: '2026',
      medium: 'GLTF / GLB Binary Asset',
      dimensions: 'Custom Studio Dimensions',
      description: 'Uploaded 3D character asset processed through real-time mesh decimation and texture optimization pipeline.',
      curatorNote: 'Positioned dynamically on a custom studio pedestal. Double-click to lock camera focus into character space.',
      type: 'custom_glb',
      customGlbUrl: blobUrl,
      polygonCount: '~180,000 tris (Optimized)',
      materialsUsed: ['Custom PBR Shader', '4K Texture Map'],
      position: [0, 0, 0],
      recommendedLighting: {
        kelvin: 3800,
        sunIntensity: 2.0,
      },
    };

    const updated = arrangeExhibitsInFloorGrid([...exhibits, newEx]);
    setExhibits(updated);
    const newlyAdded = updated.find((e) => e.id === newEx.id) || newEx;
    setCurrentExhibit(newlyAdded);
    setCameraPreset('hero');
  };

  // Handle custom exhibit addition from Modal with grid auto-placement
  const handleAddCustomExhibit = (newEx: CharacterExhibit) => {
    const updated = arrangeExhibitsInFloorGrid([...exhibits, newEx]);
    setExhibits(updated);
    const newlyAdded = updated.find((e) => e.id === newEx.id) || newEx;
    setCurrentExhibit(newlyAdded);
    setCameraPreset('hero');
  };

  // Remove custom exhibit
  const handleRemoveCustomExhibit = (id: string) => {
    setExhibits((prev) => {
      const filtered = prev.filter((e) => e.id !== id);
      if (currentExhibit.id === id && filtered.length > 0) {
        setCurrentExhibit(filtered[0]);
      }
      return filtered;
    });
  };

  // Audio Ambiance toggle
  const handleToggleAudio = () => {
    const nextState = !isAudioPlaying;
    setIsAudioPlaying(nextState);
    toggleStudioAmbiance(nextState);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#171614] font-sans antialiased select-none">
      
      {/* 3D Real-Time Canvas Stage with Photorealistic Textures & Environment Interactions */}
      <StudioCanvas
        exhibits={exhibits}
        currentExhibit={currentExhibit}
        onSelectExhibit={handleSelectExhibitById}
        onDoubleClickExhibit={handleDoubleClickExhibitById}
        roomType={roomType}
        lightingConfig={lightingConfig}
        materialConfig={materialConfig}
        cameraPreset={cameraPreset}
        displayMode={displayMode}
        turntable={turntable}
        turntableSpeed={turntableSpeed}
        highlightPart={highlightPart}
        showLightGizmos={showLightGizmos}
        roomName={roomNames[roomType]}
        optimizerSettings={optimizerSettings}
        onCycleWallMaterial={handleCycleWallMaterial}
        onCycleFloorMaterial={handleCycleFloorMaterial}
        onCycleAccentColor={handleCycleAccentColor}
        onCycleLightingMood={handleCycleLightingMood}
      />

      {/* TOP CENTER FLOATING MODEL LOCK-IN BANNER */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2 bg-stone-900/95 border border-stone-700/80 px-4 py-2 rounded-full shadow-2xl backdrop-blur-md pointer-events-auto transition-all">
        <Lock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span className="text-xs font-mono text-stone-200">
          <strong className="text-amber-300 font-medium">{currentExhibit.title}</strong>
        </span>
        <button
          onClick={() => setCameraPreset('hero')}
          className="ml-2 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-stone-950 border border-amber-500/50 text-[11px] font-mono font-medium transition-all flex items-center space-x-1.5 shadow-md"
          title="Reset camera to hero view (ESC)"
        >
          <X className="w-3.5 h-3.5" />
          <span>Reset View</span>
          <kbd className="text-[9px] bg-stone-800 px-1 rounded text-stone-300 border border-stone-700 ml-0.5">ESC</kbd>
        </button>
      </div>

      {/* MINIMALIST TRANSPARENT FLOATING ICON TOOLBAR (TOP RIGHT) - ZERO TEXT DEFAULT */}
      <div className="absolute top-4 right-4 z-30 flex items-center space-x-2 pointer-events-auto">
        <button
          onClick={() => setCameraPreset('hero')}
          className="w-9 h-9 rounded-full bg-stone-900/80 hover:bg-stone-800 border border-stone-700/60 text-stone-300 hover:text-amber-300 transition-all shadow-lg backdrop-blur-md flex items-center justify-center"
          title="Reset Camera View"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsCustomModalOpen(true)}
          className="w-9 h-9 rounded-full bg-stone-900/80 hover:bg-stone-800 border border-stone-700/60 text-stone-300 hover:text-amber-300 transition-all shadow-lg backdrop-blur-md flex items-center justify-center"
          title="Import 3D Model"
        >
          <Upload className="w-4 h-4" />
        </button>

        <button
          onClick={handleToggleAudio}
          className={`w-9 h-9 rounded-full border transition-all shadow-lg backdrop-blur-md flex items-center justify-center ${
            isAudioPlaying
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
              : 'bg-stone-900/80 border-stone-700/60 text-stone-400 hover:text-stone-200'
          }`}
          title={isAudioPlaying ? 'Mute Studio Acoustics' : 'Enable Studio Acoustics'}
        >
          {isAudioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          onClick={() => {
            setShowUIOverlay(!showUIOverlay);
            if (!showUIOverlay) {
              setLeftTab('lighting');
              setShowRightPanel(true);
            } else {
              setLeftTab('none');
              setShowRightPanel(false);
            }
          }}
          className={`w-9 h-9 rounded-full border transition-all shadow-lg backdrop-blur-md flex items-center justify-center ${
            showUIOverlay
              ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
              : 'bg-stone-900/80 border-stone-700/60 text-stone-300 hover:text-stone-100'
          }`}
          title={showUIOverlay ? 'Hide Settings' : 'Show Settings Controls'}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* OPTIONAL EXPANDABLE CONTROL PANELS (OFF BY DEFAULT) */}
      {showUIOverlay && (
        <>
          {/* LEFT SIDE FLOATING CONTROL DOCK */}
          <div className="absolute top-16 left-6 z-20 flex flex-col space-y-2 pointer-events-auto max-h-[82vh] overflow-y-auto pr-1">
            <div className="bg-stone-900/90 border border-stone-800/80 p-1 rounded-lg flex space-x-1 backdrop-blur-md self-start shadow-xl">
              <button
                onClick={() => setLeftTab(leftTab === 'lighting' ? 'none' : 'lighting')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center space-x-1.5 ${
                  leftTab === 'lighting'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Lighting</span>
              </button>

              <button
                onClick={() => setLeftTab(leftTab === 'materials' ? 'none' : 'materials')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center space-x-1.5 ${
                  leftTab === 'materials'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Finishes</span>
              </button>

              <button
                onClick={() => setLeftTab(leftTab === 'optimizer' ? 'none' : 'optimizer')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center space-x-1.5 ${
                  leftTab === 'optimizer'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>GLB</span>
              </button>
            </div>

            {leftTab === 'lighting' && (
              <LightingControlPanel
                config={lightingConfig}
                onChangeConfig={setLightingConfig}
                showGizmos={showLightGizmos}
                onToggleGizmos={() => setShowLightGizmos(!showLightGizmos)}
              />
            )}

            {leftTab === 'materials' && (
              <MaterialControlPanel
                config={materialConfig}
                onChangeConfig={setMaterialConfig}
              />
            )}

            {leftTab === 'optimizer' && (
              <ModelOptimizerPanel
                currentExhibit={currentExhibit}
                settings={optimizerSettings}
                onChangeSettings={setOptimizerSettings}
                onUploadGlb={handleUploadGlbFile}
                onRemoveCustomExhibit={handleRemoveCustomExhibit}
                isCustomModel={currentExhibit.type === 'custom_glb'}
              />
            )}
          </div>

          {/* RIGHT SIDE INSPECTOR DOCK */}
          <div className="absolute top-16 right-6 z-20 flex flex-col items-end space-y-2 pointer-events-auto max-h-[82vh] overflow-y-auto pl-1">
            <ModelInspectorPanel
              exhibits={exhibits}
              currentExhibit={currentExhibit}
              onSelectExhibit={handleSelectExhibit}
              cameraPreset={cameraPreset}
              onSelectCameraPreset={setCameraPreset}
              turntable={turntable}
              onToggleTurntable={() => setTurntable(!turntable)}
              turntableSpeed={turntableSpeed}
              onChangeTurntableSpeed={setTurntableSpeed}
              highlightPart={highlightPart}
              onSelectHighlightPart={setHighlightPart}
              onOpenDetails={() => setIsCatalogueOpen(true)}
            />
          </div>
        </>
      )}

      {/* Custom 3D Model Upload / Code Modal */}
      <CustomModelModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onAddCustomExhibit={handleAddCustomExhibit}
      />

      {/* Exhibition Catalogue Plaque Overlay */}
      <CatalogueOverlay
        isOpen={isCatalogueOpen}
        onClose={() => setIsCatalogueOpen(false)}
        currentExhibit={currentExhibit}
        roomType={roomType}
        lightingConfig={lightingConfig}
        materialConfig={materialConfig}
      />
    </div>
  );
}
