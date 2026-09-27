// Bleach 2D Web Game: Core Types & Interfaces

export type Faction = 'shinigami' | 'arrancar' | 'quincy' | 'transcendent';

export type GameState = 
  | 'TITLE'
  | 'ROSTER_SELECT'
  | 'STAGE_SELECT'
  | 'FIGHTING'
  | 'PAUSED'
  | 'ROUND_OVER'
  | 'MATCH_OVER';

export type GameMode = 'ARCADE' | 'VS_CPU' | 'VS_2P' | 'TRAINING';

export type FighterState = 
  | 'IDLE'
  | 'WALK'
  | 'DASH_FORWARD'
  | 'DASH_BACK'
  | 'JUMP'
  | 'FALL'
  | 'CROUCH'
  | 'BLOCK'
  | 'LIGHT_ATTACK'
  | 'MEDIUM_ATTACK'
  | 'HEAVY_ATTACK'
  | 'SPECIAL_1'
  | 'SPECIAL_2'
  | 'CHARGE_REIATSU'
  | 'AWAKEN'
  | 'ULTIMATE'
  | 'HURT'
  | 'KNOCKDOWN'
  | 'WAKEUP'
  | 'VICTORY'
  | 'DEFEATED';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Hitbox extends Rect {
  damage: number;
  hitstun: number; // frames
  blockstun: number; // frames
  knockbackX: number;
  knockbackY: number;
  isHeavy?: boolean;
  unblockable?: boolean;
  hitsound?: 'light' | 'heavy' | 'cero' | 'blade' | 'special';
}

export interface AttackFrameData {
  startup: number;    // frames before hitbox becomes active
  active: number;     // frames hitbox remains active
  recovery: number;   // frames of recovery
  hitbox: Rect;
  damage: number;
  knockbackX: number;
  knockbackY: number;
  reiatsuCost?: number;
  unblockable?: boolean;
}

export interface CharacterStats {
  maxHp: number;
  walkSpeed: number;
  dashSpeed: number;
  jumpForce: number;
  attackPower: number;
  defense: number;
  reiatsuGainRate: number;
}

export interface MoveInfo {
  name: string;
  command: string;
  description: string;
  cost: number;
}

export interface CharacterDefinition {
  id: string;
  name: string;
  title: string;
  japaneseName: string;
  faction: Faction;
  themeColor: string;
  secondaryColor: string;
  reiatsuColor: string;
  stats: CharacterStats;
  
  // Awakened form details
  awakeningName: string; // e.g. "Bankai: Tensa Zangetsu" or "Resurrección: Murciélago"
  awakeningDuration: number; // in frames (e.g. 900 = 15s)
  awakeningDescription: string;
  
  // Ultimate art
  ultimateName: string; // e.g. "Mugetsu"
  ultimateCost: number; // normally 300 (3 stocks)
  
  // Move list for UI
  moves: MoveInfo[];
  
  // Visual aesthetics
  avatarUrl?: string;
  quotes: {
    select: string;
    roundStart: string;
    awaken: string;
    ultimate: string;
    victory: string;
  };
}

export interface Projectile {
  id: string;
  ownerId: number; // 1 or 2
  type: 'getsuga' | 'cero' | 'arrow' | 'kurohitsugi' | 'lanza' | 'auswahlen' | 'blade_wave';
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  damage: number;
  color: string;
  secondaryColor: string;
  duration: number; // remaining frames
  piercing: boolean;
  unblockable?: boolean;
  hitRadius?: number;
  scale?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  maxLife: number;
  life: number;
  color: string;
  alpha: number;
  shape: 'circle' | 'spark' | 'flame' | 'petal' | 'feather' | 'ray';
  rotation?: number;
  rotationSpeed?: number;
}

export interface StageDefinition {
  id: string;
  name: string;
  japaneseName: string;
  location: string;
  groundY: number;
  width: number;
  height: number;
  bgGradTop: string;
  bgGradBottom: string;
  themeMusic: string;
  visualTheme: 'sokyoku' | 'las_noches' | 'silbern' | 'karakura';
}
