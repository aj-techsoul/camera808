import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { Colors } from '../theme/colors';

interface WebCameraViewProps {
  facing: 'back' | 'front';
  zoom: number;
  children?: React.ReactNode;
}

export const WebCameraView: React.FC<WebCameraViewProps> = ({
  facing,
  zoom,
  children,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    let activeStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        setStreamError(null);
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: facing === 'front' ? 'user' : 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = stream;
        setHasPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((e) => console.warn('Video play error:', e));
        }
      } catch (err: any) {
        console.warn('Web webcam access error:', err);
        setStreamError(err?.message || 'Webcam permission denied or unavailable');
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facing]);

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' && (
        <video
          ref={videoRef as any}
          autoPlay
          playsInline
          muted
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${1 + zoom * 1.5}) ${facing === 'front' ? 'scaleX(-1)' : ''}`,
            transition: 'transform 0.3s ease',
          }}
        />
      )}

      {streamError && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>Webcam Access Note:</Text>
          <Text style={styles.errorSub}>{streamError}</Text>
          <Text style={styles.errorHint}>Please allow webcam permissions in your browser address bar to see the live feed.</Text>
        </View>
      )}

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  errorText: {
    color: Colors.amber,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  errorSub: {
    color: Colors.textPrimary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  errorHint: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
