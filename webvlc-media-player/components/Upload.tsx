import React, { useState, useRef } from 'react';
import { UploadCloud, FolderOpen, CheckCircle, Cloud, ArrowRight, X } from 'lucide-react';
import { CLOUD_PROVIDERS } from '../constants';
import { CloudProvider, MediaItem } from '../types';
import { uploadToCloudProvider } from '../services/storageService';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../constants';

type UploadStep = 'SELECT_FILE' | 'SELECT_PROVIDER' | 'UPLOADING' | 'COMPLETE';

export const Upload: React.FC = () => {
  const [step, setStep] = useState<UploadStep>('SELECT_FILE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
      setStep('SELECT_PROVIDER');
    }
  };

  const startUpload = async (provider: CloudProvider) => {
    setSelectedProvider(provider);
    setStep('UPLOADING');
    
    // Simulate Progress
    const interval = setInterval(() => {
        setUploadProgress(prev => {
            if (prev >= 90) {
                clearInterval(interval);
                return 90;
            }
            return prev + Math.random() * 10;
        });
    }, 200);

    if (selectedFile) {
        await uploadToCloudProvider(selectedFile, provider.id);
        clearInterval(interval);
        setUploadProgress(100);
        setTimeout(() => setStep('COMPLETE'), 500);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
        
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
            <div>
               <h1 className="text-4xl font-bold text-white mb-2">Upload to Cloud</h1>
               <p className="text-gray-400">Securely transfer media to your connected storage providers.</p>
            </div>
            
            {/* Step Indicator */}
            <div className="flex items-center gap-4 text-sm font-medium">
               <div className={`flex items-center gap-2 ${step === 'SELECT_FILE' ? 'text-vlc-orange' : 'text-gray-500'}`}>
                  <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs">1</span>
                  Select File
               </div>
               <div className="w-8 h-[1px] bg-white/10"></div>
               <div className={`flex items-center gap-2 ${step === 'SELECT_PROVIDER' ? 'text-vlc-orange' : 'text-gray-500'}`}>
                  <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs">2</span>
                  Provider
               </div>
               <div className="w-8 h-[1px] bg-white/10"></div>
               <div className={`flex items-center gap-2 ${step === 'UPLOADING' || step === 'COMPLETE' ? 'text-vlc-orange' : 'text-gray-500'}`}>
                  <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs">3</span>
                  Upload
               </div>
            </div>
        </div>

        {/* Step 1: File Selection */}
        {step === 'SELECT_FILE' && (
           <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
              <div 
                className="w-full max-w-2xl aspect-[2/1] bg-white/5 border-2 border-dashed border-white/20 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 hover:border-vlc-orange/50 transition-all group"
                onClick={() => fileInputRef.current?.click()}
              >
                  <div className="w-20 h-20 bg-black/40 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                     <FolderOpen size={32} className="text-vlc-orange" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Choose a file to upload</h3>
                  <p className="text-gray-400">Supports MKV, MP4, AVI, MP3, FLAC</p>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
              </div>
           </div>
        )}

        {/* Step 2: Provider Selection */}
        {step === 'SELECT_PROVIDER' && (
           <div className="flex-1 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-bold text-white">Select Destination</h2>
                 <button onClick={() => setStep('SELECT_FILE')} className="text-sm text-gray-500 hover:text-white">Change File</button>
              </div>

              {selectedFile && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 bg-black rounded flex items-center justify-center">
                        <FolderOpen className="text-gray-400" />
                     </div>
                     <div>
                        <div className="text-white font-bold">{selectedFile.name}</div>
                        <div className="text-xs text-gray-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload</div>
                     </div>
                  </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                 {CLOUD_PROVIDERS.map(provider => (
                    <button 
                       key={provider.id}
                       onClick={() => startUpload(provider)}
                       className="group relative flex flex-col items-start p-6 bg-black/40 border border-white/5 hover:border-vlc-orange hover:bg-white/5 rounded-2xl transition-all text-left"
                    >
                       <div className="absolute top-4 right-4 px-2 py-1 bg-white/5 rounded text-[10px] uppercase font-bold text-gray-500 group-hover:text-vlc-orange transition-colors">
                          Demo
                       </div>
                       <Cloud className={`mb-4 ${provider.iconColor}`} size={28} />
                       <h3 className="font-bold text-white text-lg">{provider.name}</h3>
                       <p className="text-sm text-gray-500 mt-1">{provider.description}</p>
                    </button>
                 ))}
              </div>
           </div>
        )}

        {/* Step 3: Uploading & Complete */}
        {(step === 'UPLOADING' || step === 'COMPLETE') && (
           <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full animate-fade-in">
              
              {step === 'COMPLETE' ? (
                 <div className="text-center animate-slide-up">
                    <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                       <CheckCircle size={48} />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Upload Complete</h2>
                    <p className="text-gray-400 mb-8">
                       Your file has been successfully uploaded to <span className="text-white font-bold">{selectedProvider?.name}</span> (Demo).
                    </p>
                    <div className="flex gap-4 justify-center">
                       <button onClick={() => setStep('SELECT_FILE')} className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors">
                          Upload Another
                       </button>
                       <button onClick={() => navigate(APP_ROUTES.LIBRARY)} className="px-6 py-3 bg-vlc-orange text-black font-bold rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-2">
                          Go to Library <ArrowRight size={18} />
                       </button>
                    </div>
                 </div>
              ) : (
                 <div className="w-full text-center">
                    <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-white/10 animate-pulse">
                       <Cloud size={32} className="text-vlc-orange" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Uploading to {selectedProvider?.name}...</h2>
                    <p className="text-gray-400 mb-8 text-sm">Please do not close this window.</p>
                    
                    <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden mb-4 border border-white/5">
                       <div 
                         className="h-full bg-vlc-orange transition-all duration-300 ease-out"
                         style={{ width: `${uploadProgress}%` }}
                       />
                    </div>
                    <div className="flex justify-between text-xs font-mono text-gray-500">
                       <span>{Math.round(uploadProgress)}%</span>
                       <span>{(selectedFile!.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                 </div>
              )}
           </div>
        )}

      </div>
    </div>
  );
};