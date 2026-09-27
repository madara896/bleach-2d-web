// Bleach 2D Web Game: Comprehensive Character Roster
import type { CharacterDefinition } from '../../types';
export type { CharacterDefinition };

export const ICHIGO_DEFINITION: CharacterDefinition = {
  id: 'ichigo',
  name: 'Ichigo Kurosaki',
  title: 'Substitute Soul Reaper',
  japaneseName: '黒崎 一護',
  faction: 'shinigami',
  themeColor: '#ff6600',
  secondaryColor: '#00ccff',
  reiatsuColor: '#00d4ff',
  stats: {
    maxHp: 1000,
    walkSpeed: 4.8,
    dashSpeed: 14.5,
    jumpForce: 13.5,
    attackPower: 1.0,
    defense: 1.0,
    reiatsuGainRate: 1.15
  },
  awakeningName: 'Bankai: Tensa Zangetsu',
  awakeningDuration: 900, // 15 seconds
  awakeningDescription: 'Compresses spiritual pressure into a pitch-black blade, granting godlike speed and Kuroi Getsuga.',
  ultimateName: 'Mugetsu (Final Getsuga Tensho)',
  ultimateCost: 300,
  moves: [
    { name: 'Slash Combo', command: 'J -> J -> K', description: 'Quick Zanpakuto slashes into heavy downward cleave', cost: 0 },
    { name: 'Getsuga Tensho', command: 'U (Special)', description: 'Fires a crescent blade of concentrated spiritual pressure', cost: 35 },
    { name: 'Shunpo Dash', command: 'L (Shunpo)', description: 'High-speed flash step phasing behind the opponent', cost: 20 },
    { name: 'Bankai Release', command: 'O (At 200+ Reiatsu)', description: 'Awakens Tensa Zangetsu with heightened speed and power', cost: 200 },
    { name: 'Mugetsu', command: 'S + O (At 300 Reiatsu)', description: 'Becomes Getsuga itself, cleaving heaven and earth in two', cost: 300 }
  ],
  quotes: {
    select: 'If fate is a millstone, then we are the grist.',
    roundStart: 'I will protect everyone!',
    awaken: 'BANKAI... TENSA ZANGETSU!',
    ultimate: 'Saigo no Getsuga Tensho... MUGETSU!',
    victory: 'It is over. You cannot overcome my resolve.'
  }
};

export const ULQUIORRA_DEFINITION: CharacterDefinition = {
  id: 'ulquiorra',
  name: 'Ulquiorra Cifer',
  title: '4th Espada - The Emptiness',
  japaneseName: 'ウルキオラ・シファー',
  faction: 'arrancar',
  themeColor: '#00ff88',
  secondaryColor: '#003311',
  reiatsuColor: '#00ff66',
  stats: {
    maxHp: 950,
    walkSpeed: 4.5,
    dashSpeed: 15.5,
    jumpForce: 14.0,
    attackPower: 1.1,
    defense: 0.95,
    reiatsuGainRate: 1.1
  },
  awakeningName: 'Resurrección: Murciélago',
  awakeningDuration: 900,
  awakeningDescription: 'Unleashes great bat wings, raining endless Cero Oscuras and despair upon Hueco Mundo.',
  ultimateName: 'Lanza del Relámpago',
  ultimateCost: 300,
  moves: [
    { name: 'Emerald Claw Strike', command: 'J -> J -> K', description: 'Piercing hand slashes infused with hardened Hierro', cost: 0 },
    { name: 'Cero / Cero Oscuras', command: 'U (Special)', description: 'Concentrated beam of emerald or pitch-black destruction', cost: 40 },
    { name: 'Sonído Rush', command: 'L (Shunpo)', description: 'Instant sound-barrier dash that leaves a vacuum distortion', cost: 20 },
    { name: 'Enclose, Murciélago', command: 'O (At 200+ Reiatsu)', description: 'Awakens release state with massive wings and increased agility', cost: 200 },
    { name: 'Lanza del Relámpago', command: 'S + O (At 300 Reiatsu)', description: 'Hurls an immense javelin of concentrated lightning despair', cost: 300 }
  ],
  quotes: {
    select: 'Those who do not fear the sword they wield are not worthy to wield one.',
    roundStart: 'What you feel is not hope. It is the beginning of despair.',
    awaken: 'Tozasé... Murciélago!',
    ultimate: 'Witness true despair... LANZA DEL RELÁMPAGO!',
    victory: 'Your heart... was merely an illusion after all.'
  }
};

