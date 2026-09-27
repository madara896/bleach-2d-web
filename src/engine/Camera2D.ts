// Bleach 2D Web Game: Dynamic Fighting Game Camera

export class Camera2D {
  public x: number = 0;
  public y: number = 0;
  public targetX: number = 0;
  public targetY: number = 0;
  public zoom: number = 1.0;
  public targetZoom: number = 1.0;
  
  // Trauma / screen shake system
  private trauma: number = 0; // 0 to 1
  public shakeX: number = 0;
  public shakeY: number = 0;
  public shakeRot: number = 0;

  // Hit-stop system
  public hitstopFrames: number = 0;

  private viewportWidth: number;
  private viewportHeight: number;
  private stageWidth: number;
  private stageHeight: number;

  constructor(viewportWidth: number, viewportHeight: number, stageWidth: number, stageHeight: number) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.stageWidth = stageWidth;
    this.stageHeight = stageHeight;
    this.x = stageWidth / 2;
    this.y = stageHeight / 2;
    this.targetX = this.x;
    this.targetY = this.y;
  }

  public resize(viewportWidth: number, viewportHeight: number): void {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
  }

  public setStageBounds(width: number, height: number): void {
    this.stageWidth = width;
    this.stageHeight = height;
  }

  /** Add screen shake trauma (0.1 to 1.0) */
  public addTrauma(amount: number): void {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  /** Trigger hit-stop freeze frames */
  public triggerHitstop(frames: number): void {
    this.hitstopFrames = Math.max(this.hitstopFrames, frames);
  }

  public update(p1X: number, p1Y: number, p2X: number, p2Y: number): void {
    if (this.hitstopFrames > 0) {
      this.hitstopFrames--;
      return;
    }

    // Midpoint between both fighters
    const midX = (p1X + p2X) / 2;
    const midY = (p1Y + p2Y) / 2 - 30; // slightly above ground level

    // Distance between fighters determines dynamic zoom
    const dist = Math.hypot(p1X - p2X, p1Y - p2Y);
    const minZoom = 0.82;
    const maxZoom = 1.25;
    
    // Scale zoom inversely with distance
    const normalizedDist = Math.min(1, Math.max(0, (dist - 180) / 750));
    this.targetZoom = maxZoom - normalizedDist * (maxZoom - minZoom);

    this.targetX = midX;
    this.targetY = midY;

    // Smooth lerp
    this.x += (this.targetX - this.x) * 0.12;
    this.y += (this.targetY - this.y) * 0.12;
    this.zoom += (this.targetZoom - this.zoom) * 0.08;

    // Clamp camera within stage bounds accounting for zoom
    const halfViewW = (this.viewportWidth / (2 * this.zoom));
    const halfViewH = (this.viewportHeight / (2 * this.zoom));

    this.x = Math.max(halfViewW, Math.min(this.stageWidth - halfViewW, this.x));
    this.y = Math.max(halfViewH, Math.min(this.stageHeight - halfViewH + 60, this.y));

    // Calculate screen shake from trauma
    if (this.trauma > 0) {
      const shakePower = Math.pow(this.trauma, 2);
      const maxOffset = 22 * shakePower;
      this.shakeX = (Math.random() * 2 - 1) * maxOffset;
      this.shakeY = (Math.random() * 2 - 1) * maxOffset;
      this.shakeRot = (Math.random() * 2 - 1) * 0.03 * shakePower;

      // Trauma decays each frame
      this.trauma = Math.max(0, this.trauma - 0.04);
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
      this.shakeRot = 0;
    }
  }

  /** Apply camera transformation matrix to 2D canvas context */
  public applyTransform(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.viewportWidth / 2 + this.shakeX, this.viewportHeight / 2 + this.shakeY);
    if (this.shakeRot !== 0) {
      ctx.rotate(this.shakeRot);
    }
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.x, -this.y);
  }

  /** Restore canvas context after world rendering */
  public restoreTransform(ctx: CanvasRenderingContext2D): void {
    ctx.restore();
  }
}
