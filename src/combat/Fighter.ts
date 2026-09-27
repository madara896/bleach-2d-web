// Bleach 2D Web Game: Fighter Entity & Combat State Machine
import type { CharacterDefinition, FighterState, Hitbox, Rect, Projectile } from '../types';
import { audio } from '../engine/AudioEngine';
import type { VFXEngine } from '../engine/VFXEngine';

export class Fighter {
  public id: number; // 1 or 2
  public charDef: CharacterDefinition;
  
  // Position & Velocity
  public x: number;
  public y: number;
  public vx: number = 0;
  public vy: number = 0;
  public facing: 1 | -1 = 1;
  public isGrounded: boolean = true;
  public groundY: number = 520;
  
  public width: number = 48;
  public height: number = 96;

  // Combat Stats
  public hp: number;
  public maxHp: number;
  public displayHp: number;
  public reiatsu: number = 100; // start with 1 stock
  public maxReiatsu: number = 300;
  public guardMeter: number = 100;
  public maxGuardMeter: number = 100;

  // States
  public state: FighterState = 'IDLE';
  public stateTime: number = 0;
  public isAwakened: boolean = false;
  public awakeningTimer: number = 0;
  
  // Stun & Invulnerability
  public hitstun: number = 0;
  public blockstun: number = 0;
  public invulnerableFrames: number = 0;

  // Combo Tracking
  public comboCount: number = 0;
  public comboTimer: number = 0;

  // Active Hitbox
  public currentHitbox: Hitbox | null = null;
  public hasHitTarget: boolean = false;

  // Animation Pose Flags (for rendering)
  public attackPhase: 'startup' | 'active' | 'recovery' = 'startup';
  public weaponAngle: number = 0;
  public bodyLean: number = 0;

  private vfx: VFXEngine;

  constructor(id: number, charDef: CharacterDefinition, startX: number, groundY: number, vfx: VFXEngine) {
    this.id = id;
    this.charDef = charDef;
    this.x = startX;
    this.groundY = groundY;
    this.y = groundY;
    this.facing = id === 1 ? 1 : -1;
    this.maxHp = charDef.stats.maxHp;
    this.hp = this.maxHp;
    this.displayHp = this.maxHp;
    this.vfx = vfx;
  }

  public reset(startX: number, facing: 1 | -1): void {
    this.x = startX;
    this.y = this.groundY;
    this.vx = 0;
    this.vy = 0;
    this.facing = facing;
    this.isGrounded = true;
    this.hp = this.maxHp;
    this.displayHp = this.maxHp;
    this.reiatsu = 100;
    this.guardMeter = this.maxGuardMeter;
    this.state = 'IDLE';
    this.stateTime = 0;
    this.isAwakened = false;
    this.awakeningTimer = 0;
    this.hitstun = 0;
    this.blockstun = 0;
    this.invulnerableFrames = 0;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.currentHitbox = null;
  }

