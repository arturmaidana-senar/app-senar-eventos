import React from 'react';
import { useWindowDimensions, View, ActivityIndicator } from 'react-native';
import RenderHtml from 'react-native-render-html';

const tagsStyles = {
  p: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 10,
    textAlign: 'justify',
  },
  strong: { fontWeight: 'bold', color: '#000' },
};

const classesStyles = {
  'ql-align-center': {
    textAlign: 'center',
    marginBottom: 15,
    marginTop: 10,
    textTransform: 'uppercase',
  },
};

export default function TermosConsentimento({ content }) {
  const { width } = useWindowDimensions();

  if (!content) {
    return <ActivityIndicator color="#3E7D56" />;
  }

  return (
    <View style={{ paddingHorizontal: 10 }}>
      <RenderHtml
        contentWidth={width - 40}
        source={{ html: content }}
        tagsStyles={tagsStyles}
        classesStyles={classesStyles}
      />
    </View>
  );
}
