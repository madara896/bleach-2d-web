// Bleach AAA Rebuild: Active Match Combat Scene — with Cinematic Bankai System
import { Fighter } from '../combat/Fighter';
import { AIController } from '../combat/AIController';
import { CollisionSystem } from '../combat/CollisionSystem';
import { Camera2D } from '../engine/Camera2D';
import { VFXEngine } from '../engine/VFXEngine';
import { StageRenderer } from '../render/StageRenderer';
import { SpriteRenderer, spriteRenderer } from '../render/SpriteRenderer';
import { UIRenderer } from '../render/UIRenderer';
import { BankaiCinematic } from '../render/BankaiCinematic';
import { lighting } from '../engine/LightingSystem';
import { input } from '../engine/InputManager';
import { audio } from '../engine/AudioEngine';
import type { CharacterDefinition, StageDefinition, GameMode } from '../types';

export class FightScene {
  public p1: Fighter;
  public p2: Fighter;
  public stage: StageDefinition;
  public gameMode: GameMode;

  public camera: Camera2D;
  public vfx: VFXEngine;
  private stageRenderer: StageRenderer;
  private bankai: BankaiCinematic;
  private ai: AIController | null = null;

  // Screen flash on hit
  private screenFlash: number = 0;

  // Match State
  public round: number = 1;
  public maxRounds: number = 3;      // Best of 3
  public p1RoundsWon: number = 0;
  public p2RoundsWon: number = 0;
  public roundTimer: number = 99;
  public matchState: 'INTRO' | 'FIGHTING' | 'BANKAI_CINEMATIC' | 'ROUND_END' | 'MATCH_END' = 'INTRO';

  public announcement: string | null = 'ROUND 1';
  private announcementTimer: number = 90;
  private roundOverTimer: number = 0;

  constructor(
    p1Def: CharacterDefinition,
    p2Def: CharacterDefinition,
    stage: StageDefinition,
    gameMode: GameMode,
    canvasWidth: number,
    canvasHeight: number
  ) {
    this.stage = stage;
    this.gameMode = gameMode;
    this.vfx = new VFXEngine();
    this.stageRenderer = new StageRenderer();
    this.bankai = new BankaiCinematic();

    const startP1X = stage.width / 2 - 200;
    const startP2X = stage.width / 2 + 200;

    this.p1 = new Fighter(1, p1Def, startP1X, stage.groundY, this.vfx);
    this.p2 = new Fighter(2, p2Def, startP2X, stage.groundY, this.vfx);

    this.camera = new Camera2D(canvasWidth, canvasHeight, stage.width, stage.height);

    if (this.gameMode !== 'VS_2P') {
      const diff = this.gameMode === 'TRAINING' ? 'PRACTICE' : 'NORMAL';
      this.ai = new AIController(this.p2, diff);
    }

    if (this.gameMode === 'TRAINING') {
      this.p1.reiatsu = 300;
      this.p2.reiatsu = 300;
    }

    audio.startBattleBGM();
  }

