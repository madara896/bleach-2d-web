// Bleach 2D Web Game: Stage & Parallax Background Renderer
import type { StageDefinition } from '../types';

export class StageRenderer {
  private tick: number = 0;

  public render(ctx: CanvasRenderingContext2D, stage: StageDefinition, cameraX: number, cameraY: number): void {
    this.tick++;

    // 1. Sky Gradient Background
    const skyGrad = ctx.createLinearGradient(0, 0, 0, stage.height);
    skyGrad.addColorStop(0, stage.bgGradTop);
    skyGrad.addColorStop(1, stage.bgGradBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, stage.width, stage.height);

    // 2. Parallax Backdrop based on visualTheme
    switch (stage.visualTheme) {
      case 'sokyoku':
        this.renderSokyokuBackdrop(ctx, stage, cameraX);
        break;
      case 'las_noches':
        this.renderLasNochesBackdrop(ctx, stage, cameraX);
        break;
      case 'silbern':
        this.renderSilbernBackdrop(ctx, stage, cameraX);
        break;
      case 'karakura':
        this.renderKarakuraBackdrop(ctx, stage, cameraX);
        break;
    }

    // 3. Ground & Arena Platform
    this.renderGround(ctx, stage);
  }

  private renderGround(ctx: CanvasRenderingContext2D, stage: StageDefinition): void {
    const gy = stage.groundY;

    // Ground platform fill
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, gy, stage.width, stage.height - gy);

    // Ground highlight rim line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(stage.width, gy);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Platform paving / stones
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < stage.width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, gy);
      ctx.lineTo(x, gy + 40);
      ctx.stroke();
    }
  }

  private renderSokyokuBackdrop(ctx: CanvasRenderingContext2D, stage: StageDefinition, camX: number): void {
    const pX = (camX - stage.width / 2) * 0.15;

    // Distant Seireitei pagoda spires
    ctx.fillStyle = 'rgba(20, 10, 35, 0.7)';
    for (let i = 0; i < 8; i++) {
      const x = 120 + i * 190 - pX;
      ctx.beginPath();
      ctx.moveTo(x, stage.groundY - 120);
      ctx.lineTo(x + 25, stage.groundY - 180);
      ctx.lineTo(x + 50, stage.groundY - 120);
      ctx.closePath();
      ctx.fill();
    }

    // Huge Sokyoku Execution Scaffold
    const scaffoldX = stage.width * 0.75 - pX * 1.5;
    ctx.fillStyle = '#261208';
    ctx.fillRect(scaffoldX - 18, stage.groundY - 260, 36, 260);
    ctx.fillRect(scaffoldX - 80, stage.groundY - 240, 160, 24);

    // Floating cherry blossom petals
    ctx.fillStyle = '#f472b6';
    for (let i = 0; i < 30; i++) {
      const px = ((i * 53 + this.tick * 1.2) % stage.width);
      const py = ((i * 37 + this.tick * 0.8) % (stage.groundY - 60)) + 60;
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderLasNochesBackdrop(ctx: CanvasRenderingContext2D, stage: StageDefinition, camX: number): void {
    const pX = (camX - stage.width / 2) * 0.12;

    // Huge Eerie Crescent Moon
    ctx.save();
    ctx.fillStyle = '#f8fafc';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(stage.width * 0.3 - pX * 0.4, 150, 65, 0, Math.PI * 2);
    ctx.fill();

    // Crescent shadow
    ctx.fillStyle = stage.bgGradTop;
    ctx.beginPath();
    ctx.arc(stage.width * 0.3 - pX * 0.4 + 25, 140, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Las Noches Dome horizon
    ctx.fillStyle = 'rgba(15, 30, 50, 0.85)';
    ctx.beginPath();
    ctx.ellipse(stage.width * 0.65 - pX, stage.groundY - 40, 320, 160, 0, Math.PI, 0);
    ctx.fill();

    // White Quartz Trees
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 4;
    for (let i = 0; i < 6; i++) {
      const tx = 100 + i * 260 - pX * 1.2;
      ctx.beginPath();
      ctx.moveTo(tx, stage.groundY);
      ctx.lineTo(tx, stage.groundY - 90);
      ctx.lineTo(tx - 25, stage.groundY - 140);
      ctx.moveTo(tx, stage.groundY - 90);
      ctx.lineTo(tx + 25, stage.groundY - 130);
      ctx.stroke();
    }
  }

  private renderSilbernBackdrop(ctx: CanvasRenderingContext2D, stage: StageDefinition, camX: number): void {
    const pX = (camX - stage.width / 2) * 0.15;

    // Ice palace geometric spires
    ctx.fillStyle = 'rgba(10, 35, 60, 0.8)';
    for (let i = 0; i < 9; i++) {
      const sx = 80 + i * 180 - pX;
      ctx.beginPath();
      ctx.moveTo(sx, stage.groundY);
      ctx.lineTo(sx + 30, stage.groundY - 220);
      ctx.lineTo(sx + 60, stage.groundY);
      ctx.closePath();
      ctx.fill();
    }

    // Glowing Quincy Crosses in sky
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 15;
    for (let i = 0; i < 4; i++) {
      const cx = 220 + i * 360 - pX * 0.6;
      const cy = 130 + Math.sin(this.tick * 0.03 + i) * 12;
      ctx.beginPath();
      ctx.moveTo(cx - 18, cy);
      ctx.lineTo(cx + 18, cy);
      ctx.moveTo(cx, cy - 24);
      ctx.lineTo(cx, cy + 24);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  private renderKarakuraBackdrop(ctx: CanvasRenderingContext2D, stage: StageDefinition, camX: number): void {
    const pX = (camX - stage.width / 2) * 0.15;

    // Sunset skyline of Karakura Town
    ctx.fillStyle = 'rgba(40, 15, 60, 0.85)';
    for (let i = 0; i < 14; i++) {
      const bx = i * 120 - pX;
      const bh = 140 + (i % 4) * 50;
      ctx.fillRect(bx, stage.groundY - bh, 95, bh);
    }

    // Water tower on roof
    const wtx = stage.width * 0.2 - pX * 1.3;
    ctx.fillStyle = '#475569';
    ctx.fillRect(wtx - 25, stage.groundY - 140, 50, 45);
    ctx.fillRect(wtx - 18, stage.groundY - 95, 36, 95);

    // Chainlink fence on rooftop
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, stage.groundY - 70, stage.width, 70);
  }
}
