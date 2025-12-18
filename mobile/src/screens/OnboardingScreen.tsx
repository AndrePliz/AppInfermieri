// FILE: mobile/src/screens/OnboardingScreen.tsx
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button } from 'react-native-paper';
import { AppTheme } from '../theme';
// Importa il tipo che abbiamo creato al Passo 2
import { RootStackParamList } from '../types';
type OnboardingNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen() {
  const navigation = useNavigation<OnboardingNavigationProp>();

  const handleFinish = async () => {
    // Ora TypeScript sa che 'Login' esiste ed è valido
    navigation.replace('Login'); 
  };

// Se il tuo StackParamList è definito altrove, importalo. 
// Altrimenti questa definizione locale va bene per far funzionare il file.
type RootStackParamList = {
  Login: undefined;
  Onboarding: undefined;
};

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Onboarding'>;
  route: { params: { onFinish: () => void } };
};

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Precisione Chirurgica',
    description: 'Gestisci i tuoi turni con un\'interfaccia pulita e senza distrazioni. Ogni informazione è al posto giusto.',
    icon: 'medical-bag' as const,
  },
  {
    id: '2',
    title: 'Notifiche Immediate',
    description: 'Ricevi richieste di intervento in tempo reale. Accetta o rifiuta con un singolo tocco deciso.',
    icon: 'bell-ring-outline' as const,
  },
  {
    id: '3',
    title: 'Il Tuo Territorio',
    description: 'Imposta il tuo raggio d\'azione e le disponibilità. Lavora dove e quando vuoi, senza sorprese.',
    icon: 'map-marker-radius' as const,
  },
];

export default function OnboardingScreen({ navigation, route }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
  // FIX: Una sola dichiarazione di theme, forzando il tipo per leggere i tuoi colori custom
  const theme = useTheme() as typeof AppTheme;

  const handleFinish = async () => {
    try {
      await SecureStore.setItemAsync('has_seen_onboarding', 'true');
      
      if (route.params?.onFinish) {
        route.params.onFinish();
      } else {
        navigation.replace('Login');
      }
    } catch (e) {
      console.error('Errore salvataggio onboarding', e);
      // In caso di errore, vai comunque al login
      navigation.replace('Login');
    }
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleFinish();
    }
  };

  // Renderizza la singola slide
  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => (
    <View style={styles.slide}>
      <View style={styles.iconContainer}>
        {/* Usa i colori diretti di AppTheme se il hook da problemi, o theme.colors se il cast funziona */}
        <View style={[styles.circle, { backgroundColor: theme.colors.bgPatient || '#F8FCFF' }]}>
          <MaterialCommunityIcons 
            name={item.icon} 
            size={80} 
            color={theme.colors.primary} 
          />
        </View>
      </View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{item.title}</Text>
        <Text style={[styles.description, { color: theme.colors.textTertiary }]}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bgApp }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.bgApp} />
      
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      <View style={styles.footer}>
        {/* Paginazione */}
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: index === currentIndex ? theme.colors.primary : theme.colors.border },
                index === currentIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Bottoni Azione */}
        <View style={styles.buttonContainer}>
          {currentIndex < SLIDES.length - 1 ? (
            <>
              <Button 
                mode="text" 
                onPress={handleFinish}
                labelStyle={{ color: theme.colors.textTertiary, fontWeight: '600' }}
              >
                SALTA
              </Button>
              <Button 
                mode="contained" 
                onPress={handleNext}
                style={[styles.nextButton, { backgroundColor: theme.colors.primary }]}
                contentStyle={{ height: 56 }}
                labelStyle={{ fontSize: 16, fontWeight: '700' }}
              >
                AVANTI
              </Button>
            </>
          ) : (
            <Button 
              mode="contained" 
              onPress={handleFinish}
              style={[styles.nextButton, { width: '100%', backgroundColor: theme.colors.primary }]}
              contentStyle={{ height: 56 }}
              labelStyle={{ fontSize: 16, fontWeight: '700' }}
            >
              INIZIA
            </Button>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: height * 0.15,
  },
  iconContainer: {
    marginBottom: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#378DD2', // Colore fisso per evitare crash se il tema fallisce
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '90%',
  },
  footer: {
    padding: 32,
    paddingBottom: 48,
    justifyContent: 'flex-end',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 32,
  },
  inactiveDot: {
    width: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56,
  },
  nextButton: {
    borderRadius: 16,
    elevation: 4,
  },
});