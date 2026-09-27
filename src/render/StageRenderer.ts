// Bleach AAA Rebuild: Cinematic Stage Renderer with Photo-Based Backgrounds
// Renders real stage artwork from /sprites/ with parallax, depth of field, and dynamic lighting

import type { StageDefinition } from '../types';
import { spriteLoader, STAGE_SPRITE_MAP } from '../engine/SpriteLoader';

export class StageRenderer {
  private tick: number = 0;

  public render(
    ctx: CanvasRenderingContext2D,
    stage: StageDefinition,
    cameraX: number,
    cameraY: number
  ): void {
    this.tick++;

    const bg = spriteLoader.get(STAGE_SPRITE_MAP[stage.visualTheme] ?? '');

    if (bg && bg.width > 0) {
      this.renderPhotoBackground(ctx, bg, stage, cameraX);
    } else {
      this.renderFallbackBackground(ctx, stage, cameraX);
    }

    // Ground / arena platform
    this.renderGround(ctx, stage);

    // Stage-specific atmospheric effects
    this.renderAtmosphericFX(ctx, stage, cameraX);
  }

  /** Render AI-generated stage image with parallax scrolling */
  private renderPhotoBackground(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    stage: StageDefinition,
    cameraX: number
  ): void {
    const sw = stage.width;
    const sh = stage.height;

    // Parallax: background moves at 30% of camera speed
    const bgOffsetX = -cameraX * 0.3;

    // Scale image to cover full stage height
    const aspect = img.width / img.height;
    const drawH = sh;
    const drawW = drawH * aspect * 1.15; // slightly wider than stage for parallax room

    const drawX = (sw - drawW) / 2 + bgOffsetX;

    ctx.save();
    ctx.drawImage(img, drawX, 0, drawW, drawH);

    // Atmospheric depth gradient overlay (darken top, lighter near ground)
    const depthGrad = ctx.createLinearGradient(0, 0, 0, sh);
    depthGrad.addColorStop(0, 'rgba(0,0,0,0.35)');
    depthGrad.addColorStop(0.6, 'rgba(0,0,0,0.05)');
    depthGrad.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = depthGrad;
    ctx.fillRect(0, 0, sw, sh);

    ctx.restore();
  }

  /** Fallback gradient + drawn elements when image not yet loaded */
  private renderFallbackBackground(
    ctx: CanvasRenderingContext2D,
    stage: StageDefinition,
    cameraX: number
  ): void {
    const sw = stage.width;
    const sh = stage.height;

    const skyGrad = ctx.createLinearGradient(0, 0, 0, sh);
    skyGrad.addColorStop(0, stage.bgGradTop);
    skyGrad.addColorStop(1, stage.bgGradBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, sw, sh);

    // Themed backdrop drawing
    switch (stage.visualTheme) {
      case 'sokyoku': this.drawSokyokuFallback(ctx, stage, cameraX); break;
      case 'las_noches': this.drawLasNochesFallback(ctx, stage, cameraX); break;
      case 'silbern': this.drawSilbernFallback(ctx, stage, cameraX); break;
      case 'karakura': this.drawKarakuraFallback(ctx, stage, cameraX); break;
    }
  }

  /** Render scenic ground / arena floor */
  private renderGround(ctx: CanvasRenderingContext2D, stage: StageDefinition): void {
    const gy = stage.groundY;
    const sw = stage.width;
    const sh = stage.height;

    // Ground fill
    const groundGrad = ctx.createLinearGradient(0, gy, 0, sh);
    switch (stage.visualTheme) {
      case 'sokyoku':
        groundGrad.addColorStop(0, '#4a3010');
        groundGrad.addColorStop(1, '#1a0a00');
        break;
      case 'las_noches':
        groundGrad.addColorStop(0, '#e8e0c8');
        groundGrad.addColorStop(1, '#a09880');
        break;
      case 'silbern':
        groundGrad.addColorStop(0, '#c8d8e8');
        groundGrad.addColorStop(1, '#485868');
        break;
      default:
        groundGrad.addColorStop(0, '#1a2030');
        groundGrad.addColorStop(1, '#080c18');
    }
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, gy, sw, sh - gy);

