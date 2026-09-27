// Bleach AAA Rebuild: Bankai Cinematic Fatality Sequencer
// Multi-phase cinematic sequences triggered when Ultimate connects on a KO'd opponent

import type { Fighter } from '../combat/Fighter';
import { lighting } from '../engine/LightingSystem';
import { audio } from '../engine/AudioEngine';

export type CinematicActionType =
  | 'black_bars'
  | 'screen_black'
  | 'flash'
  | 'text_slam'
  | 'particle_burst'
  | 'camera_zoom'
  | 'cut_in'
  | 'screen_shake'
  | 'fade_to_white'
  | 'kanji_burst';

export interface CinematicPhase {
  startFrame: number;
  endFrame: number;
  action: CinematicActionType;
  params: Record<string, unknown>;
}

export interface BankaiSequence {
  characterId: string;
  name: string;
  color: string;
  phases: CinematicPhase[];
  totalFrames: number;
}

// ─── Bankai / Ultimate Sequences ─────────────────────────────────────────────

const SEQUENCES: BankaiSequence[] = [
  {
    characterId: 'ichigo',
    name: 'MUGETSU',
    color: '#ff6600',
    totalFrames: 420,
    phases: [
      { startFrame: 0,   endFrame: 60,  action: 'black_bars',   params: { height: 80 } },
      { startFrame: 30,  endFrame: 80,  action: 'cut_in',       params: { text: 'ICHIGO KUROSAKI', sub: 'Final Getsuga Tensho' } },
      { startFrame: 80,  endFrame: 160, action: 'camera_zoom',  params: { zoom: 1.6 } },
      { startFrame: 150, endFrame: 200, action: 'screen_black', params: { alpha: 0.98 } },
      { startFrame: 200, endFrame: 240, action: 'flash',        params: { alpha: 1.0 } },
      { startFrame: 240, endFrame: 310, action: 'particle_burst', params: { color: '#ff6600', count: 120, label: 'getsuga' } },
      { startFrame: 310, endFrame: 370, action: 'kanji_burst',  params: { kanji: '無月', romaji: 'MUGETSU' } },
      { startFrame: 370, endFrame: 420, action: 'text_slam',    params: { text: 'MUGETSU', color: '#ff6600' } },
    ],
  },
  {
    characterId: 'ulquiorra',
    name: 'LANZA DEL RELÁMPAGO',
    color: '#00ff88',
    totalFrames: 380,
    phases: [
      { startFrame: 0,   endFrame: 50,  action: 'black_bars',   params: { height: 80 } },
      { startFrame: 20,  endFrame: 80,  action: 'cut_in',       params: { text: 'ULQUIORRA CIFER', sub: '4th Espada' } },
      { startFrame: 80,  endFrame: 160, action: 'camera_zoom',  params: { zoom: 1.5 } },
      { startFrame: 140, endFrame: 200, action: 'screen_black', params: { alpha: 0.85 } },
      { startFrame: 200, endFrame: 240, action: 'flash',        params: { alpha: 0.9 } },
      { startFrame: 240, endFrame: 310, action: 'particle_burst', params: { color: '#00ff88', count: 100, label: 'lanza' } },
      { startFrame: 310, endFrame: 380, action: 'text_slam',    params: { text: 'LANZA DEL RELÁMPAGO', color: '#00ff88' } },
    ],
  },
  {
    characterId: 'aizen',
    name: 'FRAGOR',
    color: '#cc44ff',
    totalFrames: 400,
    phases: [
      { startFrame: 0,   endFrame: 55,  action: 'black_bars',   params: { height: 80 } },
      { startFrame: 20,  endFrame: 80,  action: 'cut_in',       params: { text: 'SŌSUKE AIZEN', sub: 'Transcendent Being' } },
      { startFrame: 80,  endFrame: 180, action: 'camera_zoom',  params: { zoom: 1.4 } },
      { startFrame: 160, endFrame: 220, action: 'screen_black', params: { alpha: 0.95 } },
      { startFrame: 220, endFrame: 260, action: 'flash',        params: { alpha: 0.95 } },
      { startFrame: 260, endFrame: 330, action: 'particle_burst', params: { color: '#cc44ff', count: 100, label: 'fragor' } },
      { startFrame: 330, endFrame: 400, action: 'text_slam',    params: { text: 'FRAGOR', color: '#cc44ff' } },
    ],
  },
  {
    characterId: 'yhwach',
    name: 'AUSWÄHLEN',
    color: '#aaaaff',
    totalFrames: 390,
    phases: [
      { startFrame: 0,   endFrame: 50,  action: 'black_bars',   params: { height: 80 } },
      { startFrame: 20,  endFrame: 75,  action: 'cut_in',       params: { text: 'YHWACH', sub: 'The Almighty — Soul King' } },
      { startFrame: 75,  endFrame: 155, action: 'camera_zoom',  params: { zoom: 1.5 } },
      { startFrame: 140, endFrame: 200, action: 'screen_black', params: { alpha: 0.92 } },
      { startFrame: 200, endFrame: 240, action: 'flash',        params: { alpha: 0.85 } },
      { startFrame: 240, endFrame: 310, action: 'particle_burst', params: { color: '#aaaaff', count: 110, label: 'auswahlen' } },
      { startFrame: 310, endFrame: 390, action: 'text_slam',    params: { text: 'AUSWÄHLEN', color: '#aaaaff' } },
    ],
  },
  {
    characterId: 'byakuya',
    name: 'SENKEI',
    color: '#ffaacc',
    totalFrames: 380,
    phases: [
      { startFrame: 0,   endFrame: 50,  action: 'black_bars',   params: { height: 80 } },
      { startFrame: 20,  endFrame: 70,  action: 'cut_in',       params: { text: 'BYAKUYA KUCHIKI', sub: 'Bankai: Senbonzakura Kageyoshi' } },
      { startFrame: 70,  endFrame: 150, action: 'camera_zoom',  params: { zoom: 1.45 } },
      { startFrame: 130, endFrame: 190, action: 'screen_black', params: { alpha: 0.9 } },
      { startFrame: 190, endFrame: 230, action: 'flash',        params: { alpha: 0.85 } },
      { startFrame: 230, endFrame: 300, action: 'particle_burst', params: { color: '#ffaacc', count: 150, label: 'senkei' } },
      { startFrame: 300, endFrame: 380, action: 'text_slam',    params: { text: 'SENKEI', color: '#ffaacc' } },
    ],
  },
  {
    characterId: 'kenpachi',
    name: 'KENDO FINAL',
    color: '#ff2200',
    totalFrames: 350,
    phases: [
      { startFrame: 0,   endFrame: 40,  action: 'black_bars',   params: { height: 80 } },
      { startFrame: 15,  endFrame: 65,  action: 'cut_in',       params: { text: 'KENPACHI ZARAKI', sub: 'Bankai: Unnamed' } },
      { startFrame: 65,  endFrame: 140, action: 'camera_zoom',  params: { zoom: 1.6 } },
      { startFrame: 120, endFrame: 175, action: 'screen_black', params: { alpha: 0.97 } },
      { startFrame: 175, endFrame: 215, action: 'flash',        params: { alpha: 1.0 } },
      { startFrame: 215, endFrame: 280, action: 'particle_burst', params: { color: '#ff2200', count: 130, label: 'kendo' } },
      { startFrame: 280, endFrame: 350, action: 'text_slam',    params: { text: 'KENDO!!!', color: '#ff2200' } },
    ],
  },
  {
    characterId: 'grimmjow',
    name: 'DESGARRÓN',
    color: '#4499ff',
    totalFrames: 370,
    phases: [
      { startFrame: 0,   endFrame: 45,  action: 'black_bars',   params: { height: 80 } },
      { startFrame: 15,  endFrame: 70,  action: 'cut_in',       params: { text: 'GRIMMJOW JAEGERJAQUEZ', sub: '6th Espada — Pantera' } },
      { startFrame: 70,  endFrame: 150, action: 'camera_zoom',  params: { zoom: 1.5 } },
      { startFrame: 130, endFrame: 185, action: 'screen_black', params: { alpha: 0.9 } },
      { startFrame: 185, endFrame: 225, action: 'flash',        params: { alpha: 0.9 } },
      { startFrame: 225, endFrame: 295, action: 'particle_burst', params: { color: '#4499ff', count: 100, label: 'desgarron' } },
      { startFrame: 295, endFrame: 370, action: 'text_slam',    params: { text: 'DESGARRÓN', color: '#4499ff' } },
    ],
  },
  {
    characterId: 'white_zangetsu',
    name: 'KUROI GETSUGA',
    color: '#222222',
    totalFrames: 400,
    phases: [
      { startFrame: 0,   endFrame: 55,  action: 'black_bars',   params: { height: 80 } },
      { startFrame: 20,  endFrame: 80,  action: 'cut_in',       params: { text: 'WHITE ZANGETSU', sub: 'Hollow Ichigo — True Form' } },
      { startFrame: 80,  endFrame: 170, action: 'camera_zoom',  params: { zoom: 1.7 } },
      { startFrame: 150, endFrame: 210, action: 'screen_black', params: { alpha: 0.99 } },
      { startFrame: 210, endFrame: 250, action: 'flash',        params: { alpha: 1.0 } },
      { startFrame: 250, endFrame: 320, action: 'particle_burst', params: { color: '#cccccc', count: 130, label: 'kuroi' } },
      { startFrame: 320, endFrame: 400, action: 'text_slam',    params: { text: 'KUROI GETSUGA', color: '#aaaaaa' } },
    ],
  },
];

