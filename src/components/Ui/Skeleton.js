import React from 'react';
import { View, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';

const Skeleton = () => {
  return (
    <Animatable.View
      animation="pulse"
      easing="ease-in-out"
      iterationCount="infinite"
      style={styles.card}
    >
      <View style={styles.cardDateBlock} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonAvatar} />
        </View>
        <View style={styles.skeletonLocation} />
        <View style={styles.skeletonTime} />
      </View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    elevation: 5,
    overflow: 'hidden',
    height: 115,
  },
  cardDateBlock: {
    width: 70,
    backgroundColor: '#E0E0E0',
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  skeletonTitle: {
    width: '70%',
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  skeletonAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0E0E0',
    position: 'absolute',
    top: 0,
    right: 0,
  },
  skeletonLocation: {
    width: '80%',
    height: 14,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginTop: 18,
  },
  skeletonTime: {
    width: '50%',
    height: 14,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginTop: 12,
  },
});

export default Skeleton;
