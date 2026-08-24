import { LensType, PhotographyParameters, SceneType } from '../types/camera';

export class PhotographyMath {
  /**
   * Calculates ideal shutter speed based on the 1/(2 * focalLength) rule of thumb,
   * adjusted for scene motion requirements.
   */
  public static calculateShutterSpeed(focalLengthMm: number, scene: SceneType): { text: string; value: number } {
    let baseSpeed = 1 / (focalLengthMm * 2);

    switch (scene) {
      case 'action':
        baseSpeed = Math.min(baseSpeed, 1 / 1000);
        break;
      case 'portrait':
        baseSpeed = Math.min(baseSpeed, 1 / 250);
        break;
      case 'low_light':
        baseSpeed = 1 / 30; // rely on OIS / steady hand
        break;
      case 'landscape':
      case 'golden_hour':
      default:
        baseSpeed = Math.min(baseSpeed, 1 / 125);
        break;
    }

    const denominator = Math.round(1 / baseSpeed);
    return {
      text: `1/${denominator}s`,
      value: baseSpeed,
    };
  }

  /**
   * Calculates minimum required ISO to maintain optimal Exposure Value (EV).
   */
  public static calculateISO(scene: SceneType, stability: number): number {
    switch (scene) {
      case 'low_light':
        return stability > 0.85 ? 400 : 800;
      case 'action':
        return 400; // higher sensitivity for fast shutter
      case 'golden_hour':
        return 100;
      case 'portrait':
        return 125;
      case 'landscape':
      default:
        return 64; // cleanest baseline ISO
    }
  }

  /**
   * Evaluates optimal Kelvin White Balance for detected scene.
   */
  public static calculateWhiteBalance(scene: SceneType): number {
    switch (scene) {
      case 'golden_hour':
        return 5800; // warm golden glow
      case 'portrait':
        return 5200; // flattering skin tones
      case 'low_light':
        return 4200; // neutral cool reduction of tungsten yellow
      case 'landscape':
        return 5500; // daylight balanced
      default:
        return 5000;
    }
  }

  /**
   * Derives full photography settings bundle for the Auto-Adjust engine.
   */
  public static computeOptimalSettings(scene: SceneType, stability: number, currentLensType: LensType): PhotographyParameters {
    const focalMm = currentLensType === 'ultra-wide' ? 13 : currentLensType === 'telephoto' ? 48 : 24;
    const shutter = this.calculateShutterSpeed(focalMm, scene);
    const iso = this.calculateISO(scene, stability);
    const wb = this.calculateWhiteBalance(scene);

    let recommendedLens: LensType = currentLensType;
    if (scene === 'portrait') recommendedLens = 'telephoto';
    if (scene === 'landscape') recommendedLens = 'ultra-wide';

    return {
      iso,
      shutterSpeedText: shutter.text,
      shutterSpeedValue: shutter.value,
      aperture: currentLensType === 'wide' ? 'f/1.6' : 'f/2.2',
      ev: scene === 'low_light' ? 0.3 : scene === 'golden_hour' ? -0.3 : 0.0,
      whiteBalanceKelvin: wb,
      focusDistance: scene === 'macro' ? 0.1 : scene === 'portrait' ? 0.35 : 0.8,
      hdrEnabled: scene === 'landscape' || scene === 'golden_hour',
      recommendedLens,
    };
  }
}
