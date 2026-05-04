import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Search } from 'lucide-react-native';
import Header from '../../components/Ui/Header';
import CardEvent from '../../components/Ui/CardEvent';
import CardNotEvent from '../../components/Ui/CardNotEvent';
import api from '../../services/endpont';

const { width } = Dimensions.get('window');

export default function Event() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const scrollViewRef = useRef(null);

  async function getEvents() {
    try {
      const response = await api.getUserEvents();
      setEvents(response.data);
      setFilteredEvents(response.data);
    } catch (error) {
      console.error('Erro ao buscar eventos do usuário:', error);
    }
  }

  useEffect(() => {
    getEvents();
  }, []);

  const handleSearch = text => {
    setSearchQuery(text);
    if (text) {
      const filtered = events.filter(
        event =>
          event.name?.toLowerCase().includes(text.toLowerCase()) ||
          event.name_location?.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events);
    }
  };

  const handleTabPress = index => {
    setActiveTab(index);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: index * width, animated: true });
    }
  };

  const handleScroll = event => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(scrollPosition / width);
    if (currentIndex !== activeTab) {
      setActiveTab(currentIndex);
    }
  };

  const hoje = new Date();

  const aguardandoEvents = filteredEvents.filter(e => {
    const fim = new Date(e.ended_at);
    return fim >= hoje;
  });

  const realizadosEvents = filteredEvents.filter(e => {
    const fim = new Date(e.ended_at);
    return fim < hoje;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      <View style={styles.content}>
        <Text style={styles.pageTitle}>Eventos</Text>

        <View style={styles.searchContainer}>
          <Search
            size={20}
            color="#A0A0A0"
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Buscar eventos..."
            placeholderTextColor="#A0A0A0"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              activeTab === 0 && styles.segmentButtonActive,
            ]}
            onPress={() => handleTabPress(0)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                activeTab === 0 && styles.segmentTextActive,
              ]}
            >
              Meus Serviços
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              activeTab === 1 && styles.segmentButtonActive,
            ]}
            onPress={() => handleTabPress(1)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                activeTab === 1 && styles.segmentTextActive,
              ]}
            >
              Meus Tickets
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
      >
        <View style={styles.page}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {aguardandoEvents.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.dot, { backgroundColor: '#EBB455' }]} />
                  <Text style={styles.sectionTitle}>
                    AGUARDANDO ({aguardandoEvents.length})
                  </Text>
                </View>
                {aguardandoEvents.map((item, index) => (
                  <CardEvent
                    key={item.id ? item.id.toString() : index.toString()}
                    item={item}
                  />
                ))}
              </View>
            )}

            {realizadosEvents.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.dot, { backgroundColor: '#51A85A' }]} />
                  <Text style={styles.sectionTitle}>
                    REALIZADOS ({realizadosEvents.length})
                  </Text>
                </View>
                {realizadosEvents.map((item, index) => (
                  <CardEvent
                    key={item.id ? item.id.toString() : index.toString()}
                    item={item}
                  />
                ))}
              </View>
            )}

            {filteredEvents.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhum evento encontrado.</Text>
              </View>
            )}
          </ScrollView>
        </View>

        <View style={styles.page}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            <CardNotEvent />
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F5',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    height: '100%',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F4F5F4',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  segmentButtonActive: {
    backgroundColor: '#56A960',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A8A8A',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  page: {
    width: width,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginLeft: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C3539',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#8A8A8A',
    fontSize: 15,
  },
});
