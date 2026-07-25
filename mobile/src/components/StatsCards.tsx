import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Card } from 'react-native-paper';

interface StatsCardsProps {
  totalCount: number;
  ativosCount: number;
  inativosCount: number;
}

export function StatsCards({ totalCount, ativosCount, inativosCount }: StatsCardsProps) {
  return (
    <View style={styles.statsContainer}>
      <Card style={[styles.statCard, { borderLeftColor: '#4F46E5' }]}>
        <Card.Content style={styles.statContent}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>{totalCount}</Text>
        </Card.Content>
      </Card>

      <Card style={[styles.statCard, { borderLeftColor: '#22C55E' }]}>
        <Card.Content style={styles.statContent}>
          <Text style={styles.statLabel}>Ativos</Text>
          <Text style={[styles.statValue, { color: '#15803D' }]}>{ativosCount}</Text>
        </Card.Content>
      </Card>

      <Card style={[styles.statCard, { borderLeftColor: '#EF4444' }]}>
        <Card.Content style={styles.statContent}>
          <Text style={styles.statLabel}>Inativos</Text>
          <Text style={[styles.statValue, { color: '#B91C1C' }]}>{inativosCount}</Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 2,
  },
  statContent: { paddingVertical: 12, paddingHorizontal: 10 },
  statLabel: { fontSize: 11, color: '#64748B', fontWeight: '600', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginTop: 2 },
});
