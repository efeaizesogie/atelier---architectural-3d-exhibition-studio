import React from 'react';
import { Cpu, Zap, Sliders, Layers, HardDrive, ShieldCheck, Upload, Trash2, CheckCircle2 } from 'lucide-react';
import { CharacterExhibit, ModelOptimizerSettings } from '../types';
import { calculateOptimizationStats } from '../utils/modelOptimizer';

interface ModelOptimizerPanelProps {
  currentExhibit: CharacterExhibit;
  settings: ModelOptimizerSettings;
  onChangeSettings: (settings: ModelOptimizerSettings) => void;
  onUploadGlb: (file: File) => void;
  onRemoveCustomExhibit?: (id: string) => void;
  isCustomModel: boolean;
}

export const ModelOptimizerPanel: React.FC<ModelOptimizerPanelProps> = ({
  currentExhibit,
  settings,
  onChangeSettings,
  onUploadGlb,
  onRemoveCustomExhibit,
  isCustomModel,
}) => {
  // Parse numeric tri count from current exhibit polygon string (e.g. "210,400 tris")
  const rawTriCount = parseInt(currentExhibit.polygonCount.replace(/[^0-9]/g, '')) || 150000;
  const stats = calculateOptimizationStats(rawTriCount, settings);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadGlb(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-5 text-neutral-200 text-sm">
      {/* GLB File Upload Header Section */}
      <div className="p-4 rounded-xl bg-neutral-900/90 border border-amber-500/20 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-amber-400 font-medium">
            <Upload className="w-4 h-4" />
            <span>GLB Model Uploader & Pipeline</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Real-Time GLTF/GLB
          </span>
        </div>

        <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
          Upload 3D character assets in <span className="text-neutral-200 font-mono">.glb / .gltf</span> format to populate the studio pedestals. Uploaded models automatically pass through the optimization pipeline below.
        </p>

        <div className="flex items-center gap-2">
          <label className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 rounded-lg border border-amber-500/30 cursor-pointer transition text-xs font-medium">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload GLB Asset</span>
            <input
              type="file"
              accept=".glb,.gltf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {isCustomModel && onRemoveCustomExhibit && (
            <button
              onClick={() => onRemoveCustomExhibit(currentExhibit.id)}
              className="p-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded-lg transition"
              title="Remove Custom Model"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Optimization Statistics Overview */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-lg flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span>Mesh Tris</span>
            <Cpu className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-sm font-semibold text-neutral-100 font-mono">
            {stats.optimizedTriangles.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-400 font-mono">
            -{Math.round((1 - settings.meshDecimationRatio) * 100)}% reduced
          </div>
        </div>

        <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-lg flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span>GPU Memory</span>
            <HardDrive className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-sm font-semibold text-neutral-100 font-mono">
            {stats.estimatedGpuMemoryMb} MB
          </div>
          <div className="text-[10px] text-emerald-400 font-mono">
            -{stats.savedGpuMemoryMb} MB saved
          </div>
        </div>

        <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-lg flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span>FPS Boost</span>
            <Zap className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-sm font-semibold text-emerald-400 font-mono">
            +{stats.fpsGainPercent}%
          </div>
          <div className="text-[10px] text-neutral-400">Smooth 60FPS</div>
        </div>
      </div>

      {/* Optimizer Controls */}
      <div className="flex flex-col gap-4 p-4 bg-neutral-900/40 border border-neutral-800 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium text-xs text-neutral-300">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Mesh Decimation (Polygon Simplification)</span>
          </div>
          <span className="text-xs font-mono text-amber-400">
            {Math.round(settings.meshDecimationRatio * 100)}% Quality
          </span>
        </div>

        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={settings.meshDecimationRatio}
          onChange={(e) =>
            onChangeSettings({
              ...settings,
              meshDecimationRatio: parseFloat(e.target.value),
            })
          }
          className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
        />

        <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
          <span>High Performance (10%)</span>
          <span>Balanced (50%)</span>
          <span>Full Native (100%)</span>
        </div>

        <div className="h-px bg-neutral-800/80 my-1" />

        {/* Texture Resolution Cap */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-medium text-neutral-300">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Texture Max Resolution Limit</span>
            </div>
            <span className="text-xs font-mono text-neutral-400">
              {settings.textureResolutionLimit}px
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[512, 1024, 2048].map((res) => (
              <button
                key={res}
                onClick={() =>
                  onChangeSettings({ ...settings, textureResolutionLimit: res })
                }
                className={`py-1.5 px-2 rounded text-xs font-mono border transition ${
                  settings.textureResolutionLimit === res
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold'
                    : 'bg-neutral-800/60 border-neutral-700/60 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {res}px Cap
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-neutral-800/80 my-1" />

        {/* Pipeline Flags */}
        <div className="flex flex-col gap-2.5">
          <label className="flex items-center justify-between text-xs text-neutral-300 cursor-pointer">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Weld Coplanar Vertices</span>
            </span>
            <input
              type="checkbox"
              checked={settings.weldVertices}
              onChange={(e) =>
                onChangeSettings({ ...settings, weldVertices: e.target.checked })
              }
              className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-neutral-300 cursor-pointer">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Auto Recalculate Smooth Normals</span>
            </span>
            <input
              type="checkbox"
              checked={settings.recalculateNormals}
              onChange={(e) =>
                onChangeSettings({ ...settings, recalculateNormals: e.target.checked })
              }
              className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
