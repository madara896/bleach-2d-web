// 3D Stage Environment — renders the fighting arena with Three.js
// Each stage has distinct geometry, lighting color, and atmosphere

import * as THREE from 'three';
import type { StageDefinition } from '../types';

// Gradient sky texture
function makeSkyTexture(top: string, bottom: string): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 2; canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, top);
  grad.addColorStop(1, bottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2, 512);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Per-stage theme data
interface StageTheme {
  skyTop:    string;
  skyBot:    string;
  groundCol: number;
  groundRough: number;
  groundMetal: number;
  fogColor:  number;
  ambientBoost: string; // extra ambient color
  pillars:   boolean;
  pillarsCol: number;
}

const STAGE_THEMES: Record<string, StageTheme> = {
  sokyoku:    { skyTop: '#ff6a00', skyBot: '#c94b00', groundCol: 0x3a2800, groundRough: 0.9, groundMetal: 0.0, fogColor: 0x3a1500, ambientBoost: '#331100', pillars: false, pillarsCol: 0 },
  las_noches: { skyTop: '#001122', skyBot: '#000a14', groundCol: 0xe8e8e0, groundRough: 0.3, groundMetal: 0.2, fogColor: 0x001820, ambientBoost: '#002233', pillars: true,  pillarsCol: 0xd8d8cc },
  silbern:    { skyTop: '#050520', skyBot: '#020210', groundCol: 0x1a1a3a, groundRough: 0.2, groundMetal: 0.6, fogColor: 0x050515, ambientBoost: '#0a0a2a', pillars: true,  pillarsCol: 0x333355 },
  karakura:   { skyTop: '#000a1a', skyBot: '#000308', groundCol: 0x1a1a1a, groundRough: 0.7, groundMetal: 0.1, fogColor: 0x000510, ambientBoost: '#050510', pillars: false, pillarsCol: 0 },
};

export class Stage3D {
  public group: THREE.Group;
  private threeScene: THREE.Scene;

  constructor(stage: StageDefinition, scene: THREE.Scene) {
    this.group      = new THREE.Group();
    this.threeScene = scene;
    this.build(stage);
    scene.add(this.group);
  }

