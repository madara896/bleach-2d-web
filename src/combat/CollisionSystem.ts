// Bleach 2D Web Game: Collision & Clash System
import type { Rect, Hitbox } from '../types';

export class CollisionSystem {
  /** Test AABB bounding box overlap */
  public static testOverlap(a: Rect, b: Rect): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  /** Calculate intersection rectangle */
  public static getIntersection(a: Rect, b: Rect): Rect | null {
    if (!this.testOverlap(a, b)) return null;
    const x = Math.max(a.x, b.x);
    const y = Math.max(a.y, b.y);
    const width = Math.min(a.x + a.width, b.x + b.width) - x;
    const height = Math.min(a.y + a.height, b.y + b.height) - y;
    return { x, y, width, height };
  }

  /** Check if two active attack hitboxes clash */
  public static checkClash(hitboxA: Hitbox | null, hitboxB: Hitbox | null): { clash: boolean; x: number; y: number } {
    if (!hitboxA || !hitboxB) {
      return { clash: false, x: 0, y: 0 };
    }

    const inter = this.getIntersection(hitboxA, hitboxB);
    if (inter) {
      return {
        clash: true,
        x: inter.x + inter.width / 2,
        y: inter.y + inter.height / 2
      };
    }

    return { clash: false, x: 0, y: 0 };
  }

  /** Resolve pushbox collision so fighters do not phase into each other */
  public static resolvePushboxes(
    posA: { x: number; y: number; width: number; height: number },
    posB: { x: number; y: number; width: number; height: number }
  ): void {
    if (!this.testOverlap(posA, posB)) return;

    const overlapX = (posA.width / 2 + posB.width / 2) - Math.abs((posA.x + posA.width / 2) - (posB.x + posB.width / 2));
    if (overlapX > 0) {
      const halfOverlap = overlapX / 2;
      if (posA.x < posB.x) {
        posA.x -= halfOverlap;
        posB.x += halfOverlap;
      } else {
        posA.x += halfOverlap;
        posB.x -= halfOverlap;
      }
    }
  }
}
