export type LensType = 'ultra-wide' | 'wide' | 'telephoto' | 'macro' | 'front';

export interface CameraLensInfo {
  id: string;
  name: string;
  type: LensType;
  focalLength: string;
  minZoom: number;
  maxZoom: number;
  zoomFactor: number;
  aperture: string;
}

export type AspectRatioType = '4:3' | '1:1' | '16:9' | '3:2';

export type FlashModeType = 'off' | 'on' | 'auto';

export interface MotionData {
  pitch: number;      // tilt up/down in degrees
  roll: number;       // horizon tilt left/right in degrees
  stability: number;  // 0.0 to 1.0 (1.0 = completely still)
  isLevel: boolean;   // true if within +- 1.5 deg
}

export type SceneType =
  | 'portrait'
  | 'landscape'
  | 'low_light'
  | 'action'
  | 'macro'
  | 'golden_hour'
  | 'standard';

export interface PhotographyParameters {
  iso: number;
  shutterSpeedText: string;
  shutterSpeedValue: number; // in seconds, e.g. 1/125
  aperture: string;
  ev: number;
  whiteBalanceKelvin: number;
  focusDistance: number;     // 0.0 to 1.0
  hdrEnabled: boolean;
  recommendedLens: LensType;
}

export interface GuidanceInstruction {
  primaryMessage: string;
  secondaryMessage?: string;
  direction?: 'left' | 'right' | 'up' | 'down' | 'back' | 'forward' | 'hold_steady' | 'perfect';
  isReadyToCapture: boolean;
  compositionScore: number; // 0 to 100
}

export type AutoAdjustState =
  | 'idle'
  | 'analyzing'
  | 'guiding'
  | 'countdown'
  | 'capturing'
  | 'review';

export interface CapturedPhotoMeta {
  uri: string;
  width: number;
  height: number;
  timestamp: number;
  lensUsed: string;
  settings: PhotographyParameters;
  sceneDetected: SceneType;
}
