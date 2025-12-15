import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, ActivityIndicator, IconButton, Button } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';
import PrestazioneCard from '../components/PrestazioneCard';
import CustomTabs from '../components/CustomTabs';
import RefuseDialog from '../components/RefuseDialog';
import CustomAlert from '../components/CustomAlert'; 
import { ShiftsResponse, ServiceRequest } from '../types';
import { AppTheme } from '../theme';

interface HomeScreenProps {
  highlightId?: number | null;
}

export default function HomeScreen({ highlightId }: HomeScreenProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [availableList, setAvailableList] = useState<ServiceRequest[]>([]);
  const [myList, setMyList] = useState<ServiceRequest[]>([]);
  const [viewMode, setViewMode] = useState('new'); 
  const [refuseDialogVisible, setRefuseDialogVisible] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [userName, setUserName] = useState('');

  const [alert, setAlert] = useState<{ visible: boolean; type: 'info'|'warning'|'error'|'success'; title: string; message: string; primaryLabel?: string; primaryColor?: string; onConfirm?: () => void }>({ visible: false, type: 'info', title: '', message: '' });

  const fetchShifts = async () => {
    try {
      if (!refreshing) setLoading(true);
      const response = await api.get<ShiftsResponse>('/shifts');
      setAvailableList(response.data.available);
      setMyList(response.data.myShifts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchShifts(); 
    SecureStore.getItemAsync('user_info').then(json => {
      if (json) {
        const user = JSON.parse(json);
        setUserName(user.name || 'Infermiere');
      }
    });
  }, []);

// --- LOGICA EVIDENZIAZIONE NOTIFICA ---
useEffect(() => {
if (highlightId) {
    // Se non siamo già sulla tab 'new', ci andiamo
    if (viewMode !== 'new') {
    setViewMode('new');
    fetchShifts();
    } else {
    // Se siamo già lì, ricarichiamo solo per sicurezza (o non facciamo nulla se preferisci)
    fetchShifts(); 
    }
}
}, [highlightId]); // Esegui solo quando cambia l'ID notifica
  // --------------------------------------

  const onRefresh = useCallback(() => { setRefreshing(true); fetchShifts(); }, []);

  const handleLock = (id: number) => {
    setAlert({
      visible: true, 
      type: 'warning', 
      title: 'Visualizza Dettagli', 
      message: 'Visualizzando i dettagli bloccherai la prestazione per 10 minuti.\n\nVuoi procedere?',
      primaryLabel: 'Conferma',
      primaryColor: AppTheme.custom.success,
      onConfirm: async () => {
        try { await api.post(`/shifts/${id}/lock`); fetchShifts(); } 
        catch (e: any) { setAlert({ visible: true, type: 'error', title: 'Errore', message: e.response?.data?.message || 'Errore' }); }
      }
    });
  };

  const handleAccept = (id: number) => {
    setAlert({
      visible: true,
      type: 'info',
      title: 'Accettazione',
      message: 'Confermi di voler prendere in carico questa prestazione?',
      primaryLabel: 'Sì, Accetta',
      primaryColor: AppTheme.custom.success,
      onConfirm: async () => {
        try { 
          await api.post(`/shifts/${id}/accept`);
          setAlert({ visible: true, type: 'success', title: 'Fatto!', message: 'Prestazione spostata in "Da Eseguire".' });
          fetchShifts(); setViewMode('mine'); 
        } catch { setAlert({ visible: true, type: 'error', title: 'Errore', message: 'Impossibile accettare' }); }
      }
    });
  };

  const openRefuseDialog = (id: number) => { setSelectedRequestId(id); setRefuseDialogVisible(true); };
  
  const handleRefuseConfirm = async (data: any) => {
    setRefuseDialogVisible(false);
    if (!selectedRequestId) return;
    try { await api.post(`/shifts/${selectedRequestId}/refuse`, data); fetchShifts(); } 
    catch (e) { setAlert({ visible: true, type: 'error', title: 'Errore', message: 'Impossibile rifiutare' }); }
  };

  const handleComplete = (id: number) => {
    setAlert({
      visible: true, type: 'info', title: 'Conferma', message: 'Hai completato il turno?', primaryLabel: 'Sì, Completa',
      onConfirm: async () => {
        try { await api.post(`/shifts/${id}/complete`); fetchShifts(); setAlert({ visible: true, type: 'success', title: 'Fatto!', message: 'Prestazione archiviata.' }); } 
        catch { setAlert({ visible: true, type: 'error', title: 'Errore', message: 'Errore completamento' }); }
      }
    });
  };

  if (loading && availableList.length === 0 && myList.length === 0) {
    return <View style={styles.center}><ActivityIndicator size="large" color={AppTheme.colors.primary} /></View>;
  }

  const dataToShow = viewMode === 'new' ? availableList : myList;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{flex: 1}}>
          <Text style={styles.greeting}>Ciao,</Text>
          <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>{userName}</Text>
        </View>
        <IconButton icon="bell-outline" size={28} iconColor={AppTheme.custom.textMain} style={styles.bell} />
      </View>

      <View style={styles.tabContainer}>
        <CustomTabs 
          value={viewMode} 
          onValueChange={setViewMode}
          tabs={[
            { value: 'new', label: `DISPONIBILI (${availableList.length})` },
            { value: 'mine', label: `DA ESEGUIRE (${myList.length})` }
          ]}
        />
      </View>

      <FlatList
        data={dataToShow}
        keyExtractor={(item) => item.service_request_id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={AppTheme.colors.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nessuna prestazione disponibile.</Text>
            <Button mode="text" onPress={() => fetchShifts()} textColor={AppTheme.colors.primary}>Aggiorna</Button>
          </View>
        }
        renderItem={({ item }) => {
          const isHighlighted = String(item.service_request_id) === String(highlightId);

          return (
            <PrestazioneCard
              request={item}
              isMyShift={viewMode === 'mine'}
              onLock={() => handleLock(item.service_request_id)}
              onAccept={() => handleAccept(item.service_request_id)}
              onRefuseRequest={() => openRefuseDialog(item.service_request_id)}
              onComplete={() => handleComplete(item.service_request_id)}
              style={isHighlighted ? styles.cardHighlight : undefined}
            />
          );
        }}
      />

      <RefuseDialog visible={refuseDialogVisible} onDismiss={() => setRefuseDialogVisible(false)} onConfirm={handleRefuseConfirm} />
      
      <CustomAlert 
        visible={alert.visible} 
        type={alert.type} 
        title={alert.title} 
        message={alert.message} 
        onDismiss={() => setAlert(prev => ({...prev, visible: false}))}
        primaryAction={alert.onConfirm ? { label: alert.primaryLabel || 'Conferma', onPress: () => { alert.onConfirm?.(); setAlert(prev => ({...prev, visible: false})); }, color: alert.primaryColor } : undefined}
        secondaryAction={{ label: 'Chiudi', onPress: () => setAlert(prev => ({...prev, visible: false})) }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppTheme.colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { 
    paddingHorizontal: 28, paddingTop: 36, paddingBottom: 20, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' 
  },
  greeting: { fontFamily: 'Articulat-Medium', fontSize: 16, color: AppTheme.custom.textSecondary },
  title: { fontFamily: 'Articulat-Bold', fontSize: 24, color: AppTheme.custom.textMain, letterSpacing: -0.5 },
  bell: { margin: 0, backgroundColor: 'white', width: 44, height: 44 },

  tabContainer: { paddingHorizontal: 28, marginBottom: 16 },
  list: { paddingHorizontal: 28, paddingBottom: 120 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontFamily: 'Articulat-Medium', color: '#999', fontSize: 16, marginBottom: 12 },

  // --- NUOVO STILE SEMPLIFICATO ---
  cardHighlight: {
    borderColor: AppTheme.colors.primary, // Usa il colore principale del brand
    borderWidth: 2, // Spessore del bordo
    // Non serve background o shadow extra, usiamo quelli della card standard
  },
});