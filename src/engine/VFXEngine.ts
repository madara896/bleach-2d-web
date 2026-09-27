// Bleach 2D Web Game: Visual Effects & Particle Engine
import type { Particle, Projectile } from '../types';

export interface SlashTrail {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface Afterimage {
  x: number;
  y: number;
  facing: number;
  color: string;
  alpha: number;
  life: number;
  renderCallback: (ctx: CanvasRenderingContext2D, x: number, y: number, facing: number, alpha: number) => void;
}

export interface CutInBanner {
  characterName: string;
  moveName: string;
  quote: string;
  color: string;
  life: number;
  maxLife: number;
}

export class VFXEngine {
  private particles: Particle[] = [];
  private slashTrails: SlashTrail[] = [];
  private afterimages: Afterimage[] = [];
  public projectiles: Projectile[] = [];
  public activeCutIn: CutInBanner | null = null;
  public flashColor: string | null = null;
  public flashAlpha: number = 0;

  public update(): void {
    // 1. Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.rotation !== undefined && p.rotationSpeed) {
        p.rotation += p.rotationSpeed;
      }
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 2. Update slash trails
    for (let i = this.slashTrails.length - 1; i >= 0; i--) {
      const trail = this.slashTrails[i];
      trail.life--;
      trail.alpha = Math.max(0, trail.life / trail.maxLife);
      if (trail.life <= 0) {
        this.slashTrails.splice(i, 1);
      }
    }

    // 3. Update afterimages
    for (let i = this.afterimages.length - 1; i >= 0; i--) {
      const img = this.afterimages[i];
      img.life--;
      img.alpha = Math.max(0, img.life / 16);
      if (img.life <= 0) {
        this.afterimages.splice(i, 1);
      }
    }

    // 4. Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx;
      proj.y += proj.vy;
      proj.duration--;

      // Spawn projectile particle trail
      if (Math.random() < 0.6) {
        this.spawnReiatsuSpark(
          proj.x + (Math.random() - 0.5) * proj.width,
          proj.y + (Math.random() - 0.5) * proj.height,
          proj.color
        );
      }

      if (proj.duration <= 0) {
        this.spawnExplosion(proj.x, proj.y, proj.color, 16);
        this.projectiles.splice(i, 1);
      }
    }

    // 5. Update Cut-In
    if (this.activeCutIn) {
      this.activeCutIn.life--;
      if (this.activeCutIn.life <= 0) {
        this.activeCutIn = null;
      }
    }

