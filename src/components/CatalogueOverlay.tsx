import React from 'react';
import { CharacterExhibit, LightingConfig, MaterialConfig, RoomType } from '../types';
import { X, Award, FileText, Download, Check } from 'lucide-react';

interface CatalogueOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentExhibit: CharacterExhibit;
  roomType: RoomType;
  lightingConfig: LightingConfig;
  materialConfig: MaterialConfig;
}

export const CatalogueOverlay: React.FC<CatalogueOverlayProps> = ({
  isOpen,
  onClose,
  currentExhibit,
  roomType,
  lightingConfig,
  materialConfig,
}) => {
  const [downloaded, setDownloaded] = React.useState(false);

  if (!isOpen) return null;

  const roomNames: Record<RoomType, string> = {
    atrium: 'The Grand Atrium',
    loft: 'The Brutalist Loft',
    atelier: "The Sculptor's Atelier",
  };

  const handleExport = () => {
    const textContent = `
================================================================
ATELIER GALLERY // EXHIBITION CATALOGUE CERTIFICATE
================================================================
TITLE: ${currentExhibit.title}
ARTIST: ${currentExhibit.artist} (${currentExhibit.year})
MEDIUM: ${currentExhibit.medium}
DIMENSIONS: ${currentExhibit.dimensions}
POLYGON MESH DENSITY: ${currentExhibit.polygonCount}

EXHIBITION LOCATION:
Gallery Room: ${roomNames[roomType]}
Plinth Base Material: ${materialConfig.pedestal.toUpperCase()}
Floor Finish: ${materialConfig.floor.toUpperCase()}

STUDIO PHYSICAL LIGHTING PROFILE:
- Color Temperature: ${lightingConfig.kelvin}K
- Sun Elevation: ${lightingConfig.sunElevation}° | Azimuth: ${lightingConfig.sunAzimuth}°
- Spotlight Power: ${lightingConfig.spotlightIntensity}x

CURATOR COMMENTARY:
"${currentExhibit.curatorNote}"

ARTIST STATEMENT:
"${currentExhibit.description}"
================================================================
`;
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentExhibit.title.replace(/\s+/g, '_')}_Catalogue.txt`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-stone-900 border border-stone-800 rounded-lg max-w-2xl w-full p-6 text-stone-200 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-100 p-1 rounded bg-stone-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery Plaque Header */}
        <div className="border-b border-stone-800 pb-4">
          <div className="flex items-center space-x-2 text-amber-400 font-mono text-[11px] uppercase tracking-widest mb-1">
            <Award className="w-4 h-4" />
            <span>EXHIBITION CATALOGUE ENTRY // NO. {currentExhibit.id.toUpperCase().slice(0, 8)}</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-100 tracking-tight">
            {currentExhibit.title}
          </h2>
          <p className="text-sm text-stone-300 font-serif italic mt-0.5">
            By {currentExhibit.artist}, {currentExhibit.year}
          </p>
        </div>

        {/* Metadata Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-950/80 p-3 rounded border border-stone-800/80 font-mono text-[11px]">
          <div>
            <span className="text-stone-500 block text-[9px] uppercase">Medium</span>
            <span className="text-stone-200">{currentExhibit.medium}</span>
          </div>
          <div>
            <span className="text-stone-500 block text-[9px] uppercase">Dimensions</span>
            <span className="text-stone-200">{currentExhibit.dimensions}</span>
          </div>
          <div>
            <span className="text-stone-500 block text-[9px] uppercase">Mesh Density</span>
            <span className="text-amber-300">{currentExhibit.polygonCount}</span>
          </div>
          <div>
            <span className="text-stone-500 block text-[9px] uppercase">Exhibition Space</span>
            <span className="text-stone-200">{roomNames[roomType]}</span>
          </div>
        </div>

        {/* Description & Curator Note */}
        <div className="space-y-4 text-xs leading-relaxed font-sans">
          <div>
            <h4 className="font-serif text-sm font-semibold text-stone-100 mb-1 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Artist Statement</span>
            </h4>
            <p className="text-stone-300 bg-stone-950/40 p-3 rounded border border-stone-800/60">
              {currentExhibit.description}
            </p>
          </div>

          <div>
            <h4 className="font-serif text-sm font-semibold text-stone-100 mb-1">
              Curator's Lighting Notes
            </h4>
            <blockquote className="border-l-2 border-amber-500/80 pl-3 italic text-stone-300">
              "{currentExhibit.curatorNote}"
            </blockquote>
          </div>
        </div>

        {/* Lighting & Finish Profile */}
        <div className="border-t border-stone-800 pt-4">
          <h4 className="font-mono text-xs text-stone-400 uppercase tracking-wider mb-2">
            Physical Lighting &amp; Finish Parameters
          </h4>
          <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-stone-300">
            <div className="bg-stone-950 p-2 rounded border border-stone-800">
              <span className="text-stone-500 block text-[9px]">COLOR TEMP</span>
              <span className="text-amber-300 font-semibold">{lightingConfig.kelvin}K</span>
            </div>
            <div className="bg-stone-950 p-2 rounded border border-stone-800">
              <span className="text-stone-500 block text-[9px]">SUN ANGLE</span>
              <span>{lightingConfig.sunElevation}° Elev / {lightingConfig.sunAzimuth}° Azim</span>
            </div>
            <div className="bg-stone-950 p-2 rounded border border-stone-800">
              <span className="text-stone-500 block text-[9px]">PEDESTAL FINISH</span>
              <span className="capitalize">{materialConfig.pedestal.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs font-mono flex items-center space-x-2 transition-all shadow-lg"
          >
            {downloaded ? <Check className="w-4 h-4 text-emerald-950" /> : <Download className="w-4 h-4" />}
            <span>{downloaded ? 'Catalogue Saved' : 'Export Exhibition Certificate'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
