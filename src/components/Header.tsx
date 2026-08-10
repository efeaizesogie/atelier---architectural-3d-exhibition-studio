import React from 'react';
import { RoomType, DisplayMode } from '../types';
import { Building2, Layers, Eye, Volume2, VolumeX, Upload, BookOpen } from 'lucide-react';

interface HeaderProps {
  currentRoom: RoomType;
  onSelectRoom: (room: RoomType) => void;
  displayMode: DisplayMode;
  onChangeDisplayMode: (mode: DisplayMode) => void;
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
  onOpenCustomModal: () => void;
  onOpenCatalogue: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoom,
  onSelectRoom,
  displayMode,
  onChangeDisplayMode,
  isAudioPlaying,
  onToggleAudio,
  onOpenCustomModal,
  onOpenCatalogue,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4 bg-stone-950/80 backdrop-blur-md border-b border-stone-800/60 text-stone-200">
      {/* Studio Branding */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-sm bg-stone-100 text-stone-950 font-serif text-lg font-bold flex items-center justify-center tracking-tighter">
          A
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-widest text-stone-100 uppercase font-serif">
            ATELIER <span className="text-amber-400 font-sans font-light text-xs ml-1">// 3D VIRTUAL GALLERY</span>
          </h1>
          <p className="text-[11px] text-stone-400 font-mono tracking-tight">
            PHYSICAL LIGHTING &amp; ARCHITECTURAL STUDIO
          </p>
        </div>
      </div>

      {/* Room Switcher Tabs */}
      <div className="hidden md:flex items-center bg-stone-900/90 p-1 rounded border border-stone-800/80 space-x-1">
        <button
          onClick={() => onSelectRoom('atrium')}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center space-x-1.5 ${
            currentRoom === 'atrium'
              ? 'bg-stone-100 text-stone-950 shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Grand Atrium</span>
        </button>

        <button
          onClick={() => onSelectRoom('loft')}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center space-x-1.5 ${
            currentRoom === 'loft'
              ? 'bg-stone-100 text-stone-950 shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Brutalist Loft</span>
        </button>

        <button
          onClick={() => onSelectRoom('atelier')}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center space-x-1.5 ${
            currentRoom === 'atelier'
              ? 'bg-stone-100 text-stone-950 shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Sculptor's Atelier</span>
        </button>
      </div>

      {/* Mode & Action Controls */}
      <div className="flex items-center space-x-3">
        {/* Render View Mode Selector */}
        <div className="bg-stone-900/90 p-1 rounded border border-stone-800/80 flex space-x-1">
          <button
            onClick={() => onChangeDisplayMode('realistic')}
            className={`px-2.5 py-1 text-xs rounded font-mono transition-all ${
              displayMode === 'realistic'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Realistic Studio Render"
          >
            Realistic
          </button>
          <button
            onClick={() => onChangeDisplayMode('blueprint')}
            className={`px-2.5 py-1 text-xs rounded font-mono transition-all ${
              displayMode === 'blueprint'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="CAD Architectural Blueprint Lines"
          >
            CAD Blueprint
          </button>
          <button
            onClick={() => onChangeDisplayMode('wireframe')}
            className={`px-2.5 py-1 text-xs rounded font-mono transition-all ${
              displayMode === 'wireframe'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Wireframe Geometry Mesh"
          >
            Wireframe
          </button>
        </div>

        {/* Custom 3D Model Upload / Code Button */}
        <button
          onClick={onOpenCustomModal}
          className="px-3 py-1.5 rounded bg-amber-600/20 border border-amber-500/40 text-amber-200 hover:bg-amber-600/30 transition-all text-xs font-medium flex items-center space-x-1.5"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Import 3D Model</span>
        </button>

        {/* Gallery Curator Notes Button */}
        <button
          onClick={onOpenCatalogue}
          className="p-1.5 rounded bg-stone-800/80 border border-stone-700/60 text-stone-300 hover:text-stone-100 transition-all text-xs flex items-center space-x-1"
          title="Exhibition Catalogue & Curator Notes"
        >
          <BookOpen className="w-4 h-4" />
        </button>

        {/* Studio Acoustics Sound Toggle */}
        <button
          onClick={onToggleAudio}
          className={`p-1.5 rounded border text-xs transition-all ${
            isAudioPlaying
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-stone-800/80 border-stone-700/60 text-stone-400 hover:text-stone-200'
          }`}
          title={isAudioPlaying ? 'Mute Studio Ambiance' : 'Enable Studio Room Acoustics'}
        >
          {isAudioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
