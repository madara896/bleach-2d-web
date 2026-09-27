// Bleach 2D Web Game: Master Scene Manager & Game Loop
import { TitleScene } from './TitleScene';
import { RosterSelectScene } from './RosterSelectScene';
import { StageSelectScene } from './StageSelectScene';
import { FightScene } from './FightScene';
import { input } from '../engine/InputManager';
import { audio } from '../engine/AudioEngine';
import type { GameState, GameMode, CharacterDefinition, StageDefinition } from '../types';

export class SceneManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private state: GameState = 'TITLE';
  private selectedMode: GameMode = 'VS_CPU';

  private titleScene: TitleScene;
  private rosterScene: RosterSelectScene;
  private stageScene: StageSelectScene;
  private fightScene: FightScene | null = null;

  private p1Selection: CharacterDefinition | null = null;
  private p2Selection: CharacterDefinition | null = null;
  private stageSelection: StageDefinition | null = null;

  // Viewport resolution
  public width: number = 1280;
  public height: number = 720;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;

    this.titleScene = new TitleScene();
    this.rosterScene = new RosterSelectScene();
    this.stageScene = new StageSelectScene();

    // Register mouse/touch coordinates with input manager
    input.registerCanvasEvents(canvas);

    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Initialize Web Audio on first interaction
    window.addEventListener('pointerdown', () => audio.init(), { once: true });
    window.addEventListener('keydown', () => audio.init(), { once: true });
  }

  public resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const container = this.canvas.parentElement;
    if (!container) return;

    const contW = container.clientWidth || 1280;
    const contH = container.clientHeight || 720;

    // Maintain 16:9 aspect ratio
    let targetW = contW;
    let targetH = contW * (9 / 16);

    if (targetH > contH) {
      targetH = contH;
      targetW = contH * (16 / 9);
    }

    this.canvas.width = 1280 * dpr;
    this.canvas.height = 720 * dpr;

    this.canvas.style.width = `${targetW}px`;
    this.canvas.style.height = `${targetH}px`;

    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
    this.width = 1280;
    this.height = 720;
  }

  public start(): void {
    const loop = () => {
      this.update();
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  private update(): void {
    input.update();
    const mouseClick = input.consumeMouseClick();

    const keysJustPressed = {
      up: input.isKeyJustPressed('KeyW', 'w', 'ArrowUp'),
      down: input.isKeyJustPressed('KeyS', 's', 'ArrowDown'),
      left: input.isKeyJustPressed('KeyA', 'a', 'ArrowLeft'),
      right: input.isKeyJustPressed('KeyD', 'd', 'ArrowRight'),
      confirm: input.isKeyJustPressed('KeyJ', 'j', 'Space', 'Enter', 'confirm'),
      back: input.isKeyJustPressed('Escape', 'Backspace', 'back'),
      tabPrev: input.isKeyJustPressed('KeyQ', 'q'),
      tabNext: input.isKeyJustPressed('KeyE', 'e')
    };

    switch (this.state) {
      case 'TITLE': {
        const mode = this.titleScene.update(keysJustPressed, mouseClick, this.width, this.height);
        if (mode) {
          this.selectedMode = mode;
          this.state = 'ROSTER_SELECT';
          this.rosterScene.p1Character = null;
          this.rosterScene.p2Character = null;
        }
        break;
      }

      case 'ROSTER_SELECT': {
        const res = this.rosterScene.update(
          keysJustPressed,
          mouseClick,
          this.width
        );

        if (res && res.ready) {
          this.p1Selection = res.p1;
          this.p2Selection = res.p2;
          this.state = 'STAGE_SELECT';
        }
        break;
      }

      case 'STAGE_SELECT': {
        const st = this.stageScene.update(
          {
            left: keysJustPressed.left,
            right: keysJustPressed.right,
            confirm: keysJustPressed.confirm
          },
          mouseClick,
          this.width,
          this.height
        );

        if (st && this.p1Selection && this.p2Selection) {
          this.stageSelection = st;
          this.fightScene = new FightScene(
            this.p1Selection,
            this.p2Selection,
            st,
            this.selectedMode,
            this.width,
            this.height
          );
          this.state = 'FIGHTING';
        }
        break;
      }

      case 'FIGHTING': {
        if (this.fightScene) {
          const matchDone = this.fightScene.update();
          if (matchDone) {
            // Return to roster select after match
            this.state = 'ROSTER_SELECT';
            this.rosterScene.p1Character = null;
            this.rosterScene.p2Character = null;
            this.fightScene = null;
          }
        }
        break;
      }
    }
  }

  private render(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);

    switch (this.state) {
      case 'TITLE':
        this.titleScene.render(this.ctx, this.width, this.height);
        break;
      case 'ROSTER_SELECT':
        this.rosterScene.render(this.ctx, this.width, this.height);
        break;
      case 'STAGE_SELECT':
        this.stageScene.render(this.ctx, this.width, this.height);
        break;
      case 'FIGHTING':
        if (this.fightScene) {
          this.fightScene.render(this.ctx, this.width, this.height);
        }
        break;
    }
  }
}
