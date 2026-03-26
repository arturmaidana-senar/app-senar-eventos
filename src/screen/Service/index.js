import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  ScrollView,
  StatusBar,
} from 'react-native';

import {
  useRoute,
  useNavigation,
  useTheme,
  useFocusEffect,
} from '@react-navigation/native';

import { Camera } from 'react-native-camera-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { setHeaderOptions } from '../../components/Ui/HeaderTitle';
import LoadingInfo from '../../components/Ui/LoadingInfo';
import { COLORS, FONTS } from '../../constants/theme';
import CustomTopHeader from '../../components/Ui/CustomTopHeader';
import api from '../../services/endpont';
import apiService from '../../services/api';

import { formatDateEvent } from '../../utils/dateFormat';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

const { width } = Dimensions.get('window');

export default function Service() {
  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { eventId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [titleLoading, setTitleLoading] = useState('Atualizando Informações');
  const [event, setEvent] = useState({});
  const [listCheckin, setListCheckin] = useState([]);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [showCheckInButton, setShowCheckInButton] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [isCheckin, setIsCheckin] = useState(false);
  const [isCredential, setIsCredential] = useState(false);
  const [freeCheckin, setFreeCheckin] = useState(false);

  const [hasTerm, setHasTerm] = useState(false);
  const [termText, setTermText] = useState(null);
  const [termMinorText, setTermMinorText] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const modalTranslateY = useRef(new Animated.Value(300)).current;
  const isScanning = useRef(false);

  useEffect(() => {
    setHeaderOptions(navigation, {
      headerTitle: 'Evento',
      headerTitleAlign: 'center',
      headerTitleStyle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
      headerStyle: {
        backgroundColor: '#F5F6F8',
        elevation: 0,
        shadowOpacity: 0,
      },
      headerLeft: () => (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color="#1A1A1A" />
        </TouchableOpacity>
      ),
    });
    firstEvent();
    handleListCheckin();
  }, [navigation]);

  useEffect(() => {
    if (event.started_at && event.ended_at) {
      const now = new Date();
      const start = new Date(event.started_at.replace(' ', 'T'));
      const end = new Date(event.ended_at.replace(' ', 'T'));
      setShowCheckInButton(now >= start && now <= end);
    }
  }, [event]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setTitleLoading('Atualizando Informações');

      const safetyTimer = setTimeout(() => setLoading(false), 8000);

      Promise.allSettled([
        firstEvent(),
        handleListCheckin(),
        checkEventTerm(),
      ]).finally(() => {
        clearTimeout(safetyTimer);
        setLoading(false);
      });

      return () => clearTimeout(safetyTimer);
    }, [eventId]),
  );

  const checkEventTerm = async () => {
    try {
      const id = eventId || route.params?.eventId;
      if (!id) return;

      const response = await apiService.get(`/events/${id}/term`);
      const data = response.data;

      if (data && (data.term_text || data.term_minor_text)) {
        setHasTerm(true);
        setTermText(data.term_text || null);
        setTermMinorText(data.term_minor_text || null);
      } else {
        setHasTerm(false);
      }
    } catch (error) {
      console.log('Evento sem termo configurado ou erro na api:', error);
      setHasTerm(false);
    }
  };

  async function firstEvent() {
    try {
      const response = await api.getEvent(eventId);
      setEvent(response.data);

      setIsCheckin(response.isCredential || false);
      setIsCredential(response.isCheckin || false);
      setFreeCheckin(response.freeCheckin || false);
    } catch (error) {
      console.log('Erro ao buscar o evento:', error);
    }
  }

  const handleListCheckin = async () => {
    try {
      const response = await api.getListEventCheckin(eventId);
      setListCheckin(response.data || []);
    } catch {}
  };

  const handleQRCodeRead = async data => {
    if (isScanning.current || !data) return;
    isScanning.current = true;
    setScannerVisible(false);

    setLoading(true);
    try {
      const response = await api.postCheckinEvent({ token: data, eventId });
      await handleListCheckin();
      Dialog.show({
        type: response.error ? ALERT_TYPE.DANGER : ALERT_TYPE.SUCCESS,
        title: response.error ? 'Error' : 'Check-in',
        textBody: response.error ? response.message : response.name,
        button: 'Fechar',
      });
    } catch {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Houve uma falha tente novamente.',
        button: 'Fechar',
      });
    } finally {
      isScanning.current = false;
      setLoading(false);
    }
  };

  const toggleScanner = () => setScannerVisible(v => !v);
  const closeScanner = () => setScannerVisible(false);

  const openModal = item => {
    setSelectedItem(item);
    setModalVisible(true);
    Animated.timing(modalTranslateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalTranslateY, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const renderCheckinDetails = checkins => {
    const rows = [];
    for (let i = 0; i < checkins.length; i += 2) {
      const entrada = checkins[i];
      const saida = checkins[i + 1];
      rows.push(
        <View key={i} style={styles.checkinRow}>
          <View style={styles.checkinColumn}>
            <Text style={styles.textBold}>Entrada</Text>
            <Text style={styles.modalContent}>
              {formatDateEvent(entrada.started_at)}
            </Text>
          </View>
          {saida ? (
            <View style={styles.checkinColumn}>
              <Text style={styles.textBold}>Saída</Text>
              <Text style={styles.modalContent}>
                {formatDateEvent(saida.started_at)}
              </Text>
            </View>
          ) : (
            <View style={styles.emptyColumn} />
          )}
        </View>,
      );
    }
    return rows;
  };

  const getInitials = name => {
    if (!name) return 'US';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRelativeTime = dateString => {
    if (!dateString) return '';
    const past = new Date(dateString.replace(' ', 'T'));
    const now = new Date();
    const diffMs = now - past;
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 1) return 'agora mesmo';
    if (diffMins < 60) return `há ${diffMins} min`;
    const diffHrs = Math.round(diffMins / 60);
    if (diffHrs < 24) return `há ${diffHrs} hora${diffHrs > 1 ? 's' : ''}`;
    const diffDays = Math.round(diffHrs / 24);
    return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
  };

  const ActionButton = ({
    title,
    subtitle,
    iconName,
    iconColor,
    iconBgColor,
    onPress,
  }) => (
    <TouchableOpacity
      style={styles.actionCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[styles.actionIconContainer, { backgroundColor: iconBgColor }]}
      >
        <Icon name={iconName} size={24} color={iconColor} />
      </View>
      <View style={styles.actionTextContainer}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#D1D1D1" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <CustomTopHeader navigation={navigation} title="Evento" />

      <StatusBar barStyle="dark-content" backgroundColor="#F5F6F8" />
      <LoadingInfo visible={loading} message={titleLoading} />

      {!scannerVisible && (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <LinearGradient
            colors={['#592104', '#D08236']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.eventCard}
          >
            <Text style={styles.eventName}>
              {event.name || 'Carregando evento...'}
            </Text>

            <View style={styles.infoRow}>
              <Feather
                name="calendar"
                size={14}
                color="#FFFFFF"
                style={styles.infoIcon}
              />
              <Text style={styles.infoText}>
                {event.started_at ? formatDateEvent(event.started_at) : '--'} —{' '}
                {event.ended_at ? formatDateEvent(event.ended_at) : '--'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Feather
                name="users"
                size={14}
                color="#FFFFFF"
                style={styles.infoIcon}
              />
              <Text style={styles.infoText}>
                {listCheckin.length} check-ins realizados
              </Text>
            </View>
          </LinearGradient>

          <Text style={styles.sectionTitle}>Ações Disponíveis</Text>

          {isCheckin && (
            <ActionButton
              title="Registrar Presença"
              subtitle="Registrar a presença que estão na pré lista do evento."
              iconName="assignment"
              iconColor="#4CAF50"
              iconBgColor="#E8F5E9"
              onPress={() => navigation.navigate('Credential', { eventId })}
            />
          )}

          {showCheckInButton && isCredential && (
            <ActionButton
              title="Check-In"
              subtitle="Registrar a presença de participantes via QRCode."
              iconName="qr-code-scanner"
              iconColor="#9C27B0"
              iconBgColor="#F3E5F5"
              onPress={toggleScanner}
            />
          )}

          {freeCheckin && (
            <ActionButton
              title="Credenciar participante"
              subtitle="Credenciar participantes para participar do evento."
              iconName="person-add-alt-1"
              iconColor="#2196F3"
              iconBgColor="#E3F2FD"
              onPress={() =>
                navigation.navigate('CredencialmentoResponsavel', {
                  eventId,
                  termText,
                  termMinorText,
                })
              }
            />
          )}

          {listCheckin.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
                Últimos Registros
              </Text>

              <View style={styles.recordsContainer}>
                {listCheckin.map((item, index) => (
                  <TouchableOpacity
                    key={String(item.participant_id) + index}
                    style={[
                      styles.recordItem,
                      index < listCheckin.length - 1 && styles.recordItemBorder,
                    ]}
                    onPress={() => openModal(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.recordAvatar}>
                      <Text style={styles.recordAvatarText}>
                        {getInitials(item.name_participante)}
                      </Text>
                    </View>

                    <View style={styles.recordInfo}>
                      <Text style={styles.recordName} numberOfLines={1}>
                        {item.name_participante}
                      </Text>
                      <Text style={styles.recordType} numberOfLines={1}>
                        {item.user_create || 'Check-in'}
                      </Text>
                    </View>

                    <Text style={styles.recordTime}>
                      {getRelativeTime(item.started_at)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      )}

      {scannerVisible && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { zIndex: 999, backgroundColor: '#000' },
          ]}
        >
          <Camera
            style={{ flex: 1 }}
            scanBarcode={true}
            onReadCode={event =>
              handleQRCodeRead(event.nativeEvent.codeStringValue)
            }
            showFrame={true}
            laserColor="red"
            frameColor="white"
          />
          <TouchableOpacity style={styles.closeButton} onPress={closeScanner}>
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      )}

      {modalVisible && (
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.modal,
                { transform: [{ translateY: modalTranslateY }] },
              ]}
            >
              <Text style={[styles.textBold, styles.modalTitle]}>
                Detalhes do Registro
              </Text>
              {renderCheckinDetails(selectedItem?.checkin || [])}
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  eventCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  eventName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 10,
    opacity: 0.9,
  },
  infoText: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9E9E9E',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#8A8A8A',
    lineHeight: 18,
  },
  recordsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  recordItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  recordAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordAvatarText: {
    color: '#4A9954',
    fontSize: 14,
    fontWeight: '700',
  },
  recordInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  recordName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  recordType: {
    fontSize: 12,
    color: '#8A8A8A',
  },
  recordTime: {
    fontSize: 12,
    color: '#A0A0A0',
    marginLeft: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: COLORS.danger,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    zIndex: 999,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 24,
    borderRadius: 16,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#1A1A1A',
  },
  modalContent: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  checkinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#F7F8FA',
    padding: 12,
    borderRadius: 8,
  },
  checkinColumn: {
    flex: 1,
    alignItems: 'flex-start',
  },
  emptyColumn: {
    flex: 1,
  },
  textBold: {
    fontWeight: '600',
    color: '#1A1A1A',
  },
});
