import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { CardInstance, Rarity, CardVariant } from '../types';
import { useGame } from '../context/GameContext';
import { IconLock, IconUnlock, IconCoin, IconClose } from './PixelIcons';

interface CardProps {
  card: CardInstance;
  onClick?: () => void;
  className?: string;
  showValue?: boolean;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

const RarityColors: Record<Rarity, string> = {
  [Rarity.COMMON]: 'border-slate-500 bg-slate-800 text-slate-300',
  [Rarity.UNCOMMON]: 'border-green-500 bg-green-900/20 text-green-300',
  [Rarity.RARE]: 'border-blue-500 bg-blue-900/20 text-blue-300',
  [Rarity.EPIC]: 'border-purple-500 bg-purple-900/20 text-purple-300 glow-epic',
  [Rarity.LEGENDARY]: 'border-orange-500 bg-orange-900/20 text-orange-300 glow-legendary',
};

const Card: React.FC<CardProps> = ({ 
  card, 
  onClick, 
  className = '', 
  showValue = true,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect
}) => {
  const { sellCard, toggleLock, config } = useGame();
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false); // State for rotation
  
  const variant: CardVariant = card.variant || (card.isFoil ? 'FOIL' : 'STANDARD');
  const isLocked = card.isLocked || false;
  
