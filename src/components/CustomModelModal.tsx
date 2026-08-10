import React, { useState } from 'react';
import { X, Upload, Code2, Link, Check, Sparkles } from 'lucide-react';
import { CharacterExhibit } from '../types';

interface CustomModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomExhibit: (exhibit: CharacterExhibit) => void;
}

export const CustomModelModal: React.FC<CustomModelModalProps> = ({
  isOpen,
  onClose,
  onAddCustomExhibit,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'code'>('upload');
  const [modelTitle, setModelTitle] = useState('My Custom 3D Character');
  const [artistName, setArtistName] = useState('Custom Artist');
  const [glbUrl, setGlbUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [placementSlot, setPlacementSlot] = useState<'center' | 'left' | 'right' | 'far_left' | 'far_right' | 'custom'>('center');
  const [customX, setCustomX] = useState<number>(0);

  if (!isOpen) return null;

  const sampleModels = [
    {
      name: 'Classical Venus Bust (GLTF)',
      url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Venus/glTF-Binary/Venus.glb',
      artist: 'Classical Antiquity',
    },
    {
      name: 'Sculpted Bust Study (GLTF)',
      url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CesiumMan/glTF-Binary/CesiumMan.glb',
      artist: '3D Character Rig',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const url = URL.createObjectURL(file);
      setGlbUrl(url);
    }
  };

  const handleApplyModel = (urlToUse?: string) => {
    const finalUrl = urlToUse || glbUrl;
    if (!finalUrl) return;

    let targetX = 0;
    if (placementSlot === 'left') targetX = -3.2;
    else if (placementSlot === 'right') targetX = 3.2;
    else if (placementSlot === 'far_left') targetX = -5.5;
    else if (placementSlot === 'far_right') targetX = 5.5;
    else if (placementSlot === 'custom') targetX = customX;

    const newEx: CharacterExhibit = {
      id: `custom-${Date.now()}`,
      title: modelTitle || 'Custom Character Model',
      artist: artistName || 'Unknown Artist',
      year: new Date().getFullYear().toString(),
      medium: 'Custom GLTF 3D Asset',
      dimensions: 'Variable dimensions',
      description: 'A user-imported 3D character asset rendered inside the architectural lighting studio.',
      curatorNote: 'Custom GLB imported asset with physical shadow maps and surface material reflections.',
      type: 'custom_glb',
      customGlbUrl: finalUrl,
      polygonCount: 'Imported Mesh',
      materialsUsed: ['Standard PBR Material'],
      position: [targetX, 0, targetX === 0 ? 0.2 : -0.5],
      recommendedLighting: {
        kelvin: 3200,
        sunIntensity: 1.8,
        sunElevation: 35,
      },
    };

    onAddCustomExhibit(newEx);
    onClose();
  };

  const r3fSnippet = `// REACT THREE FIBER EMBED CODE FOR ATELIER GALLERY
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

function CharacterModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} position={[0, 0.9, 0]} />;
}

export default function MyExhibitionStudio() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#171614' }}>
      <Canvas shadows camera={{ position: [0, 1.8, 3.8], fov: 45 }}>
        <ambientLight intensity={0.45} />
        <directionalLight position={[-4, 8, 5]} intensity={2.0} castShadow />
        <CharacterModel url="${glbUrl || 'YOUR_MODEL_PATH.glb'}" />
        <OrbitControls target={[0, 1.2, 0]} />
      </Canvas>
    </div>
  );
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(r3fSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-stone-900 border border-stone-800 rounded-lg max-w-xl w-full p-6 text-stone-200 shadow-2xl space-y-5 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-100 p-1 rounded-sm bg-stone-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div>
          <h2 className="text-lg font-serif font-semibold text-stone-100 tracking-wide">
            IMPORT CUSTOM 3D CHARACTER MODEL
          </h2>
          <p className="text-xs text-stone-400 font-mono mt-1">
            Load your own .GLB / .GLTF file or view React Three Fiber integration code.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-800 space-x-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2 border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'upload'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>File Upload (.GLB)</span>
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`pb-2 border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'url'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Link className="w-4 h-4" />
            <span>Web URL / Samples</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`pb-2 border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'code'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>React Three Fiber Code</span>
          </button>
        </div>

        {/* Tab 1: Local GLB Upload */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-stone-400 block mb-1">
                  Sculpture Title
                </label>
                <input
                  type="text"
                  value={modelTitle}
                  onChange={(e) => setModelTitle(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded px-3 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-stone-400 block mb-1">
                  Artist / Creator Name
                </label>
                <input
                  type="text"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded px-3 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="border-2 border-dashed border-stone-700/80 hover:border-amber-500/80 rounded-lg p-5 text-center bg-stone-950/50 transition-colors">
              <Upload className="w-7 h-7 mx-auto text-amber-400 mb-1.5 opacity-80" />
              <p className="text-xs text-stone-200 font-medium">
                Drag &amp; drop your <span className="text-amber-300 font-mono">.glb / .gltf</span> file here
              </p>
              <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                Supports binary GLTF files with embedded textures &amp; PBR materials
              </p>
              <input
                type="file"
                accept=".glb,.gltf"
                onChange={handleFileUpload}
                className="hidden"
                id="glb-file-input"
              />
              <label
                htmlFor="glb-file-input"
                className="mt-2.5 inline-block px-4 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono cursor-pointer border border-stone-700 transition-colors"
              >
                {uploadedFileName ? `Selected: ${uploadedFileName}` : 'Choose Local File'}
              </label>
            </div>

            {/* Room Placement Controls */}
            <div className="space-y-1.5 pt-1 border-t border-stone-800/80">
              <label className="text-[11px] font-mono text-stone-400 block">
                Gallery Placement Location
              </label>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                {[
                  { id: 'center', label: 'Center (0m)' },
                  { id: 'left', label: 'Left Wing (-3.2m)' },
                  { id: 'right', label: 'Right Wing (+3.2m)' },
                  { id: 'far_left', label: 'Far Left (-5.5m)' },
                  { id: 'far_right', label: 'Far Right (+5.5m)' },
                  { id: 'custom', label: 'Custom Position' },
                ].map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setPlacementSlot(slot.id as any)}
                    className={`px-2 py-1.5 rounded border text-center transition-all ${
                      placementSlot === slot.id
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-semibold'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
              {placementSlot === 'custom' && (
                <div className="flex items-center space-x-2 pt-1 font-mono text-[11px]">
                  <span className="text-stone-400">X Position:</span>
                  <input
                    type="range"
                    min={-7.0}
                    max={7.0}
                    step={0.2}
                    value={customX}
                    onChange={(e) => setCustomX(Number(e.target.value))}
                    className="flex-1 accent-amber-500"
                  />
                  <span className="text-amber-300 w-12 text-right">{customX.toFixed(1)}m</span>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded text-xs text-stone-400 hover:text-stone-200 font-mono"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApplyModel()}
                disabled={!glbUrl}
                className={`px-5 py-1.5 rounded text-xs font-medium font-mono transition-all ${
                  glbUrl
                    ? 'bg-amber-500 text-stone-950 font-semibold hover:bg-amber-400 shadow-lg'
                    : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                }`}
              >
                Display in Gallery
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Web URL & Sample GLTFs */}
        {activeTab === 'url' && (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-mono text-stone-400 block mb-1">
                Direct GLB Asset URL
              </label>
              <input
                type="url"
                placeholder="https://example.com/character_model.glb"
                value={glbUrl}
                onChange={(e) => setGlbUrl(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded px-3 py-2 text-xs font-mono text-amber-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-2">
                Or Load Pre-Tested Classical Sample 3D Models
              </label>
              <div className="space-y-2">
                {sampleModels.map((sample, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-stone-950 border border-stone-800 rounded flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-stone-200">{sample.name}</div>
                      <div className="text-[10px] text-stone-400 font-mono">{sample.artist}</div>
                    </div>
                    <button
                      onClick={() => handleApplyModel(sample.url)}
                      className="px-3 py-1 rounded bg-stone-800 hover:bg-amber-500 hover:text-stone-950 border border-stone-700 text-stone-200 text-xs font-mono transition-all"
                    >
                      Load Sample
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded text-xs text-stone-400 hover:text-stone-200 font-mono"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApplyModel()}
                disabled={!glbUrl}
                className={`px-5 py-1.5 rounded text-xs font-medium font-mono transition-all ${
                  glbUrl
                    ? 'bg-amber-500 text-stone-950 font-semibold hover:bg-amber-400 shadow-lg'
                    : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                }`}
              >
                Display in Gallery
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: R3F Embed Code */}
        {activeTab === 'code' && (
          <div className="space-y-3">
            <p className="text-xs text-stone-300 leading-relaxed">
              Copy this React Three Fiber component to integrate your custom 3D model directly into your code:
            </p>
            <div className="relative">
              <pre className="bg-stone-950 p-4 rounded border border-stone-800 text-[11px] font-mono text-stone-300 overflow-x-auto max-h-60 leading-relaxed">
                {r3fSnippet}
              </pre>
              <button
                onClick={copyCode}
                className="absolute top-3 right-3 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-[10px] font-mono flex items-center space-x-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                <span>{copied ? 'Copied Code!' : 'Copy Snippet'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
