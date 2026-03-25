import React from 'react';
import { ScrollView, Text, View, StyleSheet, Dimensions } from 'react-native';
import RenderHTML from 'react-native-render-html';

const { width: screenWidth } = Dimensions.get('window');

const EventDescription = ({ htmlContent = '<p>Texto padrão</p>' }) => {
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(htmlContent);

  const htmlStyles = {
    p: {
      fontSize: 16,
      lineHeight: 24,
      color: '#374151',
      marginBottom: 12,
      fontFamily: 'System',
    },
    h1: {
      fontSize: 24,
      fontWeight: '700',
      color: '#111827',
      marginBottom: 16,
      marginTop: 20,
    },
    h2: {
      fontSize: 20,
      fontWeight: '600',
      color: '#111827',
      marginBottom: 12,
      marginTop: 16,
    },
    h3: {
      fontSize: 18,
      fontWeight: '600',
      color: '#111827',
      marginBottom: 10,
      marginTop: 14,
    },
    ul: {
      marginBottom: 12,
    },
    li: {
      fontSize: 16,
      lineHeight: 24,
      color: '#374151',
      marginBottom: 6,
    },
    strong: {
      fontWeight: '600',
      color: '#111827',
    },
    em: {
      fontStyle: 'italic',
      color: '#6B7280',
    },
  };

  const systemFonts = ['System', 'Arial', 'Helvetica', 'sans-serif'];

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        {isHtml ? (
          <RenderHTML
            source={{ html: htmlContent }}
            contentWidth={screenWidth - 32}
            tagsStyles={htmlStyles}
            systemFonts={systemFonts}
            defaultTextProps={{
              selectable: true,
            }}
            renderersProps={{
              img: {
                enableExperimentalPercentWidth: true,
              },
            }}
          />
        ) : (
          <Text style={styles.plainText}>{htmlContent}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contentWrapper: {
    padding: 16,
  },
  plainText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    fontFamily: 'System',
  },
});

export default EventDescription;
