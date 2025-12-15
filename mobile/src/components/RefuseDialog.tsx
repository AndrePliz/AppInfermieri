import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Portal, Button, TextInput, Text, Modal } from 'react-native-paper';
import { AppTheme } from '../theme';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: (data: { reason: string; note: string; desiredPrice?: string }) => void;
};

const REASONS = [
  { value: 'distance', label: 'Distanza eccessiva' },
  { value: 'price', label: 'Compenso insufficiente' },
  { value: 'cant_be_performed', label: 'Imprevisto personale' },
  { value: 'different_request', label: 'Prestazione non idonea' },
  { value: 'resp_phone', label: 'Il cliente non risponde' },
  { value: 'another', label: 'Altro motivo' },
];

export default function RefuseDialog({ visible, onDismiss, onConfirm }: Props) {
  const [reason, setReason] = useState('distance');
  const [note, setNote] = useState('');
  const [desiredPrice, setDesiredPrice] = useState('');

  const handleConfirm = () => {
    onConfirm({ reason, note, desiredPrice });
    setReason('distance');
    setNote('');
    setDesiredPrice('');
  };

  if (!visible) return null;

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>MOTIVO RIFIUTO</Text>
        </View>
        
        <ScrollView style={{ maxHeight: 450, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
          
          <View style={styles.optionsList}>
            {REASONS.map((r) => {
              const selected = reason === r.value;
              return (
                <TouchableOpacity 
                  key={r.value} 
                  style={[styles.optionRow, selected && styles.optionSelected]} 
                  onPress={() => setReason(r.value)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.circle, selected && styles.circleSelected]}>
                    {selected && <View style={styles.dot} />}
                  </View>
                  <Text style={[styles.label, selected && styles.labelSelected]}>{r.label}</Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {reason === 'price' && (
            <TextInput
              mode="outlined"
              label="Compenso richiesto (€)"
              value={desiredPrice}
              onChangeText={setDesiredPrice}
              keyboardType="numeric"
              style={styles.input}
              outlineColor={AppTheme.custom.border}
              activeOutlineColor={AppTheme.colors.primary}
            />
          )}

          <TextInput
            mode="outlined"
            label="Note aggiuntive"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            style={[styles.input, { marginTop: 16 }]}
            outlineColor={AppTheme.custom.border}
            activeOutlineColor={AppTheme.colors.primary}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button onPress={onDismiss} textColor={AppTheme.custom.textSecondary} labelStyle={styles.btnText}>ANNULLA</Button>
          <Button 
            onPress={handleConfirm} 
            mode="contained" 
            buttonColor={AppTheme.custom.error}
            style={styles.btnConfirm}
            labelStyle={styles.btnText}
          >
            CONFERMA
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: 'white', margin: 20, borderRadius: 28, paddingBottom: 20, overflow: 'hidden' },
  header: { padding: 24, paddingBottom: 20, alignItems: 'center', borderBottomWidth: 1, borderColor: '#F0F0F0' },
  title: { fontFamily: 'Articulat-Bold', fontSize: 18, color: AppTheme.custom.error, letterSpacing: 1 },
  
  optionsList: { marginTop: 20, marginBottom: 10 },
  optionRow: { 
    flexDirection: 'row', alignItems: 'center', 
    paddingVertical: 12, paddingHorizontal: 16, 
    borderRadius: 12, marginBottom: 8,
    borderWidth: 1, borderColor: 'transparent'
  },
  optionSelected: { backgroundColor: '#FFF5F5', borderColor: AppTheme.custom.error },
  
  circle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#D0D5DD', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  circleSelected: { borderColor: AppTheme.custom.error },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: AppTheme.custom.error },
  
  label: { fontFamily: 'Articulat-Medium', fontSize: 16, color: AppTheme.custom.textPrimary },
  labelSelected: { color: AppTheme.custom.error, fontFamily: 'Articulat-Bold' },
  
  input: { backgroundColor: '#F9FAFB', fontSize: 16 },
  
  footer: { padding: 24, flexDirection: 'row', justifyContent: 'flex-end', gap: 12, borderTopWidth: 1, borderColor: '#F0F0F0' },
  btnConfirm: { borderRadius: 12, paddingHorizontal: 12 },
  btnText: { fontFamily: 'Articulat-Bold', fontSize: 15 }
});