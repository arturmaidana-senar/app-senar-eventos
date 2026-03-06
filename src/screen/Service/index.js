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
} from 'react-native';
import { PermissionsAndroid } from 'react-native';

import {
  useRoute,
  useNavigation,
  useTheme,
  useFocusEffect,
} from '@react-navigation/native';

import { Camera } from 'react-native-camera-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { setHeaderOptions } from '../../components/HeaderTitle';
import LoadingInfo from '../../components/LoadingInfo';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS } from '../../constants/theme';

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
      headerTitleStyle: { fontFamily: 'Arial', fontSize: 18, color: '#333333' },
      headerTintColor: '#333333',
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

      // Timeout de segurança: garante que o overlay de loading nunca trava a tela
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

      setIsCheckin(response.isCheckin || false);
      setIsCredential(response.isCredential || false);
      setFreeCheckin(response.freeCheckin || false);
    } catch (error) {
      console.log('Erro ao buscar o evento:', error);
    }
  }

  async function requestCameraPermission() {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
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
      activeOpacity={0.8}
    >
      <View
        style={[styles.actionIconContainer, { backgroundColor: iconBgColor }]}
      >
        <Icon name={iconName} size={28} color={iconColor} />
      </View>
      <View style={styles.actionTextContainer}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F2F4F8' }}>
      <LoadingInfo visible={loading} message={titleLoading} />
      {!scannerVisible && (
        <View style={[GlobalStyleSheet.container, { flex: 1 }]}>
          <View style={styles.eventCard}>
            <Text style={styles.eventName}>{event.name}</Text>

            <View style={styles.infoRow}>
              <Icon name="calendar-today" size={16} color="#757575" />
              <Text style={styles.infoText}>
                {formatDateEvent(event.started_at)} –{' '}
                {formatDateEvent(event.ended_at)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Icon name="people-outline" size={18} color="#757575" />
              <Text style={styles.infoText}>
                {listCheckin.length} check-ins realizados
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>AÇÕES</Text>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {isCheckin && (
              <ActionButton
                title="Registrar Presença"
                subtitle="Registrar a presença que estão na pré lista do evento."
                iconName="list-alt"
                iconColor="#3E7B58"
                iconBgColor="#E8F5E9"
                onPress={() => navigation.navigate('Credential', { eventId })}
              />
            )}

            {showCheckInButton && isCredential && (
              <ActionButton
                title="Check-In"
                subtitle="Registrar a presença de participantes que estão na pré lista do evento via QRCode."
                iconName="qr-code-scanner"
                iconColor="#3E7B58"
                iconBgColor="#E8F5E9"
                onPress={toggleScanner}
              />
            )}

            {freeCheckin && (
              <ActionButton
                title="Credenciar participante"
                subtitle="Credenciar participantes para participar do evento."
                iconName="person-add-alt-1"
                iconColor="#3E7B58"
                iconBgColor="#E8F5E9"
                onPress={() =>
                  navigation.navigate('CredencialmentoResponsavel', {
                    eventId,
                    termText,
                    termMinorText,
                  })
                }
              />
            )}

            <Text
              style={[
                FONTS.font,
                {
                  marginTop: 20,
                  marginBottom: 10,
                  fontSize: 12,
                  color: colors.text,
                  fontWeight: 'bold',
                },
              ]}
            >
              ÚLTIMOS REGISTROS:
            </Text>

            {listCheckin.map(item => (
              <View key={String(item.participant_id)} style={styles.cardList}>
                <View style={styles.nameContainer}>
                  <Text style={styles.firstName}>{item.name_participante}</Text>
                  <TouchableOpacity onPress={() => openModal(item)}>
                    <Icon name="info-outline" size={24} color="#000" />
                  </TouchableOpacity>
                </View>
                <View style={styles.nameContainer}>
                  <Text style={styles.lastName}>{item.user_create}</Text>
                  <Text style={styles.birthDate}>
                    {formatDateEvent(item.started_at)}
                  </Text>
                </View>
              </View>
            ))}
            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
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
                Check-ins
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
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  eventName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#757575',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#757575',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  actionCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
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
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#757575',
  },
  cardList: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  firstName: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  lastName: { fontSize: 14, color: '#888' },
  birthDate: { fontSize: 12, color: '#555', marginLeft: 10 },
  scannerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centerText: { flex: 1, fontSize: 18, padding: 32, color: '#777' },
  textBold: { fontWeight: '500', color: '#000' },
  buttonText: { fontSize: 21, color: '#000' },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: COLORS.danger,
    padding: 10,
    borderRadius: 5,
    zIndex: 999,
  },
  closeButtonText: { color: '#fff', fontSize: 16 },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    width: '80%',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalContent: { fontSize: 14, color: '#555' },
  checkinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  checkinColumn: { flex: 1, alignItems: 'center' },
  emptyColumn: { flex: 1 },
});