export const AIZEN_DEFINITION: CharacterDefinition = {
  id: 'aizen',
  name: 'Sosuke Aizen',
  title: 'Lord of Las Noches / God of Rebirth',
  japaneseName: '藍染 惣右介',
  faction: 'transcendent',
  themeColor: '#9933ff',
  secondaryColor: '#2b0054',
  reiatsuColor: '#bf55ec',
  stats: {
    maxHp: 1050,
    walkSpeed: 4.2,
    dashSpeed: 13.8,
    jumpForce: 13.0,
    attackPower: 1.15,
    defense: 1.1,
    reiatsuGainRate: 1.25
  },
  awakeningName: 'Hogyoku Transcendence',
  awakeningDuration: 950,
  awakeningDescription: 'Fuses directly with the Hogyoku, manifesting divine butterfly wings and transcending boundaries.',
  ultimateName: 'Hado #90: Kurohitsugi',
  ultimateCost: 300,
  moves: [
    { name: 'Kyoka Suigetsu Feint', command: 'J -> J -> K', description: 'Graceful illusionary strikes baffling the opponent', cost: 0 },
    { name: 'Illusion Counter', command: 'U (Special)', description: 'Teleports behind the opponent upon incoming strike', cost: 40 },
    { name: 'Dimensional Shift', command: 'L (Shunpo)', description: 'Instantaneous spatial transition defying Shinigami limits', cost: 20 },
    { name: 'Hogyoku Awakening', command: 'O (At 200+ Reiatsu)', description: 'Transcends Soul Reaper limits with divine wings', cost: 200 },
    { name: 'Kurohitsugi', command: 'S + O (At 300 Reiatsu)', description: 'Encloses target in an inescapable black coffin of torrents', cost: 300 }
  ],
  quotes: {
    select: 'No one stands in the heavens from the beginning. Not you, not I, not even God.',
    roundStart: 'Since when were you under the impression that I was not using Kyoka Suigetsu?',
    awaken: 'I have surpassed all beings... I will stand atop heaven!',
    ultimate: 'Seeping crest of turbidity... Hado #90: KUROHITSUGI!',
    victory: 'Admiration is the furthest thing from understanding.'
  }
};

export const YHWACH_DEFINITION: CharacterDefinition = {
  id: 'yhwach',
  name: 'Yhwach',
  title: 'The Father of the Quincy / King of Wandenreich',
  japaneseName: 'ユーハバッハ',
  faction: 'quincy',
  themeColor: '#00e5ff',
  secondaryColor: '#0a192f',
  reiatsuColor: '#38ef7d',
  stats: {
    maxHp: 1100,
    walkSpeed: 4.0,
    dashSpeed: 13.0,
    jumpForce: 12.8,
    attackPower: 1.2,
    defense: 1.15,
    reiatsuGainRate: 1.2
  },
  awakeningName: 'The Almighty',
  awakeningDuration: 900,
  awakeningDescription: 'Opens multi-pupil eyes that can perceive and rewrite all possible futures.',
  ultimateName: 'Auswählen (Holy Selection)',
  ultimateCost: 300,
  moves: [
    { name: 'Spirit Reishi Blade', command: 'J -> J -> K', description: 'Massive crushing broadsword cleaves', cost: 0 },
    { name: 'Heilig Pfeil Barrage', command: 'U (Special)', description: 'Rapid salvo of high-density sacred arrows', cost: 35 },
    { name: 'Hirenkyaku Step', command: 'L (Shunpo)', description: 'Glides atop reishi platforms instantly across the arena', cost: 20 },
    { name: 'The Almighty', command: 'O (At 200+ Reiatsu)', description: 'Awakens future sight, bypassing opponent guard', cost: 200 },
    { name: 'Auswählen', command: 'S + O (At 300 Reiatsu)', description: 'Strikes down holy light that absorbs opponent energy and health', cost: 300 }
  ],
  quotes: {
    select: 'I see all futures. And in none of them do you survive.',
    roundStart: 'Welcome to my world. Let us end this thousand-year blood war.',
    awaken: 'My eyes are open... THIS IS THE ALMIGHTY!',
    ultimate: 'Return all to your father... AUSWÄHLEN!',
    victory: 'The future was already decided before this battle even began.'
  }
};

