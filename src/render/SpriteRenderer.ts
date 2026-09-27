// Bleach AAA Rebuild: Sprite-Based Fighter Renderer
// Replaces AnimeRenderer — draws real character artwork with Mortal Kombat-style close-up framing

import type { Fighter } from '../combat/Fighter';
import { spriteLoader, CHARACTER_SPRITE_MAP } from '../engine/SpriteLoader';
import { lighting } from '../engine/LightingSystem';

// How many canvas units tall each character should appear (MK-style close framing)
const CHAR_HEIGHT_PX = 440; // ~70% of 720px canvas = Mortal Kombat scale

// Per-character scale tweaks to make proportions look right
const CHAR_SCALE_OVERRIDES: Record<string, number> = {
  ichigo:         1.00,
  ulquiorra:      0.95,
  aizen:          1.05,
  yhwach:         1.10,
  white_zangetsu: 1.00,
  byakuya:        0.98,
  kenpachi:       1.12,
  grimmjow:       1.00,
  rukia:          0.88,
  hitsugaya:      0.85,
  uryu:           0.95,
  orihime:        0.90,
};

export class SpriteRenderer {
  private tick: number = 0;

  public renderFighter(ctx: CanvasRenderingContext2D, fighter: Fighter): void {
    this.tick++;
    const img = spriteLoader.get(CHARACTER_SPRITE_MAP[fighter.charDef.id] ?? '');

    // Ground shadow
    this.renderGroundShadow(ctx, fighter);

    // Awakening reiatsu aura rings
    if (fighter.isAwakened) {
      this.renderAwakeningAura(ctx, fighter);
    }

    if (img && img.width > 0) {
      this.renderSprite(ctx, img, fighter);
    } else {
      // Fallback: render a stylized silhouette if image isn't loaded
      this.renderFallbackSilhouette(ctx, fighter);
    }

    // Hit flash overlay on the character
    if (fighter.hitstun > 0) {
      this.renderHitFlashOnCharacter(ctx, fighter);
    }

    // Block shield
    if (fighter.state === 'BLOCK') {
      this.renderBlockShield(ctx, fighter);
    }

    // Combo hit effect
    if (fighter.state === 'HURT' && fighter.hitstun > 8) {
      this.renderHitSpark(ctx, fighter);
    }

  }

  private renderSprite(ctx: CanvasRenderingContext2D, img: HTMLImageElement, f: Fighter): void {
    const scale = CHAR_SCALE_OVERRIDES[f.charDef.id] ?? 1.0;
    const charH = CHAR_HEIGHT_PX * scale;
    const aspect = img.width / img.height;
    const charW = charH * aspect;

    // Draw position: centered horizontally, feet at groundY
    const drawX = f.x - charW / 2;
    const drawY = f.y - charH;

    ctx.save();

    // Flip for facing direction
    if (f.facing < 0) {
      ctx.translate(f.x * 2, 0);
      ctx.scale(-1, 1);
    }

    // Idle breathing bob
    const breath = f.state === 'IDLE'
      ? Math.sin(this.tick * 0.07) * 3
      : 0;

    // Jump/fall offset
    const airOffset = f.isGrounded ? 0 : (f.y - f.groundY) * 0.5;

    // Awakened pulse scale
    const awakenPulse = f.isAwakened
      ? 1 + Math.sin(this.tick * 0.12) * 0.015
      : 1.0;

    // Attack lean/stretch
    let attackScaleX = 1.0;
    let attackScaleY = 1.0;
    if (f.state === 'LIGHT_ATTACK') { attackScaleX = 1.08; attackScaleY = 0.95; }
    if (f.state === 'HEAVY_ATTACK') { attackScaleX = 1.18; attackScaleY = 0.92; }
    if (f.state === 'HURT')         { attackScaleX = 0.9;  attackScaleY = 1.1;  }

    ctx.translate(f.x, f.y + breath + airOffset);
    ctx.scale(awakenPulse * attackScaleX, awakenPulse * attackScaleY);

    // Glow filter for awakened via shadow
    if (f.isAwakened) {
      ctx.shadowColor = f.charDef.reiatsuColor;
      ctx.shadowBlur = 28;
    } else if (f.reiatsu > 150) {
      ctx.shadowColor = f.charDef.reiatsuColor;
      ctx.shadowBlur = 10;
    }

    // Draw the character sprite
    ctx.drawImage(img, -charW / 2, -charH, charW, charH);

    ctx.shadowBlur = 0;
    ctx.restore();

    // Rim light on active attacker
    if (f.state.includes('ATTACK') || f.state === 'SPECIAL_1' || f.state === 'SPECIAL_2') {
      this.renderRimLight(ctx, f, charW, charH);
    }
  }

