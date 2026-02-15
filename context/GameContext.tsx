import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { CardDefinition, CardInstance, GameConfig, GameStats, PackDefinition, Rarity, AudioTrack, SFXType, CosmeticItem, CardVariant } from '../types';
import { SFX } from '../utils/audio';
import { saveToDB, loadFromDB, clearDB } from '../utils/db';

// --- Default Data ---
const INITIAL_CARDS: CardDefinition[] = [
  // Fantasy Theme
  { id: 'c1', name: 'Slime', theme: 'Fantasy', imageId: 10 },
  { id: 'c2', name: 'Goblin', theme: 'Fantasy', imageId: 11 },
  { id: 'c3', name: 'Knight', theme: 'Fantasy', imageId: 12 },
  { id: 'c4', name: 'Dragon', theme: 'Fantasy', imageId: 13 },
  { id: 'c_wiz', name: 'Wizard', theme: 'Fantasy', imageId: 14 },
  { id: 'c_mimic', name: 'Mimic Chest', theme: 'Fantasy', imageId: 15 },
  { id: 'c_skel', name: 'Skeleton King', theme: 'Fantasy', imageId: 16 },
  { id: 'c_phx', name: 'Phoenix', theme: 'Fantasy', imageId: 17 },
  { id: 'c_uni', name: 'Unicorn', theme: 'Fantasy', imageId: 101 },
  { id: 'c_grif', name: 'Griffin', theme: 'Fantasy', imageId: 102 },
  { id: 'c_hydra', name: 'Hydra', theme: 'Fantasy', imageId: 103 },

  // Sci-Fi Theme
  { id: 'c5', name: 'Robot', theme: 'Sci-Fi', imageId: 20 },
  { id: 'c6', name: 'Laser Gun', theme: 'Sci-Fi', imageId: 21 },
  { id: 'c7', name: 'Alien', theme: 'Sci-Fi', imageId: 22 },
  { id: 'c8', name: 'Spaceship', theme: 'Sci-Fi', imageId: 23 },
  { id: 'c_mech', name: 'Mecha Suit', theme: 'Sci-Fi', imageId: 24 },
  { id: 'c_cyborg', name: 'Cyborg', theme: 'Sci-Fi', imageId: 25 },
  { id: 'c_plasma', name: 'Plasma Blade', theme: 'Sci-Fi', imageId: 26 },
  { id: 'c_station', name: 'Space Station', theme: 'Sci-Fi', imageId: 120 },
  { id: 'c_droid', name: 'Battle Droid', theme: 'Sci-Fi', imageId: 121 },

  // Horror Theme
  { id: 'c9', name: 'Zombie', theme: 'Horror', imageId: 30 },
  { id: 'c10', name: 'Vampire', theme: 'Horror', imageId: 31 },
  { id: 'c_ghost', name: 'Poltergeist', theme: 'Horror', imageId: 32 },
  { id: 'c_reaper', name: 'Grim Reaper', theme: 'Horror', imageId: 33 },
  { id: 'c_wolfman', name: 'Werewolf', theme: 'Horror', imageId: 130 },
  { id: 'c_mummy', name: 'Ancient Mummy', theme: 'Horror', imageId: 131 },
  { id: 'c_witch', name: 'Swamp Witch', theme: 'Horror', imageId: 132 },

  // Cyberpunk Theme
  { id: 'c_neon', name: 'Neon Bike', theme: 'Cyberpunk', imageId: 40 },
  { id: 'c_hack', name: 'Hacker', theme: 'Cyberpunk', imageId: 41 },
  { id: 'c_kat', name: 'Nano Katana', theme: 'Cyberpunk', imageId: 42 },
  { id: 'c_chip', name: 'Data Chip', theme: 'Cyberpunk', imageId: 43 },
  { id: 'c_goggles', name: 'VR Goggles', theme: 'Cyberpunk', imageId: 44 },
  { id: 'c_drone', name: 'Spy Drone', theme: 'Cyberpunk', imageId: 140 },
  { id: 'c_synth', name: 'Synth Pop Star', theme: 'Cyberpunk', imageId: 141 },

  // Nature Theme
  { id: 'c_tree', name: 'Ancient Oak', theme: 'Nature', imageId: 50 },
  { id: 'c_wolf', name: 'Spirit Wolf', theme: 'Nature', imageId: 51 },
  { id: 'c_shroom', name: 'Mushroom', theme: 'Nature', imageId: 52 },
  { id: 'c_crys', name: 'Mana Crystal', theme: 'Nature', imageId: 53 },
  { id: 'c_flower', name: 'Lotus', theme: 'Nature', imageId: 54 },
  { id: 'c_ent', name: 'Treant', theme: 'Nature', imageId: 150 },
  { id: 'c_fairy', name: 'Pixie', theme: 'Nature', imageId: 151 },

  // Food Theme
  { id: 'c_burg', name: 'Pixel Burger', theme: 'Food', imageId: 60 },
  { id: 'c_pot', name: 'Health Potion', theme: 'Food', imageId: 61 },
  { id: 'c_ramen', name: 'Ramen Bowl', theme: 'Food', imageId: 62 },
  { id: 'c_sushi', name: 'Sushi Roll', theme: 'Food', imageId: 63 },
  { id: 'c_coffee', name: 'Hot Coffee', theme: 'Food', imageId: 64 },
  { id: 'c_pizza', name: 'Slice of Pizza', theme: 'Food', imageId: 65 },
  { id: 'c_cake', name: 'Birthday Cake', theme: 'Food', imageId: 160 },
  { id: 'c_donut', name: 'Glazed Donut', theme: 'Food', imageId: 161 },

  // Retro Tech Theme
  { id: 'c_flop', name: 'Floppy Disk', theme: 'Retro', imageId: 80 },
  { id: 'c_joy', name: 'Joystick', theme: 'Retro', imageId: 81 },
  { id: 'c_crt', name: 'CRT Monitor', theme: 'Retro', imageId: 82 },
  { id: 'c_cart', name: 'Game Cartridge', theme: 'Retro', imageId: 83 },
  { id: 'c_boy', name: 'Handheld', theme: 'Retro', imageId: 84 },
  { id: 'c_vhs', name: 'VHS Tape', theme: 'Retro', imageId: 180 },
  { id: 'c_walk', name: 'Cassette Player', theme: 'Retro', imageId: 181 },

  // Cosmic Theme
  { id: 'c_bh', name: 'Black Hole', theme: 'Cosmic', imageId: 70 },
  { id: 'c_neb', name: 'Nebula', theme: 'Cosmic', imageId: 71 },
  { id: 'c_star', name: 'Supernova', theme: 'Cosmic', imageId: 72 },
  { id: 'c_comet', name: 'Comet', theme: 'Cosmic', imageId: 73 },
  { id: 'c_planet', name: 'Ringed Planet', theme: 'Cosmic', imageId: 170 },
  { id: 'c_quas', name: 'Quasar', theme: 'Cosmic', imageId: 171 },
  { id: 'c_void', name: 'Void Walker', theme: 'Cosmic', imageId: 172 },

  // Elemental Theme (New)
  { id: 'c_fire', name: 'Fire Elemental', theme: 'Elemental', imageId: 90 },
  { id: 'c_ice', name: 'Ice Golem', theme: 'Elemental', imageId: 91 },
  { id: 'c_thun', name: 'Thunder Bird', theme: 'Elemental', imageId: 92 },
  { id: 'c_earth', name: 'Rock Golem', theme: 'Elemental', imageId: 93 },
];

