import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../context/GameContext';
import { CardInstance, Rarity } from '../types';
import Card from './Card';
import { IconCoin } from './PixelIcons';
import { SFX } from '../utils/audio';

const PackOpener: React.FC = () => {
  const { gold, buyPack, config } = useGame();
  const [opening, setOpening] = useState(false);
  const [isExploding, setIsExploding] = useState(false);
  const [openedCards, setOpenedCards] = useState<CardInstance[]>([]);
  const [revealedIndex, setRevealedIndex] = useState(-1);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  
  // Confetti particles state
  const [particles, setParticles] = useState<{
      id: string; 
      x: number; 
      y: number; 
      color: string; 
      tx: number; // Target X translate
      ty: number; // Target Y translate
      rot: number; // Rotation
      size: number;
      delay: number;
  }[]>([]);

  // Cleanup cleanup timer reference
  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Default to first pack if none selected
  useEffect(() => {
    if (!selectedPackId && config.packs.length > 0) {
      setSelectedPackId(config.packs[0].id);
    }
  }, [config.packs, selectedPackId]);

  const currentPack = config.packs.find(p => p.id === selectedPackId);

  // Optimized particle spawner with auto-cleanup
  const spawnParticles = (amount: number = 50) => {
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff', '#ffffff', '#ff9900'];
      const newParticles: any[] = [];
      const timestamp = Date.now(); 
      
      // Safety limit: if too many particles, clear old ones first
      if (particles.length > 300) {
          setParticles([]);
      }

      for(let i=0; i<amount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const velocity = 15 + Math.random() * 35; 
          
          newParticles.push({
              id: `${timestamp}-${i}-${Math.random()}`,
              x: 50,
              y: 50, 
              color: colors[Math.floor(Math.random() * colors.length)],
              tx: Math.cos(angle) * velocity * 1.5, 
              ty: Math.sin(angle) * velocity * 1.5 + (Math.random() * 20), 
              rot: (Math.random() - 0.5) * 720,
              size: Math.random() * 8 + 4,
              delay: Math.random() * 0.1
          });
      }
      
      setParticles(prev => [...prev, ...newParticles]);

      // Schedule cleanup for THESE specific particles to prevent memory leak
      setTimeout(() => {
          setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
      }, 2000);
  }

  const handleBuy = () => {
    if (!selectedPackId) return;
    if (opening || isExploding) return;
    
    // Check funds before starting animation to avoid "stuck" explosion if check fails later
    if (gold < (currentPack?.price || 0)) return;
    
    setIsExploding(true);

    setTimeout(() => {
        // Attempt buy
        const cards = buyPack(selectedPackId);
        
        if (cards && cards.length > 0) {
            SFX.openPack(config.customSFX?.openPack); 
            setOpening(true);
            spawnParticles(80); // Reduced from 150 to prevent lag
            setOpenedCards(cards);
            setRevealedIndex(-1);
            setIsExploding(false);
        } else {
            // CRITICAL FIX: Reset explosion if purchase failed (e.g. money race condition)
            setIsExploding(false);
        }
    }, 1000);
  };

  // Reveal Sequence logic
  useEffect(() => {
    if (opening && revealedIndex < openedCards.length) {
      const delay = Math.max(300, 600 - (revealedIndex * 50)); // Faster reveal
      
      const timer = setTimeout(() => {
        setRevealedIndex(prev => {
            const newIndex = prev + 1;
            if (newIndex >= 0 && newIndex < openedCards.length) {
                const card = openedCards[newIndex];
                
                // Reduced particle count per card to prevent freezing
                spawnParticles(30); 

                if (card.isFoil) SFX.revealFoil(config.customSFX?.revealFoil);
                else if (card.rarity === Rarity.LEGENDARY) SFX.revealLegendary(config.customSFX?.revealLegendary);
                else if (card.rarity === Rarity.EPIC) SFX.revealEpic(config.customSFX?.revealEpic);
                else if (card.rarity === Rarity.RARE) SFX.revealRare(config.customSFX?.revealRare);
                else SFX.revealCommon(config.customSFX?.revealCommon);
            }
            return newIndex;
        });
      }, delay); 
      return () => clearTimeout(timer);
    }
  }, [opening, revealedIndex, openedCards, config.customSFX]);

  const reset = () => {
    setOpening(false);
    setOpenedCards([]);
    setRevealedIndex(-1);
    setParticles([]);
  };

  const getRarityColor = (r: string) => {
    switch(r) {
      case 'COMMON': return 'bg-slate-500';
      case 'UNCOMMON': return 'bg-green-500';
      case 'RARE': return 'bg-blue-500';
      case 'EPIC': return 'bg-purple-500';
      case 'LEGENDARY': return 'bg-orange-500';
      case 'FOIL': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const getPackStyles = (theme: string) => {
      const t = theme.toLowerCase();
      if (t.includes('diamond')) {
        return {
              bg: 'diamond-bg',
              border: 'border-cyan-200',
              shadow: 'diamond-sparkle',
              effect: 'diamond-bg', 
              textColor: 'text-cyan-50'
        };
      }
      if (t.includes('gold')) {
          return {
              bg: 'bg-gradient-to-br from-yellow-300 via-yellow-100 to-yellow-600',
              border: 'border-yellow-700',
              shadow: 'shadow-[0_0_30px_rgba(234,179,8,0.6)]',
              effect: 'animate-pulse', 
              textColor: 'text-yellow-900'
          };
      }
      if (t.includes('silver')) {
          return {
              bg: 'bg-gradient-to-br from-slate-300 via-slate-100 to-slate-400',
              border: 'border-slate-500',
              shadow: 'shadow-[0_0_30px_rgba(203,213,225,0.6)]',
              effect: 'holo-bg opacity-50', 
              textColor: 'text-slate-900 font-extrabold' 
          };
      }
      return {
          bg: 'bg-gradient-to-br from-indigo-600 via-purple-700 to-slate-900',
          border: 'border-indigo-400',
          shadow: 'shadow-2xl',
          effect: '',
          textColor: 'text-white'
      };
  };

  const packStyle = currentPack ? getPackStyles(currentPack.theme) : getPackStyles('');

  // Portal Component for Particles
  const ConfettiOverlay = () => {
      if (particles.length === 0) return null;
      
      return createPortal(
        <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
            {particles.map(p => (
                <div 
                    key={p.id}
                    className="absolute shadow-sm"
                    style={{
                        backgroundColor: p.color,
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        transformOrigin: 'center center',
                        // @ts-ignore
                        '--tx': `${p.tx}vw`,
                        '--ty': `${p.ty}vh`,
                        '--rot': `${p.rot}deg`,
                        animation: `super-explode 1.5s cubic-bezier(0, .9, .57, 1) forwards`,
                        animationDelay: `${p.delay}s`
                    }}
                />
            ))}
            <style>{`
                @keyframes super-explode {
                    0% { transform: translate(0, 0) scale(0) rotate(0); opacity: 1; }
                    15% { opacity: 1; transform: translate(calc(var(--tx) * 0.5), calc(var(--ty) * 0.5)) scale(1.2) rotate(calc(var(--rot) * 0.2)); }
                    100% { 
                        opacity: 0; 
                        transform: translate(var(--tx), var(--ty)) scale(0.5) rotate(var(--rot)); 
                    }
                }
            `}</style>
        </div>,
        document.body
      );
  };

  if (opening) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/95 flex flex-col items-center justify-center p-4 perspective-1000 overflow-hidden">
        
        <ConfettiOverlay />

        <h2 className="text-2xl mb-8 text-white animate-pulse tracking-widest font-bold z-10 relative">
            {revealedIndex < openedCards.length ? "OPENING..." : "PACK OPENED!"}
        </h2>
        
        <div className="relative w-full max-w-4xl min-h-[400px] flex items-center justify-center z-10">
            {/* The Stack in the center (visual only, fades out) */}
            {revealedIndex < 0 && (
                <div className="absolute animate-shake w-32 h-48 bg-indigo-600 border-4 border-indigo-400 rounded-lg shadow-[0_0_50px_rgba(79,70,229,0.5)] z-0">
                    <div className="w-full h-full flex items-center justify-center text-4xl text-white/20 font-bold">?</div>
                </div>
            )}

            <div className="flex flex-wrap justify-center gap-4 w-full">
            {openedCards.map((card, idx) => {
                const isRevealed = idx <= revealedIndex;
                
                return (
                    <div 
                    key={card.instanceId} 
                    className={`transition-all duration-700 ease-out transform
                        ${isRevealed 
                            ? 'opacity-100 translate-y-0 scale-100 rotate-0' 
                            : 'opacity-0 translate-y-20 scale-50 rotate-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                        }
                    `}
                    style={{ transitionDelay: `${idx * 100}ms` }}
                    >
                    {isRevealed && <Card card={card} className="animate-pop-in shadow-xl" />}
                    </div>
                );
            })}
            </div>
        </div>

        {/* Ensure buttons show up even if reveal logic desyncs slightly */}
        {(revealedIndex >= openedCards.length || openedCards.length === 0) && (
           <div className="mt-12 flex gap-4 animate-pop-in z-20">
              <button 
                onClick={reset}
                className="bg-slate-600 border-b-4 border-slate-800 text-white py-3 px-8 rounded active:border-b-0 active:translate-y-1 hover:bg-slate-500"
              >
                CLOSE
              </button>
              {currentPack && gold >= currentPack.price && (
                <button 
                onClick={() => { reset(); setTimeout(handleBuy, 100); }}
                className="bg-green-600 border-b-4 border-green-800 text-white py-3 px-8 rounded active:border-b-0 active:translate-y-1 hover:bg-green-500 flex items-center gap-2"
              >
                OPEN AGAIN <span className="text-sm">(${currentPack.price})</span>
              </button>
              )}
           </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full max-w-2xl mx-auto pb-20">
      
      <div className="flex gap-2 mb-8 overflow-x-auto w-full justify-center py-2 no-scrollbar">
        {config.packs.map(pack => (
          <button
            key={pack.id}
            onClick={() => setSelectedPackId(pack.id)}
            className={`px-4 py-2 text-xs md:text-sm whitespace-nowrap border-2 rounded transition-colors ${selectedPackId === pack.id ? 'bg-slate-100 text-slate-900 border-slate-100 shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'bg-slate-800 border-slate-600 text-slate-400 hover:text-white hover:border-slate-500'}`}
          >
            {pack.name}
          </button>
        ))}
      </div>

      {currentPack ? (
        <div className="flex flex-col items-center w-full">
            
            <div className="relative group cursor-pointer" onClick={handleBuy}>
                {/* The Pack Graphic */}
                <div className={`
                    w-56 h-80 ${packStyle.bg} border-4 ${packStyle.border} rounded-xl ${packStyle.shadow} 
                    flex flex-col items-center justify-between py-6 px-4 relative transition-all duration-300 overflow-hidden
                    ${isExploding ? 'animate-explosion-shake scale-110 brightness-125' : ''}
                    ${gold >= currentPack.price && !isExploding ? 'animate-float hover:scale-105' : ''}
                    ${gold < currentPack.price ? 'grayscale opacity-50' : ''}
                `}>
                    
                    {currentPack.theme.toLowerCase().includes('silver') && (
                        <div className="absolute inset-0 holo-bg opacity-40 pointer-events-none" />
                    )}
                    {currentPack.theme.toLowerCase().includes('gold') && (
                        <div className="absolute inset-0 bg-yellow-400 mix-blend-overlay opacity-20 animate-pulse pointer-events-none" />
                    )}
                    
                    {/* Diamond Sparkles Overlay */}
                    {currentPack.theme.toLowerCase().includes('diamond') && (
                        <>
                           <div className="absolute inset-0 diamond-bg opacity-30 mix-blend-overlay pointer-events-none" />
                           <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full blur-[2px] animate-pulse" />
                           <div className="absolute bottom-20 right-10 w-3 h-3 bg-white rounded-full blur-[2px] animate-pulse delay-75" />
                        </>
                    )}

                    <style>{`
                        @keyframes explosionShake {
                            0% { transform: translate(0,0) rotate(0); }
                            25% { transform: translate(-5px, 5px) rotate(-5deg); }
                            50% { transform: translate(5px, -5px) rotate(5deg); }
                            75% { transform: translate(-5px, -5px) rotate(-5deg); }
                            100% { transform: translate(5px, 5px) rotate(5deg); }
                        }
                        .animate-explosion-shake {
                            animation: explosionShake 0.1s infinite;
                        }
                    `}</style>

                    <div className="absolute top-2 right-2 text-white/20 text-6xl font-bold rotate-12">?</div>
                    <div className="absolute bottom-20 left-[-10px] text-white/10 text-6xl font-bold -rotate-12">!</div>
                    
                    <div className="text-center w-full z-10 relative">
                        <h3 className={`text-2xl mb-2 leading-tight drop-shadow-md font-bold uppercase tracking-wide border-b-2 border-black/10 pb-2 ${packStyle.textColor}`}>
                            {currentPack.name}
                        </h3>
                        <p className={`text-xs uppercase tracking-widest font-bold drop-shadow-sm ${packStyle.textColor}`}>
                            {currentPack.cardCount} Cards
                        </p>
                    </div>

                    <div className="w-20 h-20 bg-black/20 rounded-full flex items-center justify-center border-2 border-white/10 backdrop-blur-sm z-10">
                    </div>
                    
                    <div className="w-full bg-black/60 rounded p-2 backdrop-blur-sm z-10 border border-white/10">
                        <div className="flex justify-between items-end h-10 gap-1">
                        {Object.keys(currentPack.rarityWeights).map((r) => {
                            const weight = currentPack.rarityWeights[r as Rarity];
                            if(weight === 0) return null;
                            const height = Math.min(100, Math.max(20, weight * 1.5)); // visual scaling
                            return (
                                <div key={r} className="flex flex-col items-center justify-end w-full h-full group/bar relative">
                                    <div 
                                        className={`w-full rounded-t ${getRarityColor(r)} transition-all`} 
                                        style={{ height: `${height}%` }} 
                                    />
                                    <div className="absolute bottom-full mb-1 hidden group-hover/bar:block bg-black text-white text-[0.5rem] p-1 rounded whitespace-nowrap z-20 border border-slate-600">
                                        {r}: {weight}%
                                    </div>
                                </div>
                            )
                        })}
                        </div>
                        <div className="flex justify-between text-[0.5rem] text-slate-300 mt-1 px-1 font-bold">
                             <span>COM</span>
                             <span>LEG</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 text-center w-full max-w-xs">
               <button 
                disabled={gold < currentPack.price || isExploding}
                onClick={handleBuy}
                className={`
                  w-full text-lg font-bold py-4 px-8 rounded border-b-8 transition-all relative overflow-hidden group
                  ${gold >= currentPack.price 
                    ? 'bg-green-500 border-green-700 text-white hover:bg-green-400 active:border-b-0 active:translate-y-2' 
                    : 'bg-slate-700 border-slate-900 text-slate-500 cursor-not-allowed'}
                `}
               >
                 <span className="relative z-10 drop-shadow-md">
                     {isExploding ? 'EXPLODING!' : (gold >= currentPack.price ? 'OPEN PACK' : 'INSUFFICIENT FUNDS')}
                 </span>
                 {gold >= currentPack.price && !isExploding && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />}
               </button>
               
               <div className={`mt-3 font-bold text-2xl flex items-center justify-center gap-2 ${gold >= currentPack.price ? 'text-yellow-400' : 'text-red-400'}`}>
                 <IconCoin className="w-6 h-6" />
                 {currentPack.price}
               </div>
            </div>

            <div className="mt-6 text-center text-slate-400 text-xs max-w-md bg-slate-800 p-4 rounded border border-slate-700">
                <p className="italic">"{currentPack.description}"</p>
            </div>
        </div>
      ) : (
        <div className="text-slate-500">Select a pack to begin</div>
      )}

    </div>
  );
};

export default PackOpener;