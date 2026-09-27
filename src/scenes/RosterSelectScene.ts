// Bleach: Souls of Eternity — Roster Select Scene with Real Character Portraits
import { ROSTER, type CharacterDefinition } from '../data/characters/Roster';
import type { Faction } from '../types';
import { audio } from '../engine/AudioEngine';
import { spriteLoader, CHARACTER_SPRITE_MAP } from '../engine/SpriteLoader';


export class RosterSelectScene {
  public selectedIndex: number = 0;
  public p1Character: CharacterDefinition | null = null;
  public p2Character: CharacterDefinition | null = null;
  
  public currentFaction: 'ALL' | Faction = 'ALL';
  public factions: ('ALL' | Faction)[] = ['ALL', 'shinigami', 'arrancar', 'quincy', 'transcendent'];

  private tick: number = 0;

  public getFilteredRoster(): CharacterDefinition[] {
    if (this.currentFaction === 'ALL') return ROSTER;
    return ROSTER.filter(c => c.faction === this.currentFaction);
  }

  public update(
    keysJustPressed: {
      left: boolean;
      right: boolean;
      up: boolean;
      down: boolean;
      tabPrev: boolean;
      tabNext: boolean;
      confirm: boolean;
      back: boolean;
    },
    mouseClick: { x: number; y: number } | null,
    width: number
  ): { ready: boolean; p1: CharacterDefinition; p2: CharacterDefinition } | null {
    this.tick++;
    const roster = this.getFilteredRoster();

    // Handle Mouse Clicks
    if (mouseClick) {
      // 1. Check Faction Tabs
      const tabY = 85;
      const tabW = 140;
      const startX = width / 2 - (this.factions.length * tabW) / 2;
      for (let i = 0; i < this.factions.length; i++) {
        const x = startX + i * tabW;
        if (
          mouseClick.x >= x &&
          mouseClick.x <= x + tabW &&
          mouseClick.y >= tabY &&
          mouseClick.y <= tabY + 30
        ) {
          this.currentFaction = this.factions[i];
          this.selectedIndex = 0;
          audio.playHitLight();
          return null;
        }
      }

      // 2. Check Character Cards
      const gridX = 30;
      const gridY = 130;
      const cols = 4;
      const cardW = 134;
      const cardH = 160;
      const gap = 10;


      for (let i = 0; i < roster.length; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = gridX + col * (cardW + gap);
        const y = gridY + row * (cardH + gap);

        if (
          mouseClick.x >= x &&
          mouseClick.x <= x + cardW &&
          mouseClick.y >= y &&
          mouseClick.y <= y + cardH
        ) {
          this.selectedIndex = i;
          audio.playSwordClash();
          const chosen = roster[i];

          if (!this.p1Character) {
            this.p1Character = chosen;
          } else if (!this.p2Character) {
            this.p2Character = chosen;
            return { ready: true, p1: this.p1Character, p2: this.p2Character };
          }
          return null;
        }
      }

      // 3. Check "DEPLOY TO BATTLE" button if clicked
      const pX = width * 0.52;
      const btnY = 560;
      const btnW = width * 0.43;
      if (
        mouseClick.x >= pX &&
        mouseClick.x <= pX + btnW &&
        mouseClick.y >= btnY &&
        mouseClick.y <= btnY + 44
      ) {
        audio.playSwordClash();
        const chosen = roster[this.selectedIndex];
        if (!this.p1Character) {
          this.p1Character = chosen;
        } else if (!this.p2Character) {
          this.p2Character = chosen;
          return { ready: true, p1: this.p1Character, p2: this.p2Character };
        }
      }
    }

    // Keyboard Tab Faction Navigation (Q/E)
    if (keysJustPressed.tabPrev) {
      const idx = this.factions.indexOf(this.currentFaction);
      this.currentFaction = this.factions[(idx - 1 + this.factions.length) % this.factions.length];
      this.selectedIndex = 0;
      audio.playHitLight();
    }
    if (keysJustPressed.tabNext) {
      const idx = this.factions.indexOf(this.currentFaction);
      this.currentFaction = this.factions[(idx + 1) % this.factions.length];
      this.selectedIndex = 0;
      audio.playHitLight();
    }

    // Grid Navigation (columns = 4)
    const cols = 4;
    if (keysJustPressed.left) {
      this.selectedIndex = (this.selectedIndex - 1 + roster.length) % roster.length;
      audio.playHitLight();
    }
    if (keysJustPressed.right) {
      this.selectedIndex = (this.selectedIndex + 1) % roster.length;
      audio.playHitLight();
    }
    if (keysJustPressed.up && this.selectedIndex >= cols) {
      this.selectedIndex -= cols;
      audio.playHitLight();
    }
    if (keysJustPressed.down && this.selectedIndex + cols < roster.length) {
      this.selectedIndex += cols;
      audio.playHitLight();
    }

    // Confirm selection
    if (keysJustPressed.confirm) {
      audio.playSwordClash();
      const chosen = roster[this.selectedIndex];

      if (!this.p1Character) {
        this.p1Character = chosen;
      } else if (!this.p2Character) {
        this.p2Character = chosen;
        return { ready: true, p1: this.p1Character, p2: this.p2Character };
      }
    }

    // Back / Deselect
    if (keysJustPressed.back) {
      if (this.p2Character) {
        this.p2Character = null;
      } else if (this.p1Character) {
        this.p1Character = null;
      }
    }

    return null;
  }