export const WHITE_ZANGETSU_DEFINITION: CharacterDefinition = {
  id: 'white_zangetsu',
  name: 'Hollow Ichigo',
  title: 'White Zangetsu - Pure Instinct',
  japaneseName: '白一護 / 虚',
  faction: 'transcendent',
  themeColor: '#ffffff',
  secondaryColor: '#ff0033',
  reiatsuColor: '#ff1744',
  stats: {
    maxHp: 980,
    walkSpeed: 5.2,
    dashSpeed: 16.0,
    jumpForce: 14.5,
    attackPower: 1.25,
    defense: 0.9,
    reiatsuGainRate: 1.3
  },
  awakeningName: 'Vasto Lorde Hollowfication',
  awakeningDuration: 850,
  awakeningDescription: 'Feral instinct takes complete dominion, unleashing savage shrieks and apocalyptic Cero.',
  ultimateName: 'Cataclysmic Hollow Cero',
  ultimateCost: 300,
  moves: [
    { name: 'Cloth Twirl Slash', command: 'J -> J -> K', description: 'Spins Zangetsu by its cloth wrap in wide lethal arcs', cost: 0 },
    { name: 'Red Cero / Getsuga', command: 'U (Special)', description: 'Unleashes crimson energy wave with maniacal laughter', cost: 40 },
    { name: 'Feral Dash', command: 'L (Shunpo)', description: 'Acrobatic leap and pounce behind enemy lines', cost: 15 },
    { name: 'Hollow Dominion', command: 'O (At 200+ Reiatsu)', description: 'Awakens horned skull mask with animalistic rage', cost: 200 },
    { name: 'Vasto Lorde Annihilation', command: 'S + O (At 300 Reiatsu)', description: 'Chambers a colossal red Cero between horns and obliterates the battlefield', cost: 300 }
  ],
  quotes: {
    select: 'What is the difference between a king and his horse?! INSTINCT!',
    roundStart: 'Hahaha! Let me show you how to truly swing a sword!',
    awaken: 'GRRRRAAAAH! THE HORSE DEVOURS THE KING!',
    ultimate: 'DROWN IN DESPAIR! CEROOOOO!',
    victory: 'Weak! If you cannot master instinct, you will be eaten alive!'
  }
};

// Additional roster combatants ready to select
export const BYAKUYA_DEFINITION: CharacterDefinition = {
  id: 'byakuya',
  name: 'Byakuya Kuchiki',
  title: '6th Division Captain',
  japaneseName: '朽木 白哉',
  faction: 'shinigami',
  themeColor: '#ff99cc',
  secondaryColor: '#4a154b',
  reiatsuColor: '#ff66b2',
  stats: {
    maxHp: 960,
    walkSpeed: 4.6,
    dashSpeed: 15.0,
    jumpForce: 13.2,
    attackPower: 1.05,
    defense: 1.0,
    reiatsuGainRate: 1.2
  },
  awakeningName: 'Bankai: Senbonzakura Kageyoshi',
  awakeningDuration: 900,
  awakeningDescription: 'Drops his blade into the ground, summoning millions of razor-sharp cherry blossom petal blades.',
  ultimateName: 'Shukei: Hakuteiken (White Emperor Sword)',
  ultimateCost: 300,
  moves: [
    { name: 'Senka Rush', command: 'J -> J -> K', description: 'Flawless noble thrust targeting soul sleep and soul chain', cost: 0 },
    { name: 'Petal Scatter', command: 'U (Special)', description: 'Directs swarms of razor petals to shred the enemy', cost: 35 },
    { name: 'Utsusemi Step', command: 'L (Shunpo)', description: 'Leaves his captain haori behind while flashing away', cost: 20 },
    { name: 'Scatter, Senbonzakura', command: 'O (At 200+ Reiatsu)', description: 'Awakens Kageyoshi, flooding the arena with blades', cost: 200 },
    { name: 'Hakuteiken', command: 'S + O (At 300 Reiatsu)', description: 'Manifests pure white angel wings of reiatsu and pierces the foe', cost: 300 }
  ],
  quotes: {
    select: 'The blade that falls without hesitation is justice.',
    roundStart: 'Scatter, Senbonzakura.',
    awaken: 'Bankai... Senbonzakura Kageyoshi.',
    ultimate: 'Shukei... Hakuteiken!',
    victory: 'There was never any gap between our skills. Only pride.'
  }
};

