// Bleach 2D Web Game: CPU AI Decision Engine
import type { Fighter } from './Fighter';

export type AIDifficulty = 'PRACTICE' | 'EASY' | 'NORMAL' | 'CAPTAIN';

export class AIController {
  private fighter: Fighter;
  private difficulty: AIDifficulty;
  private actionCooldown: number = 0;
  private blockCooldown: number = 0;

  constructor(fighter: Fighter, difficulty: AIDifficulty = 'NORMAL') {
    this.fighter = fighter;
    this.difficulty = difficulty;
  }

  public setDifficulty(diff: AIDifficulty): void {
    this.difficulty = diff;
  }

  public update(player: Fighter): void {
    if (this.difficulty === 'PRACTICE') {
      // In practice mode, dummy stands still
      return;
    }

    if (this.actionCooldown > 0) {
      this.actionCooldown--;
    }

    if (this.blockCooldown > 0) {
      this.blockCooldown--;
      if (this.blockCooldown <= 0 && this.fighter.state === 'BLOCK') {
        this.fighter.setState('IDLE');
      }
    }

    if (!this.fighter.canAct() && this.fighter.state !== 'WALK') {
      return;
    }

    const dist = Math.abs(this.fighter.x - player.x);
    const dirToPlayer = player.x > this.fighter.x ? 1 : -1;

    // React to player attacks: Chance to block or Shunpo
    if (player.currentHitbox && dist < 120 && this.fighter.state !== 'BLOCK') {
      const blockChance = this.difficulty === 'CAPTAIN' ? 0.85 : this.difficulty === 'NORMAL' ? 0.5 : 0.2;
      if (Math.random() < blockChance) {
        if (this.difficulty === 'CAPTAIN' && Math.random() < 0.4 && this.fighter.reiatsu >= 20) {
          // Captain AI flash steps behind player!
          this.fighter.startShunpo(-dirToPlayer);
        } else {
          this.fighter.setState('BLOCK');
          this.blockCooldown = 25;
          return;
        }
      }
    }

    if (this.actionCooldown > 0) return;

    // High level AI: Check Awakening & Ultimate triggers
    if (this.fighter.reiatsu >= 300 && dist < 350) {
      const ultChance = this.difficulty === 'CAPTAIN' ? 0.6 : 0.35;
      if (Math.random() < ultChance) {
        this.fighter.startUltimate();
        this.actionCooldown = 60;
        return;
      }
    }

    if (!this.fighter.isAwakened && this.fighter.reiatsu >= 200 && this.fighter.hp < this.fighter.maxHp * 0.7) {
      this.fighter.startAwakening();
      this.actionCooldown = 40;
      return;
    }

    // Distance Management & Combat Flow
    if (dist < 75) {
      // Close range: Combo strings or retreat
      const roll = Math.random();
      if (roll < 0.45) {
        this.fighter.startLightAttack();
        this.actionCooldown = 15;
      } else if (roll < 0.75) {
        this.fighter.startHeavyAttack();
        this.actionCooldown = 22;
      } else if (roll < 0.9 && this.fighter.reiatsu >= 35) {
        this.fighter.startSpecial();
        this.actionCooldown = 30;
      } else {
        // Back step
        this.fighter.vx = -dirToPlayer * this.fighter.charDef.stats.walkSpeed;
      }
    } else if (dist < 220) {
      // Mid range: Poke or close in
      const roll = Math.random();
      if (roll < 0.35 && this.fighter.reiatsu >= 20) {
        // Shunpo in!
        this.fighter.startShunpo(dirToPlayer);
        this.actionCooldown = 18;
      } else if (roll < 0.65 && this.fighter.reiatsu >= 35) {
        // Projectile special
        this.fighter.startSpecial();
        this.actionCooldown = 35;
      } else {
        // Walk closer
        this.fighter.setState('WALK');
        this.fighter.vx = dirToPlayer * this.fighter.charDef.stats.walkSpeed;
      }
    } else {
      // Long range: Charge reiatsu or approach
      const roll = Math.random();
      if (roll < 0.4 && this.fighter.reiatsu < 280) {
        this.fighter.startCharge();
        this.actionCooldown = 30;
      } else if (roll < 0.65 && this.fighter.reiatsu >= 20) {
        this.fighter.startShunpo(dirToPlayer);
        this.actionCooldown = 20;
      } else {
        // Walk towards player
        this.fighter.setState('WALK');
        this.fighter.vx = dirToPlayer * this.fighter.charDef.stats.walkSpeed;
      }
    }
  }
}
