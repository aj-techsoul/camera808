export type PoseCategory = 'solo_female' | 'solo_male' | 'couple' | 'friends' | 'cafe_food' | 'streetwear' | 'fitness';

export interface PoseGuide {
  id: string;
  title: string;
  category: PoseCategory;
  description: string;
  tip: string;
  silhouetteSvg: string; // SVG path or representation
  sceneCompatibility: string[];
}