export const KENPACHI_DEFINITION: CharacterDefinition = {
  id: 'kenpachi',
  name: 'Kenpachi Zaraki',
  title: '11th Division Captain - Kenpachi',
  japaneseName: '更木 剣八',
  faction: 'shinigami',
  themeColor: '#ffcc00',
  secondaryColor: '#331100',
  reiatsuColor: '#ffbb00',
  stats: {
    maxHp: 1250,
    walkSpeed: 3.8,
    dashSpeed: 12.5,
    jumpForce: 12.0,
    attackPower: 1.45,
    defense: 1.25,
    reiatsuGainRate: 0.9
  },
  awakeningName: 'Eyepatch Removal / Shikai Nozarashi',
  awakeningDuration: 800,
  awakeningDescription: 'Rips off his reiatsu-suppressing eyepatch and cleaves the fabric of space with Nozarashi.',
  ultimateName: 'Ryodan (Two-Handed Kendo Slash)',
  ultimateCost: 300,
  moves: [
    { name: 'Brutal Cleave', command: 'J -> J -> K', description: 'Heavy savage hacks that crush through guard', cost: 0 },
    { name: 'Roaring Shockwave', command: 'U (Special)', description: 'Slams his blade creating an earthquake shockwave', cost: 35 },
    { name: 'Fierce Leap', command: 'L (Shunpo)', description: 'Crushes the ground leaping directly onto the foe', cost: 15 },
    { name: 'Drink, Nozarashi', command: 'O (At 200+ Reiatsu)', description: 'Unleashes unbridled berserk power', cost: 200 },
    { name: 'Two-Handed Kendo', command: 'S + O (At 300 Reiatsu)', description: 'Grips sword with two hands for an apocalyptic vertical split', cost: 300 }
  ],
  quotes: {
    select: 'Hey! Come at me! Don\'t die on me too quickly!',
    roundStart: 'Fight me until your blood boils!',
    awaken: 'DRINK... NOZARASHI!',
    ultimate: 'KENDO! TWO HANDS ARE STRONGER THAN ONE!',
    victory: 'That was it?! You\'re boring me already!'
  }
};

export const GRIMMJOW_DEFINITION: CharacterDefinition = {
  id: 'grimmjow',
  name: 'Grimmjow Jaegerjaquez',
  title: '6th Espada - The Destruction',
  japaneseName: 'グリムジョー・ジャガージャック',
  faction: 'arrancar',
  themeColor: '#00a8ff',
  secondaryColor: '#192a56',
  reiatsuColor: '#00d2d3',
  stats: {
    maxHp: 1000,
    walkSpeed: 4.9,
    dashSpeed: 16.0,
    jumpForce: 14.0,
    attackPower: 1.15,
    defense: 1.0,
    reiatsuGainRate: 1.15
  },
  awakeningName: 'Resurrección: Pantera',
  awakeningDuration: 900,
  awakeningDescription: 'Releases the feline predator Pantera with razor claws and sonic shockwave darts.',
  ultimateName: 'Desgarrón',
  ultimateCost: 300,
  moves: [
    { name: 'Savage Claws', command: 'J -> J -> K', description: 'Ferocious panther swipes into roundhouse kick', cost: 0 },
    { name: 'Gran Rey Cero', command: 'U (Special)', description: 'Fires royal blue Cero that distorts space itself', cost: 40 },
    { name: 'Predator Sonído', command: 'L (Shunpo)', description: 'Pounces with razor momentum', cost: 20 },
    { name: 'Grind, Pantera', command: 'O (At 200+ Reiatsu)', description: 'Releases predatory panther form', cost: 200 },
    { name: 'Desgarrón', command: 'S + O (At 300 Reiatsu)', description: 'Generates ten colossal claws of blue energy and crushes the battlefield', cost: 300 }
  ],
  quotes: {
    select: 'I don\'t give a damn about justice or kings. I crush whoever stands in my way.',
    roundStart: 'Don\'t blink! Or you\'ll miss your own death!',
    awaken: 'Kishiré... PANTERA!',
    ultimate: 'TEAR THEM APART! DESGARRÓN!',
    victory: 'See that?! I am the King!'
  }
};

// ─── New Characters ────────────────────────────────────────────────────────

