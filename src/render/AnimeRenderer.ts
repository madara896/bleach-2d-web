// Bleach 2D Web Game: Stylized High-Definition Anime Character Renderer
import type { Fighter } from '../combat/Fighter';

export class AnimeRenderer {
  /** Main render entrypoint for a fighter */
  public static renderFighter(ctx: CanvasRenderingContext2D, fighter: Fighter): void {
    ctx.save();
    ctx.translate(fighter.x, fighter.y);
    ctx.scale(fighter.facing, 1);

    // Subtle breathing / idle bob
    const breath = fighter.state === 'IDLE' ? Math.sin(fighter.stateTime * 0.08) * 1.5 : 0;
    ctx.translate(0, breath);

    // Apply Awakening Reiatsu glow filter
    if (fighter.isAwakened) {
      ctx.shadowColor = fighter.charDef.reiatsuColor;
      ctx.shadowBlur = 16;
    }

    // Ground shadow
    this.renderGroundShadow(ctx, fighter);

    // Render character based on ID
    switch (fighter.charDef.id) {
      case 'ichigo':
        this.renderIchigo(ctx, fighter);
        break;
      case 'ulquiorra':
        this.renderUlquiorra(ctx, fighter);
        break;
      case 'aizen':
        this.renderAizen(ctx, fighter);
        break;
      case 'yhwach':
        this.renderYhwach(ctx, fighter);
        break;
      case 'white_zangetsu':
        this.renderWhiteZangetsu(ctx, fighter);
        break;
      case 'byakuya':
        this.renderByakuya(ctx, fighter);
        break;
      case 'kenpachi':
        this.renderKenpachi(ctx, fighter);
        break;
      case 'grimmjow':
        this.renderGrimmjow(ctx, fighter);
        break;
      default:
        this.renderIchigo(ctx, fighter);
        break;
    }

    // Render block shield if blocking
    if (fighter.state === 'BLOCK') {
      this.renderBlockShield(ctx, fighter);
    }

    ctx.restore();
  }

