import React from 'react';
import { MaterialConfig, FloorMaterialType, WallMaterialType, PedestalMaterialType } from '../types';
import { Palette, Grid, Box, Sliders } from 'lucide-react';

interface MaterialControlPanelProps {
  config: MaterialConfig;
  onChangeConfig: (config: MaterialConfig) => void;
}

export const MaterialControlPanel: React.FC<MaterialControlPanelProps> = ({
  config,
  onChangeConfig,
}) => {
  return (
    <div className="bg-stone-900/90 border border-stone-800/80 rounded-lg p-4 text-stone-200 text-xs shadow-2xl backdrop-blur-md space-y-4 max-w-xs w-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-2">
        <div className="flex items-center space-x-2">
          <Palette className="w-4 h-4 text-amber-400" />
          <span className="font-serif font-semibold tracking-wider text-sm text-stone-100 uppercase">
            ARCHITECTURAL FINISHES
          </span>
        </div>
      </div>

      {/* Floor Material Selection */}
      <div>
        <label className="text-[10px] font-mono uppercase text-stone-400 tracking-wider block mb-1.5 flex items-center justify-between">
          <span>Gallery Floor Finish</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'travertine', name: 'Travertine Marble', desc: 'Warm cream stone' },
            { id: 'microcement', name: 'Microcement', desc: 'Polished industrial' },
            { id: 'smoked_oak', name: 'Smoked Oak', desc: 'Dark timber planks' },
            { id: 'dark_basalt', name: 'Dark Basalt', desc: 'Honed volcanic stone' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeConfig({ ...config, floor: item.id as FloorMaterialType })}
              className={`p-2 rounded border text-left transition-all ${
                config.floor === item.id
                  ? 'bg-stone-100 text-stone-950 border-stone-100 font-semibold shadow-sm'
                  : 'bg-stone-800/80 border-stone-700/60 text-stone-300 hover:border-amber-500/50 hover:bg-stone-800'
              }`}
            >
              <div className="text-[11px] leading-tight">{item.name}</div>
              <div
                className={`text-[9px] ${
                  config.floor === item.id ? 'text-stone-600' : 'text-stone-400 font-mono'
                }`}
              >
                {item.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Wall Finish Selection */}
      <div className="border-t border-stone-800/80 pt-3">
        <label className="text-[10px] font-mono uppercase text-stone-400 tracking-wider block mb-1.5">
          Exhibition Wall Material
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'venetian_plaster', name: 'Venetian Plaster', desc: 'Soft lime wash' },
            { id: 'raw_concrete', name: 'Raw Concrete', desc: 'Board-formed' },
            { id: 'walnut_slats', name: 'Walnut Slats', desc: 'Acoustic wood' },
            { id: 'limestone', name: 'Limestone Slabs', desc: 'Honed block stone' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeConfig({ ...config, wall: item.id as WallMaterialType })}
              className={`p-2 rounded border text-left transition-all ${
                config.wall === item.id
                  ? 'bg-stone-100 text-stone-950 border-stone-100 font-semibold shadow-sm'
                  : 'bg-stone-800/80 border-stone-700/60 text-stone-300 hover:border-amber-500/50 hover:bg-stone-800'
              }`}
            >
              <div className="text-[11px] leading-tight">{item.name}</div>
              <div
                className={`text-[9px] ${
                  config.wall === item.id ? 'text-stone-600' : 'text-stone-400 font-mono'
                }`}
              >
                {item.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Pedestal Material Selection */}
      <div className="border-t border-stone-800/80 pt-3">
        <label className="text-[10px] font-mono uppercase text-stone-400 tracking-wider block mb-1.5">
          Exhibit Pedestal Finish
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'bronze', name: 'Antique Bronze', desc: 'Patinated bronze' },
            { id: 'travertine', name: 'Travertine', desc: 'Pietra limestone' },
            { id: 'matte_black', name: 'Matte Black Steel', desc: 'Anodized metal' },
            { id: 'natural_oak', name: 'Natural Oak', desc: 'Warm solid timber' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeConfig({ ...config, pedestal: item.id as PedestalMaterialType })}
              className={`p-2 rounded border text-left transition-all ${
                config.pedestal === item.id
                  ? 'bg-stone-100 text-stone-950 border-stone-100 font-semibold shadow-sm'
                  : 'bg-stone-800/80 border-stone-700/60 text-stone-300 hover:border-amber-500/50 hover:bg-stone-800'
              }`}
            >
              <div className="text-[11px] leading-tight">{item.name}</div>
              <div
                className={`text-[9px] ${
                  config.pedestal === item.id ? 'text-stone-600' : 'text-stone-400 font-mono'
                }`}
              >
                {item.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Physical Surface Parameters */}
      <div className="border-t border-stone-800/80 pt-3 space-y-2">
        <div className="flex items-center space-x-1 text-stone-400 font-mono text-[10px]">
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span>SURFACE REFLECTION &amp; ROUGHNESS</span>
        </div>

        <div>
          <div className="flex justify-between text-[10px] text-stone-300 mb-0.5">
            <span>Floor Specular Roughness</span>
            <span className="font-mono text-amber-300">{config.roughness.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={0.9}
            step={0.05}
            value={config.roughness}
            onChange={(e) => onChangeConfig({ ...config, roughness: Number(e.target.value) })}
            className="w-full accent-amber-500 bg-stone-800 h-1.5 rounded cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
