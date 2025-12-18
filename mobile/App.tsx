import React, { useState, useEffect, useCallback } from 'react';
import { View, Alert } from 'react-native';
import { Provider as PaperProvider, BottomNavigation } from 'react-native-paper';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Clipboard from 'expo-clipboard'; 

// Assicurati che questi percorsi siano corretti (se sono in src/...)
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { AppTheme } from './src/theme';
import api from './src/services/api';
import { registerForPushNotificationsAsync } from './src/services/pushNotifications';
import * as Notifications from 'expo-notifications';

// 1. DISATTIVIAMO LA GESTIONE MANUALE DELLO SPLASH SCREEN PER ORA
SplashScreen.preventAutoHideAsync();

function MainContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const [index, setIndex] = useState(0);
  
  const [routes] = useState([
    { key: 'home', title: 'Prestazioni', focusedIcon: 'clipboard-text', unfocusedIcon: 'clipboard-text-outline' },
    { key: 'profile', title: 'Profilo', focusedIcon: 'account', unfocusedIcon: 'account-outline' },
  ]);

  const insets = useSafeAreaInsets();

  const [highlightRequestId, setHighlightRequestId] = useState<number | null>(null);
  const lastNotificationResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await SecureStore.getItemAsync('user_token');
        if (token) setIsLoggedIn(true);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkLogin();
  }, []);

  useEffect(() => {
    if (
      lastNotificationResponse &&
      lastNotificationResponse.notification.request.content.data.requestId &&
      lastNotificationResponse.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      // Prendiamo l'ID dai dati nascosti
      const requestId = lastNotificationResponse.notification.request.content.data.requestId;
      console.log("🔔 Click su notifica! ID:", requestId);
      
      // Impostiamo l'evidenziazione
      setHighlightRequestId(requestId);
      
      // Forziamo il tab "Home" (indice 0)
      setIndex(0);
    }
  }, [lastNotificationResponse]);

  // LOGICA NOTIFICHE
  useEffect(() => {
    if (isLoggedIn) {
      console.log("Tentativo registrazione notifiche...");
      
      registerForPushNotificationsAsync().then(async (token) => {
        if (token) {
          console.log("✅ TOKEN PRESO:", token);
          
          // ALERT DI DEBUG (Puoi commentarlo dopo)
          Alert.alert("TOKEN GENERATO", token, [
            { text: "OK" },
            { text: "Copia", onPress: () => Clipboard.setStringAsync(token) }
          ]);

          // SALVATAGGIO SU DB
          try {
            // Deve coincidere con router.post('/auth/update-device'...)
            await api.post('/auth/update-device', { device: token }); 
            console.log("💾 Token salvato nel Database con successo!");
          } catch (error) {
             console.error("❌ Errore salvataggio token su DB:", error);
          }
        }
      });
    }
  }, [isLoggedIn]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIndex(0);
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('user_token');
    await SecureStore.deleteItemAsync('user_info');
    setIsLoggedIn(false);
    setIndex(0);
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

  if (checkingAuth) {
    return <View style={{ flex: 1, backgroundColor: AppTheme.colors.background }} />;
  }

  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: AppTheme.colors.background }}>
      <StatusBar style="dark" />
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

export default function App() {
  const [fontsLoaded] = useFonts({
    'Articulat-Thin': require('./assets/fonts/Articulate-Thin.otf'),
    'Articulat-Light': require('./assets/fonts/Articulate-Light.otf'),
    'Articulat-Regular': require('./assets/fonts/Articulate-Regular.otf'),
    'Articulat-Medium': require('./assets/fonts/Articulate-Medium.otf'),
    'Articulat-Bold': require('./assets/fonts/Articulate-Bold.otf'),
    'Articulat-Heavy': require('./assets/fonts/Articulate-Heavy.otf'),
  });


  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      // await SplashScreen.hideAsync(); // Non serve se non lo abbiamo prevent-ato
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <PaperProvider theme={AppTheme}>
        <MainContent />
      </PaperProvider>
    </SafeAreaProvider>
  );
}