const INITIAL_PACKS: PackDefinition[] = [
  {
    id: 'p1',
    name: 'Starter Pack',
    theme: 'Basic',
    price: 10,
    cardCount: 3,
    description: 'Cheap and cheerful.',
    rarityWeights: {
      [Rarity.COMMON]: 80,
      [Rarity.UNCOMMON]: 15,
      [Rarity.RARE]: 4,
      [Rarity.EPIC]: 1,
      [Rarity.LEGENDARY]: 0
    }
  },
  {
    id: 'p2',
    name: 'Silver Pack',
    theme: 'Silver',
    price: 50,
    cardCount: 5,
    description: 'Better chances.',
    rarityWeights: {
      [Rarity.COMMON]: 50,
      [Rarity.UNCOMMON]: 30,
      [Rarity.RARE]: 15,
      [Rarity.EPIC]: 4,
      [Rarity.LEGENDARY]: 1
    }
  },
  {
    id: 'p3',
    name: 'Gold Pack',
    theme: 'Gold',
    price: 250,
    cardCount: 5,
    description: 'High stakes!',
    rarityWeights: {
      [Rarity.COMMON]: 20,
      [Rarity.UNCOMMON]: 30,
      [Rarity.RARE]: 30,
      [Rarity.EPIC]: 15,
      [Rarity.LEGENDARY]: 5
    }
  },
  {
    id: 'p_cosmic',
    name: 'Diamond Pack',
    theme: 'Diamond',
    price: 2500,
    cardCount: 10,
    description: 'The ultimate luxury. High variant chance!',
    rarityWeights: {
      [Rarity.COMMON]: 0,
      [Rarity.UNCOMMON]: 10,
      [Rarity.RARE]: 30,
      [Rarity.EPIC]: 40,
      [Rarity.LEGENDARY]: 20
    }
  }
];