  public getHurtbox(): Rect {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height,
      width: this.width,
      height: this.height
    };
  }

  public getPushbox(): Rect {
    return {
      x: this.x - this.width / 2 + 8,
      y: this.y - this.height,
      width: this.width - 16,
      height: this.height
    };
  }

  // --- Attack Triggers ---

  public canAct(): boolean {
    return [
      'IDLE',
      'WALK',
      'CROUCH',
      'BLOCK',
      'JUMP',
      'FALL'
    ].includes(this.state);
  }

  public startLightAttack(): boolean {
    if (!this.canAct() && this.state !== 'WALK') return false;
    this.setState('LIGHT_ATTACK');
    this.hasHitTarget = false;
    audio.playSwordClash();
    return true;
  }

  public startHeavyAttack(): boolean {
    // Can cancel from light attack if already connected!
    const canCancel = (this.state === 'LIGHT_ATTACK' && this.hasHitTarget);
    if (!this.canAct() && !canCancel) return false;
    
    this.setState('HEAVY_ATTACK');
    this.hasHitTarget = false;
    audio.playSwordClash();
    return true;
  }

  public startShunpo(dirX: number = 0): boolean {
    if (!this.canAct() && !(this.state === 'LIGHT_ATTACK' || this.state === 'HEAVY_ATTACK')) return false;
    const cost = 20;
    if (this.reiatsu < cost) return false;

    this.reiatsu -= cost;
    const dashDir = dirX !== 0 ? dirX : this.facing;
    const speed = this.isAwakened ? this.charDef.stats.dashSpeed * 1.35 : this.charDef.stats.dashSpeed;
    
    this.vx = dashDir * speed;
    this.invulnerableFrames = 12; // brief i-frames during flash step
    this.setState('DASH_FORWARD');
    audio.playShunpo();

    // Spawn afterimages
    for (let i = 0; i < 3; i++) {
      this.vfx.addAfterimage({
        x: this.x - dashDir * i * 28,
        y: this.y,
        facing: this.facing,
        color: this.isAwakened ? this.charDef.reiatsuColor : '#ffffff',
        alpha: 0.7 - i * 0.2,
        life: 12 - i * 3,
        renderCallback: () => {} // handled in main renderer
      });
    }

    return true;
  }

  public startSpecial(): boolean {
    const cost = 35;
    const canCancel = (this.state === 'LIGHT_ATTACK' || this.state === 'HEAVY_ATTACK') && this.hasHitTarget;
    if (!this.canAct() && !canCancel) return false;
    if (this.reiatsu < cost) return false;

    this.reiatsu -= cost;
    this.setState('SPECIAL_1');
    this.hasHitTarget = false;
    return true;
  }

  public startCharge(): boolean {
    if (!this.canAct()) return false;
    this.setState('CHARGE_REIATSU');
    return true;
  }

  public stopCharge(): void {
    if (this.state === 'CHARGE_REIATSU') {
      this.setState('IDLE');
    }
  }

  public startAwakening(): boolean {
    if (this.isAwakened) return false;
    if (this.reiatsu < 200) return false; // requires 2 stocks
    if (!this.canAct()) return false;

    this.reiatsu -= 200;
    this.isAwakened = true;
    this.awakeningTimer = this.charDef.awakeningDuration;
    this.setState('AWAKEN');
    
    audio.playBankai();
    this.vfx.triggerCutIn(
      this.charDef.name,
      this.charDef.awakeningName,
      this.charDef.quotes.awaken,
      this.charDef.reiatsuColor
    );
    this.vfx.spawnExplosion(this.x, this.y - 45, this.charDef.reiatsuColor, 35);
    return true;
  }

  public startUltimate(): boolean {
    if (this.reiatsu < 300) return false; // requires all 3 stocks
    if (!this.canAct()) return false;

    this.reiatsu -= 300;
    this.setState('ULTIMATE');

    audio.playUltimate();
    this.vfx.triggerCutIn(
      this.charDef.name,
      this.charDef.ultimateName,
      this.charDef.quotes.ultimate,
      '#ff0033'
    );
    this.vfx.triggerScreenFlash('#ffffff', 0.95);
    return true;
  }

  // --- Damage & Hit Processing ---

  public takeDamage(damage: number, hitstunFrames: number, knockbackX: number, knockbackY: number, unblockable: boolean = false): void {
    if (this.invulnerableFrames > 0) return;

    // Check if blocking
    if (this.state === 'BLOCK' && !unblockable) {
      this.blockAttack(damage, hitstunFrames / 2, knockbackX / 2);
      return;
    }

    const effectiveDamage = Math.max(5, damage / this.charDef.stats.defense);
    this.hp = Math.max(0, this.hp - effectiveDamage);
    this.hitstun = hitstunFrames;
    this.vx = knockbackX;
    this.vy = knockbackY;
    if (knockbackY < -3) {
      this.isGrounded = false;
    }

    this.comboCount++;
    this.comboTimer = 75; // reset combo timeout

    audio.playHitHeavy();
    this.vfx.spawnHitSparks(this.x, this.y - 50, '#ff3333', 14);

    if (this.hp <= 0) {
      this.setState('DEFEATED');
    } else {
      this.setState(knockbackY < -4 ? 'KNOCKDOWN' : 'HURT');
    }
  }

  public blockAttack(damage: number, blockstunFrames: number, pushbackX: number): void {
    const chipDamage = Math.max(1, damage * 0.15);
    this.hp = Math.max(0, this.hp - chipDamage);
    this.guardMeter = Math.max(0, this.guardMeter - 18);
    this.blockstun = blockstunFrames;
    this.vx = pushbackX;

    audio.playBlock();
    this.vfx.spawnHitSparks(this.x, this.y - 45, '#00ffff', 8);

    // Guard break if depleted!
    if (this.guardMeter <= 0) {
      this.hitstun = 90; // massive stun on guard break
      this.setState('HURT');
      this.vfx.spawnExplosion(this.x, this.y - 45, '#ff0055', 20);
    }
  }

  public gainReiatsu(amount: number): void {
    this.reiatsu = Math.min(this.maxReiatsu, this.reiatsu + amount * this.charDef.stats.reiatsuGainRate);
  }

  public setState(newState: FighterState): void {
    this.state = newState;
    this.stateTime = 0;
    this.currentHitbox = null;
  }

  // --- Main Per-Frame Update ---

  public update(opponent: Fighter): void {
    this.stateTime++;

    // Slowly drain displayHp toward real hp for red health bar animation
    if (this.displayHp > this.hp) {
      this.displayHp = Math.max(this.hp, this.displayHp - 2.5);
    }

    // Recover guard meter slowly over time
    if (this.state !== 'BLOCK' && this.guardMeter < this.maxGuardMeter) {
      this.guardMeter = Math.min(this.maxGuardMeter, this.guardMeter + 0.12);
    }

    // Decrease i-frames
    if (this.invulnerableFrames > 0) {
      this.invulnerableFrames--;
    }

    // Combo timer decay
    if (this.comboTimer > 0) {
      this.comboTimer--;
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
      }
    }

    // Awakening duration
    if (this.isAwakened) {
      this.awakeningTimer--;
      if (this.awakeningTimer <= 0) {
        this.isAwakened = false;
        this.vfx.spawnExplosion(this.x, this.y - 45, '#555555', 12);
      } else {
        // Continuous Reiatsu aura
        if (this.stateTime % 3 === 0) {
          this.vfx.spawnReiatsuAura(this.x, this.y, this.charDef.reiatsuColor, 1.2);
        }
      }
    }

    // Handle Ground Physics & Gravity
    if (!this.isGrounded) {
      this.vy += 0.65; // gravity
      this.y += this.vy;
      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.vy = 0;
        this.isGrounded = true;
        if (this.state === 'FALL') {
          this.setState('IDLE');
        } else if (this.state === 'KNOCKDOWN') {
          this.setState('WAKEUP');
        }
      }
    }

    // Horizontal Movement & Friction
    this.x += this.vx;
    if (this.isGrounded) {
      this.vx *= 0.84; // ground friction
      if (Math.abs(this.vx) < 0.15) this.vx = 0;
    } else {
      this.vx *= 0.94; // air resistance
    }

    // Auto-face opponent during neutral
    if (['IDLE', 'WALK', 'CROUCH'].includes(this.state)) {
      this.facing = this.x < opponent.x ? 1 : -1;
    }

    // State Machine Frame Execution
    this.executeState(opponent);
  }

  private executeState(opponent: Fighter): void {
    switch (this.state) {
      case 'IDLE':
        this.currentHitbox = null;
        break;

      case 'WALK':
        this.currentHitbox = null;
        break;

      case 'BLOCK':
        this.currentHitbox = null;
        break;

      case 'DASH_FORWARD':
        if (this.stateTime >= 14) {
          this.setState('IDLE');
        }
        break;

      case 'CHARGE_REIATSU':
        this.gainReiatsu(0.9);
        this.vfx.spawnReiatsuAura(this.x, this.y, this.charDef.reiatsuColor, 1.5);
        break;

      case 'LIGHT_ATTACK':
        if (this.stateTime >= 4 && this.stateTime <= 9) {
          this.attackPhase = 'active';
          this.currentHitbox = {
            x: this.x + (this.facing === 1 ? 15 : -65),
            y: this.y - 75,
            width: 50,
            height: 45,
            damage: 28 * this.charDef.stats.attackPower * (this.isAwakened ? 1.3 : 1.0),
            hitstun: 16,
            blockstun: 10,
            knockbackX: this.facing * 3,
            knockbackY: 0
          };
        } else {
          this.currentHitbox = null;
          this.attackPhase = this.stateTime < 4 ? 'startup' : 'recovery';
        }

        if (this.stateTime >= 18) {
          this.setState('IDLE');
        }
        break;

      case 'HEAVY_ATTACK':
        if (this.stateTime >= 8 && this.stateTime <= 16) {
          this.attackPhase = 'active';
          this.currentHitbox = {
            x: this.x + (this.facing === 1 ? 15 : -85),
            y: this.y - 85,
            width: 70,
            height: 60,
            damage: 65 * this.charDef.stats.attackPower * (this.isAwakened ? 1.35 : 1.0),
            hitstun: 24,
            blockstun: 14,
            knockbackX: this.facing * 7,
            knockbackY: -2.5,
            isHeavy: true
          };
        } else {
          this.currentHitbox = null;
          this.attackPhase = this.stateTime < 8 ? 'startup' : 'recovery';
        }

        if (this.stateTime >= 30) {
          this.setState('IDLE');
        }
        break;

      case 'SPECIAL_1':
        if (this.stateTime === 12) {
          this.fireSignatureSpecial();
        }
        if (this.stateTime >= 34) {
          this.setState('IDLE');
        }
        break;

      case 'AWAKEN':
        if (this.stateTime >= 40) {
          this.setState('IDLE');
        }
        break;

      case 'ULTIMATE':
        if (this.stateTime === 25) {
          this.executeSignatureUltimate(opponent);
        }
        if (this.stateTime >= 65) {
          this.setState('IDLE');
        }
        break;

      case 'HURT':
        this.currentHitbox = null;
        if (this.stateTime >= this.hitstun) {
          this.setState('IDLE');
        }
        break;

      case 'KNOCKDOWN':
        this.currentHitbox = null;
        if (this.isGrounded && this.stateTime >= 24) {
          this.setState('WAKEUP');
        }
        break;

      case 'WAKEUP':
        this.currentHitbox = null;
        this.invulnerableFrames = 10;
        if (this.stateTime >= 14) {
          this.setState('IDLE');
        }
        break;
    }
  }

  private fireSignatureSpecial(): void {
    const dir = this.facing;
    const spawnX = this.x + dir * 40;
    const spawnY = this.y - 50;

    switch (this.charDef.id) {
      case 'ichigo': {
        audio.playGetsuga();
        const color = this.isAwakened ? '#111111' : '#00b4d8';
        const secColor = this.isAwakened ? '#ff0033' : '#90e0ef';
        this.vfx.projectiles.push({
          id: `proj_${Date.now()}_${Math.random()}`,
          ownerId: this.id,
          type: 'getsuga',
          x: spawnX,
          y: spawnY,
          vx: dir * (this.isAwakened ? 16 : 12),
          vy: 0,
          width: 80,
          height: 65,
          damage: (this.isAwakened ? 95 : 70) * this.charDef.stats.attackPower,
          color,
          secondaryColor: secColor,
          duration: 90,
          piercing: false
        });
        break;
      }

      case 'ulquiorra': {
        audio.playCero();
        const color = this.isAwakened ? '#051b11' : '#00ff66';
        this.vfx.projectiles.push({
          id: `proj_${Date.now()}_${Math.random()}`,
          ownerId: this.id,
          type: 'cero',
          x: spawnX,
          y: spawnY,
          vx: dir * (this.isAwakened ? 18 : 14),
          vy: 0,
          width: 90,
          height: 55,
          damage: (this.isAwakened ? 100 : 75) * this.charDef.stats.attackPower,
          color,
          secondaryColor: '#ffffff',
          duration: 80,
          piercing: true
        });
        break;
      }

      case 'aizen': {
        audio.playKurohitsugi();
        // Spawns Kurohitsugi directly under opponent!
        this.vfx.projectiles.push({
          id: `proj_${Date.now()}_${Math.random()}`,
          ownerId: this.id,
          type: 'kurohitsugi',
          x: spawnX + dir * 180,
          y: this.groundY,
          vx: 0,
          vy: 0,
          width: 70,
          height: 140,
          damage: 85 * this.charDef.stats.attackPower,
          color: '#9933ff',
          secondaryColor: '#ff0055',
          duration: 45,
          piercing: true
        });
        break;
      }

      case 'yhwach': {
        audio.playArrow();
        for (let i = -1; i <= 1; i++) {
          this.vfx.projectiles.push({
            id: `proj_${Date.now()}_${Math.random()}`,
            ownerId: this.id,
            type: 'arrow',
            x: spawnX,
            y: spawnY + i * 18,
            vx: dir * 15,
            vy: i * 1.5,
            width: 45,
            height: 14,
            damage: 32 * this.charDef.stats.attackPower,
            color: '#00e5ff',
            secondaryColor: '#ffffff',
            duration: 80,
            piercing: false
          });
        }
        break;
      }

      default: {
        // Generic energy blade wave
        audio.playGetsuga();
        this.vfx.projectiles.push({
          id: `proj_${Date.now()}_${Math.random()}`,
          ownerId: this.id,
          type: 'getsuga',
          x: spawnX,
          y: spawnY,
          vx: dir * 13,
          vy: 0,
          width: 60,
          height: 50,
          damage: 65 * this.charDef.stats.attackPower,
          color: this.charDef.reiatsuColor,
          secondaryColor: '#ffffff',
          duration: 80,
          piercing: false
        });
        break;
      }
    }
  }

  private executeSignatureUltimate(opponent: Fighter): void {
    const dir = this.facing;
    const targetX = opponent.x;

    switch (this.charDef.id) {
      case 'ichigo': {
        // Mugetsu: Screen-cutting cataclysm
        opponent.takeDamage(280 * this.charDef.stats.attackPower, 45, dir * 12, -7, true);
        this.vfx.spawnExplosion(targetX, opponent.y - 50, '#ff0033', 40);
        this.vfx.spawnExplosion(targetX, opponent.y - 50, '#000000', 30);
        break;
      }

      case 'ulquiorra': {
        // Lanza del Relámpago: Giant lightning nuclear lance
        opponent.takeDamage(270 * this.charDef.stats.attackPower, 45, dir * 12, -7, true);
        this.vfx.spawnExplosion(targetX, opponent.y - 50, '#00ff66', 50);
        break;
      }

      case 'aizen': {
        // Kurohitsugi Transcendent
        opponent.takeDamage(290 * this.charDef.stats.attackPower, 50, dir * 10, -6, true);
        this.vfx.spawnExplosion(targetX, opponent.y - 50, '#9933ff', 45);
        break;
      }

      case 'yhwach': {
        // Auswählen
        opponent.takeDamage(285 * this.charDef.stats.attackPower, 45, dir * 11, -8, true);
        this.vfx.spawnExplosion(targetX, opponent.y - 50, '#00e5ff', 45);
        break;
      }

      default: {
        opponent.takeDamage(260 * this.charDef.stats.attackPower, 40, dir * 10, -6, true);
        this.vfx.spawnExplosion(targetX, opponent.y - 50, this.charDef.reiatsuColor, 40);
        break;
      }
    }
  }
}
