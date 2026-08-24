import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../theme/colors';
import { PoseGuide } from '../types/poses';
import { UserCheck, Sparkles, X, ChevronRight } from 'lucide-react-native';

interface PoseGuideOverlayProps {
  visible: boolean;
  poses: PoseGuide[];
  selectedPose: PoseGuide | null;
  onSelectPose: (pose: PoseGuide | null) => void;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export const PoseGuideOverlay: React.FC<PoseGuideOverlayProps> = ({
  visible,
  poses,
  selectedPose,
  onSelectPose,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Semi-transparent Silhouette AR Wireframe Overlay */}
      {selectedPose && (
        <View style={styles.silhouetteContainer} pointerEvents="none">
          <Svg viewBox="0 0 100 100" style={styles.silhouetteSvg}>
            <Path
              d={selectedPose.silhouetteSvg}
              fill="rgba(0, 229, 160, 0.12)"
              stroke={Colors.mint}
              strokeWidth="1.2"
              strokeDasharray="4 2"
            />
          </Svg>
          <View style={styles.tipFloatingBadge}>
            <Sparkles color={Colors.amber} size={14} />
            <Text style={styles.tipFloatingText}>{selectedPose.tip}</Text>
          </View>
        </View>
      )}

      {/* Bottom Pose Selector Drawer */}
      <View style={styles.bottomDrawer} pointerEvents="auto">
        <View style={styles.drawerHeader}>
          <View style={styles.headerLeft}>
            <UserCheck color={Colors.amber} size={18} />
            <Text style={styles.drawerTitle}>AI POSE ASSISTANT</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X color={Colors.textSecondary} size={20} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.poseList}
        >
          {/* Option to clear silhouette */}
          <TouchableOpacity
            onPress={() => onSelectPose(null)}
            style={[styles.poseCard, !selectedPose && styles.poseCardActive]}
          >
            <Text style={[styles.poseCardTitle, !selectedPose && styles.poseCardTitleActive]}>
              None
            </Text>
            <Text style={styles.poseCardSub}>Free Style</Text>
          </TouchableOpacity>

          {poses.map((pose) => {
            const isSelected = selectedPose?.id === pose.id;
            return (
              <TouchableOpacity
                key={pose.id}
                onPress={() => onSelectPose(pose)}
                style={[styles.poseCard, isSelected && styles.poseCardActive]}
              >
                <Text style={[styles.poseCardTitle, isSelected && styles.poseCardTitleActive]}>
                  {pose.title}
                </Text>
                <Text style={styles.poseCardSub} numberOfLines={1}>
                  {pose.category.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
  },
  silhouetteContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  silhouetteSvg: {
    width: width * 0.75,
    height: height * 0.55,
    opacity: 0.85,
  },
  tipFloatingBadge: {
    position: 'absolute',
    bottom: 210,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 30, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceGlassBorder,
    maxWidth: '85%',
  },
  tipFloatingText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  bottomDrawer: {
    backgroundColor: 'rgba(15, 15, 22, 0.92)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: Colors.surfaceGlassBorder,
    position: 'absolute',
    bottom: 125,
    left: 0,
    right: 0,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerTitle: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  poseList: {
    paddingHorizontal: 14,
  },
  poseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 110,
  },
  poseCardActive: {
    backgroundColor: 'rgba(245, 166, 35, 0.2)',
    borderColor: Colors.amber,
  },
  poseCardTitle: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  poseCardTitleActive: {
    color: Colors.amber,
  },
  poseCardSub: {
    color: Colors.textMuted,
    fontSize: 10,
    textTransform: 'capitalize',
    marginTop: 2,
  },
});