    // 6. Update Screen Flash
    if (this.flashAlpha > 0) {
      this.flashAlpha = Math.max(0, this.flashAlpha - 0.06);
      if (this.flashAlpha === 0) {
        this.flashColor = null;
      }
    }
  }

  // --- Particle Spawners ---

  public spawnReiatsuAura(x: number, y: number, color: string, intensity: number = 1): void {
    const count = Math.floor(2 * intensity);
    for (let i = 0; i < count; i++) {
      const p: Particle = {
        x: x + (Math.random() - 0.5) * 44,
        y: y - 10 + Math.random() * 50,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -2.5 - Math.random() * 3.5,
        size: 3 + Math.random() * 7,
        maxLife: 24 + Math.random() * 16,
        life: 24 + Math.random() * 16,
        color: color,
        alpha: 0.8,
        shape: 'flame'
      };
      this.particles.push(p);
    }
  }

  public spawnReiatsuSpark(x: number, y: number, color: string): void {
    this.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      size: 2 + Math.random() * 3,
      maxLife: 15,
      life: 15,
      color,
      alpha: 1.0,
      shape: 'spark'
    });
  }

  public spawnHitSparks(x: number, y: number, color: string = '#ffe066', count: number = 12): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 7;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 4,
        maxLife: 14 + Math.random() * 10,
        life: 14 + Math.random() * 10,
        color,
        alpha: 1.0,
        shape: 'spark'
      });
    }
  }

  public spawnBladeClash(x: number, y: number): void {
    // Dramatic golden/white clash burst
    this.spawnHitSparks(x, y, '#ffffff', 20);
    this.spawnHitSparks(x, y, '#ffcc00', 16);
    this.spawnHitSparks(x, y, '#00e5ff', 12);

    // Shockwave ring
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      this.particles.push({
        x: x + Math.cos(angle) * 10,
        y: y + Math.sin(angle) * 10,
        vx: Math.cos(angle) * 8,
        vy: Math.sin(angle) * 8,
        size: 3,
        maxLife: 12,
        life: 12,
        color: '#ffffff',
        alpha: 1.0,
        shape: 'circle'
      });
    }
  }

  public spawnExplosion(x: number, y: number, color: string, count: number = 24): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 4 + Math.random() * 8,
        maxLife: 20 + Math.random() * 15,
        life: 20 + Math.random() * 15,
        color,
        alpha: 0.9,
        shape: 'circle'
      });
    }
  }

  public addSlashTrail(trail: SlashTrail): void {
    this.slashTrails.push(trail);
  }

  public addAfterimage(afterimage: Afterimage): void {
    this.afterimages.push(afterimage);
  }

  public triggerScreenFlash(color: string = '#ffffff', alpha: number = 0.85): void {
    this.flashColor = color;
    this.flashAlpha = alpha;
  }

  public triggerCutIn(characterName: string, moveName: string, quote: string, color: string): void {
    this.activeCutIn = {
      characterName,
      moveName,
      quote,
      color,
      life: 65,
      maxLife: 65
    };
    this.triggerScreenFlash(color, 0.45);
  }

  // --- World Render Pass ---

  public renderWorld(ctx: CanvasRenderingContext2D): void {
    // 1. Render Afterimages
    ctx.save();
    for (const img of this.afterimages) {
      img.renderCallback(ctx, img.x, img.y, img.facing, img.alpha);
    }
    ctx.restore();

    // 2. Render Slash Trails
    ctx.save();
    for (const trail of this.slashTrails) {
      if (trail.points.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(trail.points[0].x, trail.points[0].y);
      for (let i = 1; i < trail.points.length; i++) {
        ctx.lineTo(trail.points[i].x, trail.points[i].y);
      }
      ctx.strokeStyle = trail.color;
      ctx.lineWidth = trail.width;
      ctx.lineCap = 'round';
      ctx.globalAlpha = trail.alpha * 0.8;
      ctx.shadowColor = trail.color;
      ctx.shadowBlur = 12;
      ctx.stroke();
    }
    ctx.restore();

    // 3. Render Projectiles
    ctx.save();
    for (const proj of this.projectiles) {
      this.renderProjectile(ctx, proj);
    }
    ctx.restore();

    // 4. Render Particles
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = p.shape === 'flame' ? 10 : 6;

      if (p.shape === 'circle' || p.shape === 'flame') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'spark') {
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size * 2, p.size * 0.6, Math.atan2(p.vy, p.vx), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  private renderProjectile(ctx: CanvasRenderingContext2D, proj: Projectile): void {
    ctx.save();
    ctx.translate(proj.x, proj.y);
    const dir = proj.vx >= 0 ? 1 : -1;
    ctx.scale(dir, 1);

    if (proj.type === 'getsuga') {
      // Crescent blade wave of pure Reiatsu
      const gradient = ctx.createLinearGradient(-proj.width / 2, 0, proj.width / 2, 0);
      gradient.addColorStop(0, proj.color);
      gradient.addColorStop(0.5, proj.secondaryColor);
      gradient.addColorStop(1, '#ffffff');

      ctx.shadowColor = proj.secondaryColor;
      ctx.shadowBlur = 18;
      ctx.fillStyle = gradient;

      ctx.beginPath();
      ctx.moveTo(proj.width / 2, 0);
      ctx.quadraticCurveTo(0, -proj.height / 2, -proj.width / 2, -proj.height * 0.4);
      ctx.quadraticCurveTo(-proj.width * 0.2, 0, -proj.width / 2, proj.height * 0.4);
      ctx.quadraticCurveTo(0, proj.height / 2, proj.width / 2, 0);
      ctx.fill();

      // Energy core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(proj.width * 0.25, 0, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (proj.type === 'cero') {
      // Massive laser blast
      ctx.shadowColor = proj.color;
      ctx.shadowBlur = 24;

      // Outer beam
      ctx.fillStyle = proj.color;
      ctx.beginPath();
      ctx.roundRect(-proj.width / 2, -proj.height / 2, proj.width, proj.height, 12);
      ctx.fill();

      // Inner white beam core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(-proj.width / 2 + 5, -proj.height * 0.25, proj.width - 10, proj.height * 0.5, 8);
      ctx.fill();
    } else if (proj.type === 'arrow') {
      // Quincy Heilig Pfeil glowing spirit arrow
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.shadowColor = proj.color;
      ctx.shadowBlur = 14;

      ctx.beginPath();
      ctx.moveTo(-proj.width / 2, 0);
      ctx.lineTo(proj.width / 2, 0);
      ctx.stroke();

      // Arrowhead
      ctx.fillStyle = proj.color;
      ctx.beginPath();
      ctx.moveTo(proj.width / 2, 0);
      ctx.lineTo(proj.width / 2 - 12, -7);
      ctx.lineTo(proj.width / 2 - 8, 0);
      ctx.lineTo(proj.width / 2 - 12, 7);
      ctx.closePath();
      ctx.fill();
    } else if (proj.type === 'lanza') {
      // Lanza del Relámpago (javelin of emerald lightning)
      ctx.strokeStyle = proj.color;
      ctx.lineWidth = 4;
      ctx.shadowColor = '#00ff66';
      ctx.shadowBlur = 20;

      ctx.beginPath();
      ctx.moveTo(-proj.width / 2, 0);
      ctx.lineTo(proj.width / 2, 0);
      ctx.stroke();

      // Dual lightning heads
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(proj.width / 2, 0, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (proj.type === 'kurohitsugi') {
      // Black coffin obelisk
      ctx.fillStyle = 'rgba(10, 5, 20, 0.95)';
      ctx.strokeStyle = proj.color;
      ctx.lineWidth = 4;
      ctx.shadowColor = proj.color;
      ctx.shadowBlur = 20;

      ctx.beginPath();
      ctx.rect(-proj.width / 2, -proj.height, proj.width, proj.height);
      ctx.fill();
      ctx.stroke();

      // Spires penetrating
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 2;
      for (let s = -proj.height * 0.8; s < 0; s += 24) {
        ctx.beginPath();
        ctx.moveTo(-proj.width / 2 - 15, s);
        ctx.lineTo(proj.width / 2 + 15, s);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // --- Screen / HUD Render Pass (Overlays & Cut-Ins) ---

  public renderScreenOverlay(ctx: CanvasRenderingContext2D, screenWidth: number, screenHeight: number): void {
    // 1. Screen Flash
    if (this.flashColor && this.flashAlpha > 0) {
      ctx.save();
      ctx.fillStyle = this.flashColor;
      ctx.globalAlpha = this.flashAlpha;
      ctx.fillRect(0, 0, screenWidth, screenHeight);
      ctx.restore();
    }

    // 2. Anime Cut-In Splash Banner
    if (this.activeCutIn) {
      ctx.save();
      const progress = 1 - (this.activeCutIn.life / this.activeCutIn.maxLife);
      const bannerHeight = 150;
      const centerY = screenHeight * 0.42;

      // Darkened background bars with slash angle
      ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
      ctx.fillRect(0, centerY - bannerHeight / 2, screenWidth, bannerHeight);

      // Colored energy stripes
      ctx.fillStyle = this.activeCutIn.color;
      ctx.fillRect(0, centerY - bannerHeight / 2, screenWidth, 6);
      ctx.fillRect(0, centerY + bannerHeight / 2 - 6, screenWidth, 6);

      // Speed lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 18; i++) {
        const lineY = centerY - bannerHeight / 2 + (i / 18) * bannerHeight;
        const lineSpeed = (progress * screenWidth * 2 + i * 85) % screenWidth;
        ctx.beginPath();
        ctx.moveTo(lineSpeed - 80, lineY);
        ctx.lineTo(lineSpeed + 120, lineY);
        ctx.stroke();
      }

      // Character & Move typography
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      // Glow effect
      ctx.shadowColor = this.activeCutIn.color;
      ctx.shadowBlur = 20;

      // Character name
      ctx.font = '900 36px "Segoe UI", Impact, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(this.activeCutIn.characterName.toUpperCase(), 80, centerY - 28);

      // Move name in color
      ctx.font = 'italic 700 28px "Segoe UI", sans-serif';
      ctx.fillStyle = this.activeCutIn.color;
      ctx.fillText(`【 ${this.activeCutIn.moveName} 】`, 80, centerY + 12);

      // Quote banner
      ctx.font = '500 16px "Segoe UI", serif';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(`"${this.activeCutIn.quote}"`, 85, centerY + 42);

      ctx.restore();
    }
  }

  public clear(): void {
    this.particles = [];
    this.slashTrails = [];
    this.afterimages = [];
    this.projectiles = [];
    this.activeCutIn = null;
    this.flashColor = null;
    this.flashAlpha = 0;
  }
}
