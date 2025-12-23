import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import api from '../services/api';
import { AppTheme } from '../theme';
import CustomAlert from '../components/CustomAlert';

// Funzione helper per gestire il processo di ottenimento del token
async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token;

  if (!Device.isDevice) {
    console.log('Le notifiche push richiedono un dispositivo fisico, non un simulatore.');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    // L'utente non ha concesso i permessi. Non è un errore, ma una scelta.
    // Puoi decidere di mostrare un alert qui, ma per ora lo lasciamo silenzioso.
    console.log('Permesso per le notifiche non concesso.');
    return null;
  }
  
  // Ottieni il token
  token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Expo Push Token:', token);

  // Configurazioni specifiche per Android
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}


export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState<{ visible: boolean; type: 'error'|'info'; title: string; message: string; }>({ visible: false, type: 'info', title: '', message: '' });

  const handleLogin = async () => {
    if (!username || !password) {
      setAlert({ visible: true, type: 'info', title: 'Attenzione', message: 'Inserisci email e password' });
      return;
    }
    setLoading(true);
    
    try {
      // Chiedi i permessi e ottieni il token prima del login
      const pushToken = await registerForPushNotificationsAsync();

      const response = await api.post('/auth/login', { 
        username, 
        password,
        pushToken // Invia il token (o null se i permessi sono negati)
      });
      
      const userToSave = response.data.user;
      
      await SecureStore.setItemAsync('user_token', response.data.token);
      await SecureStore.setItemAsync('user_info', JSON.stringify(userToSave));
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });

    } catch (error: any) {
      setAlert({ visible: true, type: 'error', title: 'Accesso Negato', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.content}>
          
          <View style={styles.header}>
            <Text style={styles.brand}>PharmaCare</Text>
            <Text style={styles.subtitle}>Portale Professionisti</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              mode="outlined"
              label="La tua email"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              outlineColor={AppTheme.custom.border}
              activeOutlineColor={AppTheme.colors.primary}
              autoCapitalize="none"
              keyboardType="email-address"
              textColor={AppTheme.custom.textMain}
              theme={{ roundness: 12 }}
            />
            
            <TextInput
              mode="outlined"
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={styles.input}
              outlineColor={AppTheme.custom.border}
              activeOutlineColor={AppTheme.colors.primary}
              textColor={AppTheme.custom.textMain}
              theme={{ roundness: 12 }}
              right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
            />

            <Button 
              mode="contained" 
              onPress={handleLogin} 
              loading={loading}
              disabled={loading}
              style={styles.loginBtn}
              contentStyle={{ height: 56 }}
              labelStyle={styles.btnLabel}
            >
              ACCEDI ALL'AREA
            </Button>

            <Button 
              mode="text" 
              textColor={AppTheme.custom.textSecondary} 
              style={{ marginTop: 12 }}
              labelStyle={{ fontFamily: 'Articulat-Medium' }}
              onPress={() => Alert.alert("Assistenza", "Contatta l'amministrazione per il reset.")}
            >
              Password dimenticata?
            </Button>
          </View>

        </KeyboardAvoidingView>
        
        <CustomAlert 
          visible={alert.visible}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onDismiss={() => setAlert({ ...alert, visible: false })}
          secondaryAction={{ label: 'Chiudi', onPress: () => setAlert({ ...alert, visible: false })}}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  header: { marginBottom: 60 },
  brand: { fontFamily: 'Articulat-Bold', fontSize: 42, color: AppTheme.colors.primary, letterSpacing: -1, lineHeight: 48 },
  subtitle: { fontFamily: 'Articulat-Medium', fontSize: 20, color: AppTheme.custom.textSecondary, marginTop: 4 },
  form: { gap: 20 },
  input: { backgroundColor: '#FFFFFF', fontSize: 17, fontFamily: 'Articulat-Medium', height: 60 },
  loginBtn: { borderRadius: 16, backgroundColor: AppTheme.colors.primary, marginTop: 16, ...AppTheme.custom.shadowButton },
  btnLabel: { fontFamily: 'Articulat-Bold', fontSize: 16, letterSpacing: 0.5 }
});