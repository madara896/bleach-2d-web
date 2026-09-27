// Bleach 2D Web Game: Battlefield Stages
import type { StageDefinition } from '../../types';
export type { StageDefinition };

export const STAGES: StageDefinition[] = [
  {
    id: 'sokyoku',
    name: 'Sōkyoku Hill',
    japaneseName: '双殛の丘',
    location: 'Soul Society - Seireitei',
    groundY: 520,
    width: 1600,
    height: 720,
    bgGradTop: '#1a0826',
    bgGradBottom: '#4a154b',
    themeMusic: 'sokyoku_theme',
    visualTheme: 'sokyoku'
  },
  {
    id: 'las_noches',
    name: 'Las Noches Sands',
    japaneseName: '虚夜宮・砂漠',
    location: 'Hueco Mundo',
    groundY: 520,
    width: 1600,
    height: 720,
    bgGradTop: '#050d1a',
    bgGradBottom: '#0b2038',
    themeMusic: 'las_noches_theme',
    visualTheme: 'las_noches'
  },
  {
    id: 'silbern',
    name: 'Silbern Throne Room',
    japaneseName: '銀架城・真世界城',
    location: 'Wandenreich - Wahrwelt',
    groundY: 520,
    width: 1600,
    height: 720,
    bgGradTop: '#031726',
    bgGradBottom: '#0d3b66',
    themeMusic: 'silbern_theme',
    visualTheme: 'silbern'
  },
  {
    id: 'karakura',
    name: 'Karakura High Rooftop',
    japaneseName: '空座町・屋上',
    location: 'Human World',
    groundY: 520,
    width: 1600,
    height: 720,
    bgGradTop: '#2b1055',
    bgGradBottom: '#ff5e62',
    themeMusic: 'karakura_theme',
    visualTheme: 'karakura'
  }
];

export function getStageById(id: string): StageDefinition {
  return STAGES.find(s => s.id === id) || STAGES[0];
}
