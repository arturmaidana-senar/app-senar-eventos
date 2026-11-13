import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Rect } from 'react-native-svg';

const MONTHS_SHORT = [
  'JAN',
  'FEV',
  'MAR',
  'ABR',
  'MAI',
  'JUN',
  'JUL',
  'AGO',
  'SET',
  'OUT',
  'NOV',
  'DEZ',
];

function SerratedEdge({ side = 'left', bgColor = '#F6F7F2' }) {
  const d =
    side === 'left'
      ? 'M0,0 L0,140 L6,140 A4.5,4.5 0 0,1 6,130 L6,120 A4.5,4.5 0 0,1 6,110 L6,100 A4.5,4.5 0 0,1 6,90 L6,80 A4.5,4.5 0 0,1 6,70 L6,60 A4.5,4.5 0 0,1 6,50 L6,40 A4.5,4.5 0 0,1 6,30 L6,20 A4.5,4.5 0 0,1 6,10 L6,0 Z'
      : 'M8,0 L8,140 L2,140 A4.5,4.5 0 0,0 2,130 L2,120 A4.5,4.5 0 0,0 2,110 L2,100 A4.5,4.5 0 0,0 2,90 L2,80 A4.5,4.5 0 0,0 2,70 L2,60 A4.5,4.5 0 0,0 2,50 L2,40 A4.5,4.5 0 0,0 2,30 L2,20 A4.5,4.5 0 0,0 2,10 L2,0 Z';

  return (
    <Svg
      width={8}
      height="100%"
      viewBox="0 0 8 140"
      preserveAspectRatio="none"
      style={side === 'left' ? styles.serratedLeft : styles.serratedRight}
    >
      <Path d={d} fill={bgColor} />
    </Svg>
  );
}

function VerticalBarcode({ color = '#2B2B25' }) {
  const bars = [
    { y: 2, h: 3.5 },
    { y: 8, h: 1.5 },
    { y: 12, h: 4.5 },
    { y: 19, h: 2 },
    { y: 23, h: 1.5 },
    { y: 27, h: 4 },
    { y: 33, h: 1.5 },
    { y: 37, h: 3 },
    { y: 42, h: 4.5 },
    { y: 49, h: 1.5 },
    { y: 53, h: 3.5 },
    { y: 59, h: 2 },
    { y: 63, h: 4 },
    { y: 69, h: 1.5 },
    { y: 73, h: 3.5 },
    { y: 79, h: 2 },
    { y: 83, h: 3 },
  ];

  return (
    <Svg width={18} height={88} viewBox="0 0 18 88">
      {bars.map((b, i) => (
        <Rect key={i} x="0" y={b.y} width="18" height={b.h} fill={color} />
      ))}
    </Svg>
  );
}

function CheckeredStrip({ color = '#2F5E38' }) {
  const squares = Array.from({ length: 16 });
  return (
    <View style={styles.checkeredCol}>
      {squares.map((_, i) => (
        <View
          key={i}
          style={[
            styles.checkerCell,
            i % 2 === 0 ? styles.checkerLeft : styles.checkerRight,
            { backgroundColor: color },
          ]}
        />
      ))}
    </View>
  );
}

function OrnamentRule({ color }) {
  return (
    <View style={styles.ornamentRow}>
      <Text style={[styles.ornamentStar, { color }]}>★</Text>
      <View style={[styles.accentRule, { backgroundColor: color }]} />
      <Text style={[styles.ornamentStar, { color }]}>★</Text>
    </View>
  );
}

