import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, Monitor, Speaker, Type, Box, HardDrive, Info, RefreshCw, Cpu, Palette, Sliders, Type as TypeIcon, Brain, Sparkles, ScanLine, Mic
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { EQ_FREQUENCIES, EQ_LABELS } from '../utils/mediaHelpers';

const TABS = [
  { id: 'ai', label: 'AI Lab', icon: Brain },
  { id: 'playback', label: 'Playback', icon: Monitor },
  { id: 'audio', label: 'Audio', icon: Speaker },
  { id: 'video', label: 'Video', icon: Box },
  { id: 'subtitles', label: 'Subtitles', icon: Type },
  { id: 'about', label: 'About', icon: Info },
];

const COLOR_SCHEMES = [
  { value: 'none', label: 'Normal (None)' },
  { value: 'breeze', label: 'Breeze' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'crystal', label: 'Crystal' },
  { value: 'shiver', label: 'Shiver' },
  { value: 'chill', label: 'Chill' },
  { value: 'glow', label: 'Glow' },
  { value: 'amber', label: 'Amber' },
  { value: 'sunbeam', label: 'Sunbeam' },
  { value: 'shadow', label: 'Shadow' },
  { value: 'shade', label: 'Shade' },
  { value: 'sunshine', label: 'Sunshine' },
  { value: 'nostalgia', label: 'Nostalgia' },
  { value: 'lavender', label: 'Lavender' },
  { value: 'fc12', label: 'FC-12' },
];

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('ai');
  const { settings, updateSettings, resetSettings } = useSettings();

  const handleEqChange = (index: number, value: number) => {
    const newEq = [...(settings.audio.equalizer || [0,0,0,0,0])];
    newEq[index] = value;
    updateSettings('audio', 'equalizer', newEq);
  };

  return (
    <div className="h-full flex bg-vlc-dark text-gray-200 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-black/20 border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5">
           <h2 className="text-xl font-bold text-white flex items-center gap-2">
             <SettingsIcon size={20} className="text-vlc-orange" />
             Preferences
           </h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-vlc-orange text-white shadow-lg shadow-orange-900/20' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
           <button 
             onClick={resetSettings}
             className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-white/10 rounded-lg text-xs font-bold text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
           >
             <RefreshCw size={14} />
             Reset All
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 bg-vlc-dark relative">
         <div className="max-w-3xl mx-auto">
            
            {/* AI Lab Settings */}
            {activeTab === 'ai' && (
               <div className="space-y-8 animate-fade-in">
                  <div>
                    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-6 border-b border-white/10 pb-4 flex items-center gap-3">
                       <Brain size={24} className="text-cyan-400" /> AI Neural Engine
                    </h3>
                    
                    <div className="bg-gradient-to-br from-cyan-900/10 to-blue-900/10 border border-cyan-500/20 rounded-3xl p-8">
                       <p className="text-cyan-200 mb-8 max-w-lg leading-relaxed">
                          Enhance your media experience with our experimental neural features. These process audio and video in real-time using client-side estimation.
                       </p>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Voice Isolation */}
                          <div className="bg-black/40 border border-white/5 p-6 rounded-2xl flex items-start gap-4 hover:border-cyan-500/50 transition-colors">
                             <div className="p-3 bg-cyan-900/20 text-cyan-400 rounded-xl">
                                <Mic size={24} />
                             </div>
                             <div className="flex-1">
                                <div className="flex justify-between items-start">
                                   <label className="font-bold text-white block mb-1">Voice Isolation</label>
                                   <button 
                                      onClick={() => updateSettings('ai', 'voiceIsolation', !settings.ai?.voiceIsolation)}
                                      className={`w-10 h-6 rounded-full transition-colors relative ${settings.ai?.voiceIsolation ? 'bg-cyan-500' : 'bg-gray-700'}`}
                                   >
                                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.ai?.voiceIsolation ? 'translate-x-4' : 'translate-x-0'}`} />
                                   </button>
                                </div>
                                <p className="text-xs text-gray-400">
                                   Intelligently boosts vocal frequencies and attenuates background noise using adaptive EQ.
                                </p>
                             </div>
                          </div>

                          {/* Smart Contrast */}
                          <div className="bg-black/40 border border-white/5 p-6 rounded-2xl flex items-start gap-4 hover:border-cyan-500/50 transition-colors">
                             <div className="p-3 bg-cyan-900/20 text-cyan-400 rounded-xl">
                                <ScanLine size={24} />
                             </div>
                             <div className="flex-1">
                                <div className="flex justify-between items-start">
                                   <label className="font-bold text-white block mb-1">Smart Contrast</label>
                                   <button 
                                      onClick={() => updateSettings('ai', 'smartContrast', !settings.ai?.smartContrast)}
                                      className={`w-10 h-6 rounded-full transition-colors relative ${settings.ai?.smartContrast ? 'bg-cyan-500' : 'bg-gray-700'}`}
                                   >
                                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.ai?.smartContrast ? 'translate-x-4' : 'translate-x-0'}`} />
                                   </button>
                                </div>
                                <p className="text-xs text-gray-400">
                                   Dynamically adjusts gamma and saturation based on scene brightness estimation.
                                </p>
                             </div>
                          </div>

                           {/* Motion Smoothing */}
                           <div className="bg-black/40 border border-white/5 p-6 rounded-2xl flex items-start gap-4 hover:border-cyan-500/50 transition-colors opacity-50 cursor-not-allowed" title="Coming Soon">
                             <div className="p-3 bg-cyan-900/20 text-cyan-400 rounded-xl">
                                <Sparkles size={24} />
                             </div>
                             <div className="flex-1">
                                <div className="flex justify-between items-start">
                                   <label className="font-bold text-white block mb-1">Motion Smooth</label>
                                   <div className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold rounded uppercase">Beta</div>
                                </div>
                                <p className="text-xs text-gray-400">
                                   Simulates high frame rate playback for smoother motion.
                                </p>
                             </div>
                          </div>

                       </div>
                    </div>
                  </div>
               </div>
            )}

            {/* Audio Settings */}
            {activeTab === 'audio' && (
              <div className="space-y-8 animate-fade-in">
                <div>
                   <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Audio Configuration</h3>
                   
                   <div className="space-y-6">
                      {/* Equalizer */}
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                         <div className="flex justify-between items-center mb-6">
                           <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                             <Sliders size={16} /> Graphic Equalizer
                           </label>
                           <button 
                             onClick={() => updateSettings('audio', 'equalizer', [0,0,0,0,0])}
                             className="text-xs text-vlc-orange hover:text-white"
                           >
                             Reset Flat
                           </button>
                         </div>
                         <div className="flex justify-between items-end h-32 px-2 gap-4">
                           {EQ_FREQUENCIES.map((freq, i) => (
                             <div key={freq} className="flex flex-col items-center h-full w-full">
                               <input 
                                 type="range" 
                                 min="-10" 
                                 max="10" 
                                 step="1"
                                 {...{ orient: "vertical" } as any}
                                 value={settings.audio.equalizer?.[i] || 0}
                                 onChange={(e) => handleEqChange(i, parseInt(e.target.value))}
                                 className="h-full w-2 bg-black/50 rounded-lg appearance-none cursor-pointer accent-vlc-orange vertical-range"
                                 style={{ WebkitAppearance: 'slider-vertical' } as any}
                               />
                               <span className="text-[10px] text-gray-500 mt-2 font-medium">{EQ_LABELS[i]}</span>
                             </div>
                           ))}
                         </div>
                      </div>

                      <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                         <div className="flex justify-between items-center mb-4">
                           <label className="text-sm font-bold text-gray-300">Pre-amp Volume</label>
                           <span className="text-vlc-orange font-mono font-bold">{settings.audio.preAmpVolume}%</span>
                         </div>
                         <input 
                           type="range" 
                           min="100" 
                           max="150" 
                           value={settings.audio.preAmpVolume}
                           onChange={(e) => updateSettings('audio', 'preAmpVolume', parseInt(e.target.value))}
                           className="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer accent-vlc-orange"
                         />
                         <p className="text-xs text-gray-500 mt-2">Boost volume level above 100%.</p>
                      </div>

                      <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                         <label className="block text-sm font-bold text-gray-300 mb-2">Output Device (Demo)</label>
                         <div className="relative">
                            <select 
                              value={settings.audio.outputDevice}
                              onChange={(e) => updateSettings('audio', 'outputDevice', e.target.value)}
                              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:border-vlc-orange focus:outline-none"
                            >
                              <option value="default">System Default</option>
                              <option value="headphones">Headphones (External)</option>
                              <option value="speakers">Speakers (Realtek Audio)</option>
                            </select>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* Video Settings */}
            {activeTab === 'video' && (
              <div className="space-y-8 animate-fade-in">
                 <div>
                   <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Video & Rendering</h3>
                   
                   <div className="space-y-6">
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                         <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/10 rounded-lg text-vlc-orange">
                               <Cpu size={24} />
                            </div>
                            <div>
                              <label className="text-sm font-bold text-gray-300">Hardware Acceleration</label>
                              <p className="text-xs text-gray-500 mt-1">Use GPU for video decoding when available.</p>
                              <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] bg-green-500/10 text-green-400 font-bold uppercase">Recommended</span>
                            </div>
                         </div>
                         <button 
                            onClick={() => updateSettings('video', 'hardwareAcceleration', !settings.video.hardwareAcceleration)}
                            className={`w-14 h-8 rounded-full transition-colors relative ${settings.video.hardwareAcceleration ? 'bg-vlc-orange' : 'bg-gray-700'}`}
                         >
                            <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${settings.video.hardwareAcceleration ? 'translate-x-6' : 'translate-x-0'}`} />
                         </button>
                      </div>

                      <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                         <label className="block text-sm font-bold text-gray-300 mb-2">Color Scheme</label>
                         <div className="relative">
                          <select 
                            value={settings.video.colorScheme || 'none'}
                            onChange={(e) => updateSettings('video', 'colorScheme', e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:border-vlc-orange focus:outline-none"
                          >
                            {COLOR_SCHEMES.map(scheme => (
                              <option key={scheme.value} value={scheme.value}>{scheme.label}</option>
                            ))}
                          </select>
                          <Palette className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                        </div>
                      </div>

                      <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                         <div className="flex justify-between items-center mb-4">
                           <div className="flex items-center gap-2">
                             <label className="text-sm font-bold text-gray-300">Post-processing Quality</label>
                             <Info size={14} className="text-gray-500" />
                           </div>
                           <span className="text-vlc-orange font-mono font-bold">{settings.video.postProcessing}%</span>
                         </div>
                         <input 
                           type="range" 
                           min="0" 
                           max="100" 
                           value={settings.video.postProcessing}
                           onChange={(e) => updateSettings('video', 'postProcessing', parseInt(e.target.value))}
                           className="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer accent-vlc-orange"
                         />
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* Subtitle Settings */}
            {activeTab === 'subtitles' && (
               <div className="space-y-8 animate-fade-in">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Subtitles & OSD</h3>
                    
                    <div className="space-y-6">
                       <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                          <div>
                             <label className="text-sm font-bold text-gray-300">Auto-load Subtitles</label>
                             <p className="text-xs text-gray-500 mt-1">Automatically load matching subtitle files.</p>
                          </div>
                          <button 
                             onClick={() => updateSettings('subtitles', 'autoLoad', !settings.subtitles.autoLoad)}
                             className={`w-14 h-8 rounded-full transition-colors relative ${settings.subtitles.autoLoad ? 'bg-vlc-orange' : 'bg-gray-700'}`}
                          >
                             <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${settings.subtitles.autoLoad ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                       </div>
 
                       <div className="grid grid-cols-2 gap-6">
                          <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                             <label className="block text-sm font-bold text-gray-300 mb-2">Language</label>
                             <select 
                               value={settings.subtitles.language}
                               onChange={(e) => updateSettings('subtitles', 'language', e.target.value)}
                               className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:border-vlc-orange focus:outline-none"
                             >
                               <option value="en">English</option>
                               <option value="es">Spanish</option>
                               <option value="fr">French</option>
                             </select>
                          </div>
 
                          <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                             <label className="block text-sm font-bold text-gray-300 mb-2">Size</label>
                             <div className="flex bg-black/50 rounded-xl p-1">
                                {['small', 'medium', 'large'].map((s) => (
                                   <button 
                                      key={s}
                                      onClick={() => updateSettings('subtitles', 'size', s)}
                                      className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all ${settings.subtitles.size === s ? 'bg-white/20 text-white' : 'text-gray-500'}`}
                                   >
                                      {s}
                                   </button>
                                ))}
                             </div>
                          </div>
                       </div>

                       {/* Advanced Subtitle Styling */}
                       <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                             <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-300">
                                <TypeIcon size={16} /> Advanced Styling
                             </div>
                             
                             <div className="space-y-4">
                                <div>
                                   <div className="flex justify-between mb-2">
                                     <label className="block text-xs text-gray-500">Background Opacity</label>
                                     <span className="text-xs font-mono text-gray-400">
                                       {Math.round(settings.subtitles.backgroundOpacity * 100)}%
                                     </span>
                                   </div>
                                   <input 
                                     type="range" min="0" max="1" step="0.1"
                                     value={settings.subtitles.backgroundOpacity}
                                     onChange={(e) => updateSettings('subtitles', 'backgroundOpacity', parseFloat(e.target.value))}
                                     className="w-full h-1 bg-black/50 rounded-lg appearance-none cursor-pointer accent-white"
                                   />
                                </div>
                                
                                <div>
                                   <label className="block text-xs text-gray-500 mb-2">Text Color</label>
                                   <div className="flex gap-4">
                                      {['white', 'yellow', 'light'].map((c) => (
                                         <button 
                                            key={c}
                                            onClick={() => updateSettings('subtitles', 'color', c)}
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                                              settings.subtitles.color === c ? 'border-vlc-orange scale-110' : 'border-transparent opacity-50'
                                            }`}
                                            style={{ backgroundColor: c === 'light' ? '#e4e4e7' : c }}
                                            title={c.charAt(0).toUpperCase() + c.slice(1)}
                                         />
                                      ))}
                                   </div>
                                </div>
                             </div>
                       </div>
                    </div>
                  </div>
               </div>
            )}
            
            {(activeTab === 'playback' || activeTab === 'about') && (
               <div className="flex flex-col items-center justify-center h-96 text-gray-500 animate-fade-in">
                  <HardDrive size={48} className="mb-4 opacity-20" />
                  <p>This section is currently under development.</p>
               </div>
            )}

            {/* Reset to Defaults Section */}
            <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-gray-500 text-sm">
                    Revert all application preferences to their original state.
                </p>
                <button 
                    onClick={() => {
                        if (window.confirm('Are you sure you want to reset all settings to default?')) {
                            resetSettings();
                        }
                    }}
                    className="px-6 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-bold rounded-xl border border-red-500/20 hover:border-red-500/30 transition-all flex items-center gap-2"
                >
                    <RefreshCw size={18} />
                    Reset to Defaults
                </button>
            </div>
         </div>
      </div>
    </div>
  );
};