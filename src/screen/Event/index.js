import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Header from '../../components/Header';
import CardEvent from '../../components/CardEvent';
import CardNotEvent from '../../components/CardNotEvent';
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header />

      <View style={styles.content}>
        <Text style={styles.pageTitle}>Eventos</Text>

        <View style={styles.searchContainer}>
          <Feather
            name="search"
            size={20}
            color="#999"
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
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.page}>
          <FlatList
            data={filteredEvents}
            renderItem={({ item }) => <CardEvent item={item} />}
            keyExtractor={(item, index) =>
              item.id ? item.id.toString() : index.toString()
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhum evento encontrado.</Text>
              </View>
            }
          />
        </View>

        <View style={styles.page}>
          <View style={styles.listContent}>
            <CardNotEvent />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  segmentButtonActive: {
    backgroundColor: '#4A9954',
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
    paddingBottom: 24,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#8A8A8A',
    fontSize: 15,
  },
});
