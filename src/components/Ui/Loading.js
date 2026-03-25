// components/Loading.js
import React from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';

const Loading = ({ message = "Carregando informações..." }) => {
  return (
    <View style={styles.container}>
        <Image
            style={styles.imageSplash}
            source={require('../../assets/images/icon_splash.png')}
        />
        <Text style={styles.title}>Senar Eventos</Text>
            <ActivityIndicator size="large" color="#37C064" />
        <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  imageSplash: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    marginTop: 10,
  },
});

export default Loading;

