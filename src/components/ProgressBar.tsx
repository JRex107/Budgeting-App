import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface ProgressBarProps {
  current: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  style?: ViewStyle;
}

export function ProgressBar({
  current,
  max,
  label,
  showPercentage = true,
  color = '#007AFF',
  style,
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const isOverBudget = current > max;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {showPercentage && (
            <Text style={[styles.percentage, isOverBudget && styles.overBudget]}>
              {percentage.toFixed(0)}%
            </Text>
          )}
        </View>
      )}
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            {
              width: `${percentage}%`,
              backgroundColor: isOverBudget ? '#FF3B30' : color,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  overBudget: {
    color: '#FF3B30',
  },
  barBackground: {
    height: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
});
