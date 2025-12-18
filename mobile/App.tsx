import React, { useState, useEffect, useCallback } from 'react';
import { View, Alert } from 'react-native';
import { Provider as PaperProvider, BottomNavigation } from 'react-native-paper';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Clipboard from 'expo-clipboard';
import * as Notifications from 'expo-notifications';

// --- IMPORTIAMO LA NAVIGAZIONE ---
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './src/types'; // Il file modificato al passo 2

// --- IMPORT SCHERMATE ---
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
// import OnboardingScreen from './src/screens/OnboardingScreen'; // SCOMMENTA QUANDO CREI IL FILE

import { AppTheme } from './src/theme';
import api from './src/services/api';
import { registerForPushNotificationsAsync } from './src/services/pushNotifications';

// Creiamo lo "Stack" (il gestore delle carte)
const Stack = createStackNavigator<RootStackParamList>();

// --- COMPONENTE INTERNO: GESTISCE I TAB (Home / Profilo) ---
// Questo sostituisce la logica che avevi direttamente in App
function MainTabs({ navigation, route }: any) {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'home', title: 'Prestazioni', focusedIcon: 'clipboard-text', unfocusedIcon: 'clipboard-text-outline' },
    { key: 'profile', title: 'Profilo', focusedIcon: 'account', unfocusedIcon: 'account-outline' },
  ]);

  const insets = useSafeAreaInsets();
  const [highlightRequestId, setHighlightRequestId] = useState<number | null>(null);

  // Gestione Logout passata al Profilo
  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('user_token');
    await SecureStore.deleteItemAsync('user_info');
    // Resetta la navigazione e torna al Login
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const renderScene = useCallback(({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case 'home':
        return <HomeScreen highlightId={highlightRequestId} />;
      case 'profile':
        return <ProfileScreen onLogout={handleLogout} />;
      default:
        return null;
    }
  }, [highlightRequestId]);

  return (
    <View style={{ flex: 1, backgroundColor: AppTheme.colors.background }}>
      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
        barStyle={{ 
          backgroundColor: 'white', 
          borderTopWidth: 1, 
          borderTopColor: '#EEF2F6',
          paddingBottom: insets.bottom > 0 ? insets.bottom : 20,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 20),
          elevation: 0,
        }}
        activeColor={AppTheme.colors.primary}
        inactiveColor={AppTheme.custom.textSecondary}
        theme={AppTheme}
      />
    </View>
  );
}

// --- APP PRINCIPALE ---
export default function App() {
  const [fontsLoaded] = useFonts({
    'Articulat-Thin': require('./assets/fonts/Articulate-Thin.otf'),
    'Articulat-Light': require('./assets/fonts/Articulate-Light.otf'),
    'Articulat-Regular': require('./assets/fonts/Articulate-Regular.otf'),
    'Articulat-Medium': require('./assets/fonts/Articulate-Medium.otf'),
    'Articulat-Bold': require('./assets/fonts/Articulate-Bold.otf'),
    'Articulat-Heavy': require('./assets/fonts/Articulate-Heavy.otf'),
  });

  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  // Controlliamo il login all'avvio
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await SecureStore.getItemAsync('user_token');
        // Se c'è il token va a Main, altrimenti Login
        // (In futuro qui controllerai se l'utente ha già visto l'onboarding)
        setInitialRoute(token ? 'Main' : 'Login');
      } catch (e) {
        setInitialRoute('Login');
      }
    };
    checkLogin();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && initialRoute) {
      // await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, initialRoute]);

  if (!fontsLoaded || !initialRoute) return null;

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <PaperProvider theme={AppTheme}>
        {/* QUI RISOLVIAMO L'ERRORE NavigationContainer */}
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator 
            initialRouteName={initialRoute} 
            screenOptions={{ headerShown: false }} // Nascondiamo l'header default brutto
          >
            {/* Definiamo le schermate disponibili */}
            {/* <Stack.Screen name="Onboarding" component={OnboardingScreen} /> */}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Main" component={MainTabs} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}