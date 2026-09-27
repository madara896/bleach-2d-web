// Bleach AAA Rebuild: Sprite & Asset Loader
// Loads character images from /sprites/ and caches them as HTMLImageElement

export interface CharacterSprites {
  idle: HTMLImageElement;
  loaded: boolean;
}

class SpriteLoader {
  private cache: Map<string, HTMLImageElement> = new Map();
  private loadPromises: Map<string, Promise<HTMLImageElement>> = new Map();

  public loadImage(src: string): Promise<HTMLImageElement> {
    if (this.cache.has(src)) {
      return Promise.resolve(this.cache.get(src)!);
    }
    if (this.loadPromises.has(src)) {
      return this.loadPromises.get(src)!;
    }
    const p = new Promise<HTMLImageElement>((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(src, img);
        resolve(img);
      };
      img.onerror = () => {
        // On error, create placeholder canvas image
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.clearRect(0, 0, 256, 512);
        const placeholder = new Image();
        placeholder.src = canvas.toDataURL();
        this.cache.set(src, placeholder);
        resolve(placeholder);
      };
      img.src = src;
    });
    this.loadPromises.set(src, p);
    return p;
  }

  public get(src: string): HTMLImageElement | null {
    return this.cache.get(src) ?? null;
  }

  public async preloadAll(srcs: string[]): Promise<void> {
    await Promise.all(srcs.map(s => this.loadImage(s)));
  }
}

export const spriteLoader = new SpriteLoader();

// Map character IDs to sprite paths
export const CHARACTER_SPRITE_MAP: Record<string, string> = {
  ichigo:         '/sprites/ichigo_sprite.jpg',
  ulquiorra:      '/sprites/ulquiorra_sprite.jpg',
  aizen:          '/sprites/aizen_sprite.jpg',
  yhwach:         '/sprites/yhwach_sprite.jpg',
  byakuya:        '/sprites/byakuya_sprite.jpg',
  kenpachi:       '/sprites/kenpachi_sprite.jpg',
  grimmjow:       '/sprites/grimmjow_sprite.jpg',
  white_zangetsu: '/sprites/white_zangetsu_sprite.jpg',
  rukia:          '/sprites/rukia_sprite.jpg',
  hitsugaya:      '/sprites/hitsugaya_sprite.jpg',
  uryu:           '/sprites/uryu_sprite.jpg',
  orihime:        '/sprites/orihime_sprite.jpg',
};

export const STAGE_SPRITE_MAP: Record<string, string> = {
  sokyoku:    '/sprites/stage_sokyoku.jpg',
  las_noches: '/sprites/stage_las_noches.jpg',
  silbern:    '/sprites/stage_silbern.jpg',
  karakura:   '/sprites/stage_karakura.jpg',
};


// Preload everything at startup
export async function preloadGameAssets(): Promise<void> {
  const all = [
    ...Object.values(CHARACTER_SPRITE_MAP),
    ...Object.values(STAGE_SPRITE_MAP),
  ];
  await spriteLoader.preloadAll(all);
}
