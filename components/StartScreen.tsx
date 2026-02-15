import React, { useEffect, useState } from 'react';
import { IconCards } from './PixelIcons';
import { useGame } from '../context/GameContext';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const { config, isLoaded } = useGame();
  const [fallingItems, setFallingItems] = useState<{id: number, left: number, delay: number, variant: number, size: number}[]>([]);

  useEffect(() => {
    // Generate falling card shapes
    const items = [];
    // Increased count for better density
    for(let i=0; i<35; i++) {
        items.push({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 8, // Slower, more spread out fall
            variant: Math.floor(Math.random() * 4), // 4 color variants
            size: 0.8 + Math.random() * 0.5 // Random scale
        });
    }
    setFallingItems(items);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
            {fallingItems.map((item) => (
                <div 
                    key={item.id}
                    className="absolute top-[-15%]"
                    style={{
                        left: `${item.left}%`,
                        animation: `fall ${6 + item.delay/2}s linear infinite`,
                        animationDelay: `-${item.delay}s`,
                        transform: `scale(${item.size})`
                    }}
                >
                    {/* CARD SHAPE */}
                    <div className={`
                        w-10 h-14 rounded border-2 shadow-lg
                        ${item.variant === 0 ? 'bg-indigo-800 border-indigo-600' : ''}
                        ${item.variant === 1 ? 'bg-slate-800 border-slate-600' : ''}
                        ${item.variant === 2 ? 'bg-blue-900 border-blue-700' : ''}
                        ${item.variant === 3 ? 'bg-purple-900 border-purple-700' : ''}
                    `}>
                        {/* Inner detail to look like card back */}
                        <div className="w-full h-full opacity-30 bg-black/40 flex items-center justify-center">
                            <div className="w-6 h-10 border border-white/10 rounded-sm"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        <style>{`
            @keyframes fall {
                0% { transform: translateY(-20vh) rotate(0deg) scale(1); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translateY(120vh) rotate(360deg) scale(1); opacity: 0; }
            }
        `}</style>

        {/* Title Content */}
        <div className="z-10 text-center animate-pop-in flex flex-col items-center">
            {config.gameLogoUri ? (
                <div className="mb-12 max-w-sm md:max-w-xl mx-auto">
                    <img 
                        src={config.gameLogoUri} 
                        alt="Game Logo" 
                        className="w-full h-auto drop-shadow-xl animate-float"
                    />
                </div>
            ) : (
                <>
                    <div className="mb-6 flex justify-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-xl border-4 border-indigo-300 shadow-[0_0_30px_rgba(99,102,241,0.6)] flex items-center justify-center animate-float">
                            <IconCards className="w-12 h-12 text-white" />
                        </div>
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 tracking-tighter drop-shadow-xl">
                        PIXEL<span className="text-indigo-400">PACK</span>
                    </h1>
                    <h2 className="text-xl md:text-2xl text-slate-400 tracking-widest uppercase mb-12">
                        Opener
                    </h2>
                </>
            )}

            <button 
                onClick={onStart}
                disabled={!isLoaded}
                className={`
                    text-xl font-bold py-4 px-12 rounded border-b-8 transition-all shadow-xl
                    ${isLoaded 
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-800 active:border-b-0 active:translate-y-2' 
                        : 'bg-slate-700 text-slate-500 border-slate-900 cursor-wait'}
                `}
            >
                {isLoaded ? 'START GAME' : 'LOADING...'}
            </button>
        </div>
        
        <div className="absolute bottom-4 text-xs text-slate-600">
            v1.5.0 • Audio Enabled
        </div>
    </div>
  );
};

export default StartScreen;