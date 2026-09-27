// Bleach AAA Rebuild: Dynamic Lighting System
// Simulates point lights, rim lighting, and additive energy blending on Canvas2D

import type { Fighter } from '../combat/Fighter';

export interface LightSource {
  x: number;
  y: number;
  radius: number;
  color: string;
  intensity: number; // 0..1
  life: number;
  maxLife: number;
}

export class LightingSystem {
  private lights: LightSource[] = [];
  private tick: number = 0;

  public update(): void {
    this.tick++;
    for (let i = this.lights.length - 1; i >= 0; i--) {
      this.lights[i].life--;
      if (this.lights[i].life <= 0) this.lights.splice(i, 1);
    }
  }

  public spawnImpactLight(x: number, y: number, color: string): void {
    this.lights.push({ x, y, radius: 180, color, intensity: 1.0, life: 18, maxLife: 18 });
  }

  public spawnReiatsuLight(x: number, y: number, color: string, radius: number): void {
    this.lights.push({ x, y, radius, color, intensity: 0.5, life: 10, maxLife: 10 });
  }

  /** Render all environmental lighting effects as additive overlays */
  public renderLighting(
    ctx: CanvasRenderingContext2D,
    p1: Fighter,
    p2: Fighter
  ): void {
    ctx.save();

    // Fighter persistent auras (awakening glow)
    this.renderFighterAura(ctx, p1);
    this.renderFighterAura(ctx, p2);

    // Dynamic impact lights
    for (const light of this.lights) {
      const t = light.life / light.maxLife;
      const alpha = t * light.intensity * 0.45;
      const grad = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, light.radius * (2 - t));
      grad.addColorStop(0, this.colorWithAlpha(light.color, alpha));
      grad.addColorStop(0.4, this.colorWithAlpha(light.color, alpha * 0.4));
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(light.x, light.y, light.radius * (2 - t), light.radius * 0.8 * (2 - t), 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  private renderFighterAura(ctx: CanvasRenderingContext2D, f: Fighter): void {
    if (!f.isAwakened && f.reiatsu < 150) return;

    const intensity = f.isAwakened ? 1.0 : (f.reiatsu / 300) * 0.5;
    const pulseAmt = Math.sin(this.tick * 0.08) * 0.15;
    const radius = (f.isAwakened ? 200 : 120) * (1 + pulseAmt);
    const auraY = f.y - f.height * 0.35;

    const grad = ctx.createRadialGradient(f.x, auraY, 0, f.x, auraY, radius);
    grad.addColorStop(0, this.colorWithAlpha(f.charDef.reiatsuColor, intensity * 0.35));
    grad.addColorStop(0.5, this.colorWithAlpha(f.charDef.reiatsuColor, intensity * 0.15));
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(f.x, auraY, radius, radius * 1.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  /** Render a cinematic vignette + darkness overlay */
  public renderVignette(ctx: CanvasRenderingContext2D, w: number, h: number, intensity: number = 0.55): void {
    const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.85);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, `rgba(0,0,0,${intensity})`);
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  /** Render a hit flash (white overlay) */
  public renderHitFlash(ctx: CanvasRenderingContext2D, w: number, h: number, alpha: number): void {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  private colorWithAlpha(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
}

export const lighting = new LightingSystem();