export default function TicketCard3D({
  item,
  index = 0,
  locationText = '',
  onPress,
}) {
  const pressAnim = useRef(new Animated.Value(0)).current;
  const enterAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const sheenAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enterAnim, {
      toValue: 1,
      duration: 420,
      delay: Math.min(index * 65, 320),
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2400 + (index % 3) * 280,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2400 + (index % 3) * 280,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const sheenLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(1400 + (index % 3) * 500),
        Animated.timing(sheenAnim, {
          toValue: 1,
          duration: 1300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sheenAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.delay(1600),
      ]),
    );

    floatLoop.start();
    sheenLoop.start();

    return () => {
      floatLoop.stop();
      sheenLoop.stop();
    };
  }, [enterAnim, floatAnim, index, sheenAnim]);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 0,
      friction: 5,
      tension: 90,
      useNativeDriver: true,
    }).start();
  };

  const scale = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.965],
  });

  const pressRotateX = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 5],
  });

  const ambientRotateX = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, -0.8],
  });

  const pressRotateY = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });

  const ambientRotateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-1.2, 1.2],
  });

  const combinedRotateX = Animated.add(
    pressRotateX,
    ambientRotateX,
  ).interpolate({
    inputRange: [-10, 10],
    outputRange: ['-10deg', '10deg'],
  });

  const combinedRotateY = Animated.add(
    pressRotateY,
    ambientRotateY,
  ).interpolate({
    inputRange: [-10, 10],
    outputRange: ['-10deg', '10deg'],
  });

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -2.5],
  });

  const enterTranslateY = enterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 0],
  });

  const sheenTranslateX = sheenAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-180, 420],
  });

  const parseDateInfo = dateStr => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return { dayMonth: '-- ---', time: '--:--' };
    }
    const day = String(d.getDate()).padStart(2, '0');
    const month = MONTHS_SHORT[d.getMonth()] || '---';
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return {
      dayMonth: `${day} ${month}`,
      time: `${hours}:${mins}`,
    };
  };

  const dateInfo = parseDateInfo(item?.started_at);

  const hasCheckin = Boolean(item?.date_time_confirmation);
  const endRef = new Date(item?.ended_at || item?.started_at);
  const isPast = !isNaN(endRef.getTime()) && new Date() > endRef;

  const palette = hasCheckin
    ? {
        paper: '#EFF7EC',
        ink: '#18221B',
        accent: '#2F5E38',
        border: '#2F5E38',
        lip: '#C2D8BC',
        statusTag: 'CHECK-IN OK',
        stubTag: 'CONFIRMADO',
      }
    : isPast
      ? {
          paper: '#F1F2ED',
          ink: '#2D342F',
          accent: '#6E786F',
          border: '#7C867D',
          lip: '#D3D8CE',
          statusTag: 'REALIZADO',
          stubTag: 'ENCERRADO',
        }
      : {
          paper: '#FDF6DC',
          ink: '#2E2618',
          accent: '#B5632E',
          border: '#403421',
          lip: '#E1D19F',
          statusTag: 'AGUARDANDO',
          stubTag: 'INGRESSO',
        };

  const ticketNumber = String(item?.participant_id || item?.id || 0).padStart(
    6,
    '0',
  );

  const shortLocation = (locationText || 'Mato Grosso').split('·')[0].trim();

  return (
    <Animated.View
      style={[
        styles.outerWrapper,
        {
          opacity: enterAnim,
          transform: [
            { perspective: 950 },
            { translateY: Animated.add(enterTranslateY, floatY) },
            { scale },
            { rotateX: combinedRotateX },
            { rotateY: combinedRotateY },
          ],
        },
      ]}
    >
      <View style={styles.groundShadow} />

      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.ticketShell,
          {
            backgroundColor: palette.paper,
            borderBottomColor: palette.lip,
          },
        ]}
      >
        {/* Animated Glossy Sheen Sweep */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.sheenOverlay,
            {
              transform: [
                { translateX: sheenTranslateX },
                { rotate: '22deg' },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[
              'rgba(255,255,255,0)',
              'rgba(255,255,255,0.45)',
              'rgba(255,255,255,0)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sheenGradient}
          />
        </Animated.View>

        <SerratedEdge side="left" bgColor="#F6F7F2" />

        {/* Left Main Ticket Area */}
        <View style={styles.leftArea}>
          <View
            style={[styles.innerFrame, { borderColor: palette.border }]}
          >
            {/* Top Header */}
            <View style={styles.topRow}>
              <Text style={[styles.brandBold, { color: palette.ink }]}>
                SENAR{' '}
              </Text>
              <Text style={[styles.brandLight, { color: palette.accent }]}>
                EVENTOS
              </Text>
              <Text style={[styles.statusRight, { color: palette.accent }]}>
                {' '}
                · {palette.statusTag}
              </Text>
            </View>

            <OrnamentRule color={palette.accent} />

            {/* Middle Row: Left Date | Bold Event Title | Right Location */}
            <View style={styles.middleRow}>
              <View style={styles.sideSpecLeft}>
                <Text style={[styles.sideSpecTitle, { color: palette.accent }]}>
                  DATA
                </Text>
                <Text
                  style={[styles.sideSpecValueLeft, { color: palette.ink }]}
                  numberOfLines={1}
                >
                  {dateInfo.dayMonth}
                </Text>
                <Text style={[styles.sideSpecValueLeft, { color: palette.ink }]}>
                  {dateInfo.time}
                </Text>
              </View>

              <View style={styles.centerTitleBox}>
                <Text
                  style={[styles.eventTitle, { color: palette.ink }]}
                  numberOfLines={2}
                >
                  {item?.name || 'Evento Senar'}
                </Text>
              </View>

              <View style={styles.sideSpecRight}>
                <Text style={[styles.sideSpecTitle, { color: palette.accent }]}>
                  LOCAL
                </Text>
                <Text
                  style={[styles.sideSpecValueRight, { color: palette.ink }]}
                  numberOfLines={2}
                >
                  {shortLocation}
                </Text>
              </View>
            </View>

            <OrnamentRule color={palette.accent} />

            {/* Bottom Ticket Number */}
            <Text style={[styles.serialNumber, { color: palette.ink }]}>
              {ticketNumber}
            </Text>
          </View>
        </View>

        {/* Center Perforation */}
        <View style={styles.perforationCol}>
          <View style={[styles.notch, styles.notchTop]} />
          <View
            style={[styles.dashedTear, { borderColor: palette.border }]}
          />
          <View style={[styles.notch, styles.notchBottom]} />
        </View>

        {/* Right Stub */}
        <View style={styles.rightArea}>
          <View
            style={[styles.stubFrame, { borderColor: palette.border }]}
          >
            <CheckeredStrip color={palette.accent} />

            <View style={styles.stubVerticalTextWrap}>
              <Text style={[styles.stubVerticalText, { color: palette.ink }]}>
                {palette.stubTag}
              </Text>
            </View>

            <View style={styles.barcodeWrap}>
              <VerticalBarcode color={palette.ink} />
            </View>
          </View>
        </View>

        <SerratedEdge side="right" bgColor="#F6F7F2" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    marginBottom: 18,
    position: 'relative',
  },
  groundShadow: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: -4,
    height: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(24, 34, 27, 0.14)',
  },
  ticketShell: {
    flexDirection: 'row',
    height: 138,
    borderRadius: 4,
    borderBottomWidth: 4,
    shadowColor: '#18221B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  sheenOverlay: {
    position: 'absolute',
    top: -40,
    bottom: -40,
    width: 70,
    zIndex: 3,
  },
  sheenGradient: {
    flex: 1,
  },
  serratedLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 4,
  },
  serratedRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 4,
  },
  leftArea: {
    flex: 1,
    paddingLeft: 13,
    paddingRight: 6,
    paddingVertical: 8,
  },
  innerFrame: {
    flex: 1,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBold: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  brandLight: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statusRight: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ornamentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ornamentStar: {
    fontSize: 7.5,
    lineHeight: 9,
  },
  accentRule: {
    flex: 1,
    height: 1.5,
    opacity: 0.85,
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  sideSpecLeft: {
    width: 50,
    alignItems: 'flex-start',
  },
  sideSpecRight: {
    width: 54,
    alignItems: 'flex-end',
  },
  sideSpecTitle: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 1,
  },
  sideSpecValueLeft: {
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 12,
    textAlign: 'left',
  },
  sideSpecValueRight: {
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 12,
    textAlign: 'right',
  },
  centerTitleBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  eventTitle: {
    fontSize: 15.5,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 19,
    letterSpacing: -0.2,
  },
  serialNumber: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 3.5,
    opacity: 0.85,
  },
  perforationCol: {
    width: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notch: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F6F7F2',
    zIndex: 5,
  },
  notchTop: {
    top: -6,
  },
  notchBottom: {
    bottom: -6,
  },
  dashedTear: {
    height: '78%',
    width: 1,
    borderLeftWidth: 1.3,
    borderStyle: 'dashed',
    opacity: 0.45,
  },
  rightArea: {
    width: 80,
    paddingLeft: 4,
    paddingRight: 13,
    paddingVertical: 8,
  },
  stubFrame: {
    flex: 1,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  checkeredCol: {
    width: 6,
    height: '100%',
    justifyContent: 'space-between',
  },
  checkerCell: {
    width: 3,
    height: 4,
  },
  checkerLeft: {
    alignSelf: 'flex-start',
  },
  checkerRight: {
    alignSelf: 'flex-end',
  },
  stubVerticalTextWrap: {
    width: 16,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stubVerticalText: {
    width: 96,
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 1.4,
    textAlign: 'center',
    transform: [{ rotate: '-90deg' }],
  },
  barcodeWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
