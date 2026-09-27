// Bleach 2D Web Game: Active Match Combat Scene
import { Fighter } from '../combat/Fighter';
import { AIController } from '../combat/AIController';
import { CollisionSystem } from '../combat/CollisionSystem';
import { Camera2D } from '../engine/Camera2D';
import { VFXEngine } from '../engine/VFXEngine';
import { StageRenderer } from '../render/StageRenderer';
import { AnimeRenderer } from '../render/AnimeRenderer';
import { UIRenderer } from '../render/UIRenderer';
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
  private ai: AIController | null = null;

  // Match State
  public round: number = 1;
  public maxRounds: number = 2; // first to 2
  public p1RoundsWon: number = 0;
  public p2RoundsWon: number = 0;
  public roundTimer: number = 99; // seconds
  public matchState: 'INTRO' | 'FIGHTING' | 'ROUND_END' | 'MATCH_END' = 'INTRO';
  
  public announcement: string | null = 'ROUND 1';
  private announcementTimer: number = 90; // frames
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

    const startP1X = stage.width / 2 - 180;
    const startP2X = stage.width / 2 + 180;

    this.p1 = new Fighter(1, p1Def, startP1X, stage.groundY, this.vfx);
    this.p2 = new Fighter(2, p2Def, startP2X, stage.groundY, this.vfx);

    this.camera = new Camera2D(canvasWidth, canvasHeight, stage.width, stage.height);

    if (this.gameMode !== 'VS_2P') {
      const diff = this.gameMode === 'TRAINING' ? 'PRACTICE' : 'NORMAL';
      this.ai = new AIController(this.p2, diff);
    }

    // Infinite meter in training mode
    if (this.gameMode === 'TRAINING') {
      this.p1.reiatsu = 300;
      this.p2.reiatsu = 300;
    }

    audio.startBattleBGM();
  }

  public update(): boolean {
    // 1. Update Camera
    this.camera.update(this.p1.x, this.p1.y, this.p2.x, this.p2.y);

    // If in hitstop, freeze world animations
    if (this.camera.hitstopFrames > 0) {
      return false;
    }

    // 2. Announcements & Match Flow
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

    // 3. Process Player 1 Inputs
    this.handlePlayerInput(this.p1, input.p1);

    // 4. Process Player 2 Inputs or CPU AI
    if (this.gameMode === 'VS_2P') {
      this.handlePlayerInput(this.p2, input.p2);
    } else if (this.ai && this.matchState === 'FIGHTING') {
      this.ai.update(this.p1);
    }

    // In training mode, keep meters filled
    if (this.gameMode === 'TRAINING') {
      this.p1.reiatsu = Math.max(250, this.p1.reiatsu);
      this.p2.reiatsu = Math.max(250, this.p2.reiatsu);
    }

    // 5. Update Fighters & Collision
    if (this.matchState === 'FIGHTING') {
      // Decrement round timer
      if (this.gameMode !== 'TRAINING') {
        this.roundTimer -= 1 / 60;
        if (this.roundTimer <= 0) {
          this.handleTimeout();
        }
      }

      this.p1.update(this.p2);
      this.p2.update(this.p1);

      // Clamp within stage bounds
      this.clampFighterToStage(this.p1);
      this.clampFighterToStage(this.p2);

      // Resolve pushbox collisions
      CollisionSystem.resolvePushboxes(this.p1.getPushbox(), this.p2.getPushbox());

      // Check Blade Clash
      this.checkCombatInteractions();

      // Check Round End Conditions
      if (this.p1.hp <= 0 || this.p2.hp <= 0) {
        this.handleRoundFinish();
      }
    } else if (this.matchState === 'ROUND_END' || this.matchState === 'MATCH_END') {
      this.p1.update(this.p2);
      this.p2.update(this.p1);
      this.roundOverTimer++;

      if (this.matchState === 'ROUND_END' && this.roundOverTimer >= 140) {
        this.startNextRound();
      } else if (this.matchState === 'MATCH_END' && this.roundOverTimer >= 220) {
        // Return to title / roster
        audio.stopBattleBGM();
        return true; // Match completed!
      }
    }

    // 6. Update VFX & Projectiles
    this.vfx.update();

    return false;
  }

  private handlePlayerInput(fighter: Fighter, inp: typeof input.p1): void {
    if (this.matchState !== 'FIGHTING') return;

    // Movement & Guard
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

        // Jump
        if (inp.upPressed && fighter.isGrounded) {
          fighter.vy = -fighter.charDef.stats.jumpForce;
          fighter.isGrounded = false;
          fighter.setState('JUMP');
        }
      }
    }

    // Flash Step / Shunpo
    if (inp.shunpoPressed) {
      const dir = inp.left ? -1 : inp.right ? 1 : 0;
      fighter.startShunpo(dir);
    }

    // Attacks & Cancels
    if (inp.lightPressed) {
      fighter.startLightAttack();
    } else if (inp.heavyPressed) {
      fighter.startHeavyAttack();
    } else if (inp.specialPressed) {
      fighter.startSpecial();
    }

    // Reiatsu Charge (Hold)
    if (inp.charge) {
      if (fighter.canAct() && fighter.state !== 'CHARGE_REIATSU') {
        fighter.startCharge();
      }
    } else {
      fighter.stopCharge();
    }

    // Awakening (Bankai) & Ultimate
    if (inp.awakenPressed) {
      if (inp.down) {
        fighter.startUltimate();
      } else {
        fighter.startAwakening();
      }
    }
  }

  private checkCombatInteractions(): void {
    // 1. Blade Clash Check (Hitbox vs Hitbox)
    const clash = CollisionSystem.checkClash(this.p1.currentHitbox, this.p2.currentHitbox);
    if (clash.clash) {
      this.vfx.spawnBladeClash(clash.x, clash.y);
      audio.playSwordClash();
      this.camera.triggerHitstop(8);
      this.camera.addTrauma(0.35);

      // Push both fighters back
      this.p1.vx = -this.p1.facing * 9;
      this.p2.vx = -this.p2.facing * 9;
      this.p1.currentHitbox = null;
      this.p2.currentHitbox = null;
      return;
    }

    // 2. P1 Hitbox vs P2 Hurtbox
    if (this.p1.currentHitbox && !this.p1.hasHitTarget) {
      if (CollisionSystem.testOverlap(this.p1.currentHitbox, this.p2.getHurtbox())) {
        const hb = this.p1.currentHitbox;
        this.p1.hasHitTarget = true;
        this.p2.takeDamage(hb.damage, hb.hitstun, hb.knockbackX, hb.knockbackY, hb.unblockable);
        this.p1.gainReiatsu(14);
        this.camera.triggerHitstop(hb.isHeavy ? 9 : 4);
        this.camera.addTrauma(hb.isHeavy ? 0.35 : 0.15);
      }
    }

    // 3. P2 Hitbox vs P1 Hurtbox
    if (this.p2.currentHitbox && !this.p2.hasHitTarget) {
      if (CollisionSystem.testOverlap(this.p2.currentHitbox, this.p1.getHurtbox())) {
        const hb = this.p2.currentHitbox;
        this.p2.hasHitTarget = true;
        this.p1.takeDamage(hb.damage, hb.hitstun, hb.knockbackX, hb.knockbackY, hb.unblockable);
        this.p2.gainReiatsu(14);
        this.camera.triggerHitstop(hb.isHeavy ? 9 : 4);
        this.camera.addTrauma(hb.isHeavy ? 0.35 : 0.15);
      }
    }

    // 4. Projectile Collisions
    for (let i = this.vfx.projectiles.length - 1; i >= 0; i--) {
      const proj = this.vfx.projectiles[i];
      const target = proj.ownerId === 1 ? this.p2 : this.p1;
      const projRect = { x: proj.x - proj.width / 2, y: proj.y - proj.height / 2, width: proj.width, height: proj.height };

      if (CollisionSystem.testOverlap(projRect, target.getHurtbox())) {
        target.takeDamage(proj.damage, 20, (proj.vx >= 0 ? 1 : -1) * 7, -2, proj.unblockable);
        this.camera.addTrauma(0.4);
        this.camera.triggerHitstop(6);

        if (!proj.piercing) {
          this.vfx.spawnExplosion(proj.x, proj.y, proj.color, 18);
          this.vfx.projectiles.splice(i, 1);
        }
      }
    }
  }

  private handleRoundFinish(): void {
    this.matchState = 'ROUND_END';
    this.roundOverTimer = 0;
    this.camera.triggerHitstop(20);
    this.camera.addTrauma(0.5);

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
      this.announcement = 'TIME UP - P1 WINS!';
    } else if (this.p2.hp > this.p1.hp) {
      this.p2RoundsWon++;
      this.announcement = 'TIME UP - P2 WINS!';
    } else {
      this.announcement = 'TIME UP - DRAW!';
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

    const startP1X = this.stage.width / 2 - 180;
    const startP2X = this.stage.width / 2 + 180;
    this.p1.reset(startP1X, 1);
    this.p2.reset(startP2X, -1);
    this.vfx.clear();
  }

  private clampFighterToStage(f: Fighter): void {
    const halfW = f.width / 2;
    if (f.x - halfW < 40) {
      f.x = 40 + halfW;
      f.vx = 0;
    }
    if (f.x + halfW > this.stage.width - 40) {
      f.x = this.stage.width - 40 - halfW;
      f.vx = 0;
    }
  }

  // --- Render Pass ---

  public render(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number): void {
    this.camera.resize(canvasWidth, canvasHeight);

    // 1. World Transform Pass (Affected by camera zoom & shake)
    this.camera.applyTransform(ctx);

    // Render Stage Parallax Background
    this.stageRenderer.render(ctx, this.stage, this.camera.x, this.camera.y);

    // Render World VFX (Afterimages, Projectiles, Particles)
    this.vfx.renderWorld(ctx);

    // Render Anime Fighters
    AnimeRenderer.renderFighter(ctx, this.p1);
    AnimeRenderer.renderFighter(ctx, this.p2);

    this.camera.restoreTransform(ctx);

    // 2. Screen & HUD Pass (Fixed to viewport)
    this.vfx.renderScreenOverlay(ctx, canvasWidth, canvasHeight);

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