  private build(stage: StageDefinition): void {
    const key   = stage.id ?? 'sokyoku';
    const theme = STAGE_THEMES[key] ?? STAGE_THEMES.sokyoku;

    // ── Sky backdrop ─────────────────────────────────────────────────────────
    const skyGeo = new THREE.PlaneGeometry(60, 30);
    const skyMat = new THREE.MeshBasicMaterial({
      map: makeSkyTexture(theme.skyTop, theme.skyBot),
      side: THREE.FrontSide,
      depthWrite: false,
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    sky.position.set(0, 8, -12);
    this.group.add(sky);

    // ── Ground plane ─────────────────────────────────────────────────────────
    const groundGeo = new THREE.PlaneGeometry(36, 20);
    const groundMat = new THREE.MeshStandardMaterial({
      color: theme.groundCol,
      roughness: theme.groundRough,
      metalness: theme.groundMetal,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    this.group.add(ground);

    // Ground edge line — glowing orange/white energy line at the fighter's feet
    const edgeGeo = new THREE.BoxGeometry(20, 0.04, 0.04);
    const edgeMat = new THREE.MeshStandardMaterial({ color: 0xff8800, emissive: new THREE.Color(0xff5500), emissiveIntensity: 2.5 });
    const edge = new THREE.Mesh(edgeGeo, edgeMat);
    edge.position.set(0, 0.01, 0.5);
    this.group.add(edge);


    // ── Stage-specific structures ─────────────────────────────────────────────
    if (theme.pillars) {
      this.addPillars(theme.pillarsCol);
    }

    if (key === 'sokyoku') this.addSokyokuDetails();
    if (key === 'las_noches') this.addLasNochesDetails();
    if (key === 'karakura') this.addKarakuraDetails();
    if (key === 'silbern') this.addSilbernDetails();

    // ── Update scene fog and background ──────────────────────────────────────
    this.threeScene.fog = new THREE.Fog(theme.fogColor, 14, 35);
    this.threeScene.background = new THREE.Color(theme.fogColor);
  }

  private addPillars(color: number): void {
    const pillarMat = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.1 });
    const positions = [-7, -4, 4, 7];
    positions.forEach(px => {
      const geo  = new THREE.CylinderGeometry(0.22, 0.28, 9, 8);
      const mesh = new THREE.Mesh(geo, pillarMat);
      mesh.position.set(px, 4, -3);
      mesh.castShadow = true;
      this.group.add(mesh);

      // Pillar cap
      const capGeo  = new THREE.BoxGeometry(0.7, 0.2, 0.7);
      const cap     = new THREE.Mesh(capGeo, pillarMat);
      cap.position.set(px, 8.6, -3);
      this.group.add(cap);
    });
  }

  private addSokyokuDetails(): void {
    // Torii gate silhouette
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xcc2200, emissive: new THREE.Color(0x550800), emissiveIntensity: 0.3, roughness: 0.9 });
    // Vertical posts
    [-1.8, 1.8].forEach(px => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 5.5, 8), woodMat);
      post.position.set(px, 2.75, -8);
      this.group.add(post);
    });
    // Top horizontal beam
    const beam = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.3, 0.3), woodMat);
    beam.position.set(0, 5.7, -8);
    this.group.add(beam);
    // Middle rail
    const rail = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.2, 0.2), woodMat);
    rail.position.set(0, 4.8, -8);
    this.group.add(rail);

    // Cherry blossom tree silhouettes
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x1a0808, roughness: 1 });
    const blossomMat = new THREE.MeshStandardMaterial({ color: 0xff88bb, emissive: new THREE.Color(0xdd4488), emissiveIntensity: 0.2, roughness: 0.8 });
    [-9, -6, 6, 9].forEach((px, i) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.18, 3.5, 6), treeMat);
      trunk.position.set(px, 1.75, -6 - (i % 2));
      this.group.add(trunk);
      const blossom = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 6), blossomMat);
      blossom.position.set(px, 4.2, -6 - (i % 2));
      blossom.scale.y = 0.75;
      this.group.add(blossom);
    });
  }

  private addLasNochesDetails(): void {
    // Massive white ceiling with crack letting in moonlight
    const ceilMat  = new THREE.MeshStandardMaterial({ color: 0xddddd8, roughness: 0.4, side: THREE.DoubleSide });
    const ceil     = new THREE.Mesh(new THREE.PlaneGeometry(28, 16), ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = 9;
    this.group.add(ceil);

    // Moonlight shaft through crack
    const shaftMat = new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.08, side: THREE.DoubleSide });
    const shaft    = new THREE.Mesh(new THREE.ConeGeometry(1.5, 10, 8, 1, true), shaftMat);
    shaft.position.set(0, 4, -4);
    this.group.add(shaft);

    // Bioluminescent ground dots
    const dotMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc, emissive: new THREE.Color(0x00ddaa), emissiveIntensity: 2 });
    for (let i = 0; i < 20; i++) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), dotMat);
      dot.position.set((Math.random() - 0.5) * 20, 0.02, (Math.random() - 0.5) * 8 - 2);
      this.group.add(dot);
    }
  }

  private addKarakuraDetails(): void {
    // City buildings behind
    const buildMat = new THREE.MeshStandardMaterial({ color: 0x0d0d1a, roughness: 0.9, metalness: 0.1 });
    const winMat   = new THREE.MeshStandardMaterial({ color: 0xffee88, emissive: new THREE.Color(0xffcc22), emissiveIntensity: 1.5 });
    [[-8,5],[-5,7],[-2,6],[2,8],[5,5],[8,6]].forEach(([bx, bh]) => {
      const bld = new THREE.Mesh(new THREE.BoxGeometry(2, bh, 1.5), buildMat);
      bld.position.set(bx, bh/2, -8);
      this.group.add(bld);
      // Windows
      for (let wy = 1; wy < bh - 0.5; wy += 1.2) {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.4), winMat);
        win.position.set(bx, wy, -7.2);
        this.group.add(win);
      }
    });

    // Neon signs
    const neonMat = new THREE.MeshStandardMaterial({ color: 0xff0066, emissive: new THREE.Color(0xff0044), emissiveIntensity: 4 });
    const neon2   = new THREE.MeshStandardMaterial({ color: 0x00ffcc, emissive: new THREE.Color(0x00ddaa), emissiveIntensity: 4 });
    const sign1   = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 0.05), neonMat);
    sign1.position.set(-3, 3.5, -5);
    this.group.add(sign1);
    const sign2 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.2, 0.05), neon2);
    sign2.position.set(3, 4, -5);
    this.group.add(sign2);

    // Moon
    const moonMat = new THREE.MeshStandardMaterial({ color: 0xeeeebb, emissive: new THREE.Color(0xcccc88), emissiveIntensity: 1 });
    const moon    = new THREE.Mesh(new THREE.CircleGeometry(0.9, 16), moonMat);
    moon.position.set(4, 7.5, -11);
    this.group.add(moon);
  }

  private addSilbernDetails(): void {
    // Gothic throne room architecture
    const stoneMat  = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.5, metalness: 0.5 });
    const silverMat = new THREE.MeshStandardMaterial({ color: 0x8888bb, emissive: new THREE.Color(0x4444aa), emissiveIntensity: 0.4, roughness: 0.2, metalness: 0.8 });

    // Arched windows with blue light
    [-5, 0, 5].forEach(px => {
      const archMat = new THREE.MeshBasicMaterial({ color: 0x2244aa, transparent: true, opacity: 0.6 });
      const arch    = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 3), archMat);
      arch.position.set(px, 5.5, -9);
      this.group.add(arch);
    });

    // Quincy cross emblem
    const crossMat = new THREE.MeshStandardMaterial({ color: 0xaaaadd, emissive: new THREE.Color(0x6666ff), emissiveIntensity: 1.5 });
    const cv = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.2, 0.1), crossMat);
    cv.position.set(0, 6.5, -9);
    this.group.add(cv);
    const ch = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.18, 0.1), crossMat);
    ch.position.set(0, 6.8, -9);
    this.group.add(ch);

    // Silver floor tiles
    const tileMat = new THREE.MeshStandardMaterial({ color: 0x1a1a35, roughness: 0.2, metalness: 0.7 });
    for (let tx = -6; tx <= 6; tx += 2) {
      for (let tz = -4; tz <= 0; tz += 2) {
        const tile = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.03, 1.9), tileMat);
        tile.position.set(tx, 0, tz);
        this.group.add(tile);
      }
    }

    // Gothic pillars with silver
    this.addPillars(0x1a1a35);
    [-7,-4,4,7].forEach(px => {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6), silverMat);
      cap.position.set(px, 9, -3);
      cap.scale.y = 0.5;
      this.group.add(cap);
    });
  }

  public dispose(): void {
    this.threeScene.remove(this.group);
  }
}