  private renderFallbackSilhouette(ctx: CanvasRenderingContext2D, f: Fighter): void {
    const charH = CHAR_HEIGHT_PX * (CHAR_SCALE_OVERRIDES[f.charDef.id] ?? 1.0);
    const charW = charH * 0.45;
    const drawX = f.x - charW / 2;
    const drawY = f.y - charH;

    ctx.save();
    if (f.facing < 0) {
      ctx.translate(f.x * 2, 0);
      ctx.scale(-1, 1);
    }
    ctx.shadowColor = f.charDef.reiatsuColor;
    ctx.shadowBlur = 20;

    // Gradient silhouette body
    const bodyGrad = ctx.createLinearGradient(drawX, drawY, drawX + charW, drawY + charH);
    bodyGrad.addColorStop(0, f.charDef.themeColor);
    bodyGrad.addColorStop(0.5, f.charDef.secondaryColor);
    bodyGrad.addColorStop(1, '#000000');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(drawX + charW * 0.15, drawY, charW * 0.7, charH * 0.28, 12);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(drawX + charW * 0.05, drawY + charH * 0.25, charW * 0.9, charH * 0.5, 6);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(drawX + charW * 0.12, drawY + charH * 0.72, charW * 0.3, charH * 0.28, 4);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(drawX + charW * 0.58, drawY + charH * 0.72, charW * 0.3, charH * 0.28, 4);
    ctx.fill();

    // Character name label on fallback
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(f.charDef.name.split(' ')[0], f.x, drawY - 8);

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  private renderGroundShadow(ctx: CanvasRenderingContext2D, f: Fighter): void {
    const alpha = f.isGrounded ? 0.45 : 0.2;
    const scaleW = f.isGrounded ? 1.0 : Math.max(0.4, 1 - Math.abs(f.y - f.groundY) / 400);
    const grad = ctx.createRadialGradient(f.x, f.groundY, 0, f.x, f.groundY, 90 * scaleW);
    grad.addColorStop(0, `rgba(0,0,0,${alpha})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(f.x, f.groundY + 4, 90 * scaleW, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private renderAwakeningAura(ctx: CanvasRenderingContext2D, f: Fighter): void {
    const t = this.tick;
    ctx.save();

    // Inner rising reiatsu wisps
    for (let i = 0; i < 6; i++) {
      const angle = (t * 0.05 + (i * Math.PI * 2) / 6);
      const dist = 55 + Math.sin(t * 0.1 + i) * 25;
      const px = f.x + Math.cos(angle) * dist * 0.6;
      const py = (f.y - 180) + Math.sin(angle) * dist * 0.4;
      const alpha = 0.3 + Math.sin(t * 0.1 + i * 1.3) * 0.2;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = f.charDef.reiatsuColor;
      ctx.shadowColor = f.charDef.reiatsuColor;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(px, py, 6 + Math.sin(t * 0.07 + i) * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ground reiatsu ring
    ctx.globalAlpha = 0.25 + Math.sin(t * 0.08) * 0.15;
    ctx.strokeStyle = f.charDef.reiatsuColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = f.charDef.reiatsuColor;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.ellipse(f.x, f.groundY, 100 + Math.sin(t * 0.06) * 15, 20, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  private renderRimLight(ctx: CanvasRenderingContext2D, f: Fighter, charW: number, charH: number): void {
    ctx.save();
    const grad = ctx.createLinearGradient(
      f.facing > 0 ? f.x + charW * 0.3 : f.x - charW * 0.3,
      f.y - charH,
      f.facing > 0 ? f.x + charW * 0.5 : f.x - charW * 0.5,
      f.y
    );
    grad.addColorStop(0, f.charDef.reiatsuColor + 'cc');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = grad;
    ctx.fillRect(
      f.x - charW * 0.5,
      f.y - charH,
      charW,
      charH
    );
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  private renderHitFlashOnCharacter(ctx: CanvasRenderingContext2D, f: Fighter): void {
    const alpha = Math.min(0.7, f.hitstun / 20);
    const charH = CHAR_HEIGHT_PX * (CHAR_SCALE_OVERRIDES[f.charDef.id] ?? 1.0);
    const charW = charH * 0.5;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(f.x, f.y - charH * 0.5, charW * 0.5, charH * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  private renderHitSpark(ctx: CanvasRenderingContext2D, f: Fighter): void {
    ctx.save();
    ctx.strokeStyle = '#ffff00';
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 20;
    ctx.lineWidth = 3;
    const cx = f.x;
    const cy = f.y - 200;
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const len = 20 + Math.random() * 20;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * 5, cy + Math.sin(angle) * 5);
      ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  private renderBlockShield(ctx: CanvasRenderingContext2D, f: Fighter): void {
    ctx.save();
    const cx = f.facing > 0 ? f.x + 50 : f.x - 50;
    const cy = f.y - 200;
    const pulseR = 75 + Math.sin(this.tick * 0.3) * 8;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseR);
    grad.addColorStop(0, `${f.charDef.reiatsuColor}88`);
    grad.addColorStop(0.6, `${f.charDef.reiatsuColor}33`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = f.charDef.reiatsuColor;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = f.charDef.reiatsuColor;
    ctx.shadowBlur = 12;
    ctx.globalAlpha = 0.7 + Math.sin(this.tick * 0.2) * 0.3;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

export const spriteRenderer = new SpriteRenderer();
