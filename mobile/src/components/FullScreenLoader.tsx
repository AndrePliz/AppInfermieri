import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { AppTheme } from '../theme';

/**
 * Un componente riutilizzabile che mostra un indicatore di caricamento
 * a schermo intero. Mantiene uno stile coerente con il tema dell'app.
 */
const FullScreenLoader = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={AppTheme.colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // Usiamo il colore di sfondo del tema per una transizione più fluida
    backgroundColor: AppTheme.colors.background, 
  },
});

export default FullScreenLoader;