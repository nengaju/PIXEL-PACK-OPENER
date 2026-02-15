export enum Rarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY'
}

export type CardVariant = 'STANDARD' | 'FOIL' | 'HOLOGRAPHIC' | 'COSMIC' | 'HAUNTED' | 'MAGMA' | 'FROZEN' | 'GLITCH' | 'RADIANT';

export interface CardDefinition {
  id: string;
  name: string;
  theme: string; // e.g., "Fantasy", "Sci-Fi"
  imageId: number; // for picsum fallback
  imageUri?: string; // Base64 string for custom uploads
}

export interface CardInstance {
  instanceId: string;
  definitionId: string;
  name: string;
  rarity: Rarity;
  isFoil: boolean; // Kept for backward compatibility logic
  variant: CardVariant; // New visual style system
  isLocked?: boolean; 
  value: number;
  theme: string;
  imageId: number;
  imageUri?: string;
  obtainedAt: number;
}

export interface AudioTrack {
  id: string;
  name: string;
  dataUri: string; // Base64 audio
}

export interface PackDefinition {
  id: string;
  name: string;
  theme: string;
  price: number;
  cardCount: number;
  rarityWeights: Record<Rarity, number>; // Higher number = more likely
  description: string;
}

export interface GameStats {
  packsOpened: number;
  cardsObtained: number;
  totalGoldEarned: number;
  highestRarityFound: Rarity | null;
  battlesWon: number;
  battlesLost: number;
}

// Cosmetic Types
export type CosmeticType = 'CARD_BACK' | 'BORDER_STYLE';

export interface CosmeticItem {
  id: string;
  name: string;
  type: CosmeticType;
  price: number;
  data: string; // Image URI for card back, or CSS class/style ID for border
  purchased: boolean;
}

// Keys for customizable sounds
export type SFXType = 'openPack' | 'revealCommon' | 'revealRare' | 'revealEpic' | 'revealLegendary' | 'revealFoil' | 'sell';

export interface GameConfig {
  cards: CardDefinition[];
  packs: PackDefinition[];
  audioTracks: AudioTrack[];
  customSFX?: Partial<Record<SFXType, string>>;
  
  // Cosmetics & Global
  gameLogoUri?: string;
  activeCardBackUri?: string;
  activeBorderStyle?: string; // CSS Class string for borders
  cosmetics: CosmeticItem[];
}
