// Bleach AAA Rebuild: Fixed Sprite Renderer
// Key fixes: proper portrait crop, ground-fade blend, correct flip transform, 290px height

import type { Fighter } from '../combat/Fighter';
import { spriteLoader, CHARACTER_SPRITE_MAP } from '../engine/SpriteLoader';

// Fixed display height — fighters stand at proper fighting-game scale on screen
const CHAR_HEIGHT = 290;
// Narrow portrait width — crop the landscape wallpaper art to a fighter portrait
const CHAR_WIDTH  = 175;

// Per-character vertical offset of the "interesting" region within the image
// (how far from the top the character face/torso starts, as a 0..1 fraction)
const CHAR_SRC_CROP: Record<string, { sx: number; sw: number; sy: number; sh: number }> = {
  //                     sx (left skip)  sw (use pct)  sy (top skip)  sh (use pct)
  ichigo:         { sx: 0.18, sw: 0.55, sy: 0.00, sh: 0.88 },
  ulquiorra:      { sx: 0.18, sw: 0.55, sy: 0.00, sh: 0.88 },
  aizen:          { sx: 0.20, sw: 0.55, sy: 0.00, sh: 0.88 },
  yhwach:         { sx: 0.18, sw: 0.58, sy: 0.00, sh: 0.88 },
  white_zangetsu: { sx: 0.15, sw: 0.60, sy: 0.00, sh: 0.88 },
  byakuya:        { sx: 0.20, sw: 0.55, sy: 0.00, sh: 0.88 },
  kenpachi:       { sx: 0.16, sw: 0.60, sy: 0.00, sh: 0.88 },
  grimmjow:       { sx: 0.18, sw: 0.58, sy: 0.00, sh: 0.88 },
  rukia:          { sx: 0.18, sw: 0.55, sy: 0.00, sh: 0.85 },
  hitsugaya:      { sx: 0.18, sw: 0.55, sy: 0.00, sh: 0.85 },
  uryu:           { sx: 0.18, sw: 0.55, sy: 0.00, sh: 0.85 },
  orihime:        { sx: 0.18, sw: 0.55, sy: 0.00, sh: 0.85 },
};

// Height scale per character
const CHAR_SCALE: Record<string, number> = {
  ichigo: 1.00, ulquiorra: 0.95, aizen: 1.05,
  yhwach: 1.08, white_zangetsu: 1.00, byakuya: 0.98,
  kenpachi: 1.10, grimmjow: 1.00, rukia: 0.88,
  hitsugaya: 0.85, uryu: 0.92, orihime: 0.88,
};

export class SpriteRenderer {
  private tick = 0;

  public renderFighter(ctx: CanvasRenderingContext2D, fighter: Fighter): void {
    this.tick++;
    const img = spriteLoader.get(CHARACTER_SPRITE_MAP[fighter.charDef.id] ?? '');

    const scale  = CHAR_SCALE[fighter.charDef.id] ?? 1.0;
    const charH  = CHAR_HEIGHT * scale;
    const charW  = CHAR_WIDTH  * scale;

    this.renderGroundShadow(ctx, fighter, charW);

    if (fighter.isAwakened) {
      this.renderAwakeningAura(ctx, fighter);
    }

    if (img && img.width > 0) {
      this.renderSprite(ctx, img, fighter, charW, charH);
    } else {
      this.renderFallback(ctx, fighter, charW, charH);
    }

    if (fighter.hitstun > 0) this.renderHitFlash(ctx, fighter, charW, charH);
    if (fighter.state === 'BLOCK') this.renderBlockShield(ctx, fighter);
    if (fighter.state === 'HURT' && fighter.hitstun > 8) this.renderHitSpark(ctx, fighter);
  }

