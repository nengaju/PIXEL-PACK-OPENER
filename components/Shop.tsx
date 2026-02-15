import React from 'react';
import { useGame } from '../context/GameContext';
import { IconCoin, IconLock, IconUnlock } from './PixelIcons';

const Shop: React.FC = () => {
    const { gold, config, buyCosmetic, equipCosmetic } = useGame();

    const items = config.cosmetics || [];

    const isEquipped = (item: any) => {
        if (item.type === 'CARD_BACK') {
            if (!item.data && !config.activeCardBackUri) return true;
            return item.data === config.activeCardBackUri;
        }
        if (item.type === 'BORDER_STYLE') {
            if (!item.data && !config.activeBorderStyle) return true;
            return item.data === config.activeBorderStyle;
        }
        return false;
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
             <div className="bg-slate-800 border-b-4 border-slate-700 p-6 mb-6 rounded-lg text-center">
                 <h2 className="text-2xl text-yellow-400 font-bold mb-2">AESTHETIC SHOP</h2>
                 <p className="text-xs text-slate-400">Customize your collection! (Cosmetic Only)</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {items.map(item => {
                     const purchased = item.purchased;
                     const equipped = isEquipped(item);
                     
                     return (
                         <div key={item.id} className="bg-slate-900 border-4 border-slate-700 rounded-xl p-4 flex flex-col items-center shadow-lg relative overflow-hidden">
                             {equipped && (
                                 <div className="absolute top-2 right-2 bg-green-500 text-white text-[0.6rem] font-bold px-2 py-1 rounded shadow z-10">
                                     EQUIPPED
                                 </div>
                             )}

                             <h3 className="text-white font-bold mb-4 mt-2">{item.name}</h3>
                             
                             {/* Preview Area */}
                             <div className="w-32 h-48 flex items-center justify-center mb-4 relative">
                                 {item.type === 'CARD_BACK' && (
                                     <div 
                                        className="w-full h-full bg-slate-800 rounded-lg border-2 border-slate-600 relative overflow-hidden"
                                     >
                                        <div 
                                            className="absolute inset-2 border-2 border-slate-700 rounded opacity-80"
                                            style={{ 
                                                backgroundColor: item.data ? 'transparent' : '#1e293b',
                                                backgroundSize: item.data ? 'cover' : '10px 10px',
                                                backgroundImage: item.data 
                                                    ? `url(${item.data})` 
                                                    : `linear-gradient(45deg, #334155 25%, transparent 25%), linear-gradient(-45deg, #334155 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #334155 75%), linear-gradient(-45deg, transparent 75%, #334155 75%)`
                                            }}
                                        />
                                     </div>
                                 )}

                                 {item.type === 'BORDER_STYLE' && (
                                     <div className={`w-full h-full bg-slate-800 rounded-lg border-4 border-slate-500 flex items-center justify-center p-2 relative ${item.data}`}>
                                         {/* Fake Card Content */}
                                         <div className="w-full h-2/3 bg-black/40 rounded flex items-center justify-center text-xs text-white/50">
                                             PREVIEW
                                         </div>
                                     </div>
                                 )}
                             </div>

                             <div className="mt-auto w-full">
                                 {purchased ? (
                                     <button 
                                        onClick={() => equipCosmetic(item.id)}
                                        disabled={equipped}
                                        className={`w-full py-3 rounded font-bold border-b-4 active:border-b-0 active:translate-y-1 transition-all ${
                                            equipped 
                                            ? 'bg-slate-700 border-slate-900 text-slate-500 cursor-default'
                                            : 'bg-green-600 border-green-800 text-white hover:bg-green-500'
                                        }`}
                                     >
                                         {equipped ? 'ACTIVE' : 'EQUIP'}
                                     </button>
                                 ) : (
                                     <button 
                                        onClick={() => buyCosmetic(item.id)}
                                        disabled={gold < item.price}
                                        className={`w-full py-3 rounded font-bold border-b-4 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 ${
                                            gold >= item.price 
                                            ? 'bg-yellow-600 border-yellow-800 text-white hover:bg-yellow-500'
                                            : 'bg-slate-700 border-slate-900 text-slate-500 cursor-not-allowed'
                                        }`}
                                     >
                                         {gold < item.price && <IconLock className="w-3 h-3" />}
                                         BUY <IconCoin className="w-4 h-4 text-white" /> {item.price}
                                     </button>
                                 )}
                             </div>
                         </div>
                     )
                 })}
             </div>
        </div>
    );
};

export default Shop;