    // Glowing ground line
    const lineColor = this.getStageLineColor(stage.visualTheme);
    ctx.save();
    ctx.shadowColor = lineColor;
    ctx.shadowBlur = 20;
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(sw, gy);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    // Ground tiles / reflections
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    for (let x = 0; x < sw; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, gy);
      ctx.lineTo(x, sh);
      ctx.stroke();
    }
    ctx.restore();

    // Ground reflection (mirror of lower portion of bg)
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.transform(1, 0, 0, -0.25, 0, gy * 1.25);
    ctx.fillStyle = lineColor + '33';
    ctx.fillRect(0, gy - 60, sw, 60);
    ctx.restore();
  }

  /** Atmospheric stage-specific particle / effect layers */
  private renderAtmosphericFX(
    ctx: CanvasRenderingContext2D,
    stage: StageDefinition,
    cameraX: number
  ): void {
    switch (stage.visualTheme) {
      case 'sokyoku':     this.renderSakuraParticles(ctx, stage, cameraX); break;
      case 'las_noches':  this.renderMoonlightBeams(ctx, stage); break;
      case 'silbern':     this.renderEtherealSnow(ctx, stage); break;
      case 'karakura':    this.renderNeonReflections(ctx, stage); break;
    }
  }

  // ─── Atmospheric Effects ───────────────────────────────────────────────────

  private renderSakuraParticles(ctx: CanvasRenderingContext2D, stage: StageDefinition, cameraX: number): void {
    const t = this.tick;
    ctx.save();
    for (let i = 0; i < 18; i++) {
      const phase = (i * 37.3 + t * 0.4) % stage.width;
      const y = (stage.groundY * 0.8 * ((Math.sin(i * 1.7) + 1) / 2)) + Math.sin(t * 0.05 + i * 0.9) * 30;
      const alpha = 0.3 + Math.sin(t * 0.07 + i) * 0.2;
      const size = 3 + (i % 4);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ffaad0';
      ctx.shadowColor = '#ff88bb';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.ellipse(phase, y, size, size * 0.6, t * 0.03 + i, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    ctx.restore();
  }

  private renderMoonlightBeams(ctx: CanvasRenderingContext2D, stage: StageDefinition): void {
    const t = this.tick;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) {
      const bx = 200 + i * 280 + Math.sin(t * 0.015 + i) * 40;
      const alpha = 0.03 + Math.sin(t * 0.02 + i * 1.1) * 0.01;
      const bGrad = ctx.createLinearGradient(bx, 0, bx + 60, stage.groundY);
      bGrad.addColorStop(0, `rgba(160,230,255,${alpha})`);
      bGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.moveTo(bx - 15, 0);
      ctx.lineTo(bx + 75, 0);
      ctx.lineTo(bx + 115, stage.groundY);
      ctx.lineTo(bx + 25, stage.groundY);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  private renderEtherealSnow(ctx: CanvasRenderingContext2D, stage: StageDefinition): void {
    const t = this.tick;
    ctx.save();
    for (let i = 0; i < 24; i++) {
      const x = ((i * 91 + t * 0.7) % stage.width);
      const y = ((i * 61 + t * 0.9) % stage.groundY);
      ctx.globalAlpha = 0.25 + Math.sin(t * 0.1 + i) * 0.15;
      ctx.fillStyle = '#c8e0ff';
      ctx.shadowColor = '#aaccff';
      ctx.shadowBlur = 3;
      ctx.beginPath();
      ctx.arc(x, y, 1.5 + (i % 3) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    ctx.restore();
  }

  private renderNeonReflections(ctx: CanvasRenderingContext2D, stage: StageDefinition): void {
    const t = this.tick;
    const colors = ['#ff0080', '#00ff88', '#0088ff', '#ffcc00'];
    ctx.save();
    ctx.globalAlpha = 0.08 + Math.sin(t * 0.05) * 0.03;
    for (let i = 0; i < 5; i++) {
      const x = 80 + i * 240;
      ctx.strokeStyle = colors[i % 4];
      ctx.lineWidth = 2;
      ctx.shadowColor = colors[i % 4];
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(x, stage.groundY - 140);
      ctx.lineTo(x, stage.groundY);
      ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    ctx.restore();
  }

  // ─── Fallback Backdrops ────────────────────────────────────────────────────

  private drawSokyokuFallback(ctx: CanvasRenderingContext2D, stage: StageDefinition, cameraX: number): void {
    const sw = stage.width; const sh = stage.height;
    // Torii gate silhouette
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#660000';
    ctx.fillRect(sw * 0.42, sh * 0.2, sw * 0.02, sh * 0.5);
    ctx.fillRect(sw * 0.56, sh * 0.2, sw * 0.02, sh * 0.5);
    ctx.fillRect(sw * 0.4, sh * 0.18, sw * 0.2, sh * 0.03);
    ctx.restore();
  }

  private drawLasNochesFallback(ctx: CanvasRenderingContext2D, stage: StageDefinition, cameraX: number): void {
    const sw = stage.width; const sh = stage.height;
    ctx.save(); ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 5; i++) {
      const px = 100 + i * 260;
      ctx.fillRect(px, sh * 0.05, 20, sh * 0.7);
    }
    ctx.restore();
  }

  private drawSilbernFallback(ctx: CanvasRenderingContext2D, stage: StageDefinition, cameraX: number): void {
    const sw = stage.width; const sh = stage.height;
    ctx.save(); ctx.globalAlpha = 0.2;
    ctx.strokeStyle = '#88aaff';
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
      const gx = 80 + i * 210;
      ctx.beginPath();
      ctx.moveTo(gx, sh * 0.7);
      ctx.lineTo(gx + 80, sh * 0.1);
      ctx.lineTo(gx + 160, sh * 0.7);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawKarakuraFallback(ctx: CanvasRenderingContext2D, stage: StageDefinition, cameraX: number): void {
    const sw = stage.width; const sh = stage.height;
    ctx.save(); ctx.globalAlpha = 0.4;
    for (let i = 0; i < 8; i++) {
      const bx = i * 170;
      const bh = 80 + (i % 3) * 60;
      ctx.fillStyle = `rgba(20,30,60,0.9)`;
      ctx.fillRect(bx, sh * 0.5 - bh, 140, bh);
    }
    ctx.restore();
  }

  private getStageLineColor(theme: string): string {
    switch (theme) {
      case 'sokyoku':   return '#ff8833';
      case 'las_noches': return '#88ffee';
      case 'silbern':   return '#aaccff';
      case 'karakura':  return '#ff44aa';
      default:          return '#38bdf8';
    }
  }
}