  const imgSrc = card.imageUri 
    ? card.imageUri 
    : `https://picsum.photos/seed/${card.imageId}/200`;

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelectionMode && onToggleSelect) {
        onToggleSelect();
        return;
    }
    
    if (onClick) {
      onClick();
    } else {
      setIsZoomed(true);
      setIsFlipped(false); // Reset flip on open
    }
  };

  const handleSell = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLocked) return;
    sellCard(card.instanceId);
    setIsZoomed(false);
  };

  const handleToggleLock = (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleLock(card.instanceId);
  }

  const defaultCardBack = `data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0z' fill='%231e293b'/%3E%3Cpath d='M2 2h16v16H2z' fill='none' stroke='%23334155' stroke-width='2'/%3E%3Cpath d='M10 5l5 5-5 5-5-5z' fill='%23475569'/%3E%3C/svg%3E`;

  const cardBackBg = config.activeCardBackUri || defaultCardBack;

  const borderClasses = config.activeBorderStyle 
    ? `${RarityColors[card.rarity]} ${config.activeBorderStyle}`
    : RarityColors[card.rarity];

  const getVariantOverlay = () => {
      switch(variant) {
          case 'FOIL': return <div className="absolute inset-0 holo-bg pointer-events-none opacity-40 z-10 rounded-lg" />;
          case 'HOLOGRAPHIC': return <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-50 pointer-events-none z-10 rounded-lg" />;
          case 'COSMIC': return (
              <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-lg">
                  <div className="absolute inset-0 bg-indigo-900/30 mix-blend-overlay" />
                  <div className="absolute inset-0 variant-cosmic opacity-80" />
              </div>
          );
          case 'HAUNTED': return (
              <div className="absolute inset-0 z-10 pointer-events-none rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
                  <div className="absolute inset-0 variant-haunted opacity-60" />
              </div>
          );
          case 'MAGMA': return <div className="absolute inset-0 variant-magma mix-blend-color-dodge opacity-60 pointer-events-none z-10 rounded-lg" />;
          case 'FROZEN': return <div className="absolute inset-0 variant-frozen mix-blend-screen opacity-60 pointer-events-none z-10 rounded-lg" />;
          case 'GLITCH': return <div className="absolute inset-0 variant-glitch mix-blend-exclusion opacity-50 pointer-events-none z-10 rounded-lg" />;
          case 'RADIANT': return (
              <div className="absolute inset-0 z-10 pointer-events-none rounded-lg">
                  <div className="absolute inset-0 bg-yellow-200/20 mix-blend-overlay animate-pulse" />
                  <div className="absolute inset-0 variant-radiant opacity-70" />
              </div>
          );
          default: return null;
      }
  };

  const getVariantLabel = () => {
      if (variant === 'STANDARD') return null;
      let colorClass = 'text-yellow-300';
      if (variant === 'HAUNTED') colorClass = 'text-purple-300';
      if (variant === 'COSMIC') colorClass = 'text-indigo-300';
      if (variant === 'MAGMA') colorClass = 'text-red-400';
      if (variant === 'FROZEN') colorClass = 'text-cyan-300';
      if (variant === 'GLITCH') colorClass = 'text-green-400';
      
      return <span className={`text-[0.6rem] font-bold ${colorClass} animate-pulse bg-black/60 px-1 rounded`}>{variant}</span>;
  };

  // Use Portal to render Zoom Overlay at document body level
  const ZoomOverlay = () => {
    return createPortal(
      <div 
        className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out perspective-1000"
        onClick={(e) => { e.stopPropagation(); setIsZoomed(false); }}
      >
        {/* Card Container with 3D Transform */}
        <div 
            className="relative w-72 h-[34rem] md:w-80 md:h-[36rem] transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] transform-style-3d"
            style={{ 
                transform: isFlipped ? 'rotateY(180deg) scale(1.05)' : 'rotateY(0deg) scale(1)',
                boxShadow: isFlipped ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : 'none'
            }}
            onClick={(e) => e.stopPropagation()}
        >
            
            {/* FRONT FACE */}
            <div 
              className={`
                absolute inset-0 border-8 flex flex-col items-center justify-between p-4 rounded-xl select-none backface-hidden bg-slate-800
                ${borderClasses}
                ${variant !== 'STANDARD' ? 'shadow-[0_0_50px_rgba(255,255,255,0.5)]' : 'shadow-2xl'}
              `}
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              {getVariantOverlay()}

              {/* Zoom Header */}
              <div className="w-full flex justify-between items-center opacity-80 mb-2 relative z-20">
                <span className="text-xs font-bold uppercase tracking-widest text-white drop-shadow-md">{card.rarity}</span>
                <div className="flex gap-2 items-center">
                    {getVariantLabel()}
                    <button 
                        onClick={handleToggleLock}
                        className={`p-1 rounded ${isLocked ? 'text-yellow-400' : 'text-slate-500 hover:text-white'}`}
                    >
                        {isLocked ? <IconLock className="w-6 h-6" /> : <IconUnlock className="w-6 h-6" />}
                    </button>
                </div>
              </div>

              <div className="w-60 h-60 bg-slate-900 border-4 border-white/20 overflow-hidden relative rounded-lg pixelated shadow-inner z-20">
                <img 
                  src={imgSrc} 
                  alt={card.name} 
                  className="w-full h-full object-cover rendering-pixelated"
                />
                {variant === 'GLITCH' && <div className="absolute inset-0 variant-glitch mix-blend-hard-light opacity-30" />}
              </div>

              <div className="text-center mt-4 relative z-20">
                <div className="text-2xl font-bold leading-tight mb-2 text-white drop-shadow-md">{card.name}</div>
                <div className="text-sm opacity-80 uppercase tracking-widest text-slate-200">{card.theme}</div>
              </div>

              <div className="w-full flex gap-2 mt-4 relative z-20">
                <div className="flex-1 bg-black/60 rounded px-2 py-3 text-center border border-white/10 flex items-center justify-center gap-2">
                    <IconCoin className="w-5 h-5 text-yellow-400" />
                    <span className="text-white text-xl font-bold">{card.value}</span>
                </div>
                
                <button 
                  onClick={handleSell}
                  disabled={isLocked}
                  className={`
                    px-4 py-2 rounded font-bold border-b-4 active:border-b-0 active:translate-y-1 transition-colors
                    ${isLocked 
                        ? 'bg-slate-600 border-slate-800 text-slate-400 cursor-not-allowed' 
                        : 'bg-red-600 border-red-800 text-white hover:bg-red-500'}
                  `}
                >
                  {isLocked ? 'LOCKED' : 'SELL'}
                </button>
              </div>

              {/* Flip Button (Front) */}
              <button 
                onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
                className="absolute top-1/2 right-[-20px] transform -translate-y-1/2 translate-x-full bg-slate-700 p-2 rounded-full border-2 border-slate-500 hover:bg-slate-600 group z-30 shadow-lg"
                title="Turn Card"
              >
                  <svg className="w-6 h-6 text-white group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
              </button>

            </div>

            {/* BACK FACE */}
            <div 
                className={`
                    absolute inset-0 border-8 rounded-xl backface-hidden flex items-center justify-center overflow-hidden shadow-2xl
                    ${borderClasses}
                `}
                style={{ 
                    transform: 'rotateY(180deg)',
                    backfaceVisibility: 'hidden', 
                    WebkitBackfaceVisibility: 'hidden',
                    backgroundColor: '#1e293b' // Force solid background color to prevent transparency issues
                }}
            >
                {/* Rarity Tint Layer (To maintain color feel even with solid BG) */}
                <div className={`absolute inset-0 ${RarityColors[card.rarity]} opacity-20 pointer-events-none z-0`} />

                {/* Card Back Pattern */}
                <div 
                    className="absolute inset-2 border-4 border-black/30 rounded-lg opacity-100 z-10"
                    style={{ 
                        backgroundImage: `url(${cardBackBg})`,
                        backgroundSize: config.activeCardBackUri ? 'cover' : '20px 20px',
                        backgroundPosition: 'center',
                        imageRendering: 'pixelated'
                    }}
                />
                
                {/* Variant Overlay on Back */}
                <div className="absolute inset-0 z-20 pointer-events-none">
                     {getVariantOverlay()}
                </div>

                {/* Flip Button (Back) */}
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
                    className="absolute top-1/2 left-[-20px] transform -translate-y-1/2 -translate-x-full bg-slate-700 p-2 rounded-full border-2 border-slate-500 hover:bg-slate-600 group z-30 shadow-lg"
                    title="Turn Back"
                >
                    <svg className="w-6 h-6 text-white group-hover:-rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>
            
            {/* Close Button (Attached to container) */}
             <button 
                onClick={(e) => { e.stopPropagation(); setIsZoomed(false); }}
                className="absolute -top-4 -right-4 bg-slate-700 text-white w-10 h-10 flex items-center justify-center rounded-full border-4 border-slate-900 font-bold hover:bg-slate-600 z-50 shadow-lg"
            >
                <IconClose className="w-5 h-5" />
            </button>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      {isZoomed && <ZoomOverlay />}
      <div 
        onClick={handleCardClick}
        className={`
          relative w-32 h-48 border-4 cursor-pointer transition-transform hover:scale-105 active:scale-95 flex flex-col items-center justify-between p-2 rounded-lg select-none overflow-hidden
          ${borderClasses}
          ${className}
          ${isSelected ? 'ring-4 ring-yellow-400 scale-95' : ''}
          ${isSelectionMode && !isSelected ? 'opacity-80 grayscale-[0.5]' : ''}
        `}
        style={{
          boxShadow: variant !== 'STANDARD' ? '0 0 15px rgba(255,255,255,0.4)' : '4px 4px 0px rgba(0,0,0,0.5)'
        }}
      >
        {isSelected && (
            <div className="absolute inset-0 z-40 bg-yellow-400/20 flex items-center justify-center">
                <div className="bg-yellow-400 text-black rounded-full p-2 border-2 border-white shadow-lg">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                       <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
                   </svg>
                </div>
            </div>
        )}

        {getVariantOverlay()}

        {isLocked && (
            <div className="absolute top-1 right-1 z-30 text-yellow-400 drop-shadow-md">
                <IconLock className="w-4 h-4" />
            </div>
        )}

        <div className="w-full flex justify-between items-start text-[0.5rem] uppercase tracking-tighter opacity-90 relative z-10 font-bold">
           <span>{card.rarity.substring(0,3)}</span>
           {getVariantLabel()}
        </div>

        <div className="w-20 h-20 bg-slate-900 border-2 border-white/20 overflow-hidden relative rounded-md pixelated z-10">
          <img 
            src={imgSrc} 
            alt={card.name} 
            className="w-full h-full object-cover rendering-pixelated"
            loading="lazy"
          />
        </div>

        <div className="text-center relative z-10">
          <div className="text-xs font-bold leading-tight mb-1 drop-shadow-sm">{card.name}</div>
        </div>

        {showValue && (
          <div className="w-full bg-black/60 rounded px-1 py-0.5 text-center relative z-10 flex items-center justify-center gap-1">
            <IconCoin className="w-3 h-3 text-yellow-400" />
            <span className="text-white text-xs font-bold">{card.value}</span>
          </div>
        )}
      </div>
    </>
  );
};

export default Card;