  public update(): boolean {
    // 1. Bankai Cinematic takes full control
    if (this.matchState === 'BANKAI_CINEMATIC') {
      const done = this.bankai.update();
      if (done) {
        this.matchState = 'MATCH_END';
        this.roundOverTimer = 0;
        const winnerName = this.p1.hp > this.p2.hp ? this.p1.charDef.name : this.p2.charDef.name;
        this.announcement = `${winnerName.toUpperCase()} WINS!`;
      }
      return false;
    }

    // 2. Camera
    this.camera.update(this.p1.x, this.p1.y, this.p2.x, this.p2.y);

    if (this.camera.hitstopFrames > 0) return false;

    // 3. Screen flash decay
    this.screenFlash = Math.max(0, this.screenFlash - 0.04);

    // 4. Announcements & Match Flow
    if (this.announcementTimer > 0) {
      this.announcementTimer--;
      if (this.announcementTimer === 40 && this.matchState === 'INTRO') {
        this.announcement = 'FIGHT!';
        audio.playSwordClash();
      }
      if (this.announcementTimer <= 0) {
        if (this.matchState === 'INTRO') {
          this.matchState = 'FIGHTING';
          this.announcement = null;
        }
      }
    }

    // 5. Lighting update
    lighting.update();

    // 6. Player Inputs
    this.handlePlayerInput(this.p1, input.p1);
    if (this.gameMode === 'VS_2P') {
      this.handlePlayerInput(this.p2, input.p2);
    } else if (this.ai && this.matchState === 'FIGHTING') {
      this.ai.update(this.p1);
    }

    if (this.gameMode === 'TRAINING') {
      this.p1.reiatsu = Math.max(250, this.p1.reiatsu);
      this.p2.reiatsu = Math.max(250, this.p2.reiatsu);
    }

    // 7. Active combat
    if (this.matchState === 'FIGHTING') {
      if (this.gameMode !== 'TRAINING') {
        this.roundTimer -= 1 / 60;
        if (this.roundTimer <= 0) this.handleTimeout();
      }

      this.p1.update(this.p2);
      this.p2.update(this.p1);

      this.clampFighterToStage(this.p1);
      this.clampFighterToStage(this.p2);

      CollisionSystem.resolvePushboxes(this.p1.getPushbox(), this.p2.getPushbox());
      this.checkCombatInteractions();

      if (this.p1.hp <= 0 || this.p2.hp <= 0) {
        this.handleRoundFinish();
      }
    } else if (this.matchState === 'ROUND_END' || this.matchState === 'MATCH_END') {
      this.p1.update(this.p2);
      this.p2.update(this.p1);
      this.roundOverTimer++;

      if (this.matchState === 'ROUND_END' && this.roundOverTimer >= 150) {
        this.startNextRound();
      } else if (this.matchState === 'MATCH_END' && this.roundOverTimer >= 250) {
        audio.stopBattleBGM();
        return true;
      }
    }

    // 8. VFX
    this.vfx.update();

    return false;
  }

  private handlePlayerInput(fighter: Fighter, inp: typeof input.p1): void {
    if (this.matchState !== 'FIGHTING') return;

    if (fighter.canAct()) {
      if (inp.down) {
        if (fighter.state !== 'BLOCK') fighter.setState('BLOCK');
      } else {
        if (fighter.state === 'BLOCK') fighter.setState('IDLE');

        if (inp.left) {
          fighter.setState('WALK');
          fighter.vx = -fighter.charDef.stats.walkSpeed * (fighter.isAwakened ? 1.25 : 1.0);
        } else if (inp.right) {
          fighter.setState('WALK');
          fighter.vx = fighter.charDef.stats.walkSpeed * (fighter.isAwakened ? 1.25 : 1.0);
        } else if (fighter.state === 'WALK') {
          fighter.setState('IDLE');
        }

        if (inp.upPressed && fighter.isGrounded) {
          fighter.vy = -fighter.charDef.stats.jumpForce;
          fighter.isGrounded = false;
          fighter.setState('JUMP');
        }
      }
    }

    if (inp.shunpoPressed) {
      const dir = inp.left ? -1 : inp.right ? 1 : 0;
      fighter.startShunpo(dir);
    }

    if (inp.lightPressed) {
      fighter.startLightAttack();
    } else if (inp.heavyPressed) {
      fighter.startHeavyAttack();
    } else if (inp.specialPressed) {
      fighter.startSpecial();
    }

    if (inp.charge) {
      if (fighter.canAct() && fighter.state !== 'CHARGE_REIATSU') {
        fighter.startCharge();
      }
    } else {
      fighter.stopCharge();
    }

    if (inp.awakenPressed) {
      if (inp.down) {
        fighter.startUltimate();
      } else {
        fighter.startAwakening();
      }
    }
  }

