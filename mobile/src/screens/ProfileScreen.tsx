import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Switch, Icon, Divider, Surface } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import { AppTheme } from '../theme';
import CustomAlert from '../components/CustomAlert';

type UserInfo = { name: string; username: string; id: number; email_notifiche: string; };
type Props = { onLogout: () => void; };

export default function ProfileScreen({ onLogout }: Props) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [notificheEnabled, setNotificheEnabled] = useState(true);
  const [logoutAlertVisible, setLogoutAlertVisible] = useState(false);

  useEffect(() => {
    const load = async () => {
      const json = await SecureStore.getItemAsync('user_info');
      if (json) setUser(JSON.parse(json));
    };
    load();
  }, []);

  const confirmLogout = () => {
    setLogoutAlertVisible(false);
    onLogout();
  };

  if (!user) return null;

  const displayName = user.name && user.name.trim() !== '' ? user.name : "Infermiere";
  const displayEmail = user.email_notifiche || user.username;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{displayEmail}</Text>
        <View style={styles.badgeContainer}>
          <View style={styles.idBadge}>
            <Text style={styles.idLabel}>ID Operatore</Text>
            <Text style={styles.idValue}>{user.id}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

        {/* GRUPPO 1: IMPOSTAZIONI LAVORATIVE */}
        <Text style={styles.sectionHeader}>IMPOSTAZIONI LAVORATIVE</Text>
        <Surface style={styles.card} elevation={0}>

          {/* 1. Raggio */}
          <TouchableOpacity style={styles.row}>
            <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
              <Icon source="map-marker-radius-outline" size={24} color={AppTheme.colors.primary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Raggio d'azione</Text>
              <Text style={styles.rowSubtitle}>Impostato a 25 km</Text>
            </View>
            <Icon source="chevron-right" size={24} color={AppTheme.custom.textSecondary} />
          </TouchableOpacity>

          <Divider style={styles.divider} />

          {/* 2. Prestazioni Offerte */}
          <TouchableOpacity style={styles.row}>
            <View style={[styles.iconBox, { backgroundColor: '#E0F2F1' }]}>
              <Icon source="doctor" size={24} color={AppTheme.custom.success} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Prestazioni offerte</Text>
              <Text style={styles.rowSubtitle}>Tutti i servizi attivi</Text>
            </View>
            <Icon source="chevron-right" size={24} color={AppTheme.custom.textSecondary} />
          </TouchableOpacity>

          <Divider style={styles.divider} />

          {/* 3. Disponibilità Orario */}
          <TouchableOpacity style={styles.row}>
            <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
              <Icon source="calendar-clock" size={24} color={AppTheme.custom.warning} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Disponibilità orario</Text>
              <Text style={styles.rowSubtitle}>Gestisci i tuoi turni</Text>
            </View>
            <Icon source="chevron-right" size={24} color={AppTheme.custom.textSecondary} />
          </TouchableOpacity>
        </Surface>

        {/* GRUPPO 2: GENERALI */}
        <Text style={styles.sectionHeader}>GENERALI</Text>
        <Surface style={styles.card} elevation={0}>

          {/* 1. Notifiche */}
          <View style={styles.row}>
            <View style={[styles.iconBox, { backgroundColor: '#F3E5F5' }]}>
              <Icon source="bell-outline" size={24} color="#9C27B0" />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Notifiche Push</Text>
              <Text style={styles.rowSubtitle}>Ricevi avvisi nuovi turni</Text>
            </View>
            <Switch value={notificheEnabled} onValueChange={setNotificheEnabled} color={AppTheme.colors.primary} />
          </View>

          <Divider style={styles.divider} />

          {/* 2. Il mio profilo (FIXATO) */}
          <TouchableOpacity style={styles.row}>
            <View style={[styles.iconBox, { backgroundColor: '#E8EAF6' }]}>
              <Icon source="account-circle-outline" size={24} color="#3F51B5" />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Il mio profilo</Text>
              <Text style={styles.rowSubtitle}>Modifica dati anagrafici</Text>
            </View>
            <Icon source="chevron-right" size={24} color={AppTheme.custom.textSecondary} />
          </TouchableOpacity>

          <Divider style={styles.divider} />

          {/* 3. LOGOUT (Integrato nel menu) */}
          <TouchableOpacity style={styles.row} onPress={() => setLogoutAlertVisible(true)}>
            <View style={[styles.iconBox, { backgroundColor: '#FFEBEE' }]}>
              <Icon source="logout" size={24} color={AppTheme.custom.error} />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, { color: AppTheme.custom.error }]}>Logout</Text>
              <Text style={styles.rowSubtitle}>Disconnetti account</Text>
            </View>
            <Icon source="chevron-right" size={24} color={AppTheme.custom.textSecondary} />
          </TouchableOpacity>
        </Surface>

        <Text style={styles.version}>PharmaCare App v1.0.0</Text>
      </ScrollView>
      
      <CustomAlert 
        visible={logoutAlertVisible}
        type="warning"
        title="Disconnessione"
        message="Sei sicuro di voler uscire dall'applicazione?"
        primaryAction={{ label: 'Esci', onPress: confirmLogout, color: AppTheme.custom.error }}
        secondaryAction={{ label: 'Annulla', onPress: () => setLogoutAlertVisible(false) }}
        onDismiss={() => setLogoutAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppTheme.colors.background },
  header: { 
    alignItems: 'center', 
    paddingHorizontal: 28,
    paddingTop: 60, 
    paddingBottom: 36, 
    backgroundColor: 'white', 
    borderBottomWidth: 1, 
    borderColor: '#F0F0F0',
    width: '100%' 
  },
  name: { fontFamily: 'Articulat-Bold', fontSize: 30, color: AppTheme.custom.textMain, textAlign: 'center', marginBottom: 4 },
  email: { fontFamily: 'Articulat-Medium', fontSize: 16, color: AppTheme.custom.textSecondary, textAlign: 'center' },

  badgeContainer: { marginTop: 16 },
  idBadge: { 
    backgroundColor: '#F5F7FA', 
    paddingHorizontal: 16, paddingVertical: 8, 
    borderRadius: 12, 
    flexDirection: 'row', alignItems: 'center', gap: 8 
  },
  idLabel: { fontFamily: 'Articulat-Regular', fontSize: 12, color: AppTheme.custom.textSecondary },
  idValue: { fontFamily: 'Articulat-Bold', fontSize: 14, color: AppTheme.custom.textMain },

  scroll: { padding: 28 },
  sectionHeader: { fontFamily: 'Articulat-Bold', fontSize: 11, color: AppTheme.custom.label, marginBottom: 16, marginLeft: 4, letterSpacing: 1.5, marginTop: 8 },

  card: { 
    ...AppTheme.custom.cardStyle, 
    marginBottom: 32,
  },

  row: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  rowContent: { flex: 1 },
  rowTitle: { fontFamily: 'Articulat-Bold', fontSize: 16, color: AppTheme.custom.textMain, marginBottom: 2 },
  rowSubtitle: { fontFamily: 'Articulat-Regular', fontSize: 14, color: AppTheme.custom.textSecondary },
  divider: { height: 1, backgroundColor: '#F5F7FA', marginLeft: 84 },
  version: { textAlign: 'center', marginTop: 10, color: '#D0D5DD', fontSize: 12, fontFamily: 'Articulat-Medium' }
}); 