export const RUKIA_DEFINITION: CharacterDefinition = {
  id: 'rukia',
  name: 'Rukia Kuchiki',
  title: 'Lieutenant of Squad 13',
  japaneseName: '朽木 ルキア',
  faction: 'shinigami',
  themeColor: '#aaddff',
  secondaryColor: '#002244',
  reiatsuColor: '#88ccff',
  stats: {
    maxHp: 900,
    walkSpeed: 5.0,
    dashSpeed: 14.0,
    jumpForce: 15.0,
    attackPower: 0.9,
    defense: 0.9,
    reiatsuGainRate: 1.2,
  },
  awakeningName: 'Bankai: Hakka no Togame',
  awakeningDuration: 720,
  awakeningDescription: 'Absolute zero ice engulfs her in crystalline robes that freeze everything they touch.',
  ultimateName: 'Hakka no Togame',
  ultimateCost: 300,
  moves: [
    { name: 'Ice Dance', command: 'J → J → K', description: 'Rapid Sode no Shirayuki ice strikes', cost: 0 },
    { name: 'Some no Mai', command: 'U (Special)', description: 'Encircles opponent in a white ring of absolute zero', cost: 35 },
    { name: 'Tsugi no Mai', command: 'J+K (Special 2)', description: 'Twin ice pillars erupt from below', cost: 40 },
    { name: 'Shunpo Weave', command: 'L (Shunpo)', description: 'Elegant multi-step flash step', cost: 20 },
    { name: 'Bankai: Hakka', command: 'O (At 200+ Reiatsu)', description: 'Absolute zero crystalline bankai form', cost: 200 },
    { name: 'Hakka no Togame', command: 'S + O (At 300 Reiatsu)', description: 'White mist explosion — everything within range freezes solid', cost: 300 },
  ],
  quotes: {
    select: 'I will not let sentiment cloud my blade.',
    roundStart: 'Dance, Sode no Shirayuki.',
    awaken: 'BANKAI... HAKKA NO TOGAME!',
    ultimate: 'White mist... take everything. HAKKA NO TOGAME!',
    victory: 'You could not withstand the cold.',
  },
};

export const HITSUGAYA_DEFINITION: CharacterDefinition = {
  id: 'hitsugaya',
  name: 'Tōshirō Hitsugaya',
  title: 'Captain of Squad 10 — Ice Dragon',
  japaneseName: '日番谷 冬獅郎',
  faction: 'shinigami',
  themeColor: '#44ddff',
  secondaryColor: '#003355',
  reiatsuColor: '#00ccff',
  stats: {
    maxHp: 950,
    walkSpeed: 5.2,
    dashSpeed: 15.0,
    jumpForce: 16.0,
    attackPower: 1.05,
    defense: 1.0,
    reiatsuGainRate: 1.1,
  },
  awakeningName: 'Bankai: Daiguren Hyōrinmaru',
  awakeningDuration: 900,
  awakeningDescription: 'A dragon of ice emerges, encasing Hitsugaya in crystalline armor and a massive ice dragon.',
  ultimateName: 'Hyōten Hyakkasō',
    ultimateCost: 300,
  moves: [
    { name: 'Dragon Strike', command: 'J → J → K', description: 'Ice-blade slash combo with dragon tail swing', cost: 0 },
    { name: 'Hyōryū Senbi', command: 'U (Special)', description: 'Crescent-shaped ice blade fired from Hyōrinmaru', cost: 35 },
    { name: 'Ice Dragon Breath', command: 'J+K (Special 2)', description: 'Calls down Hyōrinmaru ice dragon for area freeze', cost: 50 },
    { name: 'Ice Step', command: 'L (Shunpo)', description: 'Shunpo leaving ice crystals in the path', cost: 20 },
    { name: 'Daiguren Bankai', command: 'O (At 200+ Reiatsu)', description: 'Dragon-armored bankai with 12 ice wings', cost: 200 },
    { name: 'Hyōten Hyakkasō', command: 'S + O (At 300 Reiatsu)', description: 'Hundred flowers scatter from the sky — instant freeze field', cost: 300 },
  ],
  quotes: {
    select: 'A captain does not need to show his bankai to the weak.',
    roundStart: 'Freeze, Hyōrinmaru.',
    awaken: 'BANKAI... DAIGUREN HYŌRINMARU!',
    ultimate: 'Scatter... HYŌTEN HYAKKASŌ!',
    victory: 'Your flames could not melt what was never meant to thaw.',
  },
};