  private checkCombatInteractions(): void {
    // Blade Clash
    const clash = CollisionSystem.checkClash(this.p1.currentHitbox, this.p2.currentHitbox);
    if (clash.clash) {
      this.vfx.spawnBladeClash(clash.x, clash.y);
      audio.playSwordClash();
      this.camera.triggerHitstop(10);
      this.camera.addTrauma(0.4);
      lighting.spawnImpactLight(clash.x, clash.y, '#ffffff');
      this.p1.vx = -this.p1.facing * 9;
      this.p2.vx = -this.p2.facing * 9;
      this.p1.currentHitbox = null;
      this.p2.currentHitbox = null;
      this.screenFlash = 0.5;
      return;
    }

    // P1 hits P2
    if (this.p1.currentHitbox && !this.p1.hasHitTarget) {
      if (CollisionSystem.testOverlap(this.p1.currentHitbox, this.p2.getHurtbox())) {
        const hb = this.p1.currentHitbox;
        this.p1.hasHitTarget = true;
        this.p2.takeDamage(hb.damage, hb.hitstun, hb.knockbackX, hb.knockbackY, hb.unblockable);
        this.p1.gainReiatsu(16);
        this.camera.triggerHitstop(hb.isHeavy ? 10 : 5);
        this.camera.addTrauma(hb.isHeavy ? 0.45 : 0.2);
        lighting.spawnImpactLight(this.p2.x, this.p2.y - 200, this.p1.charDef.reiatsuColor);
        if (hb.isHeavy) this.screenFlash = 0.35;

        // Wall bounce — if p2 hits stage wall, give juggle opportunity
        if (Math.abs(this.p2.x - 40) < 20 || Math.abs(this.p2.x - (this.stage.width - 40)) < 20) {
          this.p2.vx = -this.p2.vx * 1.4;
          this.camera.addTrauma(0.3);
          this.vfx.spawnExplosion(this.p2.x, this.p2.y - 150, '#ffffff', 14);
        }

        // Check if this is a KO ultimate
        if (this.p2.hp <= 0 && this.p1.state === 'ULTIMATE') {
          this.triggerBankaiCinematic(this.p1, this.p2);
          return;
        }
      }
    }

    // P2 hits P1
    if (this.p2.currentHitbox && !this.p2.hasHitTarget) {
      if (CollisionSystem.testOverlap(this.p2.currentHitbox, this.p1.getHurtbox())) {
        const hb = this.p2.currentHitbox;
        this.p2.hasHitTarget = true;
        this.p1.takeDamage(hb.damage, hb.hitstun, hb.knockbackX, hb.knockbackY, hb.unblockable);
        this.p2.gainReiatsu(16);
        this.camera.triggerHitstop(hb.isHeavy ? 10 : 5);
        this.camera.addTrauma(hb.isHeavy ? 0.45 : 0.2);
        lighting.spawnImpactLight(this.p1.x, this.p1.y - 200, this.p2.charDef.reiatsuColor);
        if (hb.isHeavy) this.screenFlash = 0.35;

        if (Math.abs(this.p1.x - 40) < 20 || Math.abs(this.p1.x - (this.stage.width - 40)) < 20) {
          this.p1.vx = -this.p1.vx * 1.4;
          this.camera.addTrauma(0.3);
          this.vfx.spawnExplosion(this.p1.x, this.p1.y - 150, '#ffffff', 14);
        }

        if (this.p1.hp <= 0 && this.p2.state === 'ULTIMATE') {
          this.triggerBankaiCinematic(this.p2, this.p1);
          return;
        }
      }
    }

    // Projectile Collisions
    for (let i = this.vfx.projectiles.length - 1; i >= 0; i--) {
      const proj = this.vfx.projectiles[i];
      const target = proj.ownerId === 1 ? this.p2 : this.p1;
      const projRect = { x: proj.x - proj.width / 2, y: proj.y - proj.height / 2, width: proj.width, height: proj.height };

      if (CollisionSystem.testOverlap(projRect, target.getHurtbox())) {
        target.takeDamage(proj.damage, 20, (proj.vx >= 0 ? 1 : -1) * 7, -2, proj.unblockable);
        this.camera.addTrauma(0.45);
        this.camera.triggerHitstop(7);
        lighting.spawnImpactLight(proj.x, proj.y, proj.color);
        this.screenFlash = 0.3;

        if (!proj.piercing) {
          this.vfx.spawnExplosion(proj.x, proj.y, proj.color, 22);
          this.vfx.projectiles.splice(i, 1);
        }
      }
    }
  }

  private triggerBankaiCinematic(winner: Fighter, loser: Fighter): void {
    this.matchState = 'BANKAI_CINEMATIC';
    this.bankai.trigger(winner, loser);
    this.camera.addTrauma(1.0);
    this.camera.triggerHitstop(30);
  }

