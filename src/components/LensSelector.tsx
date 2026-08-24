import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { CameraLensInfo } from '../types/camera';

interface LensSelectorProps {
  lenses: CameraLensInfo[];
  selectedLens: CameraLensInfo;
  onSelectLens: (lens: CameraLensInfo) => void;
}

export const LensSelector: React.FC<LensSelectorProps> = ({
  lenses,
  selectedLens,
  onSelectLens,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.glassPill}>
        {lenses.map((lens) => {
          const isSelected = lens.id === selectedLens.id;
          return (
            <TouchableOpacity
              key={lens.id}
              activeOpacity={0.7}
              onPress={() => onSelectLens(lens)}
              style={[styles.lensButton, isSelected && styles.lensButtonActive]}
            >
              <Text
                style={[
                  styles.lensText,
                  isSelected && styles.lensTextActive,
                ]}
              >
                {lens.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 16,
  },
  glassPill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 20, 30, 0.75)',
    borderRadius: 25,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  lensButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  lensButtonActive: {
    backgroundColor: Colors.amber,
    shadowColor: Colors.amber,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  lensText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  lensTextActive: {
    color: '#0A0A0F',
    fontWeight: '800',
  },
});
