// Bleach 2D Web Game: Title Scene
import type { GameMode } from '../types';
import { audio } from '../engine/AudioEngine';

export class TitleScene {
  public selectedIndex: number = 0;
  public modes: { id: GameMode; label: string; desc: string }[] = [
    { id: 'ARCADE', label: 'ARCADE LADDER', desc: 'Climb the ranks through the Soul Society and Hueco Mundo' },
    { id: 'VS_CPU', label: 'VS CPU', desc: 'Single battle against configurable AI opponent' },
    { id: 'VS_2P', label: 'LOCAL 2-PLAYER', desc: 'Battle a friend locally on the same keyboard' },
    { id: 'TRAINING', label: 'TRAINING DOJO', desc: 'Practice combos, cancels, and awakenings with infinite meter' }
  ];

  private tick: number = 0;

  public update(keysJustPressed: { up: boolean; down: boolean; confirm: boolean }): GameMode | null {
    this.tick++;

    if (keysJustPressed.up) {
      this.selectedIndex = (this.selectedIndex - 1 + this.modes.length) % this.modes.length;
      audio.playHitLight();
    }
    if (keysJustPressed.down) {
      this.selectedIndex = (this.selectedIndex + 1) % this.modes.length;
      audio.playHitLight();
    }
    if (keysJustPressed.confirm) {
      audio.playSwordClash();
      return this.modes[this.selectedIndex].id;
    }

    return null;
  }

  public render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Dark ominous background with crimson moonlight gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#09090b');
    grad.addColorStop(0.5, '#1e112a');
    grad.addColorStop(1, '#030712');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Dynamic Reiatsu Particle Waves
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.15)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      const waveY = height * 0.45 + i * 35;
      ctx.moveTo(0, waveY);
      for (let x = 0; x < width; x += 40) {
        const offset = Math.sin((x * 0.008) + (this.tick * 0.04) + i) * 20;
        ctx.lineTo(x, waveY + offset);
      }
      ctx.stroke();
    }

    // Japanese Bleach Calligraphy Watermark
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 120px "Segoe UI", serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.fillText('死神代行篇', width / 2, height * 0.32);
    ctx.restore();

    // Main Logo: BLEACH
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 32;

    ctx.font = '900 84px Impact, "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('B L E A C H', width / 2, height * 0.28);

    ctx.font = 'italic 800 28px "Segoe UI", sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 18;
    ctx.fillText('— BANKAI RESURRECTION —', width / 2, height * 0.38);

    ctx.font = '600 14px "Segoe UI", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.shadowBlur = 0;
    ctx.fillText('SHINIGAMI  •  ARRANCAR  •  QUINCY  •  TRANSCENDENT', width / 2, height * 0.43);
    ctx.restore();

    // Mode Selector List
    const menuY = height * 0.54;
    const itemHeight = 44;

    this.modes.forEach((mode, idx) => {
      const isSelected = idx === this.selectedIndex;
      const y = menuY + idx * itemHeight;

      if (isSelected) {
        ctx.save();
        // Selection highlight bar
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 16;

        ctx.strokeRect(width / 2 - 200, y - 20, 400, 36);
        ctx.fillRect(width / 2 - 200, y - 20, 400, 36);
        ctx.restore();
      }

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = isSelected ? '800 20px "Segoe UI", sans-serif' : '600 18px "Segoe UI", sans-serif';
      ctx.fillStyle = isSelected ? '#ffffff' : '#94a3b8';
      ctx.fillText(mode.label, width / 2, y - 2);
      ctx.restore();
    });

    // Selected Mode Description
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'italic 15px "Segoe UI", sans-serif';
    ctx.fillStyle = '#f87171';
    ctx.fillText(this.modes[this.selectedIndex].desc, width / 2, height * 0.84);

    // Call to Action
    ctx.font = '600 13px "Segoe UI", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Press [W/S] or [▲/▼] to Select  •  Press [J] or [SPACE] or [ENTER] to Confirm', width / 2, height * 0.92);
    ctx.restore();
  }
}
