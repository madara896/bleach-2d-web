// Bleach 2D Web Game: Stage Select Scene
import { STAGES, type StageDefinition } from '../data/stages/Stages';
import { audio } from '../engine/AudioEngine';

export class StageSelectScene {
  public selectedIndex: number = 0;
  private tick: number = 0;

  public update(keysJustPressed: { left: boolean; right: boolean; confirm: boolean }): StageDefinition | null {
    this.tick++;

    if (keysJustPressed.left) {
      this.selectedIndex = (this.selectedIndex - 1 + STAGES.length) % STAGES.length;
      audio.playHitLight();
    }
    if (keysJustPressed.right) {
      this.selectedIndex = (this.selectedIndex + 1) % STAGES.length;
      audio.playHitLight();
    }
    if (keysJustPressed.confirm) {
      audio.playSwordClash();
      return STAGES[this.selectedIndex];
    }

    return null;
  }

  public render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.fillStyle = '#05070e';
    ctx.fillRect(0, 0, width, height);

    const activeStage = STAGES[this.selectedIndex];

    // Title
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '900 36px Impact, "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 14;
    ctx.fillText('SELECT BATTLEFIELD STAGE', width / 2, 70);
    ctx.restore();

    // Stage Carousel Cards
    const cardW = 280;
    const cardH = 340;
    const gap = 24;
    const totalW = STAGES.length * (cardW + gap) - gap;
    const startX = width / 2 - totalW / 2;
    const cardY = height * 0.28;

    STAGES.forEach((stage, idx) => {
      const isSelected = idx === this.selectedIndex;
      const x = startX + idx * (cardW + gap);

      ctx.save();
      ctx.fillStyle = isSelected ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.7)';
      ctx.strokeStyle = isSelected ? '#38bdf8' : '#334155';
      ctx.lineWidth = isSelected ? 3 : 1.5;
      if (isSelected) {
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 18;
      }

      ctx.roundRect(x, cardY, cardW, cardH, 8);
      ctx.fill();
      ctx.stroke();

      // Mini Stage Thumbnail Gradient Preview
      const thumbGrad = ctx.createLinearGradient(x, cardY, x, cardY + 180);
      thumbGrad.addColorStop(0, stage.bgGradTop);
      thumbGrad.addColorStop(1, stage.bgGradBottom);
      ctx.fillStyle = thumbGrad;
      ctx.beginPath();
      ctx.roundRect(x + 10, cardY + 10, cardW - 20, 180, 6);
      ctx.fill();

      // Stage Title
      ctx.textAlign = 'center';
      ctx.font = '800 18px "Segoe UI", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(stage.name, x + cardW / 2, cardY + 225);

      // Japanese Kanji
      ctx.font = '700 14px "Segoe UI", serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(stage.japaneseName, x + cardW / 2, cardY + 252);

      // Location
      ctx.font = '600 12px "Segoe UI", sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(stage.location, x + cardW / 2, cardY + 280);

      ctx.restore();
    });

    // Controls hint
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '600 14px "Segoe UI", sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('Press [A/D] or [◄/►] to Browse  •  Press [J] or [SPACE] or [ENTER] to Deploy', width / 2, height - 60);
    ctx.restore();
  }
}
