// Bleach 2D Web Game: Anime Fighting Game HUD & UI Renderer
import type { Fighter } from '../combat/Fighter';

export class UIRenderer {
  public static renderBattleHUD(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    p1: Fighter,
    p2: Fighter,
    roundTimer: number,
    p1RoundsWon: number,
    p2RoundsWon: number,
    announcement: string | null
  ): void {
    ctx.save();

    // 1. Player 1 HUD (Top Left)
    this.renderFighterBar(ctx, 40, 30, 420, 26, p1, false, p1RoundsWon);

    // 2. Player 2 HUD (Top Right)
    this.renderFighterBar(ctx, width - 460, 30, 420, 26, p2, true, p2RoundsWon);

    // 3. Central Round Timer
    this.renderRoundTimer(ctx, width / 2, 45, roundTimer);

    // 4. Combo Counters
    if (p1.comboCount > 1) {
      this.renderComboCounter(ctx, 80, 160, p1.comboCount, p1.charDef.reiatsuColor);
    }
    if (p2.comboCount > 1) {
      this.renderComboCounter(ctx, width - 80, 160, p2.comboCount, p2.charDef.reiatsuColor, true);
    }

    // 5. Match Announcement (ROUND 1, FIGHT, K.O.)
    if (announcement) {
      this.renderAnnouncement(ctx, width / 2, height * 0.38, announcement);
    }

    // 6. Bottom Controls Helper Bar
    this.renderControlsCheatsheet(ctx, width, height);

    ctx.restore();
  }

