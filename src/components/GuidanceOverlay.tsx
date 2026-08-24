import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { MotionData, GuidanceInstruction, AutoAdjustState } from '../types/camera';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react-native';

interface GuidanceOverlayProps {
  motion: MotionData;
  guidance: GuidanceInstruction;
  autoAdjustState: AutoAdjustState;
}

export const GuidanceOverlay: React.FC<GuidanceOverlayProps> = ({
  motion,
  guidance,
  autoAdjustState,
}) => {
  const renderDirectionIcon = () => {
    switch (guidance.direction) {
      case 'left':
        return <ArrowLeft color={Colors.amber} size={28} />;
      case 'right':
        return <ArrowRight color={Colors.amber} size={28} />;
      case 'up':
        return <ArrowUp color={Colors.amber} size={28} />;
      case 'down':
        return <ArrowDown color={Colors.amber} size={28} />;
      case 'perfect':
        return <CheckCircle2 color={Colors.mint} size={30} />;
      case 'hold_steady':
      default:
        return <ShieldAlert color={Colors.amber} size={28} />;
    }
  };

  return (
    <View pointerEvents="none" style={styles.container}>
      {/* Rule of Thirds Grid */}
      <View style={styles.gridOverlay}>
        <View style={styles.gridVertical1} />
        <View style={styles.gridVertical2} />
        <View style={styles.gridHorizontal1} />
        <View style={styles.gridHorizontal2} />
      </View>

      {/* Horizon Level Indicator */}
      <View style={styles.horizonContainer}>
        <View
          style={[
            styles.horizonLine,
            {
              transform: [{ rotate: `${-motion.roll}deg` }],
              backgroundColor: motion.isLevel ? Colors.mint : Colors.coral,
              shadowColor: motion.isLevel ? Colors.mint : Colors.coral,
            },
          ]}
        />
        <View
          style={[
            styles.horizonCenterReticle,
            { borderColor: motion.isLevel ? Colors.mint : Colors.textMuted },
          ]}
        />
      </View>

      {/* Dynamic AR Guidance Banner */}
      {autoAdjustState !== 'idle' && (
        <View
          style={[
            styles.guidanceBanner,
            guidance.isReadyToCapture && styles.guidanceBannerReady,
          ]}
        >
          <View style={styles.iconContainer}>{renderDirectionIcon()}</View>
          <View style={styles.textContainer}>
            <Text style={styles.primaryText}>{guidance.primaryMessage}</Text>
            {guidance.secondaryMessage && (
              <Text style={styles.secondaryText}>{guidance.secondaryMessage}</Text>
            )}
          </View>
          <View style={styles.scorePill}>
            <Text style={styles.scoreText}>{guidance.compositionScore}%</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFill,
  },
  gridVertical1: {
    position: 'absolute',
    left: '33.33%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: Colors.gridLine,
  },
  gridVertical2: {
    position: 'absolute',
    left: '66.66%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: Colors.gridLine,
  },
  gridHorizontal1: {
    position: 'absolute',
    top: '33.33%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.gridLine,
  },
  gridHorizontal2: {
    position: 'absolute',
    top: '66.66%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.gridLine,
  },
  horizonContainer: {
    position: 'absolute',
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizonLine: {
    width: 90,
    height: 2,
    borderRadius: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  horizonCenterReticle: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  guidanceBanner: {
    position: 'absolute',
    top: 90,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceGlass,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceGlassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    maxWidth: '88%',
  },
  guidanceBannerReady: {
    borderColor: Colors.mint,
    backgroundColor: 'rgba(0, 40, 25, 0.75)',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  primaryText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  scorePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 8,
  },
  scoreText: {
    color: Colors.mint,
    fontSize: 12,
    fontWeight: '800',
  },
});
