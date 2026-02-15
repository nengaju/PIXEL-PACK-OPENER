import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import Card from './Card';
import { CardInstance, Rarity } from '../types';
import { IconBattle, IconCoin, IconLock } from './PixelIcons';

type BattleMode = 'DECK' | 'BAFO' | 'TCG';

const BattleArena: React.FC = () => {
  const { inventory, battleDeck, toggleBattleDeck, config, recordBattleResult, stats } = useGame();
  const [mode, setMode] = useState<BattleMode>('DECK');
  const [isIdle, setIsIdle] = useState(false);
  
  // Battle State
  const [playerCard, setPlayerCard] = useState<CardInstance | null>(null);
  const [opponentCard, setOpponentCard] = useState<CardInstance | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [animState, setAnimState] = useState<'IDLE' | 'CLASH' | 'RESULT'>('IDLE');
  
  // Bafo State
  const [bafoStack, setBafoStack] = useState<number>(0);
  const [handPos, setHandPos] = useState<'UP' | 'DOWN'>('UP');

  const deckCards = inventory.filter(c => battleDeck.includes(c.instanceId));

  // --- Helper: Generate AI Opponent ---
  const generateOpponent = (): CardInstance => {
      // Create a fake "AI" card based on existing definitions
      const randDef = config.cards[Math.floor(Math.random() * config.cards.length)];
      
      // Determine rarity based on player stats to scale difficulty
      const r = Math.random();
      let rarity = Rarity.COMMON;
      if (r > 0.6) rarity = Rarity.UNCOMMON;
      if (r > 0.8) rarity = Rarity.RARE;
      if (r > 0.95) rarity = Rarity.EPIC;
      
      // Calculate value roughly
      const baseVal = 10 * (rarity === Rarity.COMMON ? 1 : rarity === Rarity.UNCOMMON ? 5 : rarity === Rarity.RARE ? 15 : 50);

      return {
          instanceId: `ai_${Date.now()}`,
          definitionId: randDef.id,
          name: randDef.name,
          theme: randDef.theme,
          imageId: randDef.imageId,
          rarity: rarity,
          isFoil: Math.random() > 0.9,
          variant: 'STANDARD',
          value: baseVal + Math.floor(Math.random() * 20),
          obtainedAt: Date.now()
      };
  };

  // --- TCG BATTLE LOGIC ---
  const runTCGRound = () => {
      if (deckCards.length === 0) {
          setIsIdle(false);
          setBattleLog(prev => ["No cards in deck!", ...prev]);
          return;
      }

      setAnimState('IDLE');
      
      // 1. Pick Player Card
      const pCard = deckCards[Math.floor(Math.random() * deckCards.length)];
      setPlayerCard(pCard);

      // 2. Generate Opponent
      const oCard = generateOpponent();
      setOpponentCard(oCard);

      // 3. Animation Delay -> Clash
      setTimeout(() => {
          setAnimState('CLASH');
          
          // 4. Result
          setTimeout(() => {
              setAnimState('RESULT');
              const win = pCard.value >= oCard.value;
              
              let msg = "";
              let gold = 0;
              let rewardCard = undefined;

              if (win) {
                  const diff = pCard.value - oCard.value;
                  gold = Math.max(10, Math.floor(oCard.value * 0.5) + diff);
                  msg = `VICTORY! ${pCard.name} (${pCard.value}) defeats ${oCard.name} (${oCard.value}). Won $${gold}.`;
                  
                  // 10% Chance to win the card
                  if (Math.random() < 0.10) {
                      rewardCard = oCard;
                      msg += " You took the opponent's card!";
                  }
              } else {
                  const loss = Math.min(10, Math.floor(pCard.value * 0.1));
                  gold = -loss;
                  msg = `DEFEAT... ${oCard.name} (${oCard.value}) crushed ${pCard.name} (${pCard.value}). Lost $${loss}.`;
              }

              setBattleLog(prev => [msg, ...prev].slice(0, 5));
              recordBattleResult(win, gold, rewardCard);

          }, 1000); // Wait for clash
      }, 500); // Initial delay
  };

  // --- BAFO LOGIC ---
  const runBafoRound = () => {
      setHandPos('UP');
      setBafoStack(prev => Math.min(prev + 2, 20)); // Add cards to stack

      setTimeout(() => {
          setHandPos('DOWN'); // SLAP!
          
          setTimeout(() => {
               setHandPos('UP');
               // Flip Logic
               const flipChance = 0.3 + (Math.random() * 0.4); // 30-70% chance
               const flipped = Math.random() < flipChance;
               
               if (flipped) {
                   const winAmount = Math.floor(Math.random() * 50) + 10;
                   setBattleLog(prev => [`SLAP! You flipped the stack! Won $${winAmount}`, ...prev].slice(0, 5));
                   recordBattleResult(true, winAmount);
                   setBafoStack(0);
               } else {
                   setBattleLog(prev => [`Weak slap... Stack grows.`, ...prev].slice(0, 5));
               }
          }, 200);
      }, 800);
  };

  // --- IDLE LOOP ---
  useRef(() => {
     // Interval cleanup
  });

  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;

      if (isIdle) {
          const speed = mode === 'TCG' ? 4000 : 2000;
          interval = setInterval(() => {
              if (mode === 'TCG') runTCGRound();
              if (mode === 'BAFO') runBafoRound();
          }, speed);
      }

      return () => clearInterval(interval);
  }, [isIdle, mode, deckCards]);


  // --- RENDERERS ---

  if (mode === 'DECK') {
      return (
          <div className="w-full max-w-6xl mx-auto p-4">
               <div className="flex justify-between items-center mb-6 bg-slate-800 p-4 rounded border-b-4 border-slate-700">
                   <div>
                       <h2 className="text-2xl text-red-400 font-bold">BATTLE DECK</h2>
                       <p className="text-xs text-slate-400">Select up to 10 cards to battle with.</p>
                   </div>
                   <div className="text-right">
                       <span className={`text-xl font-bold ${battleDeck.length === 10 ? 'text-red-500' : 'text-green-400'}`}>
                           {battleDeck.length} / 10
                       </span>
                       <button 
                         onClick={() => setMode('TCG')}
                         disabled={battleDeck.length === 0}
                         className="block mt-2 bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded text-xs border-b-4 border-red-800 active:border-b-0 active:translate-y-1 disabled:opacity-50"
                       >
                           GO TO ARENA
                       </button>
                   </div>
               </div>

               <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2">
                   {inventory.map(card => {
                       const isSelected = battleDeck.includes(card.instanceId);
                       return (
                           <div 
                             key={card.instanceId} 
                             onClick={() => toggleBattleDeck(card.instanceId)}
                             className={`relative cursor-pointer transition-all ${isSelected ? 'ring-4 ring-green-500 scale-95' : 'opacity-80 hover:opacity-100'}`}
                           >
                               <div className="pointer-events-none">
                                  <Card card={card} showValue={true} className="w-full h-auto text-[0.5rem]" />
                               </div>
                               {isSelected && (
                                   <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-bl font-bold">
                                       IN DECK
                                   </div>
                               )}
                           </div>
                       )
                   })}
               </div>
          </div>
      );
  }

  return (
      <div className="w-full max-w-4xl mx-auto p-4 flex flex-col h-[calc(100vh-180px)]">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 bg-slate-900 p-2 rounded border border-slate-700">
              <div className="flex gap-2">
                  <button 
                    onClick={() => { setIsIdle(false); setMode('DECK'); }} 
                    className="bg-slate-700 text-slate-300 px-3 py-1 rounded text-xs hover:bg-slate-600"
                  >
                      ← DECK
                  </button>
                  <button 
                    onClick={() => { setIsIdle(false); setMode('TCG'); }} 
                    className={`px-3 py-1 rounded text-xs font-bold ${mode === 'TCG' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-500'}`}
                  >
                      WAR (TCG)
                  </button>
                  <button 
                    onClick={() => { setIsIdle(false); setMode('BAFO'); }} 
                    className={`px-3 py-1 rounded text-xs font-bold ${mode === 'BAFO' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-500'}`}
                  >
                      BAFO (SLAP)
                  </button>
              </div>
              
              <div className="flex items-center gap-4">
                   <div className="text-xs text-slate-400">
                       W: <span className="text-green-400">{stats.battlesWon}</span> L: <span className="text-red-400">{stats.battlesLost}</span>
                   </div>
                   <button 
                     onClick={() => {
                         if (deckCards.length === 0 && mode === 'TCG') {
                             alert("Empty Deck!");
                             return;
                         }
                         setIsIdle(!isIdle);
                     }}
                     className={`
                        px-6 py-2 rounded font-bold text-xs border-b-4 active:border-b-0 active:translate-y-1 transition-all
                        ${isIdle ? 'bg-yellow-500 border-yellow-700 text-black animate-pulse' : 'bg-green-600 border-green-800 text-white'}
                     `}
                   >
                       {isIdle ? 'STOP AUTO' : 'START AUTO IDLE'}
                   </button>
              </div>
          </div>

          {/* Arena Content */}
          <div className="flex-1 bg-slate-800 rounded-xl border-4 border-slate-700 relative overflow-hidden flex flex-col shadow-inner">
              
              {/* Log Console */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-black/50 p-2 overflow-hidden pointer-events-none z-20">
                  {battleLog.map((log, i) => (
                      <div key={i} className={`text-[0.6rem] mb-1 font-mono ${log.includes('VICTORY') || log.includes('Won') ? 'text-green-400' : log.includes('DEFEAT') ? 'text-red-400' : 'text-slate-400'}`}>
                          {i === 0 ? '> ' : ''}{log}
                      </div>
                  ))}
              </div>

              {/* TCG VISUALS */}
              {mode === 'TCG' && (
                  <div className="flex-1 flex items-center justify-center gap-4 md:gap-12 mt-16 pb-12 relative">
                       {/* VS Text */}
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl font-black text-white/10 z-0 italic">VS</div>

                       {/* Player Side */}
                       <div className={`transition-all duration-300 ${animState === 'CLASH' ? 'translate-x-12 rotate-12' : ''}`}>
                           <div className="text-center mb-2 text-green-400 font-bold text-xs">YOU</div>
                           {playerCard ? (
                               <div className="pointer-events-none transform scale-75 md:scale-100">
                                   <Card card={playerCard} showValue={true} />
                               </div>
                           ) : (
                               <div className="w-32 h-48 border-4 border-dashed border-slate-600 rounded flex items-center justify-center text-slate-600 text-xs">
                                   WAITING...
                               </div>
                           )}
                       </div>

                       {/* Opponent Side */}
                       <div className={`transition-all duration-300 ${animState === 'CLASH' ? '-translate-x-12 -rotate-12' : ''}`}>
                           <div className="text-center mb-2 text-red-400 font-bold text-xs">ENEMY</div>
                           {opponentCard ? (
                               <div className="pointer-events-none transform scale-75 md:scale-100">
                                   <Card card={opponentCard} showValue={true} />
                               </div>
                           ) : (
                               <div className="w-32 h-48 border-4 border-dashed border-slate-600 rounded flex items-center justify-center text-slate-600 text-xs">
                                   WAITING...
                               </div>
                           )}
                       </div>
                  </div>
              )}

              {/* BAFO VISUALS */}
              {mode === 'BAFO' && (
                  <div className="flex-1 flex flex-col items-center justify-center mt-12 pb-12 relative">
                      <div className="text-xs text-slate-400 mb-8">STACK VALUE: <span className="text-yellow-400 font-bold">${bafoStack * 50}</span></div>
                      
                      {/* The Stack */}
                      <div className="relative w-32 h-48">
                          {Array.from({ length: Math.min(bafoStack, 5) }).map((_, i) => (
                              <div 
                                key={i}
                                className="absolute inset-0 bg-slate-700 border-2 border-slate-500 rounded"
                                style={{
                                    transform: `translate(${i*2}px, ${-i*2}px)`,
                                    backgroundImage: config.activeCardBackUri ? `url(${config.activeCardBackUri})` : 'none',
                                    backgroundSize: 'cover'
                                }}
                              />
                          ))}
                          {bafoStack === 0 && (
                              <div className="absolute inset-0 border-2 border-dashed border-slate-600 rounded flex items-center justify-center text-slate-600 text-xs">
                                  EMPTY
                              </div>
                          )}
                      </div>

                      {/* The Hand */}
                      <div 
                        className={`absolute top-1/2 left-1/2 -translate-x-1/2 transition-transform duration-100 pointer-events-none z-30`}
                        style={{
                            transform: handPos === 'DOWN' ? 'translate(-50%, -20%) scale(1.2)' : 'translate(-50%, -150%) scale(1)'
                        }}
                      >
                          <div className="text-6xl">✋</div>
                      </div>
                  </div>
              )}

              {/* Controls Overlay */}
              {!isIdle && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                      <button 
                        onClick={() => {
                            if (mode === 'TCG') runTCGRound();
                            else runBafoRound();
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl border-b-8 border-indigo-800 active:border-b-0 active:translate-y-2 font-bold text-xl shadow-xl"
                      >
                          {mode === 'TCG' ? 'FIGHT!' : 'SLAP!'}
                      </button>
                  </div>
              )}
          </div>
      </div>
  );
};

export default BattleArena;