import React, { useState, useEffect } from 'react';
import { Row, EventosText } from './styles';
import { 
  View, 
  Text, 
  FlatList, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  StatusBar,
  Dimensions 
} from 'react-native';
import { 
  Container, 
  HeaderContainer,
  WelcomeSection,
  WelcomeText,
  SubtitleText,
  SearchContainer,
  SearchInput,
  FilterContainer,
  FilterButton,
  FilterText,
  SectionHeader,
  SectionTitle,
  ViewAllButton,
  ViewAllText,
  EventsContainer,
  EmptyStateContainer,
  EmptyStateText,
  LoadingContainer
} from './styles_modern';

import Header from '../../components/Header';
import CardHome from '../../components/CardHome';
import api from '../../services/endpont';

// Importar permissões
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
const { width } = Dimensions.get('window');

export default function Home() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');

  const filters = [
    { id: 'todos', label: 'Todos' },
    { id: 'proximos', label: 'Próximos' },
    { id: 'em_andamento', label: 'Em Andamento' },
    { id: 'finalizados', label: 'Finalizados' }
  ];

  async function getEvents() {
    try {
      setLoading(true);
      const response = await api.getAllEvents();
      setEvents(response.data);
      setFilteredEvents(response.data);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function requestPermissions() {
    try {
      const cameraPermission = await request(PERMISSIONS.ANDROID.CAMERA);
      const locationPermission = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      const audioPermission = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);

      if (
        cameraPermission === RESULTS.GRANTED &&
        locationPermission === RESULTS.GRANTED &&
        audioPermission === RESULTS.GRANTED
      ) {
        console.log('Todas as permissões foram concedidas!');
      } else {
        console.log('Alguma permissão foi negada!');
      }
    } catch (error) {
      console.error('Erro ao solicitar permissões: ', error);
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await getEvents();
    setRefreshing(false);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    filterEvents(text, selectedFilter);
  };

  const handleFilterChange = (filterId) => {
    setSelectedFilter(filterId);
    filterEvents(searchQuery, filterId);
  };

  const filterEvents = (query, filter) => {
    let filtered = events;

    // Filtrar por busca
    if (query) {
      filtered = filtered.filter(event => 
        event.title?.toLowerCase().includes(query.toLowerCase()) ||
        event.description?.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Filtrar por categoria
    if (filter !== 'todos') {
      const now = new Date();
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        switch (filter) {
          case 'proximos':
            return eventDate > now;
          case 'em_andamento':
            return eventDate.toDateString() === now.toDateString();
          case 'finalizados':
            return eventDate < now;
          default:
            return true;
        }
      });
    }

    setFilteredEvents(filtered);
  };

  useEffect(() => {
    getEvents();
    requestPermissions();
  }, []);

  const renderEventItem = ({ item }) => (
    <View style={{ marginBottom: 16 }}>
      <CardHome item={item} />
    </View>
  );

  const renderFilterButton = ({ item }) => (
    <FilterButton 
      active={selectedFilter === item.id}
      onPress={() => handleFilterChange(item.id)}
    >
      <FilterText active={selectedFilter === item.id}>
        {item.label}
      </FilterText>
    </FilterButton>
  );

  if (loading) {
    return (
      <Container>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Header />
        <LoadingContainer>
          <Text>Carregando eventos...</Text>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      	<HeaderContainer>
              <Header />
        </HeaderContainer>

		<WelcomeSection>
			<WelcomeText>Bem-vindo de volta!</WelcomeText>
			<SubtitleText>Descubra os próximos eventos</SubtitleText>
		</WelcomeSection>

      	<FlatList
			data={filteredEvents}
			renderItem={renderEventItem}
			keyExtractor={(item) => item.id.toString()}
			showsVerticalScrollIndicator={false}
			refreshControl={
			<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
			}
				ListHeaderComponent={(
				<>
	
{/*  
				<FilterContainer>
				<FlatList
					data={filters}
					renderItem={renderFilterButton}
					keyExtractor={(item) => item.id}
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ paddingHorizontal: 20 }}
				/>
				</FilterContainer>
 
				<SectionHeader>
				<SectionTitle>
					{selectedFilter === 'todos' ? 'Todos os Eventos' :
					filters.find(f => f.id === selectedFilter)?.label}
				</SectionTitle>
				<ViewAllButton onPress={() => {}}>
					<ViewAllText>Ver todos</ViewAllText>
				</ViewAllButton>
				</SectionHeader> */}
			</>
        )}
        ListEmptyComponent={(
          <EmptyStateContainer>
            <EmptyStateText>
              {searchQuery ? 
                'Nenhum evento encontrado para sua pesquisa' : 
                'Nenhum evento disponível no momento'
              }
            </EmptyStateText>
          </EmptyStateContainer>
        )}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      />
    </Container>
  );
}