  private static renderFighterBar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    barW: number,
    barH: number,
    f: Fighter,
    isP2: boolean,
    roundsWon: number
  ): void {
    ctx.save();

    // Health Bar Frame
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, 4);
    ctx.fill();
    ctx.stroke();

    // Delayed Damage Bar (Red)
    const delayedHpRatio = Math.max(0, f.displayHp / f.maxHp);
    ctx.fillStyle = '#dc2626';
    if (isP2) {
      const dw = barW * delayedHpRatio;
      ctx.fillRect(x + barW - dw, y, dw, barH);
    } else {
      ctx.fillRect(x, y, barW * delayedHpRatio, barH);
    }

    // Current Health Bar (Gradient Yellow to Green, or Red when low)
    const hpRatio = Math.max(0, f.hp / f.maxHp);
    const hpGrad = ctx.createLinearGradient(x, y, x + barW, y);
    if (hpRatio < 0.25) {
      hpGrad.addColorStop(0, '#ef4444');
      hpGrad.addColorStop(1, '#f97316');
    } else {
      hpGrad.addColorStop(0, '#eab308');
      hpGrad.addColorStop(1, '#22c55e');
    }

    ctx.fillStyle = hpGrad;
    if (isP2) {
      const hw = barW * hpRatio;
      ctx.fillRect(x + barW - hw, y, hw, barH);
    } else {
      ctx.fillRect(x, y, barW * hpRatio, barH);
    }

    // Guard Meter (Slim line directly below HP)
    const guardRatio = Math.max(0, f.guardMeter / f.maxGuardMeter);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x, y + barH + 2, barW, 4);
    ctx.fillStyle = '#38bdf8';
    if (isP2) {
      ctx.fillRect(x + barW - (barW * guardRatio), y + barH + 2, barW * guardRatio, 4);
    } else {
      ctx.fillRect(x, y + barH + 2, barW * guardRatio, 4);
    }

    // Character Name & Japanese Kanji Title
    ctx.textAlign = isP2 ? 'right' : 'left';
    ctx.textBaseline = 'bottom';
    ctx.font = '700 20px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = f.charDef.themeColor;
    ctx.shadowBlur = 8;
    ctx.fillText(f.charDef.name.toUpperCase(), isP2 ? x + barW : x, y - 6);

    ctx.font = '500 13px "Segoe UI", serif';
    ctx.fillStyle = '#94a3b8';
    ctx.shadowBlur = 0;
    ctx.fillText(f.charDef.japaneseName, isP2 ? x + barW - 180 : x + 180, y - 8);

    // Rounds Won Spirit Orbs
    for (let r = 0; r < 2; r++) {
      const orbX = isP2 ? (x + barW - 20 - r * 22) : (x + 20 + r * 22);
      const orbY = y + barH + 16;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 6, 0, Math.PI * 2);
      if (r < roundsWon) {
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = '#334155';
        ctx.fill();
      }
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Reiatsu Gauge (3 Stocks)
    this.renderReiatsuStocks(ctx, x, y + barH + 28, barW, f, isP2);

    ctx.restore();
  }

  private static renderReiatsuStocks(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    f: Fighter,
    isP2: boolean
  ): void {
    const stockCount = Math.floor(f.reiatsu / 100);
    const partialStock = (f.reiatsu % 100) / 100;
    const stockW = (w - 12) / 3;
    const stockH = 12;

    for (let i = 0; i < 3; i++) {
      const sx = isP2 ? (x + (2 - i) * (stockW + 6)) : (x + i * (stockW + 6));
      
      // Stock border
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(sx, y, stockW, stockH);
      ctx.fillRect(sx, y, stockW, stockH);

      // Fill
      if (i < stockCount) {
        ctx.fillStyle = f.charDef.reiatsuColor;
        ctx.shadowColor = f.charDef.reiatsuColor;
        ctx.shadowBlur = 10;
        ctx.fillRect(sx, y, stockW, stockH);
        ctx.shadowBlur = 0;
      } else if (i === stockCount && partialStock > 0) {
        ctx.fillStyle = f.charDef.reiatsuColor;
        ctx.fillRect(sx, y, stockW * partialStock, stockH);
      }
    }

    // Awakening or Max indicator
    ctx.textAlign = isP2 ? 'right' : 'left';
    ctx.font = '800 12px "Segoe UI", sans-serif';
    if (f.isAwakened) {
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 8;
      ctx.fillText(`★ ${f.charDef.awakeningName.toUpperCase()}`, isP2 ? x + w : x, y + stockH + 16);
    } else if (f.reiatsu >= 200) {
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.fillText('⚡ BANKAI / AWAKEN READY (O)', isP2 ? x + w : x, y + stockH + 16);
    } else {
      ctx.fillStyle = '#64748b';
      ctx.fillText(`REIATSU: ${Math.floor(f.reiatsu)} / 300`, isP2 ? x + w : x, y + stockH + 16);
    }
    ctx.shadowBlur = 0;
  }

  private static renderRoundTimer(ctx: CanvasRenderingContext2D, centerX: number, y: number, timer: number): void {
    ctx.save();
    // Octagonal timer badge
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.arc(centerX, y, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Seconds text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 28px Impact, "Segoe UI", sans-serif';
    ctx.fillStyle = timer <= 10 ? '#ef4444' : '#ffffff';
    ctx.fillText(`${Math.max(0, Math.ceil(timer))}`, centerX, y + 2);
    ctx.restore();
  }

  private static renderComboCounter(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    count: number,
    color: string,
    isRight: boolean = false
  ): void {
    ctx.save();
    ctx.textAlign = isRight ? 'right' : 'left';
    ctx.shadowColor = color;
    ctx.shadowBlur = 16;

    ctx.font = '900 48px Impact, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${count}`, x, y);

    ctx.font = 'italic 800 20px "Segoe UI", sans-serif';
    ctx.fillStyle = color;
    ctx.fillText('HITS COMBO!', x, y + 24);

    let rating = 'SPIRITUAL RUSH';
    if (count >= 10) rating = 'DEVASTATING!';
    else if (count >= 6) rating = 'REIATSU BURST!';
    else if (count >= 4) rating = 'HOLLOW CLASH!';

    ctx.font = '700 14px "Segoe UI", sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(rating, x, y + 42);

    ctx.restore();
  }

  private static renderAnnouncement(ctx: CanvasRenderingContext2D, x: number, y: number, text: string): void {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Glow and drop shadow
    ctx.shadowColor = '#ff0033';
    ctx.shadowBlur = 28;

    ctx.font = '900 58px Impact, "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x, y);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeText(text, x, y);

    ctx.restore();
  }

  private static renderControlsCheatsheet(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    const barY = height - 24;
    ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
    ctx.fillRect(0, barY, width, 24);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '600 12px "Segoe UI", sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('P1: [A/D] Move | [W] Jump | [S] Block | [J] Light | [K] Heavy | [L] Shunpo | [U] Special | [I] Hold Charge | [O] Bankai / Ult', width / 2, barY + 12);
    ctx.restore();
  }
}
