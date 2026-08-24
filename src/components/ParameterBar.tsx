import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { PhotographyParameters } from '../types/camera';

interface ParameterBarProps {
  settings: PhotographyParameters;
  isAutoAdjustActive: boolean;
}

export const ParameterBar: React.FC<ParameterBarProps> = ({
  settings,
  isAutoAdjustActive,
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.glassCard, isAutoAdjustActive && styles.glassCardActive]}>
        <View style={styles.paramItem}>
          <Text style={styles.paramLabel}>ISO</Text>
          <Text style={[styles.paramValue, isAutoAdjustActive && styles.paramValueActive]}>
            {settings.iso}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.paramItem}>
          <Text style={styles.paramLabel}>SHUTTER</Text>
          <Text style={[styles.paramValue, isAutoAdjustActive && styles.paramValueActive]}>
            {settings.shutterSpeedText}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.paramItem}>
          <Text style={styles.paramLabel}>IRIS</Text>
          <Text style={styles.paramValue}>{settings.aperture}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.paramItem}>
          <Text style={styles.paramLabel}>WB</Text>
          <Text style={styles.paramValue}>{settings.whiteBalanceKelvin}K</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.paramItem}>
          <Text style={styles.paramLabel}>EV</Text>
          <Text style={styles.paramValue}>
            {settings.ev > 0 ? `+${settings.ev}` : settings.ev.toFixed(1)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  glassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.surfaceGlass,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceGlassBorder,
  },
  glassCardActive: {
    borderColor: 'rgba(245, 166, 35, 0.4)',
  },
  paramItem: {
    alignItems: 'center',
  },
  paramLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  paramValue: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  paramValueActive: {
    color: Colors.amber,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
