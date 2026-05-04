import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Info } from 'lucide-react-native';

const CardNotEvent = () => {
  return (
    <View style={styles.body}>
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Info
            size={32}
            color="#37C064"
            style={{ marginTop: 5 }}
          />
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardDescription}>Nenhum evento...</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 0,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    height: 100,
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2B9348',
  },
  cardDescription: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
});

export default CardNotEvent;