export const URYU_DEFINITION: CharacterDefinition = {
  id: 'uryu',
  name: 'Uryū Ishida',
  title: 'Last Quincy — Sternritter A',
  japaneseName: '石田 雨竜',
  faction: 'quincy',
  themeColor: '#ddddff',
  secondaryColor: '#111155',
  reiatsuColor: '#aaaaff',
  stats: {
    maxHp: 870,
    walkSpeed: 4.6,
    dashSpeed: 14.5,
    jumpForce: 13.5,
    attackPower: 0.95,
    defense: 0.85,
    reiatsuGainRate: 1.3,
  },
  awakeningName: 'Vollständig: Kirchenlied St. Drei Götter',
  awakeningDuration: 840,
  awakeningDescription: 'Radiates the full Quincy cross halo — silver wings of spirit arrows blot out the sky.',
  ultimateName: 'Licht Regen',
  ultimateCost: 300,
  moves: [
    { name: 'Arrow Burst', command: 'J → J → K', description: 'Rapid Heilig Pfeil shots into close-range Seele Schneider slash', cost: 0 },
    { name: 'Heilig Pfeil', command: 'U (Special)', description: 'A volley of sacred spirit arrows', cost: 30 },
    { name: 'Seele Schneider', command: 'J+K (Special 2)', description: 'Spirit-blade arrow used as a melee weapon', cost: 35 },
    { name: 'Hirenkyaku', command: 'L (Shunpo)', description: 'Quincy flash step on a platform of reishi', cost: 20 },
    { name: 'Vollständig', command: 'O (At 200+ Reiatsu)', description: 'Full Quincy power — halo wings and silver aura', cost: 200 },
    { name: 'Licht Regen', command: 'S + O (At 300 Reiatsu)', description: 'A thousand sacred arrows rain from the heavens at once', cost: 300 },
  ],
  quotes: {
    select: 'As the last Quincy, I cannot afford to fall here.',
    roundStart: 'I will show you the pride of the Quincy.',
    awaken: 'Vollständig... KIRCHENLIED!',
    ultimate: 'Rain of light — LICHT REGEN!',
    victory: 'The Quincy are not extinct. Remember that.',
  },
};

export const ORIHIME_DEFINITION: CharacterDefinition = {
  id: 'orihime',
  name: 'Orihime Inoue',
  title: 'Shun Shun Rikka — Reject the World',
  japaneseName: '井上 織姫',
  faction: 'shinigami',
  themeColor: '#ffaadd',
  secondaryColor: '#440044',
  reiatsuColor: '#ff88ff',
  stats: {
    maxHp: 820,
    walkSpeed: 4.4,
    dashSpeed: 13.0,
    jumpForce: 13.0,
    attackPower: 0.85,
    defense: 1.15,
    reiatsuGainRate: 1.4,
  },
  awakeningName: 'Shun Shun Rikka: Full Rejection',
  awakeningDuration: 780,
  awakeningDescription: 'The six fairies surround her in a barrier of absolute rejection, reversing any reality.',
  ultimateName: 'Sōten Kisshun',
  ultimateCost: 300,
  moves: [
    { name: 'Fairy Strike', command: 'J → J → K', description: 'Koten Zanshun cuts + Hinagiku barrier bash', cost: 0 },
    { name: 'Koten Zanshun', command: 'U (Special)', description: 'Tsubaki fires a single piercing beam', cost: 30 },
    { name: 'Santen Kesshun', command: 'J+K (Special 2)', description: 'Triangle shield reflects projectiles', cost: 35 },
    { name: 'Fairy Step', command: 'L (Shunpo)', description: 'Glides on Shun Shun Rikka barrier platforms', cost: 15 },
    { name: 'Full Rejection', command: 'O (At 200+ Reiatsu)', description: 'Shun Shun Rikka full form — all abilities enhanced', cost: 200 },
    { name: 'Sōten Kisshun', command: 'S + O (At 300 Reiatsu)', description: 'Dome of absolute rejection: reverses all damage dealt in window', cost: 300 },
  ],
  quotes: {
    select: 'I will fight for the people I love. I won\'t lose.',
    roundStart: 'Shun Shun Rikka, protect us!',
    awaken: 'Full rejection... I reject this reality!',
    ultimate: 'Return... everything. SŌTEN KISSHUN!',
    victory: 'I wanted to protect everyone. I\'m glad I could.',
  },
};

export const ROSTER: CharacterDefinition[] = [
  ICHIGO_DEFINITION,
  ULQUIORRA_DEFINITION,
  AIZEN_DEFINITION,
  YHWACH_DEFINITION,
  WHITE_ZANGETSU_DEFINITION,
  BYAKUYA_DEFINITION,
  KENPACHI_DEFINITION,
  GRIMMJOW_DEFINITION,
  RUKIA_DEFINITION,
  HITSUGAYA_DEFINITION,
  URYU_DEFINITION,
  ORIHIME_DEFINITION,
];

export function getCharacterById(id: string): CharacterDefinition {
  return ROSTER.find(c => c.id === id) || ICHIGO_DEFINITION;
}

