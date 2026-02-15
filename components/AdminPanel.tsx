import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { GameConfig, CardDefinition, AudioTrack, Rarity, SFXType } from '../types';
import { IconSettings, IconMusic, IconImage, IconTrash, IconCards, IconGift } from './PixelIcons';

const AdminPanel: React.FC = () => {
  const { config, updateConfig, updateCardImage, updateCustomSFX, updateCardBack, updateGameLogo, addAudioTrack, removeAudioTrack, resetGame, factoryReset } = useGame();
  
  // New Card Form State
  const [newCardName, setNewCardName] = useState('');
  const [newCardTheme, setNewCardTheme] = useState('Fantasy');
  const [newCardImage, setNewCardImage] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper to resize and compress image
  const compressImage = (file: File, maxWidth: number = 512): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
                height *= maxWidth / width;
                width = maxWidth;
            } else {
                width *= maxWidth / height;
                height = maxWidth;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
             resolve(event.target?.result as string);
             return;
          }
          
          // Use pixelated scaling for pixel art look if needed, or smooth for photos
          // For general stability, default browser smoothing is fine for scaling DOWN
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress
          // 0.8 quality usually gives good balance
          const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          resolve(canvas.toDataURL(mimeType, 0.85));
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Helper for image upload
  const processImage = async (file: File, callback: (base64: string) => void) => {
      setError(null);
      setIsProcessing(true);
      
      try {
          // Client-side limit check (5MB raw)
          if (file.size > 5 * 1024 * 1024) { 
            throw new Error("Image too large. Please use under 5MB.");
          }

          // Compress/Resize
          // We limit card art to 400px width (plenty for the UI)
          const base64 = await compressImage(file, 400);
          
          // Check final string size (approximate)
          if (base64.length > 1000000) { // ~1MB base64 limit
               throw new Error("Resulting image is still too heavy. Try a smaller image.");
          }

          callback(base64);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 2000);
      } catch (err: any) {
          setError(err.message || "Failed to process image");
      } finally {
          setIsProcessing(false);
      }
  };

  // Helper for Audio upload
  const processAudio = (file: File, callback: (base64: string) => void) => {
      setError(null);
      // Increased to 3MB to allow slightly longer loops
      if (file.size > 3 * 1024 * 1024) { 
          setError("Audio too large. Limit 3MB.");
          return;
      }
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onloadend = () => {
          if (typeof reader.result === 'string') {
              callback(reader.result);
              setSuccess(true);
              setTimeout(() => setSuccess(false), 2000);
          }
          setIsProcessing(false);
      }
      reader.onerror = () => {
          setError("Failed to read audio file");
          setIsProcessing(false);
      }
      reader.readAsDataURL(file);
  }

  const handleUpdateCardImage = (cardId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file, (base64) => {
        updateCardImage(cardId, base64);
      });
    }
  };

  const handleUpdateSFX = (type: SFXType, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(file) {
          processAudio(file, (base64) => {
              updateCustomSFX(type, base64);
          })
      }
  }

  const handleUpdateCardBack = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          processImage(file, (base64) => {
              updateCardBack(base64);
          });
      }
  }

  const handleUpdateGameLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          processImage(file, (base64) => {
              updateGameLogo(base64);
          });
      }
  }

  const handleAddMusic = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(file) {
          processAudio(file, (base64) => {
              const newTrack: AudioTrack = {
                  id: `track_${Date.now()}`,
                  name: file.name.replace(/\.[^/.]+$/, ""), // remove extension
                  dataUri: base64
              };
              addAudioTrack(newTrack);
          });
      }
  }

  const handleAddCard = () => {
    if (!newCardName || !newCardTheme) {
      setError("Name and Theme are required.");
      return;
    }

    const newId = `c_${Date.now()}`;
    const newCard: CardDefinition = {
      id: newId,
      name: newCardName,
      theme: newCardTheme,
      imageId: Math.floor(Math.random() * 100), 
      imageUri: newCardImage || undefined
    };

    const newConfig = {
      ...config,
      cards: [...config.cards, newCard]
    };

    updateConfig(newConfig);
    setNewCardName('');
    setNewCardImage(null);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleRarityChange = (packId: string, rarity: Rarity, value: number) => {
      const newPacks = config.packs.map(pack => {
          if (pack.id === packId) {
              return {
                  ...pack,
                  rarityWeights: {
                      ...pack.rarityWeights,
                      [rarity]: value
                  }
              }
          }
          return pack;
      });
      updateConfig({ ...config, packs: newPacks });
  };

  const sfxTypes: {key: SFXType, label: string}[] = [
      { key: 'openPack', label: 'Pack Opening Sound' },
      { key: 'revealCommon', label: 'Reveal Common' },
      { key: 'revealRare', label: 'Reveal Rare' },
      { key: 'revealEpic', label: 'Reveal Epic' },
      { key: 'revealLegendary', label: 'Reveal Legendary' },
      { key: 'revealFoil', label: 'Reveal Foil' },
      { key: 'sell', label: 'Sell Coin Sound' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-20">
      
      {/* --- NOTIFICATION AREA --- */}
      {error && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 md:bottom-10 p-4 bg-red-900 text-white border-2 border-red-500 rounded shadow-xl animate-pop-in z-[100] whitespace-nowrap">
          ⚠️ {error}
        </div>
      )}
      
      {success && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 md:bottom-10 p-4 bg-green-600 text-white border-2 border-green-400 rounded shadow-xl animate-pop-in z-[100] whitespace-nowrap">
          ✅ Action Successful!
        </div>
      )}

      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center backdrop-blur-sm">
            <div className="bg-slate-800 p-6 rounded border-2 border-indigo-500 animate-pulse text-white font-bold flex flex-col items-center gap-2">
                <IconSettings className="w-8 h-8 animate-spin" />
                Processing Asset... Please Wait
            </div>
        </div>
      )}
      
      {/* --- GLOBAL GRAPHICS --- */}
      <div className="bg-slate-800 rounded-lg border-2 border-indigo-500 p-6 shadow-lg">
          <h2 className="text-xl text-indigo-400 mb-6 font-bold flex items-center gap-2">
            <IconImage className="w-6 h-6" /> GLOBAL GRAPHICS
          </h2>
          
          <div className="space-y-4">
              {/* Game Logo */}
              <div className="bg-slate-900 p-4 rounded border border-slate-700 flex items-center justify-between">
                  <div>
                      <h3 className="text-white font-bold text-sm">Game Logo</h3>
                      <p className="text-slate-400 text-xs">Replaces the Title Text on Start Screen.</p>
                      <p className="text-slate-500 text-[0.6rem] mt-1 italic">Resized automatically to max 600px width</p>
                  </div>
                  <div className="flex items-center gap-4">
                      {config.gameLogoUri && (
                          <div className="bg-black/50 p-2 rounded border border-slate-600">
                             <img src={config.gameLogoUri} className="h-10 object-contain" alt="Current Logo" />
                          </div>
                      )}
                      <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-2 px-4 rounded border-b-2 border-indigo-800 active:border-b-0 active:translate-y-[1px]">
                            UPLOAD LOGO
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleUpdateGameLogo}
                            />
                      </label>
                  </div>
              </div>

              {/* Card Back */}
              <div className="bg-slate-900 p-4 rounded border border-slate-700 flex items-center justify-between">
                  <div>
                      <h3 className="text-white font-bold text-sm">Card Back Image</h3>
                      <p className="text-slate-400 text-xs">Used for all cards unless a cosmetic overrides it.</p>
                      <p className="text-slate-500 text-[0.6rem] mt-1 italic">Resized automatically to max 400px width</p>
                  </div>
                  <div className="flex items-center gap-4">
                      {config.activeCardBackUri && (
                          <img src={config.activeCardBackUri} className="w-10 h-14 object-cover border border-slate-600 rounded" alt="Current Back" />
                      )}
                      <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-2 px-4 rounded border-b-2 border-indigo-800 active:border-b-0 active:translate-y-[1px]">
                            UPLOAD BACK
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleUpdateCardBack}
                            />
                      </label>
                  </div>
              </div>
          </div>
      </div>

      {/* --- SFX MANAGER --- */}
      <div className="bg-slate-800 rounded-lg border-2 border-green-500 p-6 shadow-lg">
          <h2 className="text-xl text-green-400 mb-6 font-bold flex items-center gap-2">
            <IconMusic className="w-6 h-6" /> SOUND EFFECTS (SFX)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sfxTypes.map(sfx => (
                  <div key={sfx.key} className="bg-slate-900 p-3 rounded border border-slate-700 flex justify-between items-center">
                      <div className="flex flex-col">
                          <span className="text-white text-xs font-bold">{sfx.label}</span>
                          <span className="text-[0.6rem] text-slate-500">{config.customSFX?.[sfx.key] ? 'Custom Active' : 'Default'}</span>
                      </div>
                      <label className="cursor-pointer bg-green-600 hover:bg-green-500 text-white text-[0.6rem] py-1 px-2 rounded">
                            UPLOAD
                            <input 
                                type="file" 
                                accept="audio/*" 
                                className="hidden" 
                                onChange={(e) => handleUpdateSFX(sfx.key, e)}
                            />
                      </label>
                  </div>
              ))}
          </div>
      </div>

      {/* --- PACK ODDS MANAGER --- */}
      <div className="bg-slate-800 rounded-lg border-2 border-yellow-500 p-6 shadow-lg">
          <h2 className="text-xl text-yellow-400 mb-6 font-bold flex items-center gap-2">
            <IconGift className="w-6 h-6" /> PACK ODDS CONFIGURATION
          </h2>
          <div className="space-y-6">
              {config.packs.map(pack => (
                  <div key={pack.id} className="bg-slate-900 p-4 rounded border border-slate-700">
                      <h3 className="text-white font-bold mb-3 border-b border-slate-700 pb-2">{pack.name}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {Object.values(Rarity).map(rarity => (
                              <div key={rarity}>
                                  <label className="block text-[0.6rem] text-slate-400 uppercase mb-1">{rarity}</label>
                                  <input 
                                    type="number" 
                                    value={pack.rarityWeights[rarity]}
                                    onChange={(e) => handleRarityChange(pack.id, rarity, parseInt(e.target.value) || 0)}
                                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-xs focus:border-yellow-500 outline-none"
                                  />
                              </div>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* --- MUSIC MANAGER --- */}
      <div className="bg-slate-800 rounded-lg border-2 border-pink-500 p-6 shadow-lg">
          <h2 className="text-xl text-pink-400 mb-6 font-bold flex items-center gap-2">
            <IconMusic className="w-6 h-6" /> MUSIC TRACKS
          </h2>
          
          <div className="mb-6">
              <label className="block text-sm text-slate-300 mb-2">Upload Track (MP3/WAV, Max 3MB)</label>
              <input 
                 type="file" 
                 accept="audio/*"
                 onChange={handleAddMusic}
                 className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-700"
              />
          </div>

          <div className="space-y-2">
              {config.audioTracks.length === 0 ? (
                  <p className="text-slate-500 text-xs italic">No music uploaded.</p>
              ) : (
                  config.audioTracks.map(track => (
                      <div key={track.id} className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-700">
                          <span className="text-white text-sm">{track.name}</span>
                          <button 
                            onClick={() => removeAudioTrack(track.id)}
                            className="text-red-400 hover:text-red-300 text-xs underline flex items-center gap-1"
                          >
                              <IconTrash className="w-3 h-3" /> Remove
                          </button>
                      </div>
                  ))
              )}
          </div>
      </div>

      {/* --- EDIT EXISTING CARDS --- */}
      <div className="bg-slate-800 rounded-lg border-2 border-blue-500 p-6 shadow-lg">
        <h2 className="text-xl text-blue-400 mb-6 font-bold flex items-center gap-2">
            <IconImage className="w-6 h-6" /> EDIT EXISTING CARD IMAGES
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
            {config.cards.map(card => (
                <div key={card.id} className="flex items-center gap-4 bg-slate-900 p-3 rounded border border-slate-700">
                    <div className="w-12 h-12 bg-black rounded overflow-hidden flex-shrink-0">
                         <img 
                            src={card.imageUri || `https://picsum.photos/seed/${card.imageId}/100`} 
                            className="w-full h-full object-cover pixelated"
                         />
                    </div>
                    <div className="flex-grow min-w-0">
                        <div className="text-white font-bold text-xs truncate">{card.name}</div>
                        <div className="text-slate-500 text-[0.6rem]">{card.theme}</div>
                    </div>
                    <div>
                        <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white text-[0.6rem] py-1 px-2 rounded">
                            UPLOAD
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => handleUpdateCardImage(card.id, e)}
                            />
                        </label>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* --- ADD NEW CARD SECTION --- */}
      <div className="bg-slate-800 rounded-lg border-2 border-indigo-500 p-6 shadow-lg">
        <h2 className="text-xl text-indigo-400 mb-6 font-bold flex items-center gap-2">
          <IconCards className="w-6 h-6" /> CREATE NEW CARD
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
             <div>
               <label className="block text-xs text-slate-400 mb-1">Card Name</label>
               <input 
                 type="text" 
                 value={newCardName}
                 onChange={(e) => setNewCardName(e.target.value)}
                 className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                 placeholder="e.g. Cyber Katana"
               />
             </div>
             
             <div>
               <label className="block text-xs text-slate-400 mb-1">Theme</label>
               <input 
                 type="text" 
                 value={newCardTheme}
                 onChange={(e) => setNewCardTheme(e.target.value)}
                 className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                 placeholder="e.g. Cyberpunk"
               />
             </div>

             <div>
               <label className="block text-xs text-slate-400 mb-1">Upload Art</label>
               <input 
                 type="file" 
                 accept="image/*"
                 onChange={(e) => {
                     const file = e.target.files?.[0];
                     if(file) processImage(file, setNewCardImage);
                 }}
                 className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
               />
             </div>
          </div>

          <div className="flex flex-col items-center justify-center bg-slate-900 rounded border-2 border-dashed border-slate-700 h-32 md:h-auto relative overflow-hidden">
             {newCardImage ? (
               <img src={newCardImage} alt="Preview" className="w-full h-full object-cover pixelated" />
             ) : (
               <span className="text-slate-600 text-xs">Image Preview</span>
             )}
          </div>
        </div>

        <button 
          onClick={handleAddCard}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded border-b-4 border-indigo-900 active:border-b-0 active:translate-y-1"
        >
          ADD CARD TO GAME
        </button>
      </div>

       <div className="flex justify-center pt-8 gap-4">
           <button 
            onClick={() => {
              if(window.confirm("This will reset your cards and gold, but keep your uploaded settings. Continue?")) resetGame();
            }}
            className="text-orange-500 text-xs underline opacity-70 hover:opacity-100"
          >
            Reset Progress
          </button>
           <button 
            onClick={() => {
              if(window.confirm("DELETE EVERYTHING? This will remove all your uploads and images. Cannot be undone.")) factoryReset();
            }}
            className="text-red-500 text-xs underline opacity-50 hover:opacity-100"
          >
            Factory Reset (Clear All Data)
          </button>
       </div>
    </div>
  );
};

export default AdminPanel;