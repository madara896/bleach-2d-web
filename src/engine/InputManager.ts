// Bleach 2D Web Game: Dual Input Manager (Keyboard, Gamepad, Touch)

export interface PlayerInputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  light: boolean;
  heavy: boolean;
  shunpo: boolean;
  special: boolean;
  charge: boolean;
  awaken: boolean;
  
  // Just-pressed single-frame triggers
  lightPressed: boolean;
  heavyPressed: boolean;
  shunpoPressed: boolean;
  specialPressed: boolean;
  chargePressed: boolean;
  awakenPressed: boolean;
  upPressed: boolean;
}

export class InputManager {
  private keysDown: Set<string> = new Set();
  private prevKeysDown: Set<string> = new Set();

  public p1: PlayerInputState = this.createEmptyState();
  public p2: PlayerInputState = this.createEmptyState();

  // Mobile virtual buttons
  public touchInputs: Partial<PlayerInputState> = {};

  constructor() {
    window.addEventListener('keydown', (e) => {
      // Prevent default scrolling for game keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      this.keysDown.add(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.keysDown.delete(e.code);
    });
  }

  private createEmptyState(): PlayerInputState {
    return {
      left: false,
      right: false,
      up: false,
      down: false,
      light: false,
      heavy: false,
      shunpo: false,
      special: false,
      charge: false,
      awaken: false,
      lightPressed: false,
      heavyPressed: false,
      shunpoPressed: false,
      specialPressed: false,
      chargePressed: false,
      awakenPressed: false,
      upPressed: false
    };
  }

  public update(): void {
    // Poll connected Gamepads
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp1 = gamepads[0];
    const gp2 = gamepads[1];

    // Update Player 1
    const p1Prev = { ...this.p1 };
    this.p1.left = this.keysDown.has('KeyA') || (gp1?.axes[0] ? gp1.axes[0] < -0.4 : false) || !!this.touchInputs.left;
    this.p1.right = this.keysDown.has('KeyD') || (gp1?.axes[0] ? gp1.axes[0] > 0.4 : false) || !!this.touchInputs.right;
    this.p1.up = this.keysDown.has('KeyW') || (gp1?.axes[1] ? gp1.axes[1] < -0.4 : false) || !!this.touchInputs.up;
    this.p1.down = this.keysDown.has('KeyS') || (gp1?.axes[1] ? gp1.axes[1] > 0.4 : false) || !!this.touchInputs.down;

    this.p1.light = this.keysDown.has('KeyJ') || (gp1?.buttons[2]?.pressed ?? false) || !!this.touchInputs.light; // X / Square
    this.p1.heavy = this.keysDown.has('KeyK') || (gp1?.buttons[3]?.pressed ?? false) || !!this.touchInputs.heavy; // Y / Triangle
    this.p1.shunpo = this.keysDown.has('KeyL') || (gp1?.buttons[5]?.pressed ?? false) || !!this.touchInputs.shunpo; // RB / R1
    this.p1.special = this.keysDown.has('KeyU') || (gp1?.buttons[0]?.pressed ?? false) || !!this.touchInputs.special; // A / Cross
    this.p1.charge = this.keysDown.has('KeyI') || (gp1?.buttons[4]?.pressed ?? false) || !!this.touchInputs.charge; // LB / L1
    this.p1.awaken = this.keysDown.has('KeyO') || (gp1?.buttons[7]?.pressed ?? false) || !!this.touchInputs.awaken; // RT / R2

    // Single-frame just-pressed triggers
    this.p1.lightPressed = this.p1.light && !p1Prev.light;
    this.p1.heavyPressed = this.p1.heavy && !p1Prev.heavy;
    this.p1.shunpoPressed = this.p1.shunpo && !p1Prev.shunpo;
    this.p1.specialPressed = this.p1.special && !p1Prev.special;
    this.p1.chargePressed = this.p1.charge && !p1Prev.charge;
    this.p1.awakenPressed = this.p1.awaken && !p1Prev.awaken;
    this.p1.upPressed = this.p1.up && !p1Prev.up;

    // Update Player 2 (Arrow keys + Numpad or bracket keys)
    const p2Prev = { ...this.p2 };
    this.p2.left = this.keysDown.has('ArrowLeft') || (gp2?.axes[0] ? gp2.axes[0] < -0.4 : false);
    this.p2.right = this.keysDown.has('ArrowRight') || (gp2?.axes[0] ? gp2.axes[0] > 0.4 : false);
    this.p2.up = this.keysDown.has('ArrowUp') || (gp2?.axes[1] ? gp2.axes[1] < -0.4 : false);
    this.p2.down = this.keysDown.has('ArrowDown') || (gp2?.axes[1] ? gp2.axes[1] > 0.4 : false);

    this.p2.light = this.keysDown.has('Numpad1') || this.keysDown.has('Digit7') || (gp2?.buttons[2]?.pressed ?? false);
    this.p2.heavy = this.keysDown.has('Numpad2') || this.keysDown.has('Digit8') || (gp2?.buttons[3]?.pressed ?? false);
    this.p2.shunpo = this.keysDown.has('Numpad3') || this.keysDown.has('Digit9') || (gp2?.buttons[5]?.pressed ?? false);
    this.p2.special = this.keysDown.has('Numpad4') || this.keysDown.has('Digit0') || (gp2?.buttons[0]?.pressed ?? false);
    this.p2.charge = this.keysDown.has('Numpad5') || this.keysDown.has('Minus') || (gp2?.buttons[4]?.pressed ?? false);
    this.p2.awaken = this.keysDown.has('Numpad6') || this.keysDown.has('Equal') || (gp2?.buttons[7]?.pressed ?? false);

    this.p2.lightPressed = this.p2.light && !p2Prev.light;
    this.p2.heavyPressed = this.p2.heavy && !p2Prev.heavy;
    this.p2.shunpoPressed = this.p2.shunpo && !p2Prev.shunpo;
    this.p2.specialPressed = this.p2.special && !p2Prev.special;
    this.p2.chargePressed = this.p2.charge && !p2Prev.charge;
    this.p2.awakenPressed = this.p2.awaken && !p2Prev.awaken;
    this.p2.upPressed = this.p2.up && !p2Prev.up;

    this.prevKeysDown = new Set(this.keysDown);
  }

  public isKeyJustPressed(code: string): boolean {
    return this.keysDown.has(code) && !this.prevKeysDown.has(code);
  }

  public isKeyPressed(code: string): boolean {
    return this.keysDown.has(code);
  }
}

export const input = new InputManager();
