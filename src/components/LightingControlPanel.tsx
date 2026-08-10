import React from 'react';
import { LightingConfig } from '../types';
import { kelvinToRGB } from '../data/exhibits';
import { Sun, SunDim, Sparkles, Eye, Palette } from 'lucide-react';

interface LightingControlPanelProps {
  config: LightingConfig;
  onChangeConfig: (config: LightingConfig) => void;
  showGizmos: boolean;
  onToggleGizmos: () => void;
}

const STUDIO_COLOR_PALETTES = [
  {
    name: 'Warm Amber Gold',
    accent: '#e2ba7e',
    wallWash: '#3d2b1a',
    pedestalGlow: '#a88d58',
    kelvin: 3200,
  },
  {
    name: 'Neon Cyber Atelier',
    accent: '#06b6d4',
    wallWash: '#033a47',
    pedestalGlow: '#ec4899',
    kelvin: 5000,
  },
  {
    name: 'Italian Sunset',
    accent: '#f43f5e',
    wallWash: '#4c1d24',
    pedestalGlow: '#fbbf24',
    kelvin: 2800,
  },
  {
    name: 'Emerald Sanctuary',
    accent: '#10b981',
    wallWash: '#064e3b',
    pedestalGlow: '#34d399',
    kelvin: 3800,
  },
  {
    name: 'Royal Velvet Violet',
    accent: '#8b5cf6',
    wallWash: '#2e1065',
    pedestalGlow: '#c084fc',
    kelvin: 3500,
  },
  {
    name: 'Crisp Daylight Gallery',
    accent: '#38bdf8',
    wallWash: '#1e293b',
    pedestalGlow: '#e2e8f0',
    kelvin: 5500,
  },
];