  private static renderGroundShadow(ctx: CanvasRenderingContext2D, fighter: Fighter): void {
    const distFromGround = fighter.groundY - fighter.y;
    const shadowScale = Math.max(0.2, 1 - distFromGround / 250);
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, distFromGround, 30 * shadowScale, 8 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private static renderBlockShield(ctx: CanvasRenderingContext2D, fighter: Fighter): void {
    ctx.save();
    ctx.strokeStyle = fighter.isAwakened ? fighter.charDef.reiatsuColor : '#00e5ff';
    ctx.lineWidth = 3;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(20, -50, 45, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();
    ctx.restore();
  }

  // ==========================================
  // ICHIGO KUROSAKI
  // ==========================================
  private static renderIchigo(ctx: CanvasRenderingContext2D, f: Fighter): void {
    const isBankai = f.isAwakened;
    const isAttacking = f.state === 'LIGHT_ATTACK' || f.state === 'HEAVY_ATTACK';

    // 1. Bankai Coat Tails or Shihakusho Hakama
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.moveTo(-16, -45);
    ctx.lineTo(-24 - (f.vx * 1.5), -5);
    ctx.lineTo(18, -5);
    ctx.lineTo(12, -45);
    ctx.closePath();
    ctx.fill();

    // 2. Legs & Tabi Boots
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(-12, -25, 8, 25);
    ctx.fillRect(4, -25, 8, 25);
    ctx.fillStyle = '#f8fafc'; // Straw waraji & white tabi
    ctx.fillRect(-14, -5, 12, 5);
    ctx.fillRect(2, -5, 12, 5);

    // 3. Torso
    ctx.fillStyle = isBankai ? '#0f0f14' : '#141419';
    ctx.fillRect(-14, -68, 28, 26);

    // White collar inner shirt
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-7, -68);
    ctx.lineTo(0, -54);
    ctx.lineTo(7, -68);
    ctx.stroke();

    // Red Bankai lining or white sash
    ctx.fillStyle = isBankai ? '#dc2626' : '#f1f5f9';
    ctx.fillRect(-15, -45, 30, 4);

    // 4. Head & Face
    ctx.fillStyle = '#fed7aa'; // skin tone
    ctx.beginPath();
    ctx.arc(0, -78, 12, 0, Math.PI * 2);
    ctx.fill();

    // Spiky Orange Hair
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(-14, -76);
    ctx.lineTo(-22, -90);
    ctx.lineTo(-10, -88);
    ctx.lineTo(-6, -98);
    ctx.lineTo(4, -88);
    ctx.lineTo(12, -96);
    ctx.lineTo(14, -86);
    ctx.lineTo(20, -88);
    ctx.lineTo(14, -74);
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = isBankai ? '#facc15' : '#78350f';
    ctx.fillRect(2, -80, 4, 3);

    // 5. Zanpakuto Sword (Zangetsu or Tensa Zangetsu)
    ctx.save();
    let swordAngle = -0.4;
    let swordOriginX = 8;
    let swordOriginY = -55;

    if (isAttacking) {
      if (f.attackPhase === 'startup') swordAngle = -1.2;
      else if (f.attackPhase === 'active') swordAngle = 0.9;
      else swordAngle = 1.3;
    }

    ctx.translate(swordOriginX, swordOriginY);
    ctx.rotate(swordAngle);

    if (isBankai) {
      // Tensa Zangetsu: Sleek pitch-black daito katana
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, -72, 4, 72);
      // Silver cutting edge
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(3, -72, 1, 72);
      // Manji Tsuba guard
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-5, 0, 14, 3);
      // Chain trailing from pommel
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(2, 8, 5, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Shikai Zangetsu: Giant khopesh/cleaver
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-2, -65);
      ctx.lineTo(16, -72);
      ctx.lineTo(18, -10);
      ctx.closePath();
      ctx.fill();

      // Silver edge
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(16, -72);
      ctx.lineTo(18, -10);
      ctx.lineTo(14, -10);
      ctx.lineTo(12, -68);
      ctx.closePath();
      ctx.fill();

      // White cloth wrap flowing
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-15, 10, -25 - (f.vx * 2), 25);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ==========================================
  // ULQUIORRA CIFER
  // ==========================================
  private static renderUlquiorra(ctx: CanvasRenderingContext2D, f: Fighter): void {
    const isResurreccion = f.isAwakened;
    const isAttacking = f.state === 'LIGHT_ATTACK' || f.state === 'HEAVY_ATTACK';

    // 1. Resurrección Bat Wings
    if (isResurreccion) {
      ctx.save();
      ctx.fillStyle = 'rgba(10, 15, 12, 0.92)';
      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00ff66';
      ctx.shadowBlur = 14;

      // Left wing
      ctx.beginPath();
      ctx.moveTo(-10, -60);
      ctx.quadraticCurveTo(-65, -110, -75, -50);
      ctx.quadraticCurveTo(-50, -35, -35, -45);
      ctx.quadraticCurveTo(-20, -35, -10, -50);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right wing
      ctx.beginPath();
      ctx.moveTo(10, -60);
      ctx.quadraticCurveTo(65, -110, 75, -50);
      ctx.quadraticCurveTo(50, -35, 35, -45);
      ctx.quadraticCurveTo(20, -35, 10, -50);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 2. White Espada Robes & Hakama
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-15, -45);
    ctx.lineTo(-20, -5);
    ctx.lineTo(18, -5);
    ctx.lineTo(14, -45);
    ctx.closePath();
    ctx.fill();

    // Black sash
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-15, -45, 30, 4);

    // Torso (White jacket with high collar)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-14, -68, 28, 26);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-2, -68, 4, 26); // black seam

    // 3. Pale Head & Face
    ctx.fillStyle = '#f1f5f9'; // ghostly pale
    ctx.beginPath();
    ctx.arc(0, -78, 12, 0, Math.PI * 2);
    ctx.fill();

