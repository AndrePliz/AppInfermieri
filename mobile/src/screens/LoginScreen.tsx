import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native'; // <--- 1. Importiamo l'hook di navigazione
import api from '../services/api';
import { AppTheme } from '../theme';

// Non servono più le Props vecchie
export default function LoginScreen() {
  const navigation = useNavigation<any>(); // <--- 2. Otteniamo l'oggetto navigation
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) return Alert.alert('Attenzione', 'Inserisci email e password');
    setLoading(true);
    
    try {
      let pushToken = null;
      try {
        // Qui dovresti usare registerForPushNotificationsAsync() se l'hai importato
        // pushToken = await registerForPushNotificationsAsync(); 
      } catch (e) {
        console.log("No push token");
      }

      const response = await api.post('/auth/login', { 
        username, 
        password,
        pushToken
      });
      
      const userToSave = response.data.user;
      
      await SecureStore.setItemAsync('user_token', response.data.token);
      await SecureStore.setItemAsync('user_info', JSON.stringify(userToSave));
      
      // 3. NAVIGAZIONE CORRETTA
      // Invece di onLoginSuccess(), diciamo al navigatore di resettare la storia e andare su Main
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });

    } catch (error: any) {
      console.log("Login Error:", error); // Debug nel terminale
      // Se è un errore di rete o server, mostriamo quello, altrimenti messaggio generico
      const msg = error.response?.data?.message || 'Errore durante il login (controlla i log)';
      Alert.alert('Accesso Negato', msg);
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
              label="Email aziendale"
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