import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import PackOpener from './components/PackOpener';
import Collection from './components/Collection';
import AdminPanel from './components/AdminPanel';
import MusicPlayer from './components/MusicPlayer';
import StartScreen from './components/StartScreen';
import CoinParticles from './components/CoinParticles';
import Shop from './components/Shop';
import BattleArena from './components/BattleArena';
import { IconGift, IconCards, IconSettings, IconCoin, IconBattle } from './components/PixelIcons';

type Tab = 'OPEN' | 'COLLECTION' | 'BATTLE' | 'SHOP' | 'ADMIN';

const GameLayout = () => {
  const { gold, stats } = useGame();
  const [currentTab, setCurrentTab] = useState<Tab>('OPEN');
  const [gameStarted, setGameStarted] = useState(false);

  if (!gameStarted) {
    return <StartScreen onStart={() => setGameStarted(true)} />;
  }

  return (
    <div className="h-screen w-screen bg-slate-900 flex flex-col overflow-hidden text-slate-100">
      
      {/* Top Header - Fixed */}
      <header className="flex-none bg-slate-900 border-b-4 border-slate-800 p-4 shadow-lg z-40">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex flex-col">
             <h1 className="text-indigo-400 text-sm md:text-xl font-bold tracking-widest uppercase">Pixel Pack Opener</h1>
             <span className="text-[0.6rem] text-slate-500">v1.6.0</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <div className="text-[0.6rem] text-slate-400 uppercase">Cards</div>
              <div className="text-white">{stats.cardsObtained}</div>
            </div>
            
            <div className="bg-slate-800 px-4 py-2 rounded border-2 border-slate-700 flex items-center gap-2 relative">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-900 border-2 border-yellow-600 z-10">
                  <IconCoin className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="text-yellow-400 font-bold text-lg md:text-xl tracking-wider">${gold.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24 md:pb-6 scrollbar-thin">
        {currentTab === 'OPEN' && <PackOpener />}
        {currentTab === 'COLLECTION' && <Collection />}
        {currentTab === 'BATTLE' && <BattleArena />}
        {currentTab === 'SHOP' && <Shop />}
        {currentTab === 'ADMIN' && <AdminPanel />}
      </main>
      
      {/* Overlays */}
      <CoinParticles />
      <MusicPlayer />

      {/* Bottom Navigation - Fixed */}
      <nav className="flex-none bg-slate-800 border-t-4 border-slate-700 p-2 md:p-4 z-50">
        <div className="max-w-md mx-auto flex justify-around">
          <button 
            onClick={() => setCurrentTab('OPEN')}
            className={`flex flex-col items-center p-2 rounded w-16 transition-all ${currentTab === 'OPEN' ? 'bg-indigo-600 text-white -translate-y-2 border-b-4 border-indigo-900' : 'text-slate-400 hover:text-white'}`}
          >
            <span className="mb-1"><IconGift className="w-5 h-5" /></span>
            <span className="text-[0.5rem]">OPEN</span>
          </button>

          <button 
            onClick={() => setCurrentTab('COLLECTION')}
            className={`flex flex-col items-center p-2 rounded w-16 transition-all ${currentTab === 'COLLECTION' ? 'bg-indigo-600 text-white -translate-y-2 border-b-4 border-indigo-900' : 'text-slate-400 hover:text-white'}`}
          >
            <span className="mb-1"><IconCards className="w-5 h-5" /></span>
            <span className="text-[0.5rem]">CARDS</span>
          </button>

          <button 
            onClick={() => setCurrentTab('BATTLE')}
            className={`flex flex-col items-center p-2 rounded w-16 transition-all ${currentTab === 'BATTLE' ? 'bg-red-600 text-white -translate-y-2 border-b-4 border-red-900' : 'text-slate-400 hover:text-white'}`}
          >
            <span className="mb-1"><IconBattle className="w-5 h-5" /></span>
            <span className="text-[0.5rem]">BATTLE</span>
          </button>

          <button 
            onClick={() => setCurrentTab('SHOP')}
            className={`flex flex-col items-center p-2 rounded w-16 transition-all ${currentTab === 'SHOP' ? 'bg-indigo-600 text-white -translate-y-2 border-b-4 border-indigo-900' : 'text-slate-400 hover:text-white'}`}
          >
            <span className="mb-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            </span>
            <span className="text-[0.5rem]">SHOP</span>
          </button>

          <button 
            onClick={() => setCurrentTab('ADMIN')}
            className={`flex flex-col items-center p-2 rounded w-16 transition-all ${currentTab === 'ADMIN' ? 'bg-indigo-600 text-white -translate-y-2 border-b-4 border-indigo-900' : 'text-slate-400 hover:text-white'}`}
          >
            <span className="mb-1"><IconSettings className="w-5 h-5" /></span>
            <span className="text-[0.5rem]">ADMIN</span>
          </button>
        </div>
      </nav>

    </div>
  );
};

const App = () => {
  return (
    <GameProvider>
      <GameLayout />
    </GameProvider>
  );
};

export default App;
