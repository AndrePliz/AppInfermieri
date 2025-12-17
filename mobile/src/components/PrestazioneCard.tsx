import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Linking, Platform, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { Text, Button, Icon } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { ServiceRequest } from '../types';
import { AppTheme } from '../theme';

type Props = {
  request: ServiceRequest;
  isMyShift: boolean;
  onLock?: (id: number) => void;
  onAccept?: (id: number) => void;
  onRefuseRequest?: (id: number) => void;
  onComplete?: (id: number) => void;
  style?: StyleProp<ViewStyle>; 
};

export default function PrestazioneCard({ request, isMyShift, onLock, onAccept, onRefuseRequest, onComplete, style }: Props) {
  const [timeLeft, setTimeLeft] = useState<string>('--:--');
  
  const safeDate = request.date_time.replace(' ', 'T');
  const dateObj = new Date(safeDate);
  
  const dayNum = dateObj.toLocaleDateString('it-IT', { day: 'numeric' });
  const monthStr = dateObj.toLocaleDateString('it-IT', { month: 'short' }).toUpperCase();
  const timeStr = dateObj.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

  const isLocked = request.status_request === 3;
  const isAssigned = request.status_request === 2;
  const isFree = request.status_request === 1;

  useEffect(() => {
    if (!isLocked || !request.blocked_time) return;

    const calculateTimeLeft = () => {
      const blockedTimeSafe = typeof request.blocked_time === 'string' 
        ? request.blocked_time.replace(' ', 'T') 
        : request.blocked_time;

      const lockTime = new Date(blockedTimeSafe!).getTime();
      const expirationTime = lockTime + (10 * 60 * 1000); 
      const now = new Date().getTime();
      const diff = expirationTime - now;

      if (diff <= 0) {
        setTimeLeft("00:00");
      } else {
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    calculateTimeLeft();
    const timerId = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timerId);
  }, [isLocked, request.blocked_time]);

  const openMaps = () => {
    const query = `${request.address}, ${request.city}`;
    const url = Platform.select({ ios: `maps:0,0?q=${query}`, android: `geo:0,0?q=${query}` });
    if (url) Linking.openURL(url);
  };

  const callPatient = () => {
    if (request.phone) Linking.openURL(`tel:${request.phone}`);
  };

  return (
    <View style={[
      styles.card,
      isLocked && styles.borderLocked,
      isAssigned && styles.borderAssigned,
      style 
    ]}>
      
      {/* 1. TOP HEADER con Timer incorporato */}
      <View style={styles.topHeaderRow}>
        <View style={styles.headerLeft}>
            <View style={styles.idBadge}>
            <Text style={styles.idText}>#{request.service_request_id}</Text>
            </View>
            <Text style={styles.serviceTitle}>
            {request.Service?.service_description || 'SERVIZIO GENERICO'}
            </Text>
        </View>

        {/* TIMER BADGE (Solo se bloccato) - Stile ispirato allo screenshot */}
        {isLocked && (
            <View style={styles.timerBadge}>
                <Icon source="clock-outline" size={14} color="#E65100" />
                <Text style={styles.timerText}>{timeLeft}</Text>
            </View>
        )}
      </View>

      {/* 2. MAIN ROW */}
      <View style={styles.mainRow}>
        <LinearGradient colors={['#F7F9FC', '#EEF2F6']} style={styles.dateBadge}>
          <Text style={styles.dayText}>{dayNum}</Text>
          <Text style={styles.monthText}>{monthStr}</Text>
        </LinearGradient>

        <View style={styles.infoCol}>
          <View style={styles.timePriceRow}>
            <Text style={styles.timeText}>Ore {timeStr}</Text>
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>€{Number(request.nurse_price).toFixed(0)}</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Icon source="map-marker-outline" size={14} color={AppTheme.custom.textSecondary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {request.address ? `${request.address}, ` : ''}{request.city || ''}
            </Text>
          </View>
        </View>
      </View>

      {/* 3. PATIENT SECTION */}
      {(isLocked || isAssigned) && (
        <View style={styles.patientBox}>
          <View style={styles.patientHeader}>
            <Text style={styles.label}>PAZIENTE</Text>
          </View>
          <View style={styles.patientContent}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.patientName}>{request.name}</Text>
              <Text style={styles.patientAddress}>{request.address}</Text>
            </View>
            <View style={styles.actionIcons}>
              {request.phone && (
                <TouchableOpacity onPress={callPatient} style={styles.circleBtn}>
                  <Icon source="phone" size={20} color="white" />
                </TouchableOpacity>
              )}
              {request.address && (
                <TouchableOpacity onPress={openMaps} style={styles.circleBtn}>
                  <Icon source="navigation-variant" size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}

      {/* 4. FOOTER */}
      <View style={styles.footer}>
        {isFree && (
          <Button 
            mode="contained" 
            style={styles.btnPrimary} 
            contentStyle={{ height: 50 }}
            labelStyle={styles.btnLabel}
            onPress={() => onLock && onLock(request.service_request_id)}
          >
            VISUALIZZA DETTAGLI
          </Button>
        )}

        {isLocked && (
          <View style={styles.gridBtns}>
            <Button 
              mode="outlined" 
              style={styles.btnRefuse} 
              textColor={AppTheme.custom.error}
              labelStyle={styles.btnLabel}
              onPress={() => onRefuseRequest && onRefuseRequest(request.service_request_id)}
            >
              Rifiuta
            </Button>
            <Button 
              mode="contained" 
              style={styles.btnAccept} 
              labelStyle={styles.btnLabel}
              onPress={() => onAccept && onAccept(request.service_request_id)}
            >
              Accetta
            </Button>
          </View>
        )}

        {isAssigned && (
          <Button 
            mode="contained" 
            style={styles.btnComplete} 
            contentStyle={{ height: 50 }}
            labelStyle={styles.btnLabel}
            icon="check"
            onPress={() => onComplete && onComplete(request.service_request_id)}
          >
            Segnala Eseguita
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...AppTheme.custom.cardStyle, 
    padding: 20,
    marginBottom: 16,
  },
  borderLocked: { 
    borderColor: AppTheme.custom.warning, 
    borderWidth: 2, 
    ...AppTheme.custom.shadowCardLocked 
  },
  borderAssigned: { borderColor: AppTheme.colors.primary, borderWidth: 1.5 },

  // Top Header Ridisegnato
  topHeaderRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 16 
  },
  headerLeft: { flex: 1, marginRight: 8 },
  
  idBadge: { backgroundColor: '#F0F4F8', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginBottom: 6, alignSelf: 'flex-start' },
  idText: { fontFamily: 'Articulat-Medium', fontSize: 12, color: AppTheme.custom.textSecondary },
  serviceTitle: { fontFamily: 'Articulat-Bold', fontSize: 22, color: AppTheme.custom.textMain, lineHeight: 22 },

  // NUOVO STILE TIMER (Ispirato allo screenshot)
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0', // Sfondo arancione molto chiaro
    borderRadius: 20,           // Molto arrotondato (pillola)
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',     // Bordo arancione sottile
    gap: 6
  },
  timerText: {
    fontFamily: 'Articulat-Bold',
    color: '#E65100',           // Arancione scuro per il testo
    fontSize: 14,
    fontVariant: ['tabular-nums'], // Evita che i numeri saltino
  },

  // Main Row
  mainRow: { flexDirection: 'row', alignItems: 'flex-start' },
  dateBadge: { width: 60, height: 70, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  dayText: { fontFamily: 'Articulat-Bold', fontSize: 26, color: AppTheme.custom.textMain, lineHeight: 28 },
  monthText: { fontFamily: 'Articulat-Bold', fontSize: 11, color: AppTheme.custom.textLight, textTransform: 'uppercase' },

  infoCol: { flex: 1, justifyContent: 'center' },
  timePriceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  timeText: { fontFamily: 'Articulat-Bold', fontSize: 20, color: AppTheme.colors.primary, marginRight: 10 },
  priceBadge: { backgroundColor: AppTheme.custom.bgPrice, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  priceText: { fontFamily: 'Articulat-Bold', fontSize: 18, color: AppTheme.custom.textMain },

  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  locationText: { fontFamily: 'Articulat-Medium', fontSize: 14, color: AppTheme.custom.textSecondary, flex: 1 },

  // Patient Box
  patientBox: { 
    marginTop: 20, 
    backgroundColor: '#EBF2FA', 
    borderRadius: 16, 
    padding: 16,
    borderWidth: 1,
    borderColor: '#DCE5EF' 
  },
  patientHeader: { marginBottom: 8 },
  label: { fontFamily: 'Articulat-Bold', fontSize: 10, color: AppTheme.custom.label, letterSpacing: 1, textTransform: 'uppercase' },
  patientContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  patientInfo: { flex: 1, marginRight: 12 },
  patientName: { fontFamily: 'Articulat-Bold', fontSize: 16, color: AppTheme.custom.textMain, marginBottom: 4 },
  patientAddress: { fontFamily: 'Articulat-Regular', fontSize: 14, color: AppTheme.custom.textDark, lineHeight: 20 },
  actionIcons: { flexDirection: 'row', gap: 8 },
  circleBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: AppTheme.colors.primary, justifyContent: 'center', alignItems: 'center' },

  footer: { marginTop: 16 },
  btnLabel: { fontFamily: 'Articulat-Bold', fontSize: 15, paddingVertical: 2 },
  btnPrimary: { borderRadius: 12, backgroundColor: AppTheme.colors.primary, ...AppTheme.custom.shadowButton },
  gridBtns: { flexDirection: 'row', gap: 12 },
  btnRefuse: { flex: 1, borderRadius: 12, borderColor: AppTheme.custom.error, borderWidth: 1.5, height: 48, justifyContent: 'center' },
  btnAccept: { flex: 1, borderRadius: 12, backgroundColor: AppTheme.custom.success, height: 48, justifyContent: 'center', ...AppTheme.custom.shadowButton },
  btnComplete: { borderRadius: 12, backgroundColor: '#2D3436' },
});