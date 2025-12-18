import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText, Surface } from 'react-native-paper';
import { AppTheme } from '../theme';
import * as SecureStore from 'expo-secure-store';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App'; // Assumiamo che esista, altrimenti adatteremo

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'EditProfile'>;
  route: any;
};

export default function EditProfileScreen({ navigation, route }: Props) {
  // Riceviamo i dati attuali come parametri per pre-compilare i campi
  const { user } = route.params || {};

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || '');
  const [distance, setDistance] = useState(user?.distance ? String(user.distance) : '30');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('token');
      // Sostituisci con il tuo URL backend reale
      const API_URL = 'https://tuo-backend-url.com'; 

      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          phone,
          address,
          city,
          distance: parseInt(distance)
        })
      });

      if (response.ok) {
        Alert.alert('Successo', 'Profilo aggiornato correttamente');
        // Aggiorniamo anche la cache locale se necessario
        const updatedUser = { ...user, name, phone, address, city, distance: parseInt(distance) };
        await SecureStore.setItemAsync('user_info', JSON.stringify(updatedUser));
        
        navigation.goBack();
      } else {
        const errorData = await response.json();
        Alert.alert('Errore', errorData.message || 'Impossibile aggiornare il profilo');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Errore', 'Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Elimina Account',
      'Sei sicuro di voler eliminare definitivamente il tuo account? Questa azione è irreversibile e tutti i tuoi dati verranno cancellati.',
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Elimina', 
          style: 'destructive', 
          onPress: async () => {
            try {
              setLoading(true);
              const token = await SecureStore.getItemAsync('token');
              const API_URL = 'https://tuo-backend-url.com'; 

              const response = await fetch(`${API_URL}/profile`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });

              if (response.ok) {
                 await SecureStore.deleteItemAsync('token');
                 await SecureStore.deleteItemAsync('user_info');
                 // Forziamo il logout navigando alla root o chiamando una prop di logout se passata
                 // Qui assumiamo che svuotare il token faccia scattare il logout nel root navigator
                 Alert.alert('Account Eliminato', 'Il tuo account è stato cancellato con successo.', [
                     { text: 'OK', onPress: () => navigation.popToTop() } 
                 ]);
              } else {
                Alert.alert('Errore', 'Impossibile eliminare l\'account. Riprova più tardi.');
              }
            } catch (error) {
              Alert.alert('Errore', 'Errore di connessione.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
            <Text style={styles.title}>Modifica Profilo</Text>
            <Text style={styles.subtitle}>Aggiorna le tue informazioni personali</Text>
        </View>

        <Surface style={styles.card} elevation={0}>
            
            {/* NOME COMPLETO */}
            <TextInput
                label="Nome e Cognome"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
                outlineColor="#E0E0E0"
                activeOutlineColor={AppTheme.colors.primary}
            />

            {/* TELEFONO */}
            <TextInput
                label="Telefono"
                value={phone}
                onChangeText={setPhone}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.input}
                outlineColor="#E0E0E0"
                activeOutlineColor={AppTheme.colors.primary}
            />

            {/* INDIRIZZO */}
            <TextInput
                label="Indirizzo"
                value={address}
                onChangeText={setAddress}
                mode="outlined"
                style={styles.input}
                outlineColor="#E0E0E0"
                activeOutlineColor={AppTheme.colors.primary}
            />

            {/* CITTÀ */}
            <TextInput
                label="Città"
                value={city}
                onChangeText={setCity}
                mode="outlined"
                style={styles.input}
                outlineColor="#E0E0E0"
                activeOutlineColor={AppTheme.colors.primary}
            />

            {/* RAGGIO KM */}
            <TextInput
                label="Raggio d'azione (km)"
                value={distance}
                onChangeText={setDistance}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                outlineColor="#E0E0E0"
                activeOutlineColor={AppTheme.colors.primary}
            />
            <HelperText type="info">Distanza massima per ricevere notifiche.</HelperText>

        </Surface>

        <Button 
            mode="contained" 
            onPress={handleSave} 
            loading={loading}
            style={styles.button}
            contentStyle={{ height: 50 }}
        >
            Salva Modifiche
        </Button>

        <Divider style={{ marginVertical: 30 }} />

        <Button 
            mode="outlined" 
            onPress={handleDeleteAccount} 
            loading={loading}
            style={{ borderColor: AppTheme.custom.error }}
            textColor={AppTheme.custom.error}
            contentStyle={{ height: 50 }}
        >
            Elimina Account
        </Button>
        <HelperText type="error" style={{ textAlign: 'center', marginBottom: 20 }}>
            Attenzione: Questa azione è irreversibile.
        </HelperText>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppTheme.colors.background },
  scroll: { padding: 20, paddingBottom: 50 },
  header: { marginBottom: 20, marginTop: 10 },
  title: { fontFamily: 'Articulat-Bold', fontSize: 24, color: AppTheme.custom.textMain },
  subtitle: { fontFamily: 'Articulat-Regular', fontSize: 16, color: AppTheme.custom.textSecondary, marginTop: 4 },
  
  card: { 
    ...AppTheme.custom.cardStyle, 
    padding: 20,
    marginBottom: 20
  },
  
  input: { marginBottom: 12, backgroundColor: 'white', fontSize: 16 },
  
  button: { borderRadius: 12, backgroundColor: AppTheme.colors.primary }
});