// ─── Cinematic State Machine ──────────────────────────────────────────────────

export interface CinematicState {
  active: boolean;
  frame: number;
  sequence: BankaiSequence;
  winner: Fighter;
  loser: Fighter;
  hitFlash: number;
  particles: CinematicParticle[];
  zoom: number;
  barHeight: number;
  textSlamScale: number;
  textSlamAlpha: number;
  cutInAlpha: number;
  screenBlackAlpha: number;
}

interface CinematicParticle {
  x: number; y: number;
  vx: number; vy: number;
  size: number; life: number; maxLife: number;
  color: string; angle: number;
}

export class BankaiCinematic {
  public state: CinematicState | null = null;

  public trigger(winner: Fighter, loser: Fighter): void {
    const seq = SEQUENCES.find(s => s.characterId === winner.charDef.id)
      ?? this.buildGenericSequence(winner);

    this.state = {
      active: true,
      frame: 0,
      sequence: seq,
      winner,
      loser,
      hitFlash: 0,
      particles: [],
      zoom: 1.0,
      barHeight: 0,
      textSlamScale: 8,
      textSlamAlpha: 0,
      cutInAlpha: 0,
      screenBlackAlpha: 0,
    };
    audio.playUltimate();
  }

  public isActive(): boolean {
    return this.state !== null && this.state.active;
  }

