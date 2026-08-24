import { PoseGuide } from '../types/poses';
import { SceneType } from '../types/camera';

export const POSE_LIBRARY: PoseGuide[] = [
  {
    id: 'candid_walk',
    title: 'The Candid Walk',
    category: 'streetwear',
    description: 'Walk slowly toward the camera while looking slightly away with one hand in pocket.',
    tip: 'Keep your chin slightly raised and relax your shoulders.',
    silhouetteSvg: 'M 50 15 C 55 15, 60 20, 60 25 C 60 30, 55 35, 50 35 C 45 35, 40 30, 40 25 C 40 20, 45 15, 50 15 Z M 48 37 L 52 37 L 55 60 L 62 75 L 58 77 L 52 64 L 51 90 L 45 90 L 46 64 L 41 78 L 37 76 L 44 58 Z',
    sceneCompatibility: ['standard', 'golden_hour', 'action'],
  },
  {
    id: 'over_shoulder',
    title: 'Over the Shoulder',
    category: 'solo_female',
    description: 'Turn your body away from the lens and glance back with a gentle smile.',
    tip: 'Drop your front shoulder to elongate your neck line.',
    silhouetteSvg: 'M 48 14 A 8 8 0 1 0 48 30 A 8 8 0 1 0 48 14 Z M 45 32 C 38 34, 35 45, 36 60 C 37 72, 42 85, 43 95 L 49 95 C 48 83, 44 70, 43 58 C 48 55, 54 50, 58 40 Z',
    sceneCompatibility: ['portrait', 'golden_hour'],
  },
  {
    id: 'cafe_lean',
    title: 'Coffee Table Lean',
    category: 'cafe_food',
    description: 'Rest elbows gently on the table, holding a cup with both hands near chin height.',
    tip: 'Tilt your head 10° toward the cup for an effortless aesthetic mood.',
    silhouetteSvg: 'M 50 16 A 7 7 0 1 0 50 30 A 7 7 0 1 0 50 16 Z M 40 40 L 60 40 L 65 65 L 58 65 L 55 48 L 45 48 L 42 65 L 35 65 Z M 25 70 L 75 70 L 75 73 L 25 73 Z',
    sceneCompatibility: ['standard', 'portrait', 'macro'],
  },
  {
    id: 'sitting_stairs',
    title: 'Step & Splay',
    category: 'solo_male',
    description: 'Sit on a step or ledge, one knee up, one leg extended down diagonally.',
    tip: 'Creates great diagonal leading lines and effortless proportions.',
    silhouetteSvg: 'M 45 15 A 8 8 0 1 0 45 31 A 8 8 0 1 0 45 15 Z M 42 33 L 52 33 L 54 55 L 68 55 L 70 80 L 64 80 L 62 61 L 46 61 L 44 85 L 38 85 L 40 50 Z',
    sceneCompatibility: ['standard', 'streetwear', 'golden_hour'],
  },
  {
    id: 'golden_silhouette',
    title: 'Sunset Reach',
    category: 'solo_female',
    description: 'Side profile with hand gently shielding or reaching toward the warm sunset light.',
    tip: 'Gives an ethereal Instagram aesthetic in backlight.',
    silhouetteSvg: 'M 46 16 A 8 8 0 1 0 46 32 A 8 8 0 1 0 46 16 Z M 44 34 L 50 34 L 62 25 L 65 28 L 54 42 L 52 88 L 46 88 L 46 55 L 40 88 L 34 88 L 40 42 Z',
    sceneCompatibility: ['golden_hour', 'landscape'],
  },
];

export class PoseLibrary {
  public static getAllPoses(): PoseGuide[] {
    return POSE_LIBRARY;
  }

  public static getPosesForScene(scene: SceneType): PoseGuide[] {
    const matching = POSE_LIBRARY.filter((p) => p.sceneCompatibility.includes(scene));
    return matching.length > 0 ? matching : POSE_LIBRARY;
  }
}
