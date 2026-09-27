// Bleach: Souls of Eternity — Main Web Application Entry Point
import { SceneManager } from './scenes/SceneManager';
import { audio } from './engine/AudioEngine';
import { input } from './engine/InputManager';
import { preloadGameAssets } from './engine/SpriteLoader';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const threeCanvas = document.getElementById('three-canvas') as HTMLCanvasElement;
  if (!canvas || !threeCanvas) {
    console.error('Canvas elements not found!');
    return;
  }

  // Ensure window & canvas have keyboard focus
  window.focus();
  canvas.focus();
  canvas.setAttribute('tabindex', '0');

  const sceneManager = new SceneManager(canvas, threeCanvas);


  // Start preloading all sprites in background (non-blocking)
  preloadGameAssets().catch(console.warn);

  const audioOverlay = document.getElementById('audio-overlay');
  const btnStart = document.getElementById('btn-start');

  let isUnlocked = false;
  const unlockAudio = () => {
    if (isUnlocked) return;
    isUnlocked = true;
    audio.init();
    audio.resume();
    if (audioOverlay) {
      audioOverlay.classList.add('hidden');
      audioOverlay.style.display = 'none'; // completely remove from hit-testing
    }
    window.focus();
    canvas.focus();
  };

  btnStart?.addEventListener('click', unlockAudio);
  audioOverlay?.addEventListener('click', unlockAudio);
  canvas.addEventListener('click', () => {
    unlockAudio();
    window.focus();
    canvas.focus();
  });

  // Any key or pointer unlocks audio & dismisses overlay immediately
  window.addEventListener('keydown', () => {
    if (!isUnlocked) unlockAudio();
  });

  window.addEventListener('pointerdown', () => {
    if (!isUnlocked) unlockAudio();
  });

  // Toolbar Actions
  const btnAudio = document.getElementById('btn-audio');
  btnAudio?.addEventListener('click', () => {
    audio.init();
    const isMuted = audio.toggleMute();
    btnAudio.textContent = isMuted ? '🔇 MUTED' : '🔊 AUDIO';
  });

  const btnFullscreen = document.getElementById('btn-fullscreen');
  btnFullscreen?.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Exit fullscreen failed:', err);
      });
    }
  });

  // Move List Modal
  const btnMovelist = document.getElementById('btn-movelist');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const movelistModal = document.getElementById('movelist-modal');

  btnMovelist?.addEventListener('click', () => {
    movelistModal?.classList.remove('hidden');
  });

  btnCloseModal?.addEventListener('click', () => {
    movelistModal?.classList.add('hidden');
    window.focus();
  });

  movelistModal?.addEventListener('click', (e) => {
    if (e.target === movelistModal) {
      movelistModal.classList.add('hidden');
      window.focus();
    }
  });

  // Mobile Virtual Touch Controls binding
  const touchButtons = document.querySelectorAll<HTMLButtonElement>('[data-key]');
  touchButtons.forEach((btn) => {
    const key = btn.getAttribute('data-key') as keyof typeof input.p1;
    if (!key) return;

    const activate = (e: Event) => {
      e.preventDefault();
      unlockAudio();
      input.touchInputs[key] = true;
    };

    const deactivate = (e: Event) => {
      e.preventDefault();
      input.touchInputs[key] = false;
    };

    btn.addEventListener('touchstart', activate, { passive: false });
    btn.addEventListener('touchend', deactivate, { passive: false });
    btn.addEventListener('touchcancel', deactivate, { passive: false });
    btn.addEventListener('mousedown', activate);
    btn.addEventListener('mouseup', deactivate);
    btn.addEventListener('mouseleave', deactivate);
  });

  // Start the Game Loop
  sceneManager.start();
});
