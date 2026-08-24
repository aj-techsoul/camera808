import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library';
import * as ImageManipulator from 'expo-image-manipulator';
import {
  Sparkles,
  Zap,
  ZapOff,
  SwitchCamera,
  UserCheck,
  Sliders,
  CheckCircle2,
  Lock,
} from 'lucide-react-native';

import { Colors } from './src/theme/colors';
import {
  CameraLensInfo,
  FlashModeType,
  PhotographyParameters,
  GuidanceInstruction,
  AutoAdjustState,
  CapturedPhotoMeta,
  SceneType,
} from './src/types/camera';
import { PoseGuide } from './src/types/poses';
import { LensManager, LENS_PRESETS } from './src/services/LensManager';
import { PhotographyMath } from './src/services/PhotographyMath';
import { PoseLibrary } from './src/services/PoseLibrary';
import { useMotionSensor } from './src/hooks/useMotionSensor';
import { GuidanceOverlay } from './src/components/GuidanceOverlay';
import { PoseGuideOverlay } from './src/components/PoseGuideOverlay';
import { LensSelector } from './src/components/LensSelector';
import { ParameterBar } from './src/components/ParameterBar';
import { WebCameraView } from './src/components/WebCameraView';

const safeHaptic = async (type: 'impact' | 'notification', style?: any) => {
  try {
    if (type === 'impact') {
      await Haptics.impactAsync(style || Haptics.ImpactFeedbackStyle.Medium);
    } else {
      await Haptics.notificationAsync(style || Haptics.NotificationFeedbackType.Success);
    }
  } catch (e) {
    // Graceful on web
  }
};

const { width, height } = Dimensions.get('window');

type CameraUIMode = 'AI' | 'PRO';