  public update(): boolean {
    if (!this.state) return false;
    const s = this.state;
    s.frame++;

    // Update particles
    for (let i = s.particles.length - 1; i >= 0; i--) {
      const p = s.particles[i];
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.18;
      p.vx *= 0.98;
      p.life--;
      if (p.life <= 0) s.particles.splice(i, 1);
    }

    // Apply phases
    s.zoom = 1.0;
    s.screenBlackAlpha = 0;
    s.hitFlash = Math.max(0, s.hitFlash - 0.05);

    for (const phase of s.sequence.phases) {
      if (s.frame < phase.startFrame || s.frame > phase.endFrame) continue;
      const t = (s.frame - phase.startFrame) / (phase.endFrame - phase.startFrame);

      switch (phase.action) {
        case 'black_bars':
          s.barHeight = Math.min((phase.params.height as number), s.barHeight + 4);
          break;
        case 'camera_zoom':
          s.zoom = 1.0 + (((phase.params.zoom as number) - 1.0) * Math.min(1, t * 2));
          break;
        case 'screen_black':
          s.screenBlackAlpha = (phase.params.alpha as number) * Math.min(1, t * 3);
          break;
        case 'flash':
          if (s.frame === phase.startFrame) {
            s.hitFlash = phase.params.alpha as number;
            audio.playSwordClash();
          }
          break;
        case 'particle_burst':
          if (s.frame === phase.startFrame) {
            this.spawnCinematicParticles(
              s,
              s.winner.x, s.winner.y - 120,
              phase.params.color as string,
              phase.params.count as number
            );
          }
          break;
        case 'text_slam':
          s.textSlamAlpha = Math.min(1, t * 3);
          s.textSlamScale = Math.max(1, 8 - t * 7);
          break;
        case 'cut_in':
          s.cutInAlpha = t < 0.5 ? t * 2 : (1 - t) * 2;
          break;
        case 'kanji_burst':
          s.textSlamAlpha = Math.min(1, t * 4);
          s.textSlamScale = Math.max(1, 5 - t * 4);
          break;
      }
    }

    if (s.frame >= s.sequence.totalFrames) {
      s.active = false;
      return true; // done
    }
    return false;
  }

