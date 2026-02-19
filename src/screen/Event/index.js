import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, Animated, Dimensions, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { 
  Container, 
  MonthSelector, 
  MonthButton, 
  MonthText, 
  EventosText, 
  Row, 
} from './styles'; 
import CardNotEvent from '../../components/CardNotEvent';
import Header from '../../components/Header';
import CardEvent from '../../components/CardEvent';
import api from '../../services/endpont';
import { COLORS, FONTS } from "../../constants/theme";

const { width } = Dimensions.get('window');

export default function Event(){
    const { colors } = useTheme();
    const [events, setEvents] = useState([]);
    const [showTickets, setShowTickets] = useState(true);  
    const [showServices, setShowServices] = useState(true);  
    
    const scrollX = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef(null);
    const [active, setActive] = useState(0);

    async function getEvents() {
        const response = await api.getUserEvents();
        setEvents(response.data);
        setShowTickets(true);
        setShowServices(true);
    }

    useEffect(() => {
        getEvents();
    }, []); 

    const buttons = [showServices ? 'Meus Serviços' : null, showTickets ? 'Meus Tickets' : null].filter(Boolean); // Filtra null de 'Fotos'

    const onClick = i => {
        setActive(i);
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ x: i * width });
        }
    };

    function ButtonContainer({ buttons, onClick, scrollX, active }) {
        const { colors } = useTheme();
        const [btnContainerWidth, setWidth] = useState(0);
        const btnWidth = btnContainerWidth / buttons.length;
        const translateX = scrollX.interpolate({
            inputRange: [0, width, width * 2],
            outputRange: [0, btnWidth, btnWidth * 2],
        });

        return (
            <View
                style={[styles.btnContainer, { borderColor: colors.borderColor }]}
                onLayout={e => setWidth(e.nativeEvent.layout.width)}>
                {buttons.map((btn, i) => (
                    <TouchableOpacity
                        key={btn}
                        style={styles.btn}
                        onPress={() => onClick(i)}>
                        <Text style={[{ ...FONTS.font, color: colors.text }, active === i && { color: '#000' }]}>{btn}</Text>
                    </TouchableOpacity>
                ))}
                <Animated.View
                    style={[
                        styles.animatedBtnContainer,
                        {
                            width: btnWidth,
                            backgroundColor: active in([1,2,3]) ? COLORS.primary : colors.title,  
                            transform: [{ translateX }],
                        },
                    ]}
                />
            </View>
        );
    }

    return (
        <Container>
            <Header />
            <Row>
                <EventosText>Eventos</EventosText>
            </Row>
            <View style={{ marginBottom: 10 }}>
                <ButtonContainer buttons={buttons} onClick={onClick} scrollX={scrollX} active={active} />
            </View>

            <ScrollView
                contentContainerStyle={{ paddingBottom: 70 }}
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                scrollEventThrottle={16}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false },
                )}>

                <View style={[styles.card]}>
                    <View style={[styles.container]}>
						<FlatList
							data={events}
							renderItem={({ item }) => <CardEvent item={item} />}   
							keyExtractor={(item) => item.id}
						/>
                    </View>
                </View>
                <View style={[styles.card]}>
                    <CardNotEvent />
                </View>

            </ScrollView>
        </Container>
    );
}

const styles = StyleSheet.create({
    btnContainer: {
        height: 45,
        overflow: 'hidden',
        flexDirection: 'row',
        width: '100%',
        borderBottomWidth: 1,
    },
    btn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    animatedBtnContainer: {
        height: 2,
        flexDirection: 'row',
        position: 'absolute',
        overflow: 'hidden',
        bottom: 0,
    },
    container: {
        flex: 1,
        padding: 20,
    },
    card: {
        width: width,
    },
});
