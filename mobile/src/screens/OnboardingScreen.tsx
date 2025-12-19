import React, { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, FlatList, Animated, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppTheme } from '../theme';
import { RootStackParamList } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Benvenuto in\nPharmaCare',
    description: 'La piattaforma dedicata ai professionisti sanitari per gestire i turni con precisione chirurgica.',
    icon: 'hospital-building', // Usa icone MaterialCommunityIcons se vuoi, qui uso testo per semplicità o immagini placeholder
  },
  {
    id: '2',
    title: 'Gestione Turni\nSemplificata',
    description: 'Ricevi notifiche in tempo reale per nuove richieste. Accetta o rifiuta con un tocco.',
    icon: 'calendar-clock',
  },
  {
    id: '3',
    title: 'Dettagli Paziente\nSempre Disponibili',
    description: 'Visualizza cartella clinica, indirizzo e necessità specifiche prima di accettare l\'incarico.',
    icon: 'account-details',
  },
];

type OnboardingNavProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen() {
  const navigation = useNavigation<OnboardingNavProp>();
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    // Qui potresti salvare in SecureStore che l'onboarding è stato visto
    navigation.replace('Login');
  };

  const SkipButton = () => (
    <Button 
      mode="text" 
      textColor={AppTheme.custom.textSecondary}
      onPress={completeOnboarding}
      labelStyle={{ fontFamily: 'Articulat-Bold' }}
    >
      SALTA
    </Button>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <SkipButton />
      </View>

      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onViewableItemsChanged={useRef(({ viewableItems }: any) => {
          if (viewableItems[0]) setCurrentIndex(viewableItems[0].index);
        }).current}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.contentContainer}>
                {/* Placeholder per Immagine/Icona - Sostituisci con Image vera se hai gli asset */}
                <View style={styles.iconContainer}>
                    <Text style={{fontSize: 80}}>🏥</Text> 
                </View>
                
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        {/* Paginator Dots */}
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 24, 10],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View 
                key={index.toString()} 
                style={[styles.dot, { width: dotWidth, opacity, backgroundColor: AppTheme.colors.primary }]} 
              />
            );
          })}
        </View>

        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.nextBtn}
          contentStyle={{ height: 56 }}
          labelStyle={styles.btnLabel}
        >
          {currentIndex === SLIDES.length - 1 ? 'INIZIA ORA' : 'AVANTI'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    paddingHorizontal: 20, 
    paddingTop: 10 
  },
  slide: { width, alignItems: 'center', paddingHorizontal: 32 },
  contentContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: -40 },
  iconContainer: {
    width: 120, height: 120, 
    backgroundColor: '#F0F7FC', 
    borderRadius: 60, 
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 40
  },
  title: {
    fontFamily: 'Articulat-Heavy',
    fontSize: 32,
    color: AppTheme.colors.primary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 38
  },
  description: {
    fontFamily: 'Articulat-Medium',
    fontSize: 18,
    color: AppTheme.custom.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: '90%'
  },
  footer: { padding: 32 },
  pagination: { flexDirection: 'row', justifyContent: 'center', marginBottom: 32, gap: 8 },
  dot: { height: 10, borderRadius: 5 },
  nextBtn: { 
    borderRadius: 16, 
    backgroundColor: AppTheme.colors.primary,
    shadowColor: AppTheme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6
  },
  btnLabel: { fontFamily: 'Articulat-Bold', fontSize: 16, letterSpacing: 0.5 }
});