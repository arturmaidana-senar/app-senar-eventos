import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react-native';

export const ALERT_TYPE = {
  SUCCESS: 'SUCCESS',
  DANGER: 'DANGER',
  WARNING: 'WARNING',
  INFO: 'INFO',
};

const VARIANT_CONFIG = {
  [ALERT_TYPE.SUCCESS]: {
    Icon: CheckCircle,
    accentColor: '#2F5E38',
    iconBg: '#E3EFE6',
    badgeLabel: 'CONFIRMAÇÃO',
  },
  [ALERT_TYPE.DANGER]: {
    Icon: AlertCircle,
    accentColor: '#C94A38',
    iconBg: '#FDF0EE',
    badgeLabel: 'ATENÇÃO',
  },
  [ALERT_TYPE.WARNING]: {
    Icon: AlertTriangle,
    accentColor: '#B5632E',
    iconBg: '#FEF5E4',
    badgeLabel: 'AVISO',
  },
  [ALERT_TYPE.INFO]: {
    Icon: Info,
    accentColor: '#2F5E38',
    iconBg: '#EDF1E6',
    badgeLabel: 'INFORMAÇÃO',
  },
};

let alertListener = null;

const formatText = value => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (value?.message) return String(value.message);
  return String(value);
};

export const Dialog = {
  show(config = {}) {
    if (alertListener) {
      alertListener({
        visible: true,
        type: config.type || ALERT_TYPE.INFO,
        title: formatText(config.title),
        textBody: formatText(config.textBody),
        button: config.button || 'Fechar',
        onPressButton: config.onPressButton,
        autoClose: config.autoClose,
        closeOnOverlayTap: config.closeOnOverlayTap !== false,
      });
    }
  },
  hide() {
    if (alertListener) {
      alertListener(null);
    }
  },
};

export function AlertNotificationRoot({ children }) {
  const [alertState, setAlertState] = useState(null);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const autoCloseTimerRef = useRef(null);

  useEffect(() => {
    alertListener = (nextState) => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
      setAlertState(nextState);
    };

    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
      alertListener = null;
    };
  }, []);

  useEffect(() => {
    if (alertState?.visible) {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 110,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      if (alertState.autoClose) {
        const delay =
          typeof alertState.autoClose === 'number' ? alertState.autoClose : 2500;
        autoCloseTimerRef.current = setTimeout(() => {
          setAlertState(null);
        }, delay);
      }
    }
  }, [alertState, opacityAnim, scaleAnim]);

  const handleClose = () => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
    const callback = alertState?.onPressButton;
    setAlertState(null);
    if (typeof callback === 'function') {
      callback();
    }
  };

  const variant =
    VARIANT_CONFIG[alertState?.type] || VARIANT_CONFIG[ALERT_TYPE.INFO];
  const VariantIcon = variant.Icon;

  return (
    <>
      {children}
      <Modal
        transparent
        visible={Boolean(alertState?.visible)}
        animationType="none"
        statusBarTranslucent
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            if (alertState?.closeOnOverlayTap) {
              handleClose();
            }
          }}
        >
          <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <Animated.View
                style={[
                  styles.card,
                  {
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <View style={styles.topRow}>
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: variant.iconBg },
                    ]}
                  >
                    <VariantIcon size={26} color={variant.accentColor} />
                  </View>

                  <TouchableOpacity
                    style={styles.closeIconButton}
                    onPress={handleClose}
                    activeOpacity={0.7}
                  >
                    <X size={18} color="#6E786E" />
                  </TouchableOpacity>
                </View>

                <Text
                  style={[styles.badgeText, { color: variant.accentColor }]}
                >
                  {variant.badgeLabel}
                </Text>

                {Boolean(alertState?.title) && (
                  <Text style={styles.title}>{alertState.title}</Text>
                )}

                {Boolean(alertState?.textBody) && (
                  <Text style={styles.body}>{alertState.textBody}</Text>
                )}

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    { backgroundColor: variant.accentColor },
                  ]}
                  onPress={handleClose}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryButtonText}>
                    {alertState?.button || 'Fechar'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 34, 24, 0.58)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: '#E5EAE0',
    shadowColor: '#0E1F14',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F5F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: '#18221B',
    marginBottom: 8,
    lineHeight: 24,
  },
  body: {
    fontSize: 14,
    color: '#5F6A61',
    lineHeight: 21,
    marginBottom: 20,
  },
  primaryButton: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default AlertNotificationRoot;
