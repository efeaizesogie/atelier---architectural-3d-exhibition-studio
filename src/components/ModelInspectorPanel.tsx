import React from 'react';
import { CameraPreset, CharacterExhibit } from '../types';
import { RotateCw, Camera, Sparkles, Box, Info } from 'lucide-react';

interface ModelInspectorPanelProps {
  exhibits: CharacterExhibit[];
  currentExhibit: CharacterExhibit;
  onSelectExhibit: (exhibit: CharacterExhibit) => void;
  cameraPreset: CameraPreset;
  onSelectCameraPreset: (preset: CameraPreset) => void;
  turntable: boolean;
  onToggleTurntable: () => void;
  turntableSpeed: number;
  onChangeTurntableSpeed: (speed: number) => void;
  highlightPart: string | null;
  onSelectHighlightPart: (part: string | null) => void;
  onOpenDetails: () => void;
}

export const ModelInspectorPanel: React.FC<ModelInspectorPanelProps> = ({
  exhibits,
  currentExhibit,
  onSelectExhibit,
  cameraPreset,
  onSelectCameraPreset,
  turntable,
  onToggleTurntable,
  turntableSpeed,
  onChangeTurntableSpeed,
  highlightPart,
  onSelectHighlightPart,
  onOpenDetails,
}) => {
  return (
    <div className="bg-stone-900/90 border border-stone-800/80 rounded-lg p-4 text-stone-200 text-xs shadow-2xl backdrop-blur-md space-y-4 max-w-xs w-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-2">
        <div className="flex items-center space-x-2">
          <Box className="w-4 h-4 text-amber-400" />
          <span className="font-serif font-semibold tracking-wider text-sm text-stone-100 uppercase">
            CHARACTER EXHIBITS
          </span>
        </div>
        <button
          onClick={onOpenDetails}
          className="text-stone-400 hover:text-amber-300 transition-colors flex items-center space-x-1 font-mono text-[10px]"
          title="Artwork Details & Artist Statement"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Info</span>
        </button>
      </div>

      {/* Exhibit Selection Dropdown / Selector */}
      <div>
        <label className="text-[10px] font-mono uppercase text-stone-400 tracking-wider block mb-1.5">
          Active Character Sculpture
        </label>
        <div className="space-y-1.5">
          {exhibits.map((ex) => (
            <button
              key={ex.id}
              onClick={() => onSelectExhibit(ex)}
              className={`w-full p-2.5 rounded border text-left transition-all flex items-center justify-between ${
                currentExhibit.id === ex.id
                  ? 'bg-stone-100 text-stone-950 border-stone-100 font-medium shadow-md'
                  : 'bg-stone-800/80 border-stone-700/60 text-stone-300 hover:border-stone-500 hover:bg-stone-800'
              }`}
            >
              <div>
                <div className="text-xs font-serif font-semibold">{ex.title}</div>
                <div
                  className={`text-[10px] ${
                    currentExhibit.id === ex.id ? 'text-stone-700' : 'text-stone-400 font-mono'
                  }`}
                >
                  {ex.artist} ({ex.year})
                </div>
              </div>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                  currentExhibit.id === ex.id
                    ? 'bg-stone-900 text-amber-300'
                    : 'bg-stone-900/60 text-stone-400'
                }`}
              >
                {ex.polygonCount}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Camera Angle Presets */}
      <div className="border-t border-stone-800/80 pt-3">
        <label className="text-[10px] font-mono uppercase text-stone-400 tracking-wider block mb-1.5 flex items-center space-x-1">
          <Camera className="w-3.5 h-3.5 text-amber-400" />
          <span>Architectural Camera View</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'hero', name: 'Hero View', desc: 'Eye-level exhibit pose' },
            { id: 'walkthrough', name: 'Walkthrough', desc: 'Explore studio hall' },
            { id: 'macro', name: 'Macro Detail', desc: 'Face / texture close-up' },
            { id: 'low_angle', name: 'Low Angle', desc: 'Dramatic monument perspective' },
            { id: 'plan', name: 'Top Plan', desc: 'Architectural layout' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelectCameraPreset(preset.id as CameraPreset)}
              className={`p-2 rounded border text-left transition-all ${
                cameraPreset === preset.id
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-stone-800/80 border-stone-700/60 text-stone-300 hover:text-stone-100 hover:bg-stone-800'
              }`}
            >
              <div className="text-[11px] font-medium">{preset.name}</div>
              <div className="text-[9px] text-stone-400 font-mono">{preset.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 360 Turntable Controls */}
      <div className="border-t border-stone-800/80 pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <RotateCw className={`w-3.5 h-3.5 text-amber-400 ${turntable ? 'animate-spin' : ''}`} />
            <span className="text-[11px] text-stone-200 font-medium">360° Studio Turntable</span>
          </div>
          <button
            onClick={onToggleTurntable}
            className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all border ${
              turntable
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200'
            }`}
          >
            {turntable ? 'Active' : 'Paused'}
          </button>
        </div>

        {turntable && (
          <div>
            <div className="flex justify-between text-[10px] text-stone-400 mb-0.5 font-mono">
              <span>Rotation Speed</span>
              <span>{turntableSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={3.0}
              step={0.1}
              value={turntableSpeed}
              onChange={(e) => onChangeTurntableSpeed(Number(e.target.value))}
              className="w-full accent-amber-500 bg-stone-800 h-1.5 rounded cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Anatomical Focus Highlight */}
      <div className="border-t border-stone-800/80 pt-3">
        <label className="text-[10px] font-mono uppercase text-stone-400 tracking-wider block mb-1.5">
          Anatomical Section Highlight
        </label>
        <div className="flex space-x-1">
          {[
            { id: null, name: 'Entire Sculpture' },
            { id: 'head', name: 'Head & Facial' },
            { id: 'torso', name: 'Torso & Muscle' },
          ].map((item) => (
            <button
              key={item.id ?? 'all'}
              onClick={() => onSelectHighlightPart(item.id)}
              className={`flex-1 py-1.5 px-1 rounded text-[10px] font-mono text-center border transition-all ${
                highlightPart === item.id
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-stone-800/80 border-stone-700/60 text-stone-400 hover:text-stone-200'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
