import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { MotionData } from '../types/camera';

export function useMotionSensor() {
  const [motion, setMotion] = useState<MotionData>({
    pitch: 0,
    roll: 0,
    stability: 0.95,
    isLevel: true,
  });

  useEffect(() => {
    let isMounted = true;

    if (Platform.OS === 'web') {
      // In web browser, simulate gentle realistic handheld breathing motion & level state
      let step = 0;
      const timer = setInterval(() => {
        if (!isMounted) return;
        step += 0.05;
        const simRoll = Math.round(Math.sin(step) * 3);
        const simPitch = Math.round(Math.cos(step * 0.7) * 2);
        setMotion({
          pitch: simPitch,
          roll: simRoll,
          stability: 0.92,
          isLevel: Math.abs(simRoll) <= 2,
        });
      }, 100);

      return () => {
        isMounted = false;
        clearInterval(timer);
      };
    }

    // Native mobile devices
    try {
      const { DeviceMotion } = require('expo-sensors');
      DeviceMotion.setUpdateInterval(100);
      const subscription = DeviceMotion.addListener((data: any) => {
        if (!isMounted || !data.rotation) return;

        const pitchDeg = Math.round((data.rotation.beta || 0) * (180 / Math.PI));
        const rollDeg = Math.round((data.rotation.gamma || 0) * (180 / Math.PI));

        const acc = data.acceleration;
        const jitter = acc ? Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z) : 0;
        const stabilityScore = Math.max(0.1, Math.min(1.0, 1.0 - jitter * 1.5));
        const isLevel = Math.abs(rollDeg) <= 2;

        setMotion({
          pitch: pitchDeg,
          roll: rollDeg,
          stability: Number(stabilityScore.toFixed(2)),
          isLevel,
        });
      });

      return () => {
        isMounted = false;
        subscription.remove();
      };
    } catch (e) {
      console.warn('Sensors not available:', e);
    }
  }, []);

  return motion;
}
