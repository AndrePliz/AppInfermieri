// 1. Unico import necessario all'inizio
import 'react-native-gesture-handler'; 

import React, { useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { Provider as PaperProvider, BottomNavigation } from 'react-native-paper';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { useFonts } from 'expo-font';

// --- NAVIGAZIONE ---
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './src/types'; 

// --- SCHERMATE ---
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

import { AppTheme } from './src/theme';

const Stack = createStackNavigator<RootStackParamList>();

// --- COMPONENTE TABS ---
function MainTabs({ navigation }: any) {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'home', title: 'Prestazioni', focusedIcon: 'clipboard-text', unfocusedIcon: 'clipboard-text-outline' },
    { key: 'profile', title: 'Profilo', focusedIcon: 'account', unfocusedIcon: 'account-outline' },
  ]);

  const insets = useSafeAreaInsets();
  const [highlightRequestId, setHighlightRequestId] = useState<number | null>(null);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('user_token');
    await SecureStore.deleteItemAsync('user_info');
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const renderScene = useCallback(({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case 'home': return <HomeScreen highlightId={highlightRequestId} />;
      case 'profile': return <ProfileScreen onLogout={handleLogout} />;
      default: return null;
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
          borderTopColor: '#EEF2F6',
          borderTopWidth: 1,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 20),
        }}
        activeColor={AppTheme.colors.primary}
        theme={AppTheme}
      />
    </View>
  );
}

// --- ROOT APP ---
export default function App() {
  const [fontsLoaded] = useFonts({
    'Articulat-Regular': require('./assets/fonts/Articulate-Regular.otf'),
    'Articulat-Bold': require('./assets/fonts/Articulate-Bold.otf'),
    // 2. AGGIUNTO QUESTO: Fondamentale perché il tuo theme.ts lo usa
    'Articulat-Medium': require('./assets/fonts/Articulate-Medium.otf'),
  });

  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    const checkState = async () => {
      try {
        const [token, hasSeenOnboarding] = await Promise.all([
          SecureStore.getItemAsync('user_token'),
          SecureStore.getItemAsync('has_seen_onboarding')
        ]);

        if (token) {
          setInitialRoute('Main');
        } else if (hasSeenOnboarding === 'true') {
          setInitialRoute('Login');
        } else {
          setInitialRoute('Onboarding');
        }
      } catch (e) {
        setInitialRoute('Login');
      }
    };
    
    checkState();
  }, []);

  const onLayoutRootView = useCallback(async () => {
  }, [fontsLoaded]);

  if (!fontsLoaded || !initialRoute) return null;

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <PaperProvider theme={AppTheme}>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}