  private handleRoundFinish(): void {
    this.matchState = 'ROUND_END';
    this.roundOverTimer = 0;
    this.camera.triggerHitstop(22);
    this.camera.addTrauma(0.6);

    if (this.p1.hp <= 0 && this.p2.hp <= 0) {
      this.announcement = 'DOUBLE K.O.!';
    } else if (this.p2.hp <= 0) {
      this.p1RoundsWon++;
      this.p1.setState('VICTORY');
      this.announcement = 'K.O.!';
    } else {
      this.p2RoundsWon++;
      this.p2.setState('VICTORY');
      this.announcement = 'K.O.!';
    }

    if (this.p1RoundsWon >= this.maxRounds || this.p2RoundsWon >= this.maxRounds) {
      this.matchState = 'MATCH_END';
      const winnerName = this.p1RoundsWon >= this.maxRounds ? this.p1.charDef.name : this.p2.charDef.name;
      setTimeout(() => {
        this.announcement = `${winnerName.toUpperCase()} WINS!`;
      }, 1200);
    }
  }

  private handleTimeout(): void {
    if (this.p1.hp > this.p2.hp) {
      this.p1RoundsWon++;
      this.announcement = 'TIME UP — P1 WINS!';
    } else if (this.p2.hp > this.p1.hp) {
      this.p2RoundsWon++;
      this.announcement = 'TIME UP — P2 WINS!';
    } else {
      this.announcement = 'TIME UP — DRAW!';
    }
    this.matchState = 'ROUND_END';
    this.roundOverTimer = 0;
  }

  private startNextRound(): void {
    this.round++;
    this.roundTimer = 99;
    this.matchState = 'INTRO';
    this.announcement = `ROUND ${this.round}`;
    this.announcementTimer = 80;

    const startP1X = this.stage.width / 2 - 200;
    const startP2X = this.stage.width / 2 + 200;
    this.p1.reset(startP1X, 1);
    this.p2.reset(startP2X, -1);
    this.vfx.clear();
  }

  private clampFighterToStage(f: Fighter): void {
    const halfW = f.width / 2;
    if (f.x - halfW < 40) { f.x = 40 + halfW; f.vx = 0; }
    if (f.x + halfW > this.stage.width - 40) { f.x = this.stage.width - 40 - halfW; f.vx = 0; }
  }

  // ─── Render Pass ─────────────────────────────────────────────────────────

  public render(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number): void {
    this.camera.resize(canvasWidth, canvasHeight);

    // Bankai cinematic zoom
    const bankaiZoom = this.bankai.state?.zoom ?? 1.0;
    if (bankaiZoom !== 1.0) {
      this.camera.targetZoom = bankaiZoom;
    }

    // 1. World pass
    this.camera.applyTransform(ctx);

    // Stage background
    this.stageRenderer.render(ctx, this.stage, this.camera.x, this.camera.y);

    // Lighting auras (behind fighters)
    lighting.renderLighting(ctx, this.p1, this.p2);

    // World VFX
    this.vfx.renderWorld(ctx);

    // Fighters — draw further one first (depth sort)
    if (this.p1.x < this.p2.x) {
      spriteRenderer.renderFighter(ctx, this.p1);
      spriteRenderer.renderFighter(ctx, this.p2);
    } else {
      spriteRenderer.renderFighter(ctx, this.p2);
      spriteRenderer.renderFighter(ctx, this.p1);
    }

    this.camera.restoreTransform(ctx);

    // 2. Screen overlay pass
    this.vfx.renderScreenOverlay(ctx, canvasWidth, canvasHeight);

    // Screen flash on hit
    if (this.screenFlash > 0) {
      lighting.renderHitFlash(ctx, canvasWidth, canvasHeight, this.screenFlash * 0.5);
    }

    // Vignette for atmosphere
    lighting.renderVignette(ctx, canvasWidth, canvasHeight);

    // Bankai cinematic overlay (on top of everything)
    if (this.matchState === 'BANKAI_CINEMATIC') {
      this.bankai.render(ctx, canvasWidth, canvasHeight);
    }

    // HUD
    UIRenderer.renderBattleHUD(
      ctx,
      canvasWidth,
      canvasHeight,
      this.p1,
      this.p2,
      this.roundTimer,
      this.p1RoundsWon,
      this.p2RoundsWon,
      this.announcement
    );
  }
}
