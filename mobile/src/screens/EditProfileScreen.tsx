import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { AppTheme } from '../theme';
import api from '../services/api';

// Definiamo i tipi per le props che arrivano dallo Stack Navigator
type Props = {
  navigation: any;
  route: any; // Qui dentro ci sarà route.params.user
};

export default function EditProfileScreen({ navigation, route }: Props) {
  // Prendiamo l'utente passato come parametro da ProfileScreen
  const { user } = route.params || {};

  // Inizializziamo gli stati con i dati esistenti
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || '');
  const [distance, setDistance] = useState(user?.distance ? String(user.distance) : '30');
  
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Chiamata PUT al backend
      await api.put('/profile', {
        name,
        phone,
        address,
        city,
        distance: parseInt(distance), // Convertiamo stringa in numero
      });

      Alert.alert('Successo', 'Profilo aggiornato correttamente');
      navigation.goBack(); // Torna indietro (ProfileScreen si aggiornerà grazie al listener)
    } catch (error) {
      console.error(error);
      Alert.alert('Errore', 'Impossibile aggiornare il profilo');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
        "Elimina Account", 
        "Sei sicuro? Questa azione non può essere annullata.",
        [
            { text: "Annulla", style: "cancel" },
            { 
                text: "Elimina per sempre", 
                style: "destructive", 
                onPress: async () => {
                    try {
                        await api.delete('/profile');
                        // Qui l'app dovrebbe gestire il logout automatico. 
                        // Per ora chiudiamo l'app o torniamo al login.
                        Alert.alert("Account Eliminato", "L'applicazione verrà chiusa.");
                    } catch (e) {
                        Alert.alert("Errore", "Impossibile eliminare l'account.");
                    }
                }
            }
        ]
    );
  };

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        
        <View style={styles.header}>
            <Text style={styles.title}>Modifica Profilo</Text>
            <Text style={styles.subtitle}>Aggiorna i tuoi dati e il raggio d'azione.</Text>
        </View>

        <View style={styles.form}>
            <TextInput 
                label="Nome Completo" 
                value={name} 
                onChangeText={setName} 
                mode="outlined" 
                style={styles.input}
                outlineColor="#E0E6ED"
                activeOutlineColor={AppTheme.colors.primary}
            />
            
            <TextInput 
                label="Telefono" 
                value={phone} 
                onChangeText={setPhone} 
                mode="outlined" 
                keyboardType="phone-pad"
                style={styles.input}
                outlineColor="#E0E6ED"
                activeOutlineColor={AppTheme.colors.primary}
            />

            <View style={styles.row}>
                <TextInput 
                    label="Città" 
                    value={city} 
                    onChangeText={setCity} 
                    mode="outlined" 
                    style={[styles.input, { flex: 1, marginRight: 10 }]}
                    outlineColor="#E0E6ED"
                />
                <TextInput 
                    label="Raggio (KM)" 
                    value={distance} 
                    onChangeText={setDistance} 
                    mode="outlined" 
                    keyboardType="numeric"
                    style={[styles.input, { width: 100 }]}
                    outlineColor="#E0E6ED"
                />
            </View>

            <TextInput 
                label="Indirizzo Base" 
                value={address} 
                onChangeText={setAddress} 
                mode="outlined" 
                style={styles.input}
                outlineColor="#E0E6ED"
            />

            <Button 
                mode="contained" 
                onPress={handleSave} 
                loading={loading}
                disabled={loading}
                style={styles.saveBtn}
                contentStyle={{ height: 50 }}
                labelStyle={{ fontFamily: 'Articulat-Bold' }}
            >
                SALVA MODIFICHE
            </Button>

            <View style={{ marginTop: 40 }}>
                <Button 
                    mode="text" 
                    textColor={AppTheme.custom.error}
                    onPress={handleDeleteAccount}
                >
                    Elimina il mio account
                </Button>
                <HelperText type="error" visible={true} style={{ textAlign: 'center' }}>
                   Azione irreversibile
                </HelperText>
            </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  scroll: { padding: 24, paddingTop: 100 }, // Padding top per non finire sotto l'header trasparente
  header: { marginBottom: 32 },
  title: { fontFamily: 'Articulat-Bold', fontSize: 24, color: AppTheme.custom.textMain },
  subtitle: { fontFamily: 'Articulat-Regular', fontSize: 16, color: AppTheme.custom.textSecondary, marginTop: 4 },
  form: { gap: 16 },
  input: { backgroundColor: '#fff', fontSize: 16, fontFamily: 'Articulat-Medium' },
  row: { flexDirection: 'row' },
  saveBtn: { borderRadius: 12, backgroundColor: AppTheme.colors.primary, marginTop: 8 }
});