import { CameraLensInfo, LensType } from '../types/camera';

export const LENS_PRESETS: CameraLensInfo[] = [
  {
    id: 'ultra_wide',
    name: '0.5x',
    type: 'ultra-wide',
    focalLength: '13mm',
    minZoom: 0.0,
    maxZoom: 0.2,
    zoomFactor: 0.0,
    aperture: 'f/2.2',
  },
  {
    id: 'wide_main',
    name: '1x',
    type: 'wide',
    focalLength: '24mm',
    minZoom: 0.2,
    maxZoom: 0.5,
    zoomFactor: 0.25,
    aperture: 'f/1.6',
  },
  {
    id: 'telephoto_2x',
    name: '2x',
    type: 'telephoto',
    focalLength: '48mm',
    minZoom: 0.5,
    maxZoom: 0.8,
    zoomFactor: 0.5,
    aperture: 'f/1.8',
  },
  {
    id: 'telephoto_5x',
    name: '5x',
    type: 'telephoto',
    focalLength: '120mm',
    minZoom: 0.8,
    maxZoom: 1.0,
    zoomFactor: 1.0,
    aperture: 'f/2.8',
  },
];

export class LensManager {
  public static getAvailableLenses(): CameraLensInfo[] {
    return LENS_PRESETS;
  }

  public static getLensByType(type: LensType): CameraLensInfo {
    return LENS_PRESETS.find((l) => l.type === type) || LENS_PRESETS[1];
  }

  public static getLensByZoomFactor(zoom: number): CameraLensInfo {
    if (zoom < 0.15) return LENS_PRESETS[0];
    if (zoom < 0.4) return LENS_PRESETS[1];
    if (zoom < 0.75) return LENS_PRESETS[2];
    return LENS_PRESETS[3];
  }
}
