import React, { useEffect, useContext, useRef } from 'react';
import { 
    Animated, 
    Image, 
    StatusBar, 
    Text, 
    View, 
    StyleSheet
} from 'react-native';
import { AuthContext } from '../../contexts/auth';
import { useNavigation } from '@react-navigation/native';

export default function Preload() {
    const navigation = useNavigation();
    const { loadStorage } = useContext(AuthContext);

    const fadeAnim = useRef(new Animated.Value(0)).current;  // Valor inicial da animação

    useEffect(() => {
        // Função de animação
        Animated.loop(
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0.5,
                    duration: 1500,
                    useNativeDriver: true,
                })
            ])
        ).start();

        // Função para checar o token após 3 segundos
        const timer = setTimeout(() => {
            const checkToken = async () => {
                loadStorage();
            }
            checkToken();
        }, 3500);

        return () => clearTimeout(timer);
    }, [fadeAnim, navigation]);

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            <Animated.View style={{ opacity: fadeAnim }}>
                <Image
                    style={styles.imageSplash}
                    source={require('../../assets/images/icon_splash.png')}
                />
                <Text style={styles.textMain}>Senar Eventos</Text>
            </Animated.View>
            <View style={styles.footer}>
                <Image
                    style={styles.imageFooter}
                    source={require('../../assets/images/icon_famato.png')}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 20,
    },
    imageSplash: {
        width: 285,
        height: 295,
		flexShrink: 0,
    },
    textMain: {
        color: '#007C6F',
        textAlign: 'center',
        fontFamily: 'Ubuntu',
        fontSize: 32,
        fontWeight: '700',
        lineHeight: 38,
        marginVertical: 20,
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageFooter: {
        width: 146,
        height: 45,
		flexShrink: 0,
    }
});