    // Green tear marks
    ctx.fillStyle = '#00ff66';
    ctx.fillRect(-3, -76, 2, 8);
    ctx.fillRect(5, -76, 2, 8);

    // Black Emo Shaggy Hair
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.moveTo(-14, -76);
    ctx.lineTo(-18, -88);
    ctx.lineTo(-8, -94);
    ctx.lineTo(4, -92);
    ctx.lineTo(14, -86);
    ctx.lineTo(16, -74);
    ctx.lineTo(8, -78);
    ctx.lineTo(2, -74);
    ctx.closePath();
    ctx.fill();

    // Horned Helmet Mask (Left horn)
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-10, -82);
    ctx.quadraticCurveTo(-22, -100, -28, -105);
    ctx.lineTo(-20, -96);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (isResurreccion) {
      // Right horn as well
      ctx.beginPath();
      ctx.moveTo(10, -82);
      ctx.quadraticCurveTo(22, -100, 28, -105);
      ctx.lineTo(20, -96);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // 4. Emerald Claw / Lanza del Relámpago
    ctx.save();
    let weaponAngle = 0.2;
    if (isAttacking) {
      weaponAngle = f.attackPhase === 'active' ? 1.0 : -0.8;
    }
    ctx.translate(10, -55);
    ctx.rotate(weaponAngle);

    if (isResurreccion) {
      // Emerald Reishi Lance
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#00ff66';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(0, 25);
      ctx.lineTo(0, -65);
      ctx.stroke();

      // Energy tips
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -65, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Green energy-coated hand claw
      ctx.fillStyle = '#00ff88';
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 10;
      ctx.fillRect(0, -10, 8, 12);
    }
    ctx.restore();
  }

  // ==========================================
  // SOSUKE AIZEN
  // ==========================================
  private static renderAizen(ctx: CanvasRenderingContext2D, f: Fighter): void {
    const isTranscendent = f.isAwakened;
    const isAttacking = f.state === 'LIGHT_ATTACK' || f.state === 'HEAVY_ATTACK';

    // 1. Transcendent Butterfly Wings
    if (isTranscendent) {
      ctx.save();
      ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 20;

      // Divine multi-tier wings
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(0, -60);
        ctx.quadraticCurveTo(side * 60, -115, side * 75, -60);
        ctx.quadraticCurveTo(side * 50, -20, side * 30, -35);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Espada Lord High Robes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-16, -45);
    ctx.lineTo(-22, -5);
    ctx.lineTo(20, -5);
    ctx.lineTo(15, -45);
    ctx.closePath();
    ctx.fill();

    // Maroon Obi Sash
    ctx.fillStyle = '#831843';
    ctx.fillRect(-16, -45, 32, 5);

    // High White Collared Robe
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-14, -68, 28, 26);
    // Dark inner
    ctx.fillStyle = '#3b0764';
    ctx.fillRect(-2, -68, 4, 26);

    // 3. Head & Slicked-back Hair
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -78, 12, 0, Math.PI * 2);
    ctx.fill();

    // Brown Slick Hair with Iconic Strand
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(0, -82, 13, Math.PI, 0);
    ctx.lineTo(12, -74);
    ctx.lineTo(-12, -74);
    ctx.closePath();
    ctx.fill();

    // Iconic single strand hanging over eye
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-2, -84);
    ctx.quadraticCurveTo(2, -74, 4, -68);
    ctx.stroke();

    // Smirking calm eyes
    ctx.fillStyle = isTranscendent ? '#d8b4fe' : '#92400e';
    ctx.fillRect(2, -80, 4, 2);

    // 4. Kyoka Suigetsu Katana
    ctx.save();
    let swordAngle = -0.3;
    if (isAttacking) {
      swordAngle = f.attackPhase === 'active' ? 0.95 : -0.9;
    }
    ctx.translate(10, -55);
    ctx.rotate(swordAngle);

    // Katana blade with subtle lilac aura
    ctx.fillStyle = '#e2e8f0';
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 8;
    ctx.fillRect(0, -65, 3, 65);

    // Green diamond tsuba guard
    ctx.fillStyle = '#059669';
    ctx.fillRect(-4, 0, 11, 3);
    ctx.restore();
  }

  // ==========================================
  // YHWACH
  // ==========================================
  private static renderYhwach(ctx: CanvasRenderingContext2D, f: Fighter): void {
    const isAlmighty = f.isAwakened;
    const isAttacking = f.state === 'LIGHT_ATTACK' || f.state === 'HEAVY_ATTACK';

    // 1. Quincy Dark Cloak
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.moveTo(-18, -50);
    ctx.lineTo(-26, -5);
    ctx.lineTo(24, -5);
    ctx.lineTo(16, -50);
    ctx.closePath();
    ctx.fill();

    // Red Quincy Inner Lining
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(-15, -48, 30, 4);

    // White Military Uniform
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-15, -70, 30, 24);

    // Quincy Cross Pin
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(0, -60, 4, 0, Math.PI * 2);
    ctx.fill();

    // 2. Head & Wild Mane
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -78, 12, 0, Math.PI * 2);
    ctx.fill();

    // Wild Black Hair
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.moveTo(-16, -76);
    ctx.lineTo(-24, -92);
    ctx.lineTo(-12, -98);
    ctx.lineTo(0, -100);
    ctx.lineTo(14, -96);
    ctx.lineTo(22, -88);
    ctx.lineTo(16, -74);
    ctx.closePath();
    ctx.fill();

    // Prominent Mustache
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-7, -73, 14, 4);

    // Eyes: Multi-pupil in Almighty mode!
    if (isAlmighty) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(3, -80, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.fillRect(2, -81, 2, 2);
      ctx.fillRect(4, -79, 2, 2);
    } else {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(2, -80, 4, 2);
    }

    // 3. Quincy Spirit Broadsword
    ctx.save();
    let swordAngle = -0.5;
    if (isAttacking) {
      swordAngle = f.attackPhase === 'active' ? 1.05 : -1.0;
    }
    ctx.translate(10, -55);
    ctx.rotate(swordAngle);

    // Heavy Reishi Broadsword
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 14;
    ctx.fillRect(-2, -72, 8, 72);

    // Crossguard
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(-8, 0, 20, 5);
    ctx.restore();
  }

  // ==========================================
  // WHITE ZANGETSU (HOLLOW ICHIGO)
  // ==========================================
  private static renderWhiteZangetsu(ctx: CanvasRenderingContext2D, f: Fighter): void {
    const isFullHollow = f.isAwakened;
    const isAttacking = f.state === 'LIGHT_ATTACK' || f.state === 'HEAVY_ATTACK';

    // 1. Inverted White Shihakusho
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-16, -45);
    ctx.lineTo(-24 - (f.vx * 1.5), -5);
    ctx.lineTo(18, -5);
    ctx.lineTo(12, -45);
    ctx.closePath();
    ctx.fill();

    // Black sash
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-15, -45, 30, 4);

    // Torso
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-14, -68, 28, 26);
    // Black inner collar
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-7, -68);
    ctx.lineTo(0, -54);
    ctx.lineTo(7, -68);
    ctx.stroke();

    // 2. Head & Bone-White Hair
    ctx.fillStyle = '#e2e8f0'; // Pale skin
    ctx.beginPath();
    ctx.arc(0, -78, 12, 0, Math.PI * 2);
    ctx.fill();

    // Bone White Spiky Hair
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-14, -76);
    ctx.lineTo(-22, -90);
    ctx.lineTo(-10, -88);
    ctx.lineTo(-6, -98);
    ctx.lineTo(4, -88);
    ctx.lineTo(12, -96);
    ctx.lineTo(14, -86);
    ctx.lineTo(20, -88);
    ctx.lineTo(14, -74);
    ctx.closePath();
    ctx.fill();

    // Inverted Eyes (Black sclera + Golden iris)
    ctx.fillStyle = '#000000';
    ctx.fillRect(1, -81, 6, 4);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(3, -80, 3, 2);

    // Horned Vasto Lorde Mask if Awakened
    if (isFullHollow) {
      ctx.save();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.fillStyle = '#ffffff';
      // Forward sweeping horns
      ctx.beginPath();
      ctx.moveTo(-8, -84);
      ctx.quadraticCurveTo(-20, -105, -28, -100);
      ctx.lineTo(-14, -88);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(8, -84);
      ctx.quadraticCurveTo(20, -105, 28, -100);
      ctx.lineTo(14, -88);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 3. Inverted White Zangetsu (Cloth twirl)
    ctx.save();
    let swordAngle = (f.stateTime * 0.25) % (Math.PI * 2); // feral spinning blade
    if (isAttacking) {
      swordAngle = f.attackPhase === 'active' ? 1.2 : -1.1;
    }
    ctx.translate(10, -55);
    ctx.rotate(swordAngle);

    // Inverted white blade
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-2, -65);
    ctx.lineTo(16, -72);
    ctx.lineTo(18, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Black cloth wrapping
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-20, 15, -35, 30);
    ctx.stroke();
    ctx.restore();
  }

  // ==========================================
  // BYAKUYA KUCHIKI
  // ==========================================
  private static renderByakuya(ctx: CanvasRenderingContext2D, f: Fighter): void {
    // White Captain's Haori
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-16, -45);
    ctx.lineTo(-22, -5);
    ctx.lineTo(20, -5);
    ctx.lineTo(15, -45);
    ctx.closePath();
    ctx.fill();

    // Gintompan turquoise scarf
    ctx.fillStyle = '#2dd4bf';
    ctx.fillRect(-10, -68, 20, 8);

    // Head & Noble Hair with Kenseikan
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -78, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, -82, 13, Math.PI, 0);
    ctx.lineTo(12, -74);
    ctx.lineTo(-12, -74);
    ctx.closePath();
    ctx.fill();

    // White Kenseikan hair clips
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-6, -92, 4, 10);
    ctx.fillRect(2, -92, 4, 10);

    // Senbonzakura Blade
    ctx.save();
    ctx.translate(10, -55);
    ctx.fillStyle = '#f472b6';
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 10;
    ctx.fillRect(0, -60, 3, 60);
    ctx.restore();
  }

  // ==========================================
  // KENPACHI ZARAKI
  // ==========================================
  private static renderKenpachi(ctx: CanvasRenderingContext2D, f: Fighter): void {
    // Muscular Bare Chest & Tattered Haori
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-18, -48, 36, 44);

    // Muscular skin
    ctx.fillStyle = '#fbcfe8';
    ctx.fillRect(-10, -68, 20, 24);

    // Spiky Hair with Bells
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.moveTo(-16, -76);
    ctx.lineTo(-24, -98);
    ctx.lineTo(-10, -105);
    ctx.lineTo(0, -112);
    ctx.lineTo(12, -105);
    ctx.lineTo(24, -98);
    ctx.lineTo(16, -74);
    ctx.closePath();
    ctx.fill();

    // Jagged Cleaver
    ctx.save();
    ctx.translate(12, -55);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-2, -75, 12, 75);
    ctx.restore();
  }

  // ==========================================
  // GRIMMJOW JAEGERJAQUEZ
  // ==========================================
  private static renderGrimmjow(ctx: CanvasRenderingContext2D, f: Fighter): void {
    // Open Espada Vest
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-16, -68, 32, 26);
    ctx.fillStyle = '#fed7aa'; // bare chest
    ctx.fillRect(-6, -68, 12, 26);

    // Cyan Spiky Hair
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.moveTo(-14, -76);
    ctx.lineTo(-22, -92);
    ctx.lineTo(-8, -98);
    ctx.lineTo(4, -96);
    ctx.lineTo(16, -90);
    ctx.lineTo(14, -74);
    ctx.closePath();
    ctx.fill();

    // Jawbone Hollow Mask on right cheek
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, -77, 8, 8);
  }
}
