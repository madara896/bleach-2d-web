# ⚔️ Bleach: Bankai Resurrection - 2D Web Fighting Game

An authentic, high-speed 2D anime fighting game inspired by **BLEACH**, built from scratch to run seamlessly in modern web browsers using HTML5 Canvas, Web Audio API, TypeScript, and Vite.

Featuring a multi-faction roster of **Soul Reapers (Shinigami)**, **Arrancars**, **Quincies**, and **Transcendent Beings**, players can execute flash steps (*Shunpo / Sonído / Hirenkyaku*), charge spiritual pressure (*Reiatsu*), clash blades, and unleash cinematic **Bankai**, **Resurrección**, and **Ultimate Arts**!

---

## 🎮 Playable Combatants

### 1. Soul Reapers (死神 - Shinigami)
- **Ichigo Kurosaki (黒崎 一護)**: Substitute Shinigami wielding the giant cleaver *Zangetsu*. Unleashes blue *Getsuga Tensho* crescent blasts, awakens into *Bankai: Tensa Zangetsu* with doubled speed and *Kuroi Getsuga*, and can sacrifice his spiritual powers for the cataclysmic *Mugetsu (Final Getsuga Tensho)*.
- **Byakuya Kuchiki (朽木 白哉)**: 6th Division Captain. Commands swarms of razor-sharp cherry blossom petals with *Senbonzakura Kageyoshi* and pierces the foe with *Hakuteiken*.
- **Kenpachi Zaraki (更木 剣八)**: 11th Division Captain. High-durability berserker with devastating two-handed Kendo cleaves that shatter guard meters.

### 2. Arrancars & Espada (破面)
- **Ulquiorra Cifer (ウルキオラ・シファー)**: 4th Espada representing Emptiness. Executes high-velocity *Sonído*, fires pitch-black *Cero Oscuras*, releases *Resurrección: Murciélago* with giant bat wings, and hurls the nuclear lightning spear *Lanza del Relámpago*.
- **Grimmjow Jaegerjaquez (グリムジョー)**: 6th Espada representing Destruction. Predatory agility, *Gran Rey Cero*, and *Desgarrón* claws.

### 3. Quincies & Wandenreich (滅却師)
- **Yhwach (ユーハバッハ)**: Father of the Quincies. Commands sacred *Heilig Pfeil* arrows, spirit reishi broadsword, awakens *The Almighty* with future-sight unblockable strikes, and triggers *Auswählen* to siphon enemy spiritual energy.

### 4. Transcendent & Hollow Spirits (超越者)
- **Sosuke Aizen (藍染 惣右介)**: Former 5th Division Captain who stood atop heaven. Controls complete hypnosis through *Kyoka Suigetsu* counter-teleports, casts *Hado #90: Kurohitsugi (Black Coffin)*, and achieves *Hogyoku Transcendence* with divine butterfly wings.
- **Hollow Ichigo / White Zangetsu (白一護 / 虚)**: The feral spirit within Ichigo. Twirls Zangetsu by its cloth wrap in relentless lethal spins, unleashes crimson *Hollow Cero*, and enters *Vasto Lorde Hollowfication*.

---

## 🕹️ Controls

### Player 1 (Keyboard)
| Action | Key | Description |
|---|---|---|
| **Move Left / Right** | <kbd>A</kbd> / <kbd>D</kbd> | Ground movement and spacing |
| **Jump** | <kbd>W</kbd> | High jump |
| **Crouch / Guard** | <kbd>S</kbd> (Hold) | High/low guard; reduces damage by 85% |
| **Light Attack** | <kbd>J</kbd> | Fast poke attack to initiate combos |
| **Heavy Attack** | <kbd>K</kbd> | Heavy launcher / downward slash |
| **Flash Step (Shunpo)** | <kbd>L</kbd> | Invulnerable high-speed teleport dash |
| **Signature Special** | <kbd>U</kbd> | Getsuga Tensho, Cero, Kurohitsugi, or Heilig Pfeil |
| **Charge Reiatsu** | <kbd>I</kbd> (Hold) | Meditate to rapidly gather spiritual pressure |
| **Bankai / Awakening** | <kbd>O</kbd> | Requires 200+ Reiatsu (2 stocks) |
| **Cinematic Ultimate** | <kbd>S</kbd> + <kbd>O</kbd> | Requires 300 Reiatsu (3 stocks) |

### Player 2 (Local Versus)
- **Movement / Jump / Block**: Arrow Keys (<kbd>◄</kbd>, <kbd>▲</kbd>, <kbd>▼</kbd>, <kbd>►</kbd>)
- **Light / Heavy Attacks**: <kbd>Numpad 1</kbd> / <kbd>Numpad 2</kbd> (or <kbd>7</kbd> / <kbd>8</kbd>)
- **Shunpo Dash**: <kbd>Numpad 3</kbd> (or <kbd>9</kbd>)
- **Signature Special**: <kbd>Numpad 4</kbd> (or <kbd>0</kbd>)
- **Charge Reiatsu**: <kbd>Numpad 5</kbd> (or <kbd>-</kbd>)
- **Bankai / Ultimate**: <kbd>Numpad 6</kbd> (or <kbd>=</kbd>)

### Touch Controls
On mobile and tablet devices, an on-screen responsive virtual D-Pad and action buttons automatically appear!

---

## ⚡ Game Modes
- **Arcade Ladder**: Battle across consecutive rivals through the Soul Society and Hueco Mundo.
- **VS CPU**: Quick-match against an intelligent AI opponent with dynamic spacing, combo cancels, and guard reactions.
- **Local 2-Player**: Duel a friend on the same machine.
- **Training Dojo**: Practice combos, cancel windows, and awakenings with infinite Reiatsu.

---

## 🏟️ Battlefields
1. **Sōkyoku Hill (双殛の丘)**: The dramatic Soul Society cliff with the execution scaffold and falling cherry blossom petals.
2. **Las Noches Sands (虚夜宮)**: The boundless white desert under the eternal crescent moon of Hueco Mundo.
3. **Silbern Throne Room (銀架城)**: The icy crystal palace of the Quincy Wandenreich.
4. **Karakura High Rooftop (空座町)**: Japanese high school rooftop at sunset overlooking the town.

---

## 🛠️ Tech Stack & Architecture
- **Framework**: Vite + TypeScript
- **Renderer**: Pure HTML5 Canvas 2D with dynamic auto-zoom camera, trauma-based screen shake, and hitstop freeze frames
- **Audio**: Web Audio API procedural synthesizer for sword clashes, Cero blasts, Getsuga hums, Bankai chimes, and battle BGM
- **Zero Heavy External Dependencies**: Loads instantly on desktop and mobile browsers with 60 FPS performance.
