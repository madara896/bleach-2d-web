// 3D Character Model — builds a stylized anime fighter from Three.js primitives
// Uses MeshToonMaterial for cel-shaded look — each character has unique geometry

import * as THREE from 'three';
import type { CharacterDefinition } from '../types';

// Shared gradient map for cel-shading (3 tone steps)
let _gradientMap: THREE.DataTexture | null = null;
function getGradientMap(): THREE.DataTexture {
  if (!_gradientMap) {
    const colors = new Uint8Array([40, 120, 255]); // dark / mid / bright
    _gradientMap = new THREE.DataTexture(colors, 3, 1, THREE.RedFormat);
    _gradientMap.needsUpdate = true;
  }
  return _gradientMap;
}

function toonMat(color: string | number, emissive = '#000000', emissiveIntensity = 0): THREE.MeshToonMaterial {
  return new THREE.MeshToonMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(emissive),
    emissiveIntensity,
    gradientMap: getGradientMap(),
  });
}

function stdMat(color: string | number, roughness = 0.7, metalness = 0.0, emissiveIntensity = 0, emissive = '#000000'): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness, metalness,
    emissive: new THREE.Color(emissive),
    emissiveIntensity,
  });
}

// ── Character limb refs for animation ────────────────────────────────────────
interface CharacterRig {
  root:     THREE.Group;  // whole character, positioned at feet
  hips:     THREE.Group;  // main body pivot
  spine:    THREE.Group;  // upper body tilt
  head:     THREE.Group;  // head + hair
  rArm:     THREE.Group;  // right arm
  lArm:     THREE.Group;  // left arm
  rLeg:     THREE.Group;
  lLeg:     THREE.Group;
  weapon:   THREE.Group;  // weapon pivot
  aura:     THREE.Points; // reiatsu particle system
  eyeL:     THREE.Mesh;
  eyeR:     THREE.Mesh;
}

// ── Per-character body spec ───────────────────────────────────────────────────
interface CharSpec {
  height: number;         // overall scale
  bodyColor:  string;     // main outfit
  accentColor: string;    // secondary outfit detail
  skinColor:  string;     // face/hands skin
  hairColor:  string;     // hair
  hairStyle:  'spiky_orange' | 'spiky_white' | 'slicked_black' | 'long_brown' | 'long_black' | 'silver_short' | 'black_medium' | 'short_brown' | 'black_short';
  weaponType: 'katana' | 'broad_katana' | 'none' | 'lance' | 'bow' | 'fists';
  weaponColor: string;
  eyeColor:   string;
}

const CHAR_SPECS: Record<string, CharSpec> = {
  ichigo:         { height: 1.00, bodyColor: '#111111', accentColor: '#333333', skinColor: '#f5c8a0', hairColor: '#ff6600', hairStyle: 'spiky_orange', weaponType: 'broad_katana', weaponColor: '#222222', eyeColor: '#603000' },
  ulquiorra:      { height: 0.96, bodyColor: '#e8e8e8', accentColor: '#111111', skinColor: '#c8dde8', hairColor: '#111111', hairStyle: 'slicked_black', weaponType: 'lance',       weaponColor: '#004444', eyeColor: '#00aa00' },
  aizen:          { height: 1.02, bodyColor: '#f0f0e8', accentColor: '#888866', skinColor: '#eeddb0', hairColor: '#553311', hairStyle: 'long_brown',    weaponType: 'katana',       weaponColor: '#555544', eyeColor: '#335500' },
  yhwach:         { height: 1.08, bodyColor: '#111111', accentColor: '#444444', skinColor: '#b8946a', hairColor: '#111111', hairStyle: 'long_black',    weaponType: 'none',         weaponColor: '#ffffff', eyeColor: '#aaaaff' },
  white_zangetsu: { height: 1.00, bodyColor: '#f0f0f0', accentColor: '#cccccc', skinColor: '#e8e8e8', hairColor: '#eeeeee', hairStyle: 'spiky_white',   weaponType: 'broad_katana', weaponColor: '#f0f0f0', eyeColor: '#cc0000' },
  byakuya:        { height: 1.00, bodyColor: '#111111', accentColor: '#f0f0f0', skinColor: '#f0d8c0', hairColor: '#111111', hairStyle: 'black_medium',  weaponType: 'katana',       weaponColor: '#aaaaaa', eyeColor: '#334455' },
  kenpachi:       { height: 1.14, bodyColor: '#111111', accentColor: '#222222', skinColor: '#b8a888', hairColor: '#111111', hairStyle: 'spiky_orange',  weaponType: 'broad_katana', weaponColor: '#333322', eyeColor: '#554400' },
  grimmjow:       { height: 1.00, bodyColor: '#e8e8e8', accentColor: '#4488cc', skinColor: '#d0c8c0', hairColor: '#4488ff', hairStyle: 'spiky_orange',  weaponType: 'fists',        weaponColor: '#4488cc', eyeColor: '#0044cc' },
  rukia:          { height: 0.90, bodyColor: '#111111', accentColor: '#333333', skinColor: '#f5d4c4', hairColor: '#111111', hairStyle: 'black_short',   weaponType: 'katana',       weaponColor: '#ddddff', eyeColor: '#334466' },
  hitsugaya:      { height: 0.88, bodyColor: '#111111', accentColor: '#f0f0f0', skinColor: '#e8d8c8', hairColor: '#e8eeff', hairStyle: 'silver_short',  weaponType: 'katana',       weaponColor: '#aaddff', eyeColor: '#00aacc' },
  uryu:           { height: 0.97, bodyColor: '#eeeeff', accentColor: '#aaaadd', skinColor: '#f0d8c0', hairColor: '#111133', hairStyle: 'black_medium',  weaponType: 'bow',          weaponColor: '#aaaaee', eyeColor: '#334455' },
  orihime:        { height: 0.94, bodyColor: '#cc4488', accentColor: '#ffaacc', skinColor: '#f8d0c0', hairColor: '#cc8844', hairStyle: 'long_brown',    weaponType: 'fists',        weaponColor: '#ffaacc', eyeColor: '#994444' },
};

