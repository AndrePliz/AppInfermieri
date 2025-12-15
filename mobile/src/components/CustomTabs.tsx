import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { AppTheme } from '../theme';

type Props = {
  value: string;
  onValueChange: (val: string) => void;
  tabs: { value: string; label: string }[];
};

export default function CustomTabs({ value, onValueChange, tabs }: Props) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = value === tab.value;
        return (
          <TouchableOpacity
            key={tab.value}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onValueChange(tab.value)}
            activeOpacity={0.8}
          >
            <Text style={[styles.label, isActive ? styles.activeLabel : styles.inactiveLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#E4E9F2',
    borderRadius: 16,
    padding: 6,
    height: 56,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    ...AppTheme.custom.shadowFloating,
  },
  label: {
    fontFamily: 'Articulat-Bold',
    fontSize: 14,
  },
  activeLabel: {
    color: AppTheme.custom.textHero,
  },
  inactiveLabel: {
    color: AppTheme.custom.textSecondary,
  }
});