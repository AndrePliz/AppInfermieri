import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { AppTheme } from '../theme';

type AlertType = 'info' | 'warning' | 'error' | 'success';

interface Props {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  primaryAction?: { label: string; onPress: () => void; color?: string };
  secondaryAction?: { label: string; onPress: () => void };
  onDismiss: () => void;
}

const ICONS = {
  info: 'information-outline',
  warning: 'alert-outline',
  error: 'close-circle-outline',
  success: 'check-circle-outline'
};

const COLORS_TYPE = {
  info: AppTheme.colors.primary,
  warning: AppTheme.custom.warning,
  error: AppTheme.colors.error,
  success: AppTheme.custom.success
};

export default function CustomAlert({ visible, type, title, message, primaryAction, secondaryAction, onDismiss }: Props) {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          
          <View style={styles.iconContainer}>
            <Icon source={ICONS[type]} size={56} color={COLORS_TYPE[type]} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            {secondaryAction && (
              <TouchableOpacity onPress={secondaryAction.onPress} style={styles.secondaryBtn}>
                <Text style={styles.secondaryText}>{secondaryAction.label}</Text>
              </TouchableOpacity>
            )}
            
            {primaryAction && (
              <TouchableOpacity 
                onPress={primaryAction.onPress} 
                style={[
                  styles.primaryBtn, 
                  { backgroundColor: primaryAction.color || COLORS_TYPE[type] }
                ]}
              >
                <Text style={styles.primaryText}>{primaryAction.label}</Text>
              </TouchableOpacity>
            )}
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 43, 72, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  iconContainer: { marginBottom: 16 },
  title: {
    fontFamily: 'Articulat-Bold',
    fontSize: 20,
    color: AppTheme.custom.textMain,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontFamily: 'Articulat-Medium',
    fontSize: 16,
    color: AppTheme.custom.textDark,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  // Pulsante Primario (Es. Conferma Verde)
  primaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryText: {
    fontFamily: 'Articulat-Bold',
    fontSize: 15,
    color: 'white',
  },
  // Pulsante Secondario (Es. Chiudi) - Ora ha uno sfondo leggero come richiesto
  secondaryBtn: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F5', // Sfondo leggero
    borderRadius: 12,
  },
  secondaryText: {
    fontFamily: 'Articulat-Bold',
    fontSize: 15,
    color: AppTheme.custom.textSecondary,
  },
});