  public render(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    if (!this.state || !this.state.active) return;
    const s = this.state;

    // Screen black
    if (s.screenBlackAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = s.screenBlackAlpha;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    // Hit flash
    if (s.hitFlash > 0) {
      lighting.renderHitFlash(ctx, w, h, s.hitFlash);
    }

    // Cinematic particles
    ctx.save();
    for (const p of s.particles) {
      const t = p.life / p.maxLife;
      ctx.globalAlpha = t;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.size * t, p.size * 0.3 * t, p.angle, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    // Cut-in portrait
    if (s.cutInAlpha > 0) {
      this.renderCutIn(ctx, w, h, s);
    }

    // Text slam
    this.renderActiveTextSlam(ctx, w, h, s);

    // Black bars (cinematic letterbox)
    if (s.barHeight > 0) {
      ctx.save();
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, s.barHeight);
      ctx.fillRect(0, h - s.barHeight, w, s.barHeight);
      ctx.restore();
    }
  }

  private renderCutIn(ctx: CanvasRenderingContext2D, w: number, h: number, s: CinematicState): void {
    const phase = s.sequence.phases.find(p => p.action === 'cut_in');
    if (!phase) return;

    ctx.save();
    ctx.globalAlpha = s.cutInAlpha;

    // Diagonal split background
    const mid = w * 0.55;
    ctx.fillStyle = s.sequence.color;
    ctx.shadowColor = s.sequence.color;
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.moveTo(mid - 80, 0);
    ctx.lineTo(mid + 80, 0);
    ctx.lineTo(mid - 20, h);
    ctx.lineTo(mid - 180, h);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Character name
    ctx.font = 'bold 48px "Bebas Neue", "Impact", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.letterSpacing = '6px';
    ctx.fillText((phase.params.text as string).toUpperCase(), 60, h / 2 - 30);

    // Sub-title
    ctx.font = '24px "Bebas Neue", "Impact", sans-serif';
    ctx.fillStyle = s.sequence.color;
    ctx.fillText(phase.params.sub as string, 60, h / 2 + 20);

    ctx.restore();
  }

  private renderActiveTextSlam(ctx: CanvasRenderingContext2D, w: number, h: number, s: CinematicState): void {
    const phase = s.sequence.phases.find(p => p.action === 'text_slam' || p.action === 'kanji_burst');
    if (!phase || s.textSlamAlpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = s.textSlamAlpha;
    ctx.textAlign = 'center';

    const text = phase.params.text as string ?? phase.params.kanji as string;
    const color = phase.params.color as string ?? s.sequence.color;

    ctx.font = `bold ${Math.round(s.textSlamScale * 48)}px "Bebas Neue", "Impact", sans-serif`;
    ctx.shadowColor = color;
    ctx.shadowBlur = 40;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.strokeText(text, w / 2, h * 0.55);
    ctx.fillStyle = color;
    ctx.fillText(text, w / 2, h * 0.55);

    if (phase.params.romaji) {
      ctx.font = `bold 36px "Bebas Neue", "Impact", sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = color;
      ctx.fillText(phase.params.romaji as string, w / 2, h * 0.55 + 55);
    }

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  private spawnCinematicParticles(
    s: CinematicState,
    cx: number, cy: number,
    color: string,
    count: number
  ): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 4 + Math.random() * 12;
      s.particles.push({
        x: cx + (Math.random() - 0.5) * 60,
        y: cy + (Math.random() - 0.5) * 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 3 + Math.random() * 10,
        life: 40 + Math.random() * 50,
        maxLife: 90,
        color,
        angle: Math.random() * Math.PI,
      });
    }
  }

  private buildGenericSequence(winner: Fighter): BankaiSequence {
    return {
      characterId: winner.charDef.id,
      name: winner.charDef.ultimateName,
      color: winner.charDef.reiatsuColor,
      totalFrames: 360,
      phases: [
        { startFrame: 0,   endFrame: 50,  action: 'black_bars',   params: { height: 80 } },
        { startFrame: 20,  endFrame: 75,  action: 'cut_in',       params: { text: winner.charDef.name, sub: winner.charDef.awakeningName } },
        { startFrame: 75,  endFrame: 150, action: 'camera_zoom',  params: { zoom: 1.5 } },
        { startFrame: 130, endFrame: 185, action: 'screen_black', params: { alpha: 0.9 } },
        { startFrame: 185, endFrame: 225, action: 'flash',        params: { alpha: 0.9 } },
        { startFrame: 225, endFrame: 295, action: 'particle_burst', params: { color: winner.charDef.reiatsuColor, count: 100, label: 'generic' } },
        { startFrame: 295, endFrame: 360, action: 'text_slam',    params: { text: winner.charDef.ultimateName, color: winner.charDef.reiatsuColor } },
      ],
    };
  }
}
