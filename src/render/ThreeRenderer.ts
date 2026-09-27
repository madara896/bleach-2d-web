// Three.js Renderer — Manages the WebGL scene for the 3D fight view
// Uses a dedicated <canvas id="three-canvas"> overlaid on the HUD canvas

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }     from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass }     from 'three/addons/postprocessing/OutputPass.js';

export class ThreeRenderer {
  public renderer: THREE.WebGLRenderer;
  public scene:    THREE.Scene;
  public camera:   THREE.PerspectiveCamera;
  private composer: EffectComposer;

  // Dynamic lights that follow each fighter
  public p1Light: THREE.PointLight;
  public p2Light: THREE.PointLight;
  private ambientLight: THREE.AmbientLight;
  private mainLight:    THREE.DirectionalLight;
  private rimLight:     THREE.DirectionalLight;

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    // ── Renderer ────────────────────────────────────────────────────────────
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // ── Scene ────────────────────────────────────────────────────────────────
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x000008, 18, 40);
    this.scene.background = new THREE.Color(0x000005);

    // ── Camera ───────────────────────────────────────────────────────────────
    // Side-angle perspective — classic 2.5D fighter camera
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.camera.position.set(0, 2.2, 13);
    this.camera.lookAt(0, 1.2, 0);

    // ── Lighting ─────────────────────────────────────────────────────────────
    // Ambient — cold base fill
    this.ambientLight = new THREE.AmbientLight(0x111122, 1.8);
    this.scene.add(this.ambientLight);

    // Main key light — slightly warm, from above-front
    this.mainLight = new THREE.DirectionalLight(0xfff5e0, 2.5);
    this.mainLight.position.set(2, 6, 5);
    this.mainLight.castShadow = true;
    this.mainLight.shadow.mapSize.set(2048, 2048);
    this.mainLight.shadow.camera.near = 0.5;
    this.mainLight.shadow.camera.far  = 50;
    this.mainLight.shadow.camera.left   = -10;
    this.mainLight.shadow.camera.right  =  10;
    this.mainLight.shadow.camera.top    =  10;
    this.mainLight.shadow.camera.bottom = -10;
    this.scene.add(this.mainLight);

    // Rim / back light — purple/blue cinematic rim from behind
    this.rimLight = new THREE.DirectionalLight(0x4433ff, 1.2);
    this.rimLight.position.set(-3, 4, -8);
    this.scene.add(this.rimLight);

    // Per-fighter reiatsu point lights — start dim, get updated each frame
    this.p1Light = new THREE.PointLight(0xffffff, 0, 5, 1.8);
    this.p1Light.position.set(-3, 2, 0);
    this.scene.add(this.p1Light);

    this.p2Light = new THREE.PointLight(0xffffff, 0, 5, 1.8);
    this.p2Light.position.set(3, 2, 0);
    this.scene.add(this.p2Light);

    // ── Post-processing ──────────────────────────────────────────────────────
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Selective bloom — makes energy effects glow without washing out everything
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.55,   // strength
      0.4,    // radius
      0.82    // threshold — only bright pixels bloom
    );
    this.composer.addPass(bloomPass);

    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  public render(): void {
    this.composer.render();
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
  }

  // Move camera to focus on the midpoint between fighters with dynamic zoom
  public updateCamera(p1x: number, p2x: number): void {
    const SCALE = 95;
    const midX  = ((p1x + p2x) / 2 - 800) / SCALE;
    const span  = Math.abs(p2x - p1x) / SCALE;
    const targetZ = Math.max(7.5, Math.min(13.5, 6.2 + span * 1.1));

    this.camera.position.x += (midX - this.camera.position.x) * 0.08;
    this.camera.position.z += (targetZ - this.camera.position.z) * 0.06;
    this.camera.position.y = 2.0;
    this.camera.lookAt(this.camera.position.x, 1.4, 0);
  }

  // Update a fighter's point light position and intensity
  public updateFighterLight(
    light: THREE.PointLight,
    gameX: number,
    gameY: number,
    color: string,
    intensity: number
  ): void {
    const SCALE = 95;
    light.color.set(color);
    light.intensity  = intensity;
    light.position.x = (gameX - 800) / SCALE;
    light.position.y = Math.max(0.5, (520 - gameY) / SCALE) + 1.5;
    light.position.z = 0.8;
  }
}

