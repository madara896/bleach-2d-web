// Bleach 2D Web Game: Roster Select Scene with Multi-Faction Support
import { ROSTER, type CharacterDefinition } from '../data/characters/Roster';
import type { Faction } from '../types';
import { audio } from '../engine/AudioEngine';

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

  public update(keysJustPressed: {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    tabPrev: boolean;
    tabNext: boolean;
    confirm: boolean;
    back: boolean;
  }): { ready: boolean; p1: CharacterDefinition; p2: CharacterDefinition } | null {
    this.tick++;
    const roster = this.getFilteredRoster();

    // Tab Faction Navigation (Q/E)
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
    ctx.font = '600 13px "Segoe UI", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('P1: ' + (this.p1Character ? this.p1Character.name : 'Choosing...') + '   VS   P2: ' + (this.p2Character ? this.p2Character.name : 'Waiting...'), width / 2, height - 20);
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
    const gridX = 60;
    const gridY = 145;
    const cols = 4;
    const cardW = 120;
    const cardH = 140;
    const gap = 16;

    roster.forEach((c, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = gridX + col * (cardW + gap);
      const y = gridY + row * (cardH + gap);
      const isSelected = c.id === activeChar.id;
      const isP1 = this.p1Character?.id === c.id;
      const isP2 = this.p2Character?.id === c.id;

      ctx.save();
      // Card Background
      ctx.fillStyle = isSelected ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.8)';
      ctx.strokeStyle = isSelected ? c.reiatsuColor : isP1 ? '#38bdf8' : isP2 ? '#ef4444' : '#334155';
      ctx.lineWidth = isSelected ? 3 : 1.5;
      if (isSelected) {
        ctx.shadowColor = c.reiatsuColor;
        ctx.shadowBlur = 14;
      }

      ctx.roundRect(x, y, cardW, cardH, 6);
      ctx.fill();
      ctx.stroke();

      // Card Header Banner
      ctx.fillStyle = c.themeColor;
      ctx.fillRect(x + 1, y + 1, cardW - 2, 8);

      // Stylized Initial / Emblem
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 36px Impact, sans-serif';
      ctx.fillStyle = isSelected ? '#ffffff' : '#475569';
      ctx.fillText(c.name.split(' ')[0][0], x + cardW / 2, y + 55);

      // Japanese Calligraphy Kanji
      ctx.font = '700 13px "Segoe UI", serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(c.japaneseName, x + cardW / 2, y + 88);

      // Character Name
      ctx.font = '700 13px "Segoe UI", sans-serif';
      ctx.fillStyle = isSelected ? '#f8fafc' : '#cbd5e1';
      ctx.fillText(c.name.split(' ')[0], x + cardW / 2, y + 115);

      // P1 / P2 Badges
      if (isP1) {
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(x + 6, y + 6, 26, 16);
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 10px sans-serif';
        ctx.fillText('P1', x + 19, y + 14);
      }
      if (isP2) {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(x + cardW - 32, y + 6, 26, 16);
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 10px sans-serif';
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
    const pH = height - 220;

    ctx.save();
    // Glassmorphic details panel
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
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
    ctx.fillText(c.name.toUpperCase(), pX + 24, pY + 40);

    ctx.font = 'italic 600 15px "Segoe UI", sans-serif';
    ctx.fillStyle = c.themeColor;
    ctx.fillText(`【 ${c.title} 】`, pX + 24, pY + 65);

    // Faction Badge
    ctx.fillStyle = '#334155';
    ctx.roundRect(pX + 24, pY + 78, 120, 20, 3);
    ctx.fill();
    ctx.font = '700 11px sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`FACTION: ${c.faction.toUpperCase()}`, pX + 32, pY + 92);

    // Stats Section
    const statsY = pY + 125;
    this.renderStatBar(ctx, pX + 24, statsY, 'HP', c.stats.maxHp / 1250, '#22c55e');
    this.renderStatBar(ctx, pX + 24, statsY + 28, 'ATTACK', c.stats.attackPower / 1.45, '#ef4444');
    this.renderStatBar(ctx, pX + 24, statsY + 56, 'SPEED', c.stats.dashSpeed / 16.0, '#38bdf8');
    this.renderStatBar(ctx, pX + 24, statsY + 84, 'REIATSU', c.stats.reiatsuGainRate / 1.3, '#f59e0b');

    // Awakening / Bankai Details
    const awkY = statsY + 130;
    ctx.fillStyle = '#facc15';
    ctx.font = '800 14px "Segoe UI", sans-serif';
    ctx.fillText(`⚡ RELEASE: ${c.awakeningName}`, pX + 24, awkY);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 12px "Segoe UI", sans-serif';
    ctx.fillText(c.awakeningDescription, pX + 24, awkY + 20, pW - 48);

    // Ultimate Art
    ctx.fillStyle = '#ef4444';
    ctx.font = '800 14px "Segoe UI", sans-serif';
    ctx.fillText(`☠ ULTIMATE: ${c.ultimateName}`, pX + 24, awkY + 54);

    // Character Quote
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'italic 500 13px "Segoe UI", serif';
    ctx.fillText(`"${c.quotes.select}"`, pX + 24, awkY + 88, pW - 48);

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
