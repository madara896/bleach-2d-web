// Bleach 2D Web Game: Dual Input Manager (Keyboard, Gamepad, Touch, Mouse)

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
  private rawJustPressed: Set<string> = new Set();
  private frameJustPressed: Set<string> = new Set();

  public p1: PlayerInputState = this.createEmptyState();
  public p2: PlayerInputState = this.createEmptyState();

  // Mobile virtual buttons
  public touchInputs: Partial<PlayerInputState> = {};

  // Mouse / Pointer clicks
  public mouseClick: { x: number; y: number } | null = null;
  public mousePos: { x: number; y: number } = { x: 0, y: 0 };

  constructor() {
    window.addEventListener('keydown', (e) => {
      // Prevent default scrolling for game keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) {
        e.preventDefault();
      }

      const keysToAdd = this.normalizeKey(e.code, e.key);
      for (const k of keysToAdd) {
        if (!this.keysDown.has(k)) {
          this.rawJustPressed.add(k);
        }
        this.keysDown.add(k);
      }
    });

    window.addEventListener('keyup', (e) => {
      const keysToRemove = this.normalizeKey(e.code, e.key);
      for (const k of keysToRemove) {
        this.keysDown.delete(k);
      }
    });

    window.addEventListener('blur', () => {
      this.keysDown.clear();
      this.rawJustPressed.clear();
      this.frameJustPressed.clear();
    });
  }

  private normalizeKey(code: string, key: string): string[] {
    const list: string[] = [code, code.toLowerCase()];
    if (key) {
      list.push(key);
      list.push(key.toLowerCase());
    }
    // Convenience aliases
    if (code === 'KeyW' || key === 'w' || key === 'W') list.push('w', 'KeyW', 'up');
    if (code === 'KeyA' || key === 'a' || key === 'A') list.push('a', 'KeyA', 'left');
    if (code === 'KeyS' || key === 's' || key === 'S') list.push('s', 'KeyS', 'down');
    if (code === 'KeyD' || key === 'd' || key === 'D') list.push('d', 'KeyD', 'right');
    if (code === 'KeyJ' || key === 'j' || key === 'J') list.push('j', 'KeyJ', 'light');
    if (code === 'KeyK' || key === 'k' || key === 'K') list.push('k', 'KeyK', 'heavy');
    if (code === 'KeyL' || key === 'l' || key === 'L') list.push('l', 'KeyL', 'shunpo');
    if (code === 'KeyU' || key === 'u' || key === 'U') list.push('u', 'KeyU', 'special');
    if (code === 'KeyI' || key === 'i' || key === 'I') list.push('i', 'KeyI', 'charge');
    if (code === 'KeyO' || key === 'o' || key === 'O') list.push('o', 'KeyO', 'awaken');

    if (code === 'Space' || key === ' ') list.push('Space', 'space', 'confirm');
    if (code === 'Enter' || key === 'Enter') list.push('Enter', 'enter', 'confirm');
    if (code === 'Escape' || key === 'Escape') list.push('Escape', 'escape', 'back');

    return list;
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

  public registerCanvasEvents(canvas: HTMLCanvasElement): void {
    const getPos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = 1280 / rect.width;
      const scaleY = 720 / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    canvas.addEventListener('mousemove', (e) => {
      this.mousePos = getPos(e);
    });

    canvas.addEventListener('mousedown', (e) => {
      this.mouseClick = getPos(e);
    });

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const scaleX = 1280 / rect.width;
        const scaleY = 720 / rect.height;
        this.mouseClick = {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY
        };
      }
    }, { passive: true });
  }

  public update(): void {
    // 1. Transfer raw just-pressed events into frameJustPressed
    this.frameJustPressed = new Set(this.rawJustPressed);
    this.rawJustPressed.clear();

    // 2. Poll connected Gamepads
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp1 = gamepads[0];
    const gp2 = gamepads[1];

    // Helper checks
    const isP1Held = (...keys: string[]) => keys.some(k => this.keysDown.has(k) || this.keysDown.has(k.toLowerCase()));
    const isP1JustPressed = (...keys: string[]) => keys.some(k => this.frameJustPressed.has(k) || this.frameJustPressed.has(k.toLowerCase()));

    // Update Player 1
    // Supports WASD + Arrow Keys for single-player movement
    this.p1.left = isP1Held('KeyA', 'a', 'ArrowLeft') || (gp1?.axes[0] ? gp1.axes[0] < -0.4 : false) || !!this.touchInputs.left;
    this.p1.right = isP1Held('KeyD', 'd', 'ArrowRight') || (gp1?.axes[0] ? gp1.axes[0] > 0.4 : false) || !!this.touchInputs.right;
    this.p1.up = isP1Held('KeyW', 'w', 'ArrowUp') || (gp1?.axes[1] ? gp1.axes[1] < -0.4 : false) || !!this.touchInputs.up;
    this.p1.down = isP1Held('KeyS', 's', 'ArrowDown') || (gp1?.axes[1] ? gp1.axes[1] > 0.4 : false) || !!this.touchInputs.down;

    this.p1.light = isP1Held('KeyJ', 'j', 'KeyZ', 'z') || (gp1?.buttons[2]?.pressed ?? false) || !!this.touchInputs.light;
    this.p1.heavy = isP1Held('KeyK', 'k', 'KeyX', 'x') || (gp1?.buttons[3]?.pressed ?? false) || !!this.touchInputs.heavy;
    this.p1.shunpo = isP1Held('KeyL', 'l', 'KeyC', 'c') || (gp1?.buttons[5]?.pressed ?? false) || !!this.touchInputs.shunpo;
    this.p1.special = isP1Held('KeyU', 'u', 'KeyV', 'v') || (gp1?.buttons[0]?.pressed ?? false) || !!this.touchInputs.special;
    this.p1.charge = isP1Held('KeyI', 'i', 'KeyB', 'b') || (gp1?.buttons[4]?.pressed ?? false) || !!this.touchInputs.charge;
    this.p1.awaken = isP1Held('KeyO', 'o', 'KeyN', 'n') || (gp1?.buttons[7]?.pressed ?? false) || !!this.touchInputs.awaken;

    // Single-frame just-pressed triggers for Player 1
    this.p1.lightPressed = isP1JustPressed('KeyJ', 'j', 'KeyZ', 'z') || !!this.touchInputs.light;
    this.p1.heavyPressed = isP1JustPressed('KeyK', 'k', 'KeyX', 'x') || !!this.touchInputs.heavy;
    this.p1.shunpoPressed = isP1JustPressed('KeyL', 'l', 'KeyC', 'c') || !!this.touchInputs.shunpo;
    this.p1.specialPressed = isP1JustPressed('KeyU', 'u', 'KeyV', 'v') || !!this.touchInputs.special;
    this.p1.chargePressed = isP1JustPressed('KeyI', 'i', 'KeyB', 'b') || !!this.touchInputs.charge;
    this.p1.awakenPressed = isP1JustPressed('KeyO', 'o', 'KeyN', 'n') || !!this.touchInputs.awaken;
    this.p1.upPressed = isP1JustPressed('KeyW', 'w', 'ArrowUp') || !!this.touchInputs.up;

    // Update Player 2 (Arrow keys + Numpad or bracket keys)
    this.p2.left = isP1Held('ArrowLeft') || (gp2?.axes[0] ? gp2.axes[0] < -0.4 : false);
    this.p2.right = isP1Held('ArrowRight') || (gp2?.axes[0] ? gp2.axes[0] > 0.4 : false);
    this.p2.up = isP1Held('ArrowUp') || (gp2?.axes[1] ? gp2.axes[1] < -0.4 : false);
    this.p2.down = isP1Held('ArrowDown') || (gp2?.axes[1] ? gp2.axes[1] > 0.4 : false);

    this.p2.light = isP1Held('Numpad1', 'Digit7') || (gp2?.buttons[2]?.pressed ?? false);
    this.p2.heavy = isP1Held('Numpad2', 'Digit8') || (gp2?.buttons[3]?.pressed ?? false);
    this.p2.shunpo = isP1Held('Numpad3', 'Digit9') || (gp2?.buttons[5]?.pressed ?? false);
    this.p2.special = isP1Held('Numpad4', 'Digit0') || (gp2?.buttons[0]?.pressed ?? false);
    this.p2.charge = isP1Held('Numpad5', 'Minus') || (gp2?.buttons[4]?.pressed ?? false);
    this.p2.awaken = isP1Held('Numpad6', 'Equal') || (gp2?.buttons[7]?.pressed ?? false);

    this.p2.lightPressed = isP1JustPressed('Numpad1', 'Digit7');
    this.p2.heavyPressed = isP1JustPressed('Numpad2', 'Digit8');
    this.p2.shunpoPressed = isP1JustPressed('Numpad3', 'Digit9');
    this.p2.specialPressed = isP1JustPressed('Numpad4', 'Digit0');
    this.p2.chargePressed = isP1JustPressed('Numpad5', 'Minus');
    this.p2.awakenPressed = isP1JustPressed('Numpad6', 'Equal');
    this.p2.upPressed = isP1JustPressed('ArrowUp');
  }

  public isKeyJustPressed(...codes: string[]): boolean {
    return codes.some(code => this.frameJustPressed.has(code) || this.frameJustPressed.has(code.toLowerCase()));
  }

  public isKeyPressed(...codes: string[]): boolean {
    return codes.some(code => this.keysDown.has(code) || this.keysDown.has(code.toLowerCase()));
  }

  public consumeMouseClick(): { x: number; y: number } | null {
    const c = this.mouseClick;
    this.mouseClick = null;
    return c;
  }
}

export const input = new InputManager();