export const LightingControlPanel: React.FC<LightingControlPanelProps> = ({
  config,
  onChangeConfig,
  showGizmos,
  onToggleGizmos,
}) => {
  const currentColorHex = kelvinToRGB(config.kelvin);

  const applyPalette = (pal: typeof STUDIO_COLOR_PALETTES[0]) => {
    onChangeConfig({
      ...config,
      accentColor: pal.accent,
      wallWashColor: pal.wallWash,
      pedestalGlowColor: pal.pedestalGlow,
      kelvin: pal.kelvin,
    });
  };

  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'sunset':
        onChangeConfig({
          ...config,
          kelvin: 2800,
          sunIntensity: 2.2,
          sunElevation: 22,
          sunAzimuth: 145,
          spotlightIntensity: 1.5,
          shadowSoftness: 0.8,
          accentColor: '#f97316',
          wallWashColor: '#451a03',
          pedestalGlowColor: '#fbbf24',
        });
        break;
      case 'gallery':
        onChangeConfig({
          ...config,
          kelvin: 3200,
          sunIntensity: 1.6,
          sunElevation: 38,
          sunAzimuth: 135,
          spotlightIntensity: 2.5,
          shadowSoftness: 0.5,
          accentColor: '#e2ba7e',
          wallWashColor: '#2b2319',
          pedestalGlowColor: '#a88d58',
        });
        break;
      case 'daylight':
        onChangeConfig({
          ...config,
          kelvin: 4800,
          sunIntensity: 2.5,
          sunElevation: 55,
          sunAzimuth: 110,
          spotlightIntensity: 1.2,
          shadowSoftness: 0.4,
          accentColor: '#38bdf8',
          wallWashColor: '#0f172a',
          pedestalGlowColor: '#cbd5e1',
        });
        break;
      case 'dramatic':
        onChangeConfig({
          ...config,
          kelvin: 3000,
          sunIntensity: 0.5,
          sunElevation: 15,
          sunAzimuth: 220,
          spotlightIntensity: 4.2,
          spotlightAngle: 28,
          rimLightIntensity: 2.5,
          shadowSoftness: 0.2,
          accentColor: '#e11d48',
          wallWashColor: '#1f1924',
          pedestalGlowColor: '#f43f5e',
        });
        break;
    }
  };

  return (
    <div className="bg-stone-900/90 border border-stone-800/80 rounded-lg p-4 text-stone-200 text-xs shadow-2xl backdrop-blur-md space-y-4 max-w-xs w-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-2">
        <div className="flex items-center space-x-2">
          <Sun className="w-4 h-4 text-amber-400" />
          <span className="font-serif font-semibold tracking-wider text-sm text-stone-100 uppercase">
            STUDIO LIGHT &amp; COLOR
          </span>
        </div>
        <button
          onClick={onToggleGizmos}
          className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center space-x-1 border transition-all ${
            showGizmos
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
              : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200'
          }`}
          title="Toggle 3D Light Vectors & Gizmos"
        >
          <Eye className="w-3 h-3" />
          <span>Gizmos</span>
        </button>
      </div>

      {/* VIBRANT STUDIO COLOR PALETTES */}
      <div className="space-y-1.5">
        <div className="flex items-center space-x-1.5 text-stone-300 font-mono text-[10px]">
          <Palette className="w-3.5 h-3.5 text-amber-400" />
          <span className="uppercase">MODEL SPACE COLOR PALETTES</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {STUDIO_COLOR_PALETTES.map((pal) => (
            <button
              key={pal.name}
              onClick={() => applyPalette(pal)}
              className="p-1.5 rounded bg-stone-800/80 border border-stone-700/60 hover:border-amber-400 text-left transition-all group flex flex-col justify-between h-14"
            >
              <div className="text-[10px] font-medium text-stone-300 truncate group-hover:text-amber-200">
                {pal.name.split(' ')[0]}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="w-3 h-3 rounded-full border border-stone-600 inline-block" style={{ backgroundColor: pal.accent }} />
                <span className="w-3 h-3 rounded-full border border-stone-600 inline-block" style={{ backgroundColor: pal.wallWash }} />
                <span className="w-3 h-3 rounded-full border border-stone-600 inline-block" style={{ backgroundColor: pal.pedestalGlow }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CUSTOM COLOR PICKERS */}
      <div className="space-y-2 border-t border-stone-800/80 pt-2">
        <label className="text-[10px] font-mono uppercase text-stone-400 tracking-wider block">
          Custom Color Controls
        </label>
        <div className="grid grid-cols-3 gap-2 text-[10px]">
          <div className="flex flex-col items-center gap-1">
            <span className="text-stone-400">LED Trim</span>
            <input
              type="color"
              value={config.accentColor || '#e2ba7e'}
              onChange={(e) => onChangeConfig({ ...config, accentColor: e.target.value })}
              className="w-8 h-8 rounded border border-stone-700 bg-transparent cursor-pointer"
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-stone-400">Wall Wash</span>
            <input
              type="color"
              value={config.wallWashColor || '#2b2319'}
              onChange={(e) => onChangeConfig({ ...config, wallWashColor: e.target.value })}
              className="w-8 h-8 rounded border border-stone-700 bg-transparent cursor-pointer"
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-stone-400">Pedestal Ring</span>
            <input
              type="color"
              value={config.pedestalGlowColor || '#a88d58'}
              onChange={(e) => onChangeConfig({ ...config, pedestalGlowColor: e.target.value })}
              className="w-8 h-8 rounded border border-stone-700 bg-transparent cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Lighting Quick Presets */}
      <div className="border-t border-stone-800/80 pt-2">
        <label className="text-[10px] font-mono uppercase text-stone-400 tracking-wider block mb-1.5">
          Lighting Angles &amp; Moods
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => applyPreset('gallery')}
            className="px-2 py-1.5 rounded bg-stone-800/80 border border-stone-700/60 hover:border-amber-500/50 hover:bg-stone-800 text-left transition-all"
          >
            <div className="font-medium text-stone-200">Gallery Halogen</div>
            <div className="text-[9px] text-stone-400 font-mono">3200K Warm White</div>
          </button>
          <button
            onClick={() => applyPreset('sunset')}
            className="px-2 py-1.5 rounded bg-stone-800/80 border border-stone-700/60 hover:border-amber-500/50 hover:bg-stone-800 text-left transition-all"
          >
            <div className="font-medium text-amber-200">Golden Sunset</div>
            <div className="text-[9px] text-stone-400 font-mono">2800K Low Sun</div>
          </button>
          <button
            onClick={() => applyPreset('daylight')}
            className="px-2 py-1.5 rounded bg-stone-800/80 border border-stone-700/60 hover:border-amber-500/50 hover:bg-stone-800 text-left transition-all"
          >
            <div className="font-medium text-stone-200">North Daylight</div>
            <div className="text-[9px] text-stone-400 font-mono">4800K Skylight</div>
          </button>
          <button
            onClick={() => applyPreset('dramatic')}
            className="px-2 py-1.5 rounded bg-stone-800/80 border border-stone-700/60 hover:border-amber-500/50 hover:bg-stone-800 text-left transition-all"
          >
            <div className="font-medium text-stone-200">Chiaroscuro Spot</div>
            <div className="text-[9px] text-stone-400 font-mono">Key &amp; Rim Focus</div>
          </button>
        </div>
      </div>

      {/* Color Temperature Kelvin Slider */}
      <div className="space-y-1 border-t border-stone-800/80 pt-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-stone-300 font-medium">Color Temperature</span>
          <div className="flex items-center space-x-1.5 font-mono text-[10px]">
            <span
              className="w-3 h-3 rounded-full border border-stone-700 inline-block"
              style={{ backgroundColor: currentColorHex }}
            />
            <span className="text-amber-300">{config.kelvin}K</span>
          </div>
        </div>
        <input
          type="range"
          min={2500}
          max={6500}
          step={50}
          value={config.kelvin}
          onChange={(e) => onChangeConfig({ ...config, kelvin: Number(e.target.value) })}
          className="w-full accent-amber-500 bg-stone-800 h-1.5 rounded cursor-pointer"
        />
        <div className="flex justify-between text-[9px] text-stone-500 font-mono">
          <span>2500K Candle</span>
          <span>4000K Neutral</span>
          <span>6500K Cool</span>
        </div>
      </div>

      {/* Sun Position Controls */}
      <div className="space-y-2 border-t border-stone-800/80 pt-2">
        <div className="flex items-center space-x-1 text-stone-400 font-mono text-[10px]">
          <SunDim className="w-3.5 h-3.5 text-amber-400" />
          <span>NATURAL SUNLIGHT / WINDOW ANGLE</span>
        </div>

        <div>
          <div className="flex justify-between text-[10px] text-stone-300 mb-0.5">
            <span>Sun Elevation</span>
            <span className="font-mono text-amber-300">{config.sunElevation}°</span>
          </div>
          <input
            type="range"
            min={10}
            max={80}
            value={config.sunElevation}
            onChange={(e) => onChangeConfig({ ...config, sunElevation: Number(e.target.value) })}
            className="w-full accent-amber-500 bg-stone-800 h-1.5 rounded cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-[10px] text-stone-300 mb-0.5">
            <span>Sun Azimuth Angle</span>
            <span className="font-mono text-amber-300">{config.sunAzimuth}°</span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            value={config.sunAzimuth}
            onChange={(e) => onChangeConfig({ ...config, sunAzimuth: Number(e.target.value) })}
            className="w-full accent-amber-500 bg-stone-800 h-1.5 rounded cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-[10px] text-stone-300 mb-0.5">
            <span>Sunlight Intensity</span>
            <span className="font-mono text-amber-300">{config.sunIntensity.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min={0}
            max={4}
            step={0.1}
            value={config.sunIntensity}
            onChange={(e) => onChangeConfig({ ...config, sunIntensity: Number(e.target.value) })}
            className="w-full accent-amber-500 bg-stone-800 h-1.5 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Studio Spotlight Rig */}
      <div className="space-y-2 border-t border-stone-800/80 pt-2">
        <div className="flex items-center space-x-1 text-stone-400 font-mono text-[10px]">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>KEY SPOTLIGHT &amp; COVE LEDS</span>
        </div>

        <div>
          <div className="flex justify-between text-[10px] text-stone-300 mb-0.5">
            <span>Spotlight Power</span>
            <span className="font-mono text-amber-300">{config.spotlightIntensity.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min={0}
            max={5}
            step={0.1}
            value={config.spotlightIntensity}
            onChange={(e) => onChangeConfig({ ...config, spotlightIntensity: Number(e.target.value) })}
            className="w-full accent-amber-500 bg-stone-800 h-1.5 rounded cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-[10px] text-stone-300 mb-0.5">
            <span>Ceiling Cove Ambient</span>
            <span className="font-mono text-amber-300">{config.coveLightIntensity.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min={0}
            max={3}
            step={0.1}
            value={config.coveLightIntensity}
            onChange={(e) => onChangeConfig({ ...config, coveLightIntensity: Number(e.target.value) })}
            className="w-full accent-amber-500 bg-stone-800 h-1.5 rounded cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-[10px] text-stone-300 mb-0.5">
            <span>Shadow Softness</span>
            <span className="font-mono text-amber-300">{config.shadowSoftness.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={1.5}
            step={0.1}
            value={config.shadowSoftness}
            onChange={(e) => onChangeConfig({ ...config, shadowSoftness: Number(e.target.value) })}
            className="w-full accent-amber-500 bg-stone-800 h-1.5 rounded cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