  public render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Dark moody arena background
    ctx.fillStyle = '#05070e';
    ctx.fillRect(0, 0, width, height);

    const roster = this.getFilteredRoster();
    const activeChar = roster[this.selectedIndex] || ROSTER[0];

    // Header Title
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '900 32px Impact, "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 12;
    const titleText = !this.p1Character ? 'PLAYER 1 - CHOOSE YOUR SOUL WARRIOR' : 'PLAYER 2 / CPU - SELECT RIVAL';
    ctx.fillText(titleText, width / 2, 45);
    ctx.restore();

    // Faction Filter Tabs (ALL, SHINIGAMI, ARRANCAR, QUINCY, TRANSCENDENT)
    this.renderFactionTabs(ctx, width);

    // Left Side: Character Grid
    this.renderCharacterGrid(ctx, roster, activeChar);

    // Right Side: Selected Character Details & Stats Radar
    this.renderCharacterProfile(ctx, width, height, activeChar);

    // Bottom Selection Status
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '600 14px "Segoe UI", sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('P1: ' + (this.p1Character ? this.p1Character.name : 'Choosing...') + '   VS   P2: ' + (this.p2Character ? this.p2Character.name : 'Waiting... (Click Card or Press J/Space/Enter to Confirm)'), width / 2, height - 16);
    ctx.restore();
  }

  private renderFactionTabs(ctx: CanvasRenderingContext2D, width: number): void {
    const tabY = 85;
    const tabW = 140;
    const startX = width / 2 - (this.factions.length * tabW) / 2;

    this.factions.forEach((fac, idx) => {
      const isCur = fac === this.currentFaction;
      const x = startX + idx * tabW;

      ctx.save();
      ctx.fillStyle = isCur ? '#dc2626' : '#1e293b';
      ctx.strokeStyle = isCur ? '#f87171' : '#334155';
      ctx.lineWidth = 1.5;
      ctx.roundRect(x + 5, tabY, tabW - 10, 28, 4);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = isCur ? '700 12px "Segoe UI", sans-serif' : '600 12px "Segoe UI", sans-serif';
      ctx.fillStyle = isCur ? '#ffffff' : '#94a3b8';
      ctx.fillText(fac.toUpperCase(), x + tabW / 2, tabY + 14);
      ctx.restore();
    });
  }

  private renderCharacterGrid(ctx: CanvasRenderingContext2D, roster: CharacterDefinition[], activeChar: CharacterDefinition): void {
    const gridX = 30;
    const gridY = 130;
    const cols = 4;
    const cardW = 134;
    const cardH = 160;
    const gap = 10;

    roster.forEach((c, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = gridX + col * (cardW + gap);
      const y = gridY + row * (cardH + gap);
      const isSelected = c.id === activeChar.id;
      const isP1 = this.p1Character?.id === c.id;
      const isP2 = this.p2Character?.id === c.id;
      const pulse = 1 + (isSelected ? Math.sin(this.tick * 0.1) * 0.02 : 0);

      ctx.save();

      // Selected scale pulse
      if (isSelected) {
        ctx.translate(x + cardW / 2, y + cardH / 2);
        ctx.scale(pulse, pulse);
        ctx.translate(-(x + cardW / 2), -(y + cardH / 2));
      }

      // Card background
      ctx.fillStyle = isSelected ? 'rgba(20, 10, 30, 0.95)' : 'rgba(10, 15, 25, 0.85)';
      ctx.strokeStyle = isSelected ? c.reiatsuColor : isP1 ? '#38bdf8' : isP2 ? '#ef4444' : '#334155';
      ctx.lineWidth = isSelected ? 3 : 1.5;
      if (isSelected) {
        ctx.shadowColor = c.reiatsuColor;
        ctx.shadowBlur = 20;
      }
      ctx.roundRect(x, y, cardW, cardH, 8);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Portrait image
      const img = spriteLoader.get(CHARACTER_SPRITE_MAP[c.id] ?? '');
      if (img && img.width > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, cardW - 4, cardH - 40, 6);
        ctx.clip();
        // Draw image — show upper portion (face/torso) of the character
        const aspect = img.width / img.height;
        const drawW = cardW - 4;
        const drawH = drawW / aspect;
        // Show top 70% of character image (face/torso area)
        const srcH = img.height * 0.7;
        ctx.drawImage(img, 0, 0, img.width, srcH, x + 2, y + 2, drawW, cardH - 40);
        ctx.restore();

        // Gradient overlay on portrait bottom
        const fadeGrad = ctx.createLinearGradient(x, y + cardH - 70, x, y + cardH - 38);
        fadeGrad.addColorStop(0, 'rgba(0,0,0,0)');
        fadeGrad.addColorStop(1, 'rgba(10,5,20,0.9)');
        ctx.fillStyle = fadeGrad;
        ctx.fillRect(x + 2, y + cardH - 70, cardW - 4, 32);
      } else {
        // Fallback: Initial letter
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '900 48px Impact, sans-serif';
        ctx.fillStyle = isSelected ? c.reiatsuColor : '#475569';
        ctx.shadowColor = c.reiatsuColor;
        ctx.shadowBlur = isSelected ? 14 : 0;
        ctx.fillText(c.name.split(' ')[0][0], x + cardW / 2, y + (cardH - 38) / 2);
        ctx.shadowBlur = 0;
      }

      // Colored bottom banner
      const bannerGrad = ctx.createLinearGradient(x, y + cardH - 38, x + cardW, y + cardH - 38);
      bannerGrad.addColorStop(0, c.themeColor + 'cc');
      bannerGrad.addColorStop(1, c.secondaryColor + 'cc');
      ctx.fillStyle = bannerGrad;
      ctx.roundRect(x + 1, y + cardH - 38, cardW - 2, 37, [0, 0, 7, 7]);
      ctx.fill();

      // Character first name
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '700 12px "Segoe UI", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(c.name.split(' ')[0].toUpperCase(), x + cardW / 2, y + cardH - 22);

      // Faction dot
      const factionColors: Record<string, string> = {
        shinigami: '#38bdf8', arrancar: '#22c55e',
        quincy: '#a78bfa', transcendent: '#f59e0b',
      };
      ctx.fillStyle = factionColors[c.faction] ?? '#94a3b8';
      ctx.beginPath();
      ctx.arc(x + cardW - 14, y + cardH - 9, 5, 0, Math.PI * 2);
      ctx.fill();

      // P1 / P2 badges
      if (isP1) {
        ctx.fillStyle = '#0284c7';
        ctx.roundRect(x + 5, y + 5, 28, 18, 3);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 11px sans-serif';
        ctx.fillText('P1', x + 19, y + 14);
      }
      if (isP2) {
        ctx.fillStyle = '#dc2626';
        ctx.roundRect(x + cardW - 33, y + 5, 28, 18, 3);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 11px sans-serif';
        ctx.fillText('P2', x + cardW - 19, y + 14);
      }

      ctx.restore();
    });
  }

  private renderCharacterProfile(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    c: CharacterDefinition
  ): void {
    const pX = width * 0.52;
    const pY = 145;
    const pW = width * 0.43;
    const pH = height - 210;

    ctx.save();
    // Glassmorphic details panel
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = c.reiatsuColor;
    ctx.lineWidth = 2;
    ctx.shadowColor = c.reiatsuColor;
    ctx.shadowBlur = 12;
    ctx.roundRect(pX, pY, pW, pH, 8);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Header Tag
    ctx.textAlign = 'left';
    ctx.font = '900 28px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(c.name.toUpperCase(), pX + 24, pY + 36);

    ctx.font = 'italic 600 15px "Segoe UI", sans-serif';
    ctx.fillStyle = c.themeColor;
    ctx.fillText(`【 ${c.title} 】`, pX + 24, pY + 60);

    // Faction Badge
    ctx.fillStyle = '#334155';
    ctx.roundRect(pX + 24, pY + 74, 130, 20, 3);
    ctx.fill();
    ctx.font = '700 11px sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`FACTION: ${c.faction.toUpperCase()}`, pX + 32, pY + 88);

    // Stats Section
    const statsY = pY + 116;
    this.renderStatBar(ctx, pX + 24, statsY, 'HP', c.stats.maxHp / 1250, '#22c55e');
    this.renderStatBar(ctx, pX + 24, statsY + 26, 'ATTACK', c.stats.attackPower / 1.45, '#ef4444');
    this.renderStatBar(ctx, pX + 24, statsY + 52, 'SPEED', c.stats.dashSpeed / 16.0, '#38bdf8');
    this.renderStatBar(ctx, pX + 24, statsY + 78, 'REIATSU', c.stats.reiatsuGainRate / 1.3, '#f59e0b');

    // Awakening / Bankai Details
    const awkY = statsY + 118;
    ctx.fillStyle = '#facc15';
    ctx.font = '800 14px "Segoe UI", sans-serif';
    ctx.fillText(`⚡ RELEASE: ${c.awakeningName}`, pX + 24, awkY);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 12px "Segoe UI", sans-serif';
    ctx.fillText(c.awakeningDescription, pX + 24, awkY + 18, pW - 48);

    // Ultimate Art
    ctx.fillStyle = '#ef4444';
    ctx.font = '800 14px "Segoe UI", sans-serif';
    ctx.fillText(`☠ ULTIMATE: ${c.ultimateName}`, pX + 24, awkY + 46);

    // Character Quote
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'italic 500 13px "Segoe UI", serif';
    ctx.fillText(`"${c.quotes.select}"`, pX + 24, awkY + 74, pW - 48);

    // Big Select Button
    const btnY = pY + pH - 50;
    ctx.fillStyle = 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)';
    ctx.fillStyle = '#dc2626';
    ctx.roundRect(pX + 24, btnY, pW - 48, 38, 4);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.font = '800 15px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('⚔️ CONFIRM SELECTION (CLICK OR PRESS J/ENTER)', pX + pW / 2, btnY + 24);

    ctx.restore();
  }

  private renderStatBar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    label: string,
    ratio: number,
    color: string
  ): void {
    ctx.save();
    ctx.font = '700 12px "Segoe UI", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(label, x, y + 10);

    const barX = x + 70;
    const barW = 200;
    const barH = 10;

    // Track
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(barX, y, barW, barH);

    // Fill
    ctx.fillStyle = color;
    ctx.fillRect(barX, y, barW * Math.min(1, Math.max(0, ratio)), barH);
    ctx.restore();
  }
}