const INITIAL_COSMETICS: CosmeticItem[] = [
  // Card Backs
  { id: 'cb_default', name: 'Classic Blue', type: 'CARD_BACK', price: 0, purchased: true, data: '' },
  { id: 'cb_red', name: 'Ruby Red', type: 'CARD_BACK', price: 500, purchased: false, data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' }, // Placeholder
  { id: 'cb_gold', name: 'Midas Touch', type: 'CARD_BACK', price: 2000, purchased: false, data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' },
  
  // Borders
  { id: 'bs_default', name: 'Standard Borders', type: 'BORDER_STYLE', price: 0, purchased: true, data: '' },
  { id: 'bs_double', name: 'Double Frame', type: 'BORDER_STYLE', price: 1000, purchased: false, data: 'border-double border-8' },
  { id: 'bs_neon', name: 'Neon Glow', type: 'BORDER_STYLE', price: 2500, purchased: false, data: 'shadow-[0_0_10px_rgba(255,255,255,0.7)] border-dashed' },
  { id: 'bs_rounded', name: 'Super Round', type: 'BORDER_STYLE', price: 500, purchased: false, data: 'rounded-3xl' },
];

const RARITY_VALUES: Record<Rarity, number> = {
  [Rarity.COMMON]: 1,
  [Rarity.UNCOMMON]: 5,
  [Rarity.RARE]: 15,
  [Rarity.EPIC]: 50,
  [Rarity.LEGENDARY]: 200
};

const VARIANT_MULTIPLIERS: Record<CardVariant, number> = {
    'STANDARD': 1,
    'FOIL': 5,
    'HOLOGRAPHIC': 6,
    'HAUNTED': 8,
    'FROZEN': 8,
    'MAGMA': 8,
    'COSMIC': 10,
    'GLITCH': 15,
    'RADIANT': 20
};

interface GameContextType {
  gold: number;
  inventory: CardInstance[];
  battleDeck: string[]; // List of instanceIds
  stats: GameStats;
  config: GameConfig;
  coinAnimTrigger: number;
  isLoaded: boolean;
  buyPack: (packId: string) => CardInstance[] | null;
  sellCard: (instanceId: string) => void;
  sellMultipleCards: (instanceIds: string[]) => void;
  sellAllDuplicates: () => void;
  sellAllInventory: () => void;
  toggleLock: (instanceId: string) => void;
  updateConfig: (newConfig: GameConfig) => void;
  updateCardImage: (cardId: string, imageUri: string) => void;
  updateCustomSFX: (type: SFXType, base64: string) => void;
  updateCardBack: (base64: string) => void;
  updateGameLogo: (base64: string) => void;
  buyCosmetic: (itemId: string) => void;
  equipCosmetic: (itemId: string) => void;
  addAudioTrack: (track: AudioTrack) => void;
  removeAudioTrack: (trackId: string) => void;
  resetGame: () => void;
  factoryReset: () => void;
  toggleBattleDeck: (instanceId: string) => void;
  recordBattleResult: (won: boolean, goldEarned: number, cardWon?: CardInstance) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [gold, setGold] = useState<number>(100);
  const [inventory, setInventory] = useState<CardInstance[]>([]);
  const [battleDeck, setBattleDeck] = useState<string[]>([]);
  const [coinAnimTrigger, setCoinAnimTrigger] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [stats, setStats] = useState<GameStats>({
    packsOpened: 0,
    cardsObtained: 0,
    totalGoldEarned: 0,
    highestRarityFound: null,
    battlesWon: 0,
    battlesLost: 0
  });
  
  const [config, setConfig] = useState<GameConfig>({
    cards: INITIAL_CARDS,
    packs: INITIAL_PACKS,
    audioTracks: [],
    customSFX: {},
    activeCardBackUri: undefined,
    activeBorderStyle: undefined,
    gameLogoUri: undefined,
    cosmetics: INITIAL_COSMETICS
  });

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load Data (Migration Logic)
  useEffect(() => {
    const loadData = async () => {
        try {
            const loadedConfig = await loadFromDB('config', 'main');
            const loadedProgress = await loadFromDB('progress', 'main');

            if (loadedConfig) {
                 setConfig(prev => ({ 
                    ...prev, 
                    ...loadedConfig,
                    cards: mergeNewCards(loadedConfig.cards || [], INITIAL_CARDS),
                    packs: loadedConfig.packs || INITIAL_PACKS,
                    audioTracks: loadedConfig.audioTracks || [],
                    customSFX: loadedConfig.customSFX || {},
                    cosmetics: loadedConfig.cosmetics || INITIAL_COSMETICS
                }));
            }

            if (loadedProgress) {
                setGold(typeof loadedProgress.gold === 'number' ? loadedProgress.gold : 100);
                setInventory(Array.isArray(loadedProgress.inventory) ? loadedProgress.inventory : []);
                setStats(prev => ({
                    ...prev,
                    ...(loadedProgress.stats || {}),
                    battlesWon: loadedProgress.stats?.battlesWon || 0,
                    battlesLost: loadedProgress.stats?.battlesLost || 0
                }));
                setBattleDeck(Array.isArray(loadedProgress.battleDeck) ? loadedProgress.battleDeck : []);
            }
        } catch (e) {
          console.error("Failed to load save data from DB", e);
        } finally {
            setIsLoaded(true);
        }
    };
    
    loadData();
  }, []);

  const mergeNewCards = (savedCards: CardDefinition[], newDefaults: CardDefinition[]) => {
      const existingIds = new Set(savedCards.map(c => c.id));
      const cardsToAdd = newDefaults.filter(c => !existingIds.has(c.id));
      return [...savedCards, ...cardsToAdd];
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
        saveToDB('config', 'main', config).catch(e => console.error("Failed to save config to DB", e));
    }, 1000);
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [config, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(() => {
        saveToDB('progress', 'main', {
            gold,
            inventory,
            stats,
            battleDeck
        }).catch(e => console.error("Failed to save progress to DB", e));
    }, 500);
    return () => clearTimeout(timer);
  }, [gold, inventory, stats, battleDeck, isLoaded]);

  const generateCard = (pack: PackDefinition): CardInstance => {
    let totalWeight = 0;
    Object.values(pack.rarityWeights).forEach(w => totalWeight += w);
    let randomWeight = Math.random() * totalWeight;
    let selectedRarity = Rarity.COMMON;
    
    for (const [r, w] of Object.entries(pack.rarityWeights)) {
      if (randomWeight < w) {
        selectedRarity = r as Rarity;
        break;
      }
      randomWeight -= w;
    }

    // Boost Variant chances for Diamond Pack
    const baseVariantChance = pack.theme === 'Diamond' ? 0.6 : 0.10;
    const isSpecialVariant = Math.random() < baseVariantChance;
    
    let variant: CardVariant = 'STANDARD';
    const randomCardDef = config.cards[Math.floor(Math.random() * config.cards.length)];

    if (isSpecialVariant) {
        if (randomCardDef.theme === 'Cosmic' && Math.random() < 0.6) variant = 'COSMIC';
        else if (randomCardDef.theme === 'Horror' && Math.random() < 0.6) variant = 'HAUNTED';
        else if (randomCardDef.theme === 'Elemental' && Math.random() < 0.4) {
             const r = Math.random();
             if (r < 0.33) variant = 'MAGMA';
             else if (r < 0.66) variant = 'FROZEN';
             else variant = 'RADIANT';
        } else {
            const rand = Math.random();
            if (rand < 0.5) variant = 'FOIL';
            else if (rand < 0.7) variant = 'HOLOGRAPHIC';
            else if (rand < 0.8) variant = 'MAGMA';
            else if (rand < 0.9) variant = 'FROZEN';
            else variant = 'GLITCH';
        }
    }
    
    // Very rare chance for Radiant everywhere, but higher in Diamond
    const radiantChance = pack.theme === 'Diamond' ? 0.01 : 0.001;
    if (Math.random() < radiantChance) variant = 'RADIANT';

    let value = 5 * RARITY_VALUES[selectedRarity];
    value = Math.floor(value * VARIANT_MULTIPLIERS[variant]);

    return {
      instanceId: Math.random().toString(36).substr(2, 9),
      definitionId: randomCardDef.id,
      name: randomCardDef.name,
      theme: randomCardDef.theme,
      imageId: randomCardDef.imageId,
      imageUri: randomCardDef.imageUri,
      rarity: selectedRarity,
      isFoil: variant !== 'STANDARD', 
      variant: variant,
      isLocked: false,
      value,
      obtainedAt: Date.now()
    };
  };

  const buyPack = (packId: string): CardInstance[] | null => {
    const pack = config.packs.find(p => p.id === packId);
    if (!pack) return null;
    if (gold < pack.price) return null;
    setGold(prev => prev - pack.price);
    const newCards: CardInstance[] = [];
    for (let i = 0; i < pack.cardCount; i++) {
      newCards.push(generateCard(pack));
    }
    setInventory(prev => [...prev, ...newCards]);
    setStats(prev => ({
      ...prev,
      packsOpened: prev.packsOpened + 1,
      cardsObtained: prev.cardsObtained + newCards.length,
      highestRarityFound: newCards.reduce((acc, card) => {
        if (RARITY_VALUES[card.rarity] > (prev.highestRarityFound ? RARITY_VALUES[prev.highestRarityFound] : 0)) {
          return card.rarity;
        }
        return acc;
      }, prev.highestRarityFound)
    }));
    return newCards;
  };

  const triggerSellEffect = () => {
      setCoinAnimTrigger(prev => prev + 1);
      SFX.sell(config.customSFX?.sell);
  }

  const sellCard = (instanceId: string) => {
    const card = inventory.find(c => c.instanceId === instanceId);
    if (!card) return;
    if (card.isLocked) return; 

    // Remove from battle deck if sold
    if (battleDeck.includes(instanceId)) {
        setBattleDeck(prev => prev.filter(id => id !== instanceId));
    }

    setGold(prev => prev + card.value);
    setStats(prev => ({ ...prev, totalGoldEarned: prev.totalGoldEarned + card.value }));
    setInventory(prev => prev.filter(c => c.instanceId !== instanceId));
    
    triggerSellEffect();
  };

  const sellMultipleCards = (instanceIds: string[]) => {
    const toSell = inventory.filter(c => instanceIds.includes(c.instanceId) && !c.isLocked);
    if (toSell.length === 0) return;

    // Filter out from battle deck
    setBattleDeck(prev => prev.filter(id => !instanceIds.includes(id)));

    const totalValue = toSell.reduce((sum, c) => sum + c.value, 0);
    setGold(prev => prev + totalValue);
    setStats(prev => ({ ...prev, totalGoldEarned: prev.totalGoldEarned + totalValue }));
    setInventory(prev => prev.filter(c => !instanceIds.includes(c.instanceId)));
    triggerSellEffect();
  };

  const toggleLock = (instanceId: string) => {
      setInventory(prev => prev.map(card => 
          card.instanceId === instanceId ? { ...card, isLocked: !card.isLocked } : card
      ));
  }

  const sellAllDuplicates = () => {
    const seen = new Set<string>();
    const toKeep: CardInstance[] = [];
    const toSellIds: string[] = [];

    const sortedInv = [...inventory].sort((a, b) => b.value - a.value);

    for (const card of sortedInv) {
      const key = `${card.definitionId}-${card.rarity}-${card.variant}`;
      if (card.isLocked) {
          toKeep.push(card);
          seen.add(key); 
          continue;
      }
      if (seen.has(key)) {
        toSellIds.push(card.instanceId);
      } else {
        seen.add(key);
        toKeep.push(card);
      }
    }
    sellMultipleCards(toSellIds);
  };

  const sellAllInventory = () => {
    const unlockedIds = inventory.filter(c => !c.isLocked).map(c => c.instanceId);
    sellMultipleCards(unlockedIds);
  };

  // --- Battle Logic ---

  const toggleBattleDeck = (instanceId: string) => {
      setBattleDeck(prev => {
          if (prev.includes(instanceId)) {
              return prev.filter(id => id !== instanceId);
          } else {
              if (prev.length >= 10) return prev; // Max 10
              return [...prev, instanceId];
          }
      });
  };

  const recordBattleResult = (won: boolean, goldEarned: number, cardWon?: CardInstance) => {
      setGold(prev => prev + goldEarned);
      if (cardWon) {
          setInventory(prev => [...prev, cardWon]);
          setStats(prev => ({
              ...prev,
              cardsObtained: prev.cardsObtained + 1
          }));
      }
      setStats(prev => ({
          ...prev,
          battlesWon: won ? prev.battlesWon + 1 : prev.battlesWon,
          battlesLost: won ? prev.battlesLost : prev.battlesLost + 1,
          totalGoldEarned: goldEarned > 0 ? prev.totalGoldEarned + goldEarned : prev.totalGoldEarned
      }));
      
      if (goldEarned > 0) {
          triggerSellEffect();
      }
  };

  const updateConfig = (newConfig: GameConfig) => setConfig(newConfig);
  const updateCardImage = (cardId: string, imageUri: string) => {
    const updatedCards = config.cards.map(c => c.id === cardId ? { ...c, imageUri } : c);
    setConfig({ ...config, cards: updatedCards });
    setInventory(prev => prev.map(c => c.definitionId === cardId ? { ...c, imageUri } : c));
  };
  const updateCustomSFX = (type: SFXType, base64: string) => setConfig(prev => ({...prev, customSFX: {...prev.customSFX, [type]: base64}}));
  const updateCardBack = (base64: string) => setConfig(prev => ({...prev, activeCardBackUri: base64}));
  const updateGameLogo = (base64: string) => setConfig(prev => ({...prev, gameLogoUri: base64}));
  const buyCosmetic = (itemId: string) => {
      const item = config.cosmetics.find(c => c.id === itemId);
      if (!item || item.purchased || gold < item.price) return;
      setGold(prev => prev - item.price);
      setConfig(prev => ({...prev, cosmetics: prev.cosmetics.map(c => c.id === itemId ? { ...c, purchased: true } : c)}));
      triggerSellEffect(); 
  };
  const equipCosmetic = (itemId: string) => {
      const item = config.cosmetics.find(c => c.id === itemId);
      if (!item || !item.purchased) return;
      if (item.type === 'CARD_BACK') setConfig(prev => ({...prev, activeCardBackUri: item.data || undefined}));
      else if (item.type === 'BORDER_STYLE') setConfig(prev => ({...prev, activeBorderStyle: item.data || undefined}));
  };
  const addAudioTrack = (track: AudioTrack) => setConfig(prev => ({ ...prev, audioTracks: [...prev.audioTracks, track] }));
  const removeAudioTrack = (trackId: string) => setConfig(prev => ({ ...prev, audioTracks: prev.audioTracks.filter(t => t.id !== trackId) }));
  const resetGame = () => {
    setGold(100);
    setInventory([]);
    setBattleDeck([]);
    setStats({ packsOpened: 0, cardsObtained: 0, totalGoldEarned: 0, highestRarityFound: null, battlesWon: 0, battlesLost: 0 });
    setTimeout(() => { saveToDB('progress', 'main', { gold: 100, inventory: [], battleDeck: [], stats: { packsOpened: 0, cardsObtained: 0, totalGoldEarned: 0, highestRarityFound: null, battlesWon: 0, battlesLost: 0 } }); }, 100);
  };
  const factoryReset = async () => { await clearDB(); localStorage.clear(); window.location.reload(); }

  return (
    <GameContext.Provider value={{
      gold, inventory, stats, config, coinAnimTrigger, isLoaded, battleDeck,
      buyPack, sellCard, sellMultipleCards, sellAllDuplicates, sellAllInventory, toggleLock,
      updateConfig, updateCardImage, updateCustomSFX, updateCardBack, updateGameLogo,
      buyCosmetic, equipCosmetic, addAudioTrack, removeAudioTrack, resetGame, factoryReset,
      toggleBattleDeck, recordBattleResult
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) throw new Error('useGame must be used within a GameProvider');
  return context;
};