  private renderSprite(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    f: Fighter,
    charW: number,
    charH: number
  ): void {
    // Breathing bob on idle
    const breath = f.state === 'IDLE' ? Math.sin(this.tick * 0.07) * 2.5 : 0;
    // Squash/stretch on attacks
    let sx = 1.0, sy = 1.0;
    if (f.state === 'LIGHT_ATTACK') { sx = 1.10; sy = 0.92; }
    if (f.state === 'HEAVY_ATTACK') { sx = 1.20; sy = 0.88; }
    if (f.state === 'HURT')         { sx = 0.88; sy = 1.12; }
    if (f.state === 'JUMP' || f.state === 'FALL') { sy = 1.08; }

    const crop = CHAR_SRC_CROP[f.charDef.id] ?? { sx: 0.18, sw: 0.55, sy: 0.0, sh: 0.88 };

    // Source rect from the landscape image
    const srcX = img.width  * crop.sx;
    const srcW = img.width  * crop.sw;
    const srcY = img.height * crop.sy;
    const srcH = img.height * crop.sh;

    ctx.save();

    // Move origin to fighter foot position
    ctx.translate(f.x, f.y + breath);

    // Flip for facing (done around character center — correct)
    if (f.facing < 0) ctx.scale(-1, 1);

    // Squash/stretch
    ctx.scale(sx, sy);

    // Glow shadow for energy feel
    if (f.isAwakened) {
      ctx.shadowColor = f.charDef.reiatsuColor;
      ctx.shadowBlur  = 30;
    } else if (f.reiatsu > 150) {
      ctx.shadowColor = f.charDef.reiatsuColor;
      ctx.shadowBlur  = 12;
    }

    // ── Draw the cropped character portrait ──────────────────────────────────
    ctx.drawImage(img, srcX, srcY, srcW, srcH, -charW / 2, -charH, charW, charH);
    ctx.shadowBlur = 0;

    // ── Bottom ground-fade: blends feet into the stage floor ─────────────────
    const fadeH = charH * 0.30;
    const fadeGrad = ctx.createLinearGradient(0, -fadeH, 0, 0);
    fadeGrad.addColorStop(0, 'rgba(0,0,0,0)');
    fadeGrad.addColorStop(1, 'rgba(0,0,0,0.92)');
    ctx.fillStyle = fadeGrad;
    ctx.fillRect(-charW / 2, -fadeH, charW, fadeH);

    // ── Side edge-fade: removes hard left/right borders ───────────────────────
    const edgeFadeW = charW * 0.18;
    // Left edge
    const leftFade = ctx.createLinearGradient(-charW / 2, 0, -charW / 2 + edgeFadeW, 0);
    leftFade.addColorStop(0, 'rgba(0,0,0,0.85)');
    leftFade.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = leftFade;
    ctx.fillRect(-charW / 2, -charH, edgeFadeW, charH);
    // Right edge
    const rightFade = ctx.createLinearGradient(charW / 2 - edgeFadeW, 0, charW / 2, 0);
    rightFade.addColorStop(0, 'rgba(0,0,0,0)');
    rightFade.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = rightFade;
    ctx.fillRect(charW / 2 - edgeFadeW, -charH, edgeFadeW, charH);

    // ── Top edge-fade ─────────────────────────────────────────────────────────
    const topFade = ctx.createLinearGradient(0, -charH, 0, -charH + charH * 0.08);
    topFade.addColorStop(0, 'rgba(0,0,0,0.7)');
    topFade.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = topFade;
    ctx.fillRect(-charW / 2, -charH, charW, charH * 0.08);

    // ── Attack rim light ──────────────────────────────────────────────────────
    if (f.state.includes('ATTACK') || f.state === 'SPECIAL_1' || f.state === 'SPECIAL_2' || f.state === 'ULTIMATE') {
      const rimGrad = ctx.createLinearGradient(charW * 0.2, -charH, charW * 0.5, 0);
      rimGrad.addColorStop(0, f.charDef.reiatsuColor + 'aa');
      rimGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = rimGrad;
      ctx.fillRect(-charW / 2, -charH, charW, charH);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  // ── Fallback silhouette when image not loaded ───────────────────────────────
  private renderFallback(
    ctx: CanvasRenderingContext2D,
    f: Fighter,
    charW: number,
    charH: number
  ): void {
    ctx.save();
    ctx.translate(f.x, f.y);
    if (f.facing < 0) ctx.scale(-1, 1);

    // Body gradient
    const bodyGrad = ctx.createLinearGradient(-charW / 2, -charH, charW / 2, 0);
    bodyGrad.addColorStop(0, f.charDef.themeColor + 'dd');
    bodyGrad.addColorStop(0.5, f.charDef.secondaryColor + 'aa');
    bodyGrad.addColorStop(1, '#00000000');
    ctx.fillStyle = bodyGrad;
    ctx.shadowColor = f.charDef.reiatsuColor;
    ctx.shadowBlur  = 20;

    // Head
    ctx.beginPath();
    ctx.ellipse(0, -charH + charH * 0.12, charW * 0.2, charH * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    // Torso
    ctx.fillRect(-charW * 0.28, -charH + charH * 0.26, charW * 0.56, charH * 0.42);
    // Left leg
    ctx.fillRect(-charW * 0.25, -charH + charH * 0.68, charW * 0.2, charH * 0.32);
    // Right leg
    ctx.fillRect(charW * 0.05, -charH + charH * 0.68, charW * 0.2, charH * 0.32);

    // Name
    ctx.shadowBlur  = 0;
    ctx.fillStyle   = '#ffffff';
    ctx.font        = `bold 16px "Impact", sans-serif`;
    ctx.textAlign   = 'center';
    ctx.fillText(f.charDef.name.split(' ')[0].toUpperCase(), 0, -charH - 10);

    ctx.restore();
  }

  // ── Ground oval shadow ───────────────────────────────────────────────────────
  private renderGroundShadow(ctx: CanvasRenderingContext2D, f: Fighter, charW: number): void {
    const airRatio = f.isGrounded ? 1.0 : Math.max(0.3, 1 - Math.abs(f.y - f.groundY) / 350);
    const alpha    = 0.55 * airRatio;
    const grad     = ctx.createRadialGradient(f.x, f.groundY + 6, 0, f.x, f.groundY + 6, charW * 0.65 * airRatio);
    grad.addColorStop(0, `rgba(0,0,0,${alpha})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(f.x, f.groundY + 6, charW * 0.65 * airRatio, 18 * airRatio, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── Awakening aura orbit ─────────────────────────────────────────────────────
  private renderAwakeningAura(ctx: CanvasRenderingContext2D, f: Fighter): void {
    const t = this.tick;
    ctx.save();
    for (let i = 0; i < 7; i++) {
      const a  = (t * 0.045 + (i * Math.PI * 2) / 7);
      const px = f.x + Math.cos(a) * 65;
      const py = (f.y - CHAR_HEIGHT * (CHAR_SCALE[f.charDef.id] ?? 1) * 0.5)
               + Math.sin(a) * 40;
      ctx.globalAlpha = 0.25 + Math.sin(t * 0.1 + i * 1.2) * 0.18;
      ctx.shadowColor = f.charDef.reiatsuColor;
      ctx.shadowBlur  = 12;
      ctx.fillStyle   = f.charDef.reiatsuColor;
      ctx.beginPath();
      ctx.arc(px, py, 5 + Math.sin(t * 0.08 + i) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    // Ground ring
    ctx.globalAlpha  = 0.3 + Math.sin(t * 0.08) * 0.12;
    ctx.strokeStyle  = f.charDef.reiatsuColor;
    ctx.lineWidth    = 2.5;
    ctx.shadowColor  = f.charDef.reiatsuColor;
    ctx.shadowBlur   = 14;
    ctx.beginPath();
    ctx.ellipse(f.x, f.groundY, 90 + Math.sin(t * 0.06) * 12, 18, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.shadowBlur  = 0;
    ctx.restore();
  }

  // ── Hit white flash ──────────────────────────────────────────────────────────
  private renderHitFlash(
    ctx: CanvasRenderingContext2D,
    f: Fighter,
    charW: number,
    charH: number
  ): void {
    const alpha = Math.min(0.65, f.hitstun / 18);
    ctx.save();
    ctx.translate(f.x, f.y);
    if (f.facing < 0) ctx.scale(-1, 1);
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle   = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, -charH * 0.5, charW * 0.4, charH * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  // ── Hit spark lines ──────────────────────────────────────────────────────────
  private renderHitSpark(ctx: CanvasRenderingContext2D, f: Fighter): void {
    ctx.save();
    ctx.strokeStyle = '#ffee00';
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur  = 18;
    ctx.lineWidth   = 3;
    const cx = f.x + (f.facing > 0 ? 50 : -50);
    const cy = f.y - CHAR_HEIGHT * (CHAR_SCALE[f.charDef.id] ?? 1) * 0.55;
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 + this.tick * 0.1;
      const len   = 18 + (i % 3) * 10;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * 5, cy + Math.sin(angle) * 5);
      ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // ── Block reiatsu shield ─────────────────────────────────────────────────────
  private renderBlockShield(ctx: CanvasRenderingContext2D, f: Fighter): void {
    const charH  = CHAR_HEIGHT * (CHAR_SCALE[f.charDef.id] ?? 1);
    const cx     = f.facing > 0 ? f.x + 55 : f.x - 55;
    const cy     = f.y - charH * 0.5;
    const pulseR = 70 + Math.sin(this.tick * 0.3) * 9;
    ctx.save();
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseR);
    grad.addColorStop(0, f.charDef.reiatsuColor + '88');
    grad.addColorStop(0.6, f.charDef.reiatsuColor + '33');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle   = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = f.charDef.reiatsuColor;
    ctx.lineWidth   = 2.5;
    ctx.shadowColor = f.charDef.reiatsuColor;
    ctx.shadowBlur  = 14;
    ctx.globalAlpha = 0.7 + Math.sin(this.tick * 0.2) * 0.3;
    ctx.stroke();
    ctx.shadowBlur  = 0;
    ctx.restore();
  }
}

export const spriteRenderer = new SpriteRenderer();
