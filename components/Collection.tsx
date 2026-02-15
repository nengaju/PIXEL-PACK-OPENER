import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import Card from './Card';
import { Rarity } from '../types';
import { IconCoin, IconTrash, IconLock } from './PixelIcons';

const Collection: React.FC = () => {
  const { inventory, sellCard, sellMultipleCards, sellAllDuplicates, sellAllInventory, stats } = useGame();
  const [filterRarity, setFilterRarity] = useState<Rarity | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'VALUE' | 'RECENT'>('RECENT');
  
  // Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());

  // Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const filteredCards = useMemo(() => {
    let cards = [...inventory];
    
    if (filterRarity !== 'ALL') {
      cards = cards.filter(c => c.rarity === filterRarity);
    }

    if (sortBy === 'VALUE') {
      cards.sort((a, b) => b.value - a.value);
    } else {
      cards.sort((a, b) => b.obtainedAt - a.obtainedAt);
    }

    return cards;
  }, [inventory, filterRarity, sortBy]);

  const totalValue = useMemo(() => {
      return inventory.reduce((acc, curr) => acc + curr.value, 0);
  }, [inventory]);

  const requestSellCard = (instanceId: string, value: number, name: string) => {
    // Direct sell for single click in collection view too, or confirmation
    setConfirmModal({
      isOpen: true,
      title: 'Sell Card',
      message: `Sell ${name} for $${value}?`,
      onConfirm: () => sellCard(instanceId)
    });
  };

  const requestSellAllDuplicates = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Sell Duplicates',
      message: 'Sell all duplicate cards? Locked cards and high value cards will be kept.',
      onConfirm: () => sellAllDuplicates()
    });
  };

  const requestSellAllCards = () => {
    setConfirmModal({
      isOpen: true,
      title: 'LIQUIDATE COLLECTION',
      message: `Sell ALL unlocked cards? Locked cards will remain. This cannot be undone.`,
      onConfirm: () => sellAllInventory()
    });
  };

  // Selection Logic
  const toggleSelectionMode = () => {
      setIsSelectionMode(!isSelectionMode);
      setSelectedCardIds(new Set());
  }

  const toggleCardSelection = (id: string) => {
      const newSet = new Set(selectedCardIds);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setSelectedCardIds(newSet);
  }

  const handleSellSelected = () => {
      if (selectedCardIds.size === 0) return;
      const amount = selectedCardIds.size;
      const ids = Array.from(selectedCardIds);
      
      setConfirmModal({
          isOpen: true,
          title: `Sell ${amount} Cards`,
          message: `Are you sure you want to sell ${amount} selected cards?`,
          onConfirm: () => {
              sellMultipleCards(ids);
              setIsSelectionMode(false);
              setSelectedCardIds(new Set());
          }
      });
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-800 border-4 border-slate-500 p-6 rounded-lg max-w-sm w-full shadow-2xl animate-pop-in">
            <h3 className="text-xl text-white font-bold mb-2">{confirmModal.title}</h3>
            <p className="text-slate-300 text-sm mb-6">{confirmModal.message}</p>
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="px-4 py-2 text-slate-400 hover:text-white"
              >
                CANCEL
              </button>
              <button 
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal({ ...confirmModal, isOpen: false });
                }}
                className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded border-b-4 border-green-800 active:border-b-0 active:translate-y-1"
              >
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4 border-b-2 border-slate-700 pb-4 sticky top-0 bg-slate-900 z-30 pt-2">
        <div>
          <h2 className="text-2xl mb-1 text-indigo-400">Collection</h2>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>{inventory.length} Cards</span> 
            <span>•</span>
            <span className="flex items-center gap-1">Total Value: <IconCoin className="w-3 h-3 text-yellow-400" /> <span className="text-yellow-400">${totalValue}</span></span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-end">
            {!isSelectionMode ? (
                <>
                    <button 
                        onClick={toggleSelectionMode}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-2 px-4 rounded border-b-2 border-indigo-800 active:border-b-0 active:translate-y-[2px]"
                    >
                        SELECT CARDS
                    </button>
                    <button 
                    onClick={requestSellAllDuplicates}
                    className="bg-orange-600 hover:bg-orange-500 text-white text-xs py-2 px-4 rounded border-b-2 border-orange-800 active:border-b-0 active:translate-y-[2px] flex items-center gap-1"
                    >
                    <IconTrash className="w-3 h-3" /> Sell Duplicates
                    </button>
                    
                    <button 
                    onClick={requestSellAllCards}
                    className="bg-red-600 hover:bg-red-500 text-white text-xs py-2 px-4 rounded border-b-2 border-red-800 active:border-b-0 active:translate-y-[2px] mr-2 flex items-center gap-1"
                    >
                    <IconTrash className="w-3 h-3" /> SELL ALL
                    </button>
                </>
            ) : (
                <div className="flex items-center gap-2 animate-pop-in">
                    <span className="text-white text-xs font-bold mr-2">{selectedCardIds.size} Selected</span>
                    <button 
                        onClick={handleSellSelected}
                        disabled={selectedCardIds.size === 0}
                        className={`text-white text-xs py-2 px-4 rounded border-b-2 active:border-b-0 active:translate-y-[2px] flex items-center gap-1
                            ${selectedCardIds.size > 0 ? 'bg-red-600 border-red-800 hover:bg-red-500' : 'bg-slate-700 border-slate-800 opacity-50 cursor-not-allowed'}
                        `}
                    >
                        <IconCoin className="w-3 h-3" /> SELL SELECTED
                    </button>
                    <button 
                        onClick={toggleSelectionMode}
                        className="bg-slate-600 hover:bg-slate-500 text-white text-xs py-2 px-4 rounded border-b-2 border-slate-800 active:border-b-0 active:translate-y-[2px]"
                    >
                        CANCEL
                    </button>
                </div>
            )}

            <select 
              value={filterRarity} 
              onChange={(e) => setFilterRarity(e.target.value as any)}
              className="bg-slate-800 text-slate-200 text-xs p-2 rounded border border-slate-600"
            >
              <option value="ALL">All Rarities</option>
              {Object.values(Rarity).map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-800 text-slate-200 text-xs p-2 rounded border border-slate-600"
            >
              <option value="RECENT">Newest</option>
              <option value="VALUE">Highest Value</option>
            </select>
        </div>
      </div>

      {inventory.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <p className="text-lg">Your collection is empty.</p>
          <p className="text-sm mt-2">Go open some packs!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 justify-items-center">
          {filteredCards.map(card => (
            <div key={card.instanceId} className="relative group">
              <Card 
                card={card} 
                isSelectionMode={isSelectionMode}
                isSelected={selectedCardIds.has(card.instanceId)}
                onToggleSelect={() => toggleCardSelection(card.instanceId)}
              />
              
              {/* Quick Sell Button (Hidden in selection mode or if locked) */}
              {!card.isLocked && !isSelectionMode && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      requestSellCard(card.instanceId, card.value, card.name);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs items-center justify-center hidden group-hover:flex shadow-md border border-red-700 z-10 hover:bg-red-400"
                    title="Sell Card"
                  >
                    <IconCoin className="w-3 h-3" />
                  </button>
              )}
              {/* Lock Indicator */}
              {card.isLocked && (
                  <div className="absolute -top-2 -right-2 bg-slate-700 text-yellow-400 w-6 h-6 rounded-full flex items-center justify-center border border-slate-900 z-10 shadow-md">
                      <IconLock className="w-3 h-3" />
                  </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Collection;
