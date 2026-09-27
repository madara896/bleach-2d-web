// Bleach 2D Web Game: Stage Select Scene with Mouse Support
import { STAGES, type StageDefinition } from '../data/stages/Stages';
import { audio } from '../engine/AudioEngine';

export class StageSelectScene {
  public selectedIndex: number = 0;
  private tick: number = 0;

  public update(
    keysJustPressed: { left: boolean; right: boolean; confirm: boolean },
    mouseClick: { x: number; y: number } | null,
    width: number,
    height: number
  ): StageDefinition | null {
    this.tick++;

    // Mouse click on stage cards
    if (mouseClick) {
      const cardW = 280;
      const cardH = 340;
      const gap = 24;
      const totalW = STAGES.length * (cardW + gap) - gap;
      const startX = width / 2 - totalW / 2;
      const cardY = height * 0.28;

      for (let i = 0; i < STAGES.length; i++) {
        const x = startX + i * (cardW + gap);
        if (
          mouseClick.x >= x &&
          mouseClick.x <= x + cardW &&
          mouseClick.y >= cardY &&
          mouseClick.y <= cardY + cardH
        ) {
          this.selectedIndex = i;
          audio.playSwordClash();
          return STAGES[i];
        }
      }
    }

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

      // Deploy Button
      const btnY = cardY + cardH - 42;
      ctx.fillStyle = isSelected ? '#0284c7' : '#1e293b';
      ctx.roundRect(x + 16, btnY, cardW - 32, 28, 4);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 12px "Segoe UI", sans-serif';
      ctx.fillText('DEPLOY (CLICK)', x + cardW / 2, btnY + 18);

      ctx.restore();
    });

    // Controls hint
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '600 14px "Segoe UI", sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('Press [A/D] or [◄/►] to Browse  •  Press [J], [SPACE], or [ENTER] to Deploy (Or CLICK a Stage)', width / 2, height - 50);
    ctx.restore();
  }
}