export default function App() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const cameraRef = useRef<any>(null);

  // App UI Mode: 'AI' (Default, ultra-minimalist) vs 'PRO' (Hardware metrics HUD)
  const [uiMode, setUiMode] = useState<CameraUIMode>('AI');

  // Hardware and Camera State
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashModeType>('off');
  const [selectedLens, setSelectedLens] = useState<CameraLensInfo>(LENS_PRESETS[1]); // 1x Main
  const [zoom, setZoom] = useState(0);

  // Motion Sensor
  const motion = useMotionSensor();

  // Auto-Adjust Engine State
  const [autoAdjustState, setAutoAdjustState] = useState<AutoAdjustState>('idle');
  const [detectedScene, setDetectedScene] = useState<SceneType>('portrait');
  const [countdown, setCountdown] = useState<number>(3);
  const [saveBannerVisible, setSaveBannerVisible] = useState(false);
  const [photoSettings, setPhotoSettings] = useState<PhotographyParameters>(
    PhotographyMath.computeOptimalSettings('portrait', 0.9, 'wide')
  );
  const [guidance, setGuidance] = useState<GuidanceInstruction>({
    primaryMessage: 'AI Ready',
    secondaryMessage: 'Framing scene in Story 9:16',
    compositionScore: 92,
    isReadyToCapture: false,
  });

  // Pose Guide State
  const [isPoseDrawerOpen, setIsPoseDrawerOpen] = useState(false);
  const [availablePoses, setAvailablePoses] = useState<PoseGuide[]>(PoseLibrary.getAllPoses());
  const [selectedPose, setSelectedPose] = useState<PoseGuide | null>(null);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shutterAnim = useRef(new Animated.Value(1)).current;

  // Auto-request permissions on initial mount
  useEffect(() => {
    (async () => {
      if (!cameraPermission?.granted) {
        await requestCameraPermission();
      }
      if (!mediaPermission?.granted) {
        await requestMediaPermission();
      }
    })();
  }, [cameraPermission, mediaPermission]);

  // Pulse animation for Auto button
  useEffect(() => {
    if (autoAdjustState === 'analyzing' || autoAdjustState === 'guiding') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.12,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [autoAdjustState]);

  // Real-time Guidance & Horizon
  useEffect(() => {
    if (autoAdjustState === 'idle') return;

    let dir: GuidanceInstruction['direction'] = 'hold_steady';
    let primary = 'Hold steady...';
    let secondary = 'Stabilizing story frame';
    let score = 85;

    if (Math.abs(motion.roll) > 2) {
      dir = motion.roll > 0 ? 'left' : 'right';
      primary = motion.roll > 0 ? 'Tilt left slightly ↺' : 'Tilt right slightly ↻';
      secondary = `Horizon off by ${Math.abs(motion.roll)}°`;
      score = Math.max(40, 90 - Math.abs(motion.roll) * 5);
    } else if (motion.pitch < -20) {
      dir = 'up';
      primary = 'Tilt camera UP ↑';
      secondary = 'Align story perspective';
      score = 78;
    } else if (motion.pitch > 25) {
      dir = 'down';
      primary = 'Tilt camera DOWN ↓';
      secondary = 'Align eye level';
      score = 78;
    } else if (motion.stability > 0.85 && motion.isLevel) {
      dir = 'perfect';
      primary = selectedPose ? `✨ Match ${selectedPose.title} Silhouette!` : '✨ Perfect Shot';
      secondary = 'Settings locked';
      score = 99;
    }

    setGuidance({
      primaryMessage: primary,
      secondaryMessage: secondary,
      direction: dir,
      isReadyToCapture: motion.isLevel && motion.stability > 0.85,
      compositionScore: score,
    });

    const settings = PhotographyMath.computeOptimalSettings(
      detectedScene,
      motion.stability,
      selectedLens.type
    );
    setPhotoSettings(settings);
  }, [motion, autoAdjustState, detectedScene, selectedLens, selectedPose]);

  // Process & Auto-Save photo directly in 9:16 Instagram Story Format
  const saveImageInStoryFormat = async (photoUri: string, origWidth: number, origHeight: number) => {
    try {
      let finalUri = photoUri;

      // Ensure dimensions are valid numbers
      const w = Math.max(1, origWidth || 1080);
      const h = Math.max(1, origHeight || 1920);

      // Calculate 9:16 Story Crop bounds
      const targetRatio = 9 / 16;
      let cropWidth = w;
      let cropHeight = Math.round(w / targetRatio);

      if (cropHeight > h) {
        cropHeight = h;
        cropWidth = Math.round(h * targetRatio);
      }

      // Constrain boundaries to prevent distortion/errors
      cropWidth = Math.min(w, Math.max(1, cropWidth));
      cropHeight = Math.min(h, Math.max(1, cropHeight));

      const originX = Math.max(0, Math.floor((w - cropWidth) / 2));
      const originY = Math.max(0, Math.floor((h - cropHeight) / 2));

      // Crop to 9:16
      try {
        const manipResult = await ImageManipulator.manipulateAsync(
          photoUri,
          [
            {
              crop: {
                originX,
                originY,
                width: cropWidth,
                height: cropHeight,
              },
            },
          ],
          { compress: 0.95, format: ImageManipulator.SaveFormat.JPEG }
        );
        if (manipResult?.uri) {
          finalUri = manipResult.uri;
        }
      } catch (cropErr) {
        console.warn("Crop manipulation error, using original:", cropErr);
      }

      // Save directly to Camera Roll / Media Library with write permissions
      if (Platform.OS !== "web") {
        const permission = await MediaLibrary.requestPermissionsAsync(true);
        if (permission.granted || permission.status === "granted") {
          const asset = await MediaLibrary.createAssetAsync(finalUri);
          if (asset) {
            try {
              const album = await MediaLibrary.getAlbumAsync("Camera808");
              if (album) {
                await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
              } else {
                await MediaLibrary.createAlbumAsync("Camera808", asset, false);
              }
            } catch (albumErr) {
              // Non-critical, asset is already in main gallery
            }
          }
        } else {
          console.warn("Media library write permission not granted");
        }
      } else {
        // Web browser download
        const link = document.createElement("a");
        link.href = finalUri;
        link.download = `Camera808_Story_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // Show brief minimal toast and stay in camera mode
      setSaveBannerVisible(true);
      setTimeout(() => setSaveBannerVisible(false), 2000);
    } catch (e) {
      console.warn("Auto-save error:", e);
      // Fallback save original
      if (Platform.OS !== "web") {
        try {
          const perm = await MediaLibrary.requestPermissionsAsync(true);
          if (perm.granted || perm.status === "granted") {
            await MediaLibrary.createAssetAsync(photoUri);
          }
        } catch (err) {
          console.warn("Fallback save error:", err);
        }
      }
      setSaveBannerVisible(true);
      setTimeout(() => setSaveBannerVisible(false), 2000);
    }
  };

  // Trigger Capture & Auto-Save
  const triggerCapture = async () => {
    try {
      setAutoAdjustState('capturing');
      await safeHaptic('notification', Haptics.NotificationFeedbackType.Success);

      // Shutter flash animation
      Animated.sequence([
        Animated.timing(shutterAnim, { toValue: 0.8, duration: 80, useNativeDriver: true }),
        Animated.timing(shutterAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]).start();

      let photoUri = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop';
      let photoW = 1200;
      let photoH = 1600;

      if (cameraRef.current?.takePictureAsync && Platform.OS !== 'web') {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.95,
          skipProcessing: false,
        });
        if (photo?.uri) {
          photoUri = photo.uri;
          photoW = photo.width;
          photoH = photo.height;
        }
      } else if (Platform.OS === 'web') {
        const videoElement = document.querySelector('video') as HTMLVideoElement | null;
        if (videoElement && videoElement.videoWidth) {
          const canvas = document.createElement('canvas');
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            if (facing === 'front') {
              ctx.translate(canvas.width, 0);
              ctx.scale(-1, 1);
            }
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            photoUri = canvas.toDataURL('image/jpeg', 0.95);
            photoW = canvas.width;
            photoH = canvas.height;
          }
        }
      }

      // Always auto-save in 9:16 story format and instantly return to picture taking mode!
      await saveImageInStoryFormat(photoUri, photoW, photoH);
    } catch (e) {
      console.warn('Capture error:', e);
    } finally {
      setAutoAdjustState('idle');
    }
  };

  // Auto-Adjust Button Flow
  const handleToggleAutoAdjust = async () => {
    await safeHaptic('impact', Haptics.ImpactFeedbackStyle.Medium);

    if (autoAdjustState !== 'idle') {
      setAutoAdjustState('idle');
      return;
    }

    setAutoAdjustState('analyzing');
    setDetectedScene('portrait');

    setTimeout(async () => {
      setAutoAdjustState('guiding');
      await safeHaptic('notification', Haptics.NotificationFeedbackType.Success);

      // Start 3-second countdown
      setAutoAdjustState('countdown');
      setCountdown(3);

      const interval = setInterval(async () => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            triggerCapture();
            return 0;
          }
          safeHaptic('impact', Haptics.ImpactFeedbackStyle.Heavy);
          return prev - 1;
        });
      }, 1000);
    }, 600);
  };

  // Lens select
  const handleSelectLens = async (lens: CameraLensInfo) => {
    await safeHaptic('impact', Haptics.ImpactFeedbackStyle.Light);
    setSelectedLens(lens);
    setZoom(lens.zoomFactor);
  };

  // Permission Screen
  if (!cameraPermission?.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.permissionCard}>
          <Sparkles color={Colors.amber} size={42} />
          <Text style={styles.permissionTitle}>Camera808</Text>
          <Text style={styles.permissionSubtitle}>
            AI Camera requires camera and photo library access to capture and auto-save story shots.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={async () => {
              await requestCameraPermission();
              await requestMediaPermission();
            }}
          >
            <Text style={styles.permissionButtonText}>Grant Permissions</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Main Viewfinder Preview (Story 9:16 Full Screen Edge-to-Edge) */}
      <View style={styles.viewfinderWrapper}>
        {Platform.OS === 'web' ? (
          <WebCameraView facing={facing} zoom={zoom}>
            <GuidanceOverlay
              motion={motion}
              guidance={guidance}
              autoAdjustState={autoAdjustState}
            />

            {autoAdjustState === 'countdown' && (
              <View style={styles.countdownContainer}>
                <Text style={styles.countdownText}>{countdown}</Text>
                <Text style={styles.countdownSub}>AI STORY OPTIMIZING</Text>
              </View>
            )}
          </WebCameraView>
        ) : (
          <CameraView
            ref={cameraRef}
            style={styles.cameraPreview}
            facing={facing}
            flash={flash}
            enableTorch={flash === 'on'}
            zoom={zoom}
          >
            <GuidanceOverlay
              motion={motion}
              guidance={guidance}
              autoAdjustState={autoAdjustState}
            />
            {autoAdjustState === 'countdown' && (
              <View style={styles.countdownContainer}>
                <Text style={styles.countdownText}>{countdown}</Text>
                <Text style={styles.countdownSub}>AI STORY OPTIMIZING</Text>
              </View>
            )}
          </CameraView>
        )}
      </View>

      {/* Standalone Pose Silhouette & Drawer Overlay (Rendered above viewfinder so it never intercepts bottom taps) */}
      <PoseGuideOverlay
        visible={isPoseDrawerOpen || selectedPose !== null}
        poses={availablePoses}
        selectedPose={selectedPose}
        onSelectPose={(pose) => {
          setSelectedPose(pose);
          if (!pose) {
            setIsPoseDrawerOpen(false);
          }
        }}
        onClose={() => {
          setIsPoseDrawerOpen(false);
          setSelectedPose(null);
        }}
      />

      {/* Quick Saved Toast Notification */}
      {saveBannerVisible && (
        <View style={styles.savedToast}>
          <CheckCircle2 color={Colors.mint} size={18} />
          <Text style={styles.savedToastText}>Saved to Gallery (Story 9:16)</Text>
        </View>
      )}

      {/* Minimalistic Floating Top Bar */}
      <SafeAreaView style={styles.topBarContainer}>
        <View style={styles.topBar}>
          {/* Flash Toggle */}
          <TouchableOpacity
            style={[styles.minimalIconButton, flash === 'on' && styles.minimalIconButtonActive]}
            activeOpacity={0.7}
            onPress={async () => {
              await safeHaptic('impact', Haptics.ImpactFeedbackStyle.Light);
              const nextFlash = flash === 'off' ? 'on' : 'off';
              setFlash(nextFlash);
            }}
          >
            {flash === 'on' ? (
              <Zap color={Colors.amber} size={20} fill={Colors.amber} />
            ) : (
              <ZapOff color="rgba(255, 255, 255, 0.65)" size={20} />
            )}
          </TouchableOpacity>

          {/* AI vs PRO Minimalist Segmented Toggle */}
          <View style={styles.modeTogglePill}>
            <TouchableOpacity
              onPress={async () => {
                await safeHaptic('impact', Haptics.ImpactFeedbackStyle.Light);
                setUiMode('AI');
              }}
              style={[styles.modeToggleItem, uiMode === 'AI' && styles.modeToggleItemActive]}
            >
              <Sparkles
                color={uiMode === 'AI' ? '#0A0A0F' : 'rgba(255, 255, 255, 0.6)'}
                size={13}
              />
              <Text
                style={[
                  styles.modeToggleText,
                  uiMode === 'AI' && styles.modeToggleTextActive,
                ]}
              >
                AI
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={async () => {
                await safeHaptic('impact', Haptics.ImpactFeedbackStyle.Light);
                setUiMode('PRO');
              }}
              style={[styles.modeToggleItem, uiMode === 'PRO' && styles.modeToggleItemActive]}
            >
              <Sliders
                color={uiMode === 'PRO' ? '#0A0A0F' : 'rgba(255, 255, 255, 0.6)'}
                size={13}
              />
              <Text
                style={[
                  styles.modeToggleText,
                  uiMode === 'PRO' && styles.modeToggleTextActive,
                ]}
              >
                PRO
              </Text>
            </TouchableOpacity>
          </View>

          {/* Front / Back Switch */}
          <TouchableOpacity
            style={styles.minimalIconButton}
            onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
          >
            <SwitchCamera color="rgba(255, 255, 255, 0.65)" size={20} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Floating Bottom Controls (Ultra-Minimalist) */}
      <SafeAreaView style={styles.bottomAreaContainer}>
        {/* PRO Mode Only: Show full hardware parameter HUD */}
        {uiMode === 'PRO' && (
          <ParameterBar
            settings={photoSettings}
            isAutoAdjustActive={autoAdjustState !== 'idle'}
          />
        )}

        {/* Minimal Lens Switcher (0.5x, 1x, 2x, 5x) */}
        <LensSelector
          lenses={LENS_PRESETS}
          selectedLens={selectedLens}
          onSelectLens={handleSelectLens}
        />

        {/* Shutter Bar */}
        <View style={styles.shutterRow}>
          {/* Pose Guide Button */}
          <TouchableOpacity
            style={[styles.minimalSideButton, (isPoseDrawerOpen || selectedPose) && styles.minimalSideButtonActive]}
            onPress={async () => {
              await safeHaptic('impact', Haptics.ImpactFeedbackStyle.Light);
              setIsPoseDrawerOpen(!isPoseDrawerOpen);
            }}
          >
            <UserCheck
              color={isPoseDrawerOpen || selectedPose ? Colors.amber : 'rgba(255, 255, 255, 0.75)'}
              size={22}
            />
          </TouchableOpacity>

          {/* Main Shutter Button */}
          <Animated.View style={{ transform: [{ scale: shutterAnim }] }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={triggerCapture}
              style={styles.minimalShutterOuter}
            >
              <View style={styles.minimalShutterInner} />
            </TouchableOpacity>
          </Animated.View>

          {/* AI Auto-Adjust Hero Button */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleToggleAutoAdjust}
              style={[
                styles.minimalAutoButton,
                autoAdjustState !== 'idle' && styles.minimalAutoButtonActive,
              ]}
            >
              <Sparkles
                color={autoAdjustState !== 'idle' ? '#0A0A0F' : Colors.amber}
                size={18}
              />
              <Text
                style={[
                  styles.minimalAutoText,
                  autoAdjustState !== 'idle' && styles.minimalAutoTextActive,
                ]}
              >
                {autoAdjustState === 'idle' ? 'AUTO' : '...'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  viewfinderWrapper: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
  },
  cameraPreview: {
    ...StyleSheet.absoluteFill,
  },
  savedToast: {
    position: 'absolute',
    top: 75,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 15, 0.92)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.mint,
    zIndex: 999,
    shadowColor: Colors.mint,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  savedToastText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
  },
  topBarContainer: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  minimalIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(20, 20, 28, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  minimalIconButtonActive: {
    borderColor: Colors.amber,
    backgroundColor: 'rgba(245, 166, 35, 0.2)',
  },
  modeTogglePill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 20, 28, 0.65)',
    borderRadius: 22,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modeToggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
  },
  modeToggleItemActive: {
    backgroundColor: Colors.amber,
  },
  modeToggleText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  modeToggleTextActive: {
    color: '#0A0A0F',
    fontWeight: '800',
  },
  bottomAreaContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    paddingBottom: 8,
    zIndex: 50,
  },
  shutterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 30,
    marginTop: 2,
  },
  minimalSideButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(20, 20, 28, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  minimalSideButtonActive: {
    borderColor: Colors.amber,
    backgroundColor: 'rgba(245, 166, 35, 0.2)',
  },
  minimalShutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  minimalShutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFFFFF',
  },
  minimalAutoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 28, 0.7)',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.amber,
    shadowColor: Colors.amber,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  minimalAutoButtonActive: {
    backgroundColor: Colors.amber,
  },
  minimalAutoText: {
    color: Colors.amber,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginLeft: 4,
  },
  minimalAutoTextActive: {
    color: '#0A0A0F',
  },
  countdownContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  countdownText: {
    color: Colors.mint,
    fontSize: 100,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 229, 160, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  countdownSub: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 6,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionCard: {
    backgroundColor: '#14141E',
    padding: 28,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 14,
  },
  permissionSubtitle: {
    color: '#A0A0B0',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 18,
  },
  permissionButton: {
    backgroundColor: Colors.amber,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 22,
    width: '100%',
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#0A0A0F',
    fontSize: 15,
    fontWeight: '800',
  },
});
