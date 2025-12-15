import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';
import { AppTheme } from '../theme';
// 1. IMPORTA LA FUNZIONE
import { registerForPushNotificationsAsync } from '../services/pushNotifications';

type Props = { onLoginSuccess: () => void; };

export default function LoginScreen({ onLoginSuccess }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) return Alert.alert('Attenzione', 'Inserisci email e password');
    setLoading(true);
    
    try {
      // 2. RECUPERA IL TOKEN PRIMA DEL LOGIN
      let pushToken = null;
      try {
        const pushToken = null;
      } catch (e) {
        console.log("Impossibile ottenere token push (sei sul simulatore?)");
      }

      // 3. INVIA IL TOKEN AL BACKEND
      const response = await api.post('/auth/login', { 
        username, 
        password,
        pushToken // <-- Campo aggiunto
      });
      
      const userToSave = response.data.user;
      
      await SecureStore.setItemAsync('user_token', response.data.token);
      await SecureStore.setItemAsync('user_info', JSON.stringify(userToSave));
      
      onLoginSuccess();
    } catch (error: any) {
      Alert.alert('Accesso Negato', error.response?.data?.message || 'Credenziali non valide.');
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