export class CharacterMesh3D {
  public group: THREE.Group;
  private rig: CharacterRig;
  private spec: CharSpec;
  private charDef: CharacterDefinition;
  private tick = 0;
  private attackT = 0;
  private hurtT   = 0;

  constructor(charDef: CharacterDefinition) {
    this.charDef = charDef;
    this.spec    = CHAR_SPECS[charDef.id] ?? CHAR_SPECS.ichigo;
    this.group   = new THREE.Group();
    this.rig     = this.buildCharacter();
    this.group.add(this.rig.root);
    this.group.scale.setScalar(this.spec.height);
  }

  private buildCharacter(): CharacterRig {
    const s = this.spec;

    const skinMat   = toonMat(s.skinColor);
    const bodyMat   = toonMat(s.bodyColor);
    const accentMat = toonMat(s.accentColor);
    const hairMat   = toonMat(s.hairColor);
    const eyeMat    = stdMat(s.eyeColor, 0.1, 0, 3, s.eyeColor);

    const root   = new THREE.Group();
    const hips   = new THREE.Group();
    const spine  = new THREE.Group();
    const head   = new THREE.Group();
    const rArm   = new THREE.Group();
    const lArm   = new THREE.Group();
    const rLeg   = new THREE.Group();
    const lLeg   = new THREE.Group();
    const weapon = new THREE.Group();

    root.add(hips);
    hips.position.y = 1.45; // hips height from ground, so feet rest on ground at y=0.03

    // ── Legs ────────────────────────────────────────────────────────────────
    hips.add(rLeg); hips.add(lLeg);

    const legGeo = new THREE.CapsuleGeometry(0.13, 0.65, 4, 8);
    const lowerLegGeo = new THREE.CapsuleGeometry(0.1, 0.6, 4, 8);
    const footGeo = new THREE.BoxGeometry(0.18, 0.1, 0.32);

    rLeg.position.set(-0.2, 0, 0);
    lLeg.position.set( 0.2, 0, 0);

    [rLeg, lLeg].forEach(leg => {
      const upper = new THREE.Mesh(legGeo, bodyMat);
      upper.position.y = -0.45;
      leg.add(upper);
      upper.castShadow = true;

      const lower = new THREE.Mesh(lowerLegGeo, bodyMat);
      lower.position.y = -1.05;
      leg.add(lower);
      lower.castShadow = true;

      const foot = new THREE.Mesh(footGeo, bodyMat);
      foot.position.set(0, -1.42, 0.07);
      leg.add(foot);
      foot.castShadow = true;
    });

    // ── Hips / Torso ────────────────────────────────────────────────────────
    const hipsGeo = new THREE.CylinderGeometry(0.22, 0.26, 0.35, 8);
    const hipsMesh = new THREE.Mesh(hipsGeo, bodyMat);
    hipsMesh.position.y = 0;
    hips.add(hipsMesh);
    hipsMesh.castShadow = true;

    hips.add(spine);
    spine.position.y = 0.22;

    const torsoGeo = new THREE.CapsuleGeometry(0.26, 0.6, 4, 8);
    const torso = new THREE.Mesh(torsoGeo, bodyMat);
    torso.position.y = 0.36;
    spine.add(torso);
    torso.castShadow = true;

    // Belt / sash accent
    const beltGeo  = new THREE.TorusGeometry(0.27, 0.04, 4, 16);
    const belt     = new THREE.Mesh(beltGeo, accentMat);
    belt.rotation.x = Math.PI / 2;
    belt.position.y = 0.05;
    spine.add(belt);

    // ── Arms ────────────────────────────────────────────────────────────────
    spine.add(rArm); spine.add(lArm);
    rArm.position.set(-0.34, 0.62, 0);
    lArm.position.set( 0.34, 0.62, 0);

    const upperArmGeo = new THREE.CapsuleGeometry(0.1, 0.42, 4, 8);
    const lowerArmGeo = new THREE.CapsuleGeometry(0.09, 0.4, 4, 8);

    [rArm, lArm].forEach((arm, i) => {
      arm.rotation.z = i === 0 ? -0.35 : 0.35; // slight outward angle

      const upper = new THREE.Mesh(upperArmGeo, bodyMat);
      upper.position.y = -0.28;
      arm.add(upper);
      upper.castShadow = true;

      const lower = new THREE.Mesh(lowerArmGeo, bodyMat);
      lower.position.y = -0.75;
      arm.add(lower);
      lower.castShadow = true;

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 5), skinMat);
      hand.position.y = -1.02;
      arm.add(hand);
      hand.castShadow = true;
    });

    // ── Weapon ──────────────────────────────────────────────────────────────
    const weaponMat = stdMat(s.weaponColor, 0.15, 0.85, 0.5, s.weaponColor);
    rArm.add(weapon);
    weapon.position.set(0, -1.1, 0);
    this.buildWeapon(weapon, weaponMat, s.weaponType);

    // ── Neck + Head ─────────────────────────────────────────────────────────
    spine.add(head);
    head.position.y = 1.02;

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.2, 6), skinMat);
    neck.position.y = -0.1;
    head.add(neck);

    const headGeo  = new THREE.SphereGeometry(0.28, 10, 10);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.scale.set(0.95, 1, 0.92);
    headMesh.castShadow = true;
    head.add(headMesh);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.06, 6, 6);
    const eyeL   = new THREE.Mesh(eyeGeo, eyeMat);
    const eyeR   = new THREE.Mesh(eyeGeo, eyeMat.clone());
    eyeL.position.set(-0.1, 0.04, 0.22);
    eyeR.position.set( 0.1, 0.04, 0.22);
    head.add(eyeL); head.add(eyeR);

    // ── Hair ────────────────────────────────────────────────────────────────
    this.buildHair(head, hairMat, s.hairStyle);

    // ── Reiatsu Particle Aura ────────────────────────────────────────────────
    const aura = this.buildAura();
    root.add(aura);

    return { root, hips, spine, head, rArm, lArm, rLeg, lLeg, weapon, aura, eyeL, eyeR };
  }

  private buildHair(parent: THREE.Group, mat: THREE.MeshToonMaterial, style: CharSpec['hairStyle']): void {
    const addSpike = (x: number, y: number, z: number, rx: number, ry: number, rz: number, h: number, r: number) => {
      const geo  = new THREE.ConeGeometry(r, h, 5);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.rotation.set(rx, ry, rz);
      parent.add(mesh);
    };

    switch (style) {
      case 'spiky_orange':
      case 'spiky_white':
        // Spiky top — Ichigo/Grimmjow/Kenpachi/White Zangetsu
        addSpike( 0.00, 0.45, 0.05, -0.3, 0, 0, 0.55, 0.12);
        addSpike(-0.14, 0.42, 0.05, -0.3, 0, 0.5, 0.45, 0.1);
        addSpike( 0.14, 0.42, 0.05, -0.3, 0,-0.5, 0.45, 0.1);
        addSpike(-0.22, 0.35, 0.0,  -0.2, 0, 0.9, 0.38, 0.09);
        addSpike( 0.22, 0.35, 0.0,  -0.2, 0,-0.9, 0.38, 0.09);
        // Back hair mass
        const backGeo = new THREE.SphereGeometry(0.26, 8, 8);
        const back = new THREE.Mesh(backGeo, mat);
        back.position.set(0, 0.1, -0.1);
        back.scale.set(1, 0.9, 0.95);
        parent.add(back);
        break;

      case 'slicked_black':
        // Ulquiorra — slicked back
        const slick = new THREE.Mesh(new THREE.SphereGeometry(0.29, 10, 8), mat);
        slick.position.set(0, 0.05, -0.05);
        slick.scale.set(1, 0.8, 1.1);
        parent.add(slick);
        addSpike(0, 0.36, -0.08, 0.2, 0, 0, 0.3, 0.06);
        break;

      case 'long_brown':
      case 'long_black':
        // Long flowing — Aizen/Yhwach/Orihime
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), mat);
        cap.position.y = 0.05;
        parent.add(cap);
        const longL = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.9, 4, 8), mat);
        longL.position.set(-0.2, -0.4, -0.08);
        longL.rotation.z = 0.15;
        parent.add(longL);
        const longR = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.9, 4, 8), mat);
        longR.position.set( 0.2, -0.4, -0.08);
        longR.rotation.z = -0.15;
        parent.add(longR);
        break;

      case 'silver_short':
        // Hitsugaya — silver/white short spiky
        addSpike(0, 0.4, 0.06, -0.4, 0, 0, 0.38, 0.1);
        addSpike(-0.1, 0.37, 0.04, -0.3, 0, 0.4, 0.32, 0.09);
        addSpike( 0.1, 0.37, 0.04, -0.3, 0,-0.4, 0.32, 0.09);
        const shortCap = new THREE.Mesh(new THREE.SphereGeometry(0.27, 8, 8), mat);
        shortCap.position.y = 0.04;
        parent.add(shortCap);
        break;

      case 'black_medium':
      case 'black_short':
        // Byakuya/Uryu/Rukia — neat black
        const neatCap = new THREE.Mesh(new THREE.SphereGeometry(0.29, 10, 8), mat);
        neatCap.position.y = 0.04;
        parent.add(neatCap);
        if (style === 'black_medium') {
          const sideL = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.5, 4, 6), mat);
          sideL.position.set(-0.25, -0.15, 0);
          sideL.rotation.z = 0.2;
          parent.add(sideL);
        }
        break;
    }
  }

  private buildWeapon(parent: THREE.Group, mat: THREE.MeshStandardMaterial, type: CharSpec['weaponType']): void {
    switch (type) {
      case 'katana': {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.5, 0.008), mat);
        blade.position.y = -0.75;
        parent.add(blade);
        const guard = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.025, 4, 8), mat);
        guard.rotation.x = Math.PI / 2;
        parent.add(guard);
        break;
      }
      case 'broad_katana': {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.8, 0.01), mat);
        blade.position.y = -0.9;
        parent.add(blade);
        const wrap = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8), new THREE.MeshToonMaterial({ color: 0x333333, gradientMap: getGradientMap() }));
        wrap.position.y = 0.2;
        parent.add(wrap);
        break;
      }
      case 'lance': {
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.2, 8), mat);
        shaft.position.y = -1.1;
        parent.add(shaft);
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.4, 6), mat);
        tip.position.y = -2.1;
        parent.add(tip);
        break;
      }
      case 'bow': {
        const bowGeo = new THREE.TorusGeometry(0.55, 0.02, 4, 20, Math.PI);
        const bow    = new THREE.Mesh(bowGeo, mat);
        bow.rotation.z = Math.PI / 2;
        bow.position.y = -0.55;
        parent.add(bow);
        break;
      }
      case 'fists':
      case 'none':
        break;
    }
  }

  private buildAura(): THREE.Points {
    const count   = 80;
    const geo     = new THREE.BufferGeometry();
    const pos     = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r     = 0.4 + Math.random() * 0.7;
      pos[i*3]   = Math.cos(angle) * r;
      pos[i*3+1] = Math.random() * 2.8;
      pos[i*3+2] = Math.sin(angle) * r * 0.4;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: new THREE.Color(this.charDef.reiatsuColor),
      size: 0.07,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return new THREE.Points(geo, mat);
  }

  // ── Update — called every frame with current fighter state ──────────────────
  public update(
    state: string,
    facing: number,
    isAwakened: boolean,
    reiatsu: number,
    hp: number,
    maxHp: number
  ): void {
    this.tick++;
    const t = this.tick;
    const r = this.rig;

    // ── Facing direction ────────────────────────────────────────────────────
    this.group.scale.set(facing > 0 ? this.spec.height : -this.spec.height, this.spec.height, this.spec.height);

    // ── Idle breathing ───────────────────────────────────────────────────────
    const breathY = state === 'IDLE' ? Math.sin(t * 0.06) * 0.04 : 0;
    r.spine.rotation.z = state === 'IDLE' ? Math.sin(t * 0.04) * 0.015 : 0;

    // ── Aura particle opacity ─────────────────────────────────────────────────
    const auraMat = r.aura.material as THREE.PointsMaterial;
    const targetOpacity = isAwakened ? 0.8 : reiatsu > 150 ? 0.3 : 0.05;
    auraMat.opacity += (targetOpacity - auraMat.opacity) * 0.08;
    auraMat.color.set(this.charDef.reiatsuColor);

    // Rotate aura particles
    r.aura.rotation.y = t * 0.02;

    // ── Eye glow on awakened ──────────────────────────────────────────────────
    const eyeMat = r.eyeL.material as THREE.MeshStandardMaterial;
    eyeMat.emissiveIntensity = isAwakened ? 5 + Math.sin(t * 0.15) * 2 : 3;

    // ── State animations ──────────────────────────────────────────────────────
    switch (state) {
      case 'IDLE':
        r.hips.position.y = 1.45 + breathY;
        r.spine.rotation.x = 0;
        r.rArm.rotation.x  = 0;
        r.lArm.rotation.x  = 0;
        r.rArm.rotation.z  = -0.35;
        r.lArm.rotation.z  =  0.35;
        r.rLeg.rotation.x  = 0;
        r.lLeg.rotation.x  = 0;
        this.attackT = 0;
        break;

      case 'WALK':
        r.hips.position.y = 1.45 + Math.abs(Math.sin(t * 0.18)) * 0.04;
        r.rLeg.rotation.x = Math.sin(t * 0.18) * 0.5;
        r.lLeg.rotation.x = -Math.sin(t * 0.18) * 0.5;
        r.rArm.rotation.x = -Math.sin(t * 0.18) * 0.3;
        r.lArm.rotation.x = Math.sin(t * 0.18) * 0.3;
        break;

      case 'JUMP':
      case 'FALL':
        r.rLeg.rotation.x = -0.5;
        r.lLeg.rotation.x = -0.5;
        r.rArm.rotation.x = -0.8;
        r.lArm.rotation.x = -0.8;
        r.spine.rotation.x = -0.15;
        break;

      case 'LIGHT_ATTACK':
        this.attackT += 0.25;
        r.spine.rotation.x = -0.3;
        r.rArm.rotation.x  = -(Math.sin(this.attackT) * 1.4 + 1.2);
        r.rArm.rotation.z  = -0.2;
        break;

      case 'HEAVY_ATTACK':
        this.attackT += 0.18;
        r.spine.rotation.x  = -0.45;
        r.hips.rotation.y   = -0.3;
        r.rArm.rotation.x   = -(Math.sin(this.attackT) * 1.6 + 1.5);
        r.lArm.rotation.x   = -0.5;
        break;

      case 'SPECIAL_1':
      case 'SPECIAL_2':
      case 'ULTIMATE':
        this.attackT += 0.12;
        r.spine.rotation.x = -0.5;
        r.rArm.rotation.x  = -2.0 + Math.sin(this.attackT) * 0.4;
        r.lArm.rotation.x  = -1.5 + Math.sin(this.attackT + 0.5) * 0.3;
        r.hips.rotation.y  = Math.sin(this.attackT) * 0.4;
        break;

      case 'HURT':
        r.spine.rotation.x = 0.35;
        r.head.rotation.x  = 0.25;
        r.rArm.rotation.x  = 0.5;
        r.lArm.rotation.x  = 0.5;
        this.hurtT++;
        if (this.hurtT > 18) {
          r.head.rotation.x = 0;
          this.hurtT = 0;
        }
        break;

      case 'BLOCK':
        r.rArm.rotation.x = -2.2;
        r.lArm.rotation.x = -2.0;
        r.spine.rotation.x = -0.2;
        break;

      case 'VICTORY':
        r.rArm.rotation.x = -2.8;
        r.spine.rotation.x = -0.2;
        r.hips.rotation.y = Math.sin(t * 0.04) * 0.1;
        break;

      case 'KO':
        r.hips.position.y = 0.2;
        r.spine.rotation.x = 1.4;
        r.rLeg.rotation.x = -0.5;
        r.lLeg.rotation.x = -0.5;
        break;
    }

    // ── Awakening scale pulse ─────────────────────────────────────────────────
    if (isAwakened) {
      const pulse = 1 + Math.sin(t * 0.12) * 0.02;
      this.group.scale.multiplyScalar(pulse);
    }
  }

  // Convert game-world pixel coordinates to Three.js world units
  public setGamePosition(gameX: number, gameY: number): void {
    const SCALE = 95; // pixels per Three.js unit
    this.group.position.x = (gameX - 800) / SCALE;
    this.group.position.y = (520 - gameY) / SCALE; // game Y increases downward, 520 is ground level
  }

  public dispose(): void {
    this.group.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
    });
  }
}
