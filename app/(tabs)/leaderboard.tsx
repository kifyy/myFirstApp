import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { type LeaderboardEntry } from '@/constants/leaderboard';
import { useUserProfile } from '@/contexts/user-profile-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getLeaderboardEntryId, loadLeaderboard, sortLeaderboardEntries } from '@/lib/leaderboard-storage';

const COLUMNS = [
  { key: 'rank', label: 'Rank', icon: 'trophy.fill' as const, flex: 0.75 },
  { key: 'team', label: 'Team', icon: 'person.3.fill' as const, flex: 1.15 },
  { key: 'name', label: 'Name', icon: 'person.fill' as const, flex: 1.15 },
  { key: 'points', label: 'Points', icon: 'star.fill' as const, flex: 0.85 },
];

export default function LeaderboardScreen() {
  const { profile } = useUserProfile();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const borderColor = useThemeColor({ light: '#E5E7EB', dark: '#374151' }, 'text');
  const headerBackground = useThemeColor({ light: '#F3F4F6', dark: '#1F2937' }, 'background');
  const iconColor = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'icon');
  const rowAltBackground = useThemeColor({ light: 'rgba(0,0,0,0.03)', dark: 'rgba(255,255,255,0.04)' }, 'background');

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const load = async () => {
        const data = sortLeaderboardEntries(await loadLeaderboard());
        if (isActive) {
          setEntries(data);
        }
      };

      void load();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const currentUserStats = useMemo(() => {
    if (!profile) {
      return null;
    }

    const entryId = getLeaderboardEntryId(profile);
    const entryIndex = entries.findIndex((item) => item.id === entryId);
    const entry = entryIndex >= 0 ? entries[entryIndex] : null;

    return {
      rank: entry ? entryIndex + 1 : '—',
      team: profile.teamName,
      name: profile.firstName,
      points: entry?.points ?? 0,
    };
  }, [entries, profile]);

  return (
    <AppScreen style={styles.container}>
      <ThemedText type="title" style={styles.header}>
        Leaderboard
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Complete challenges to earn points and climb the ranks.
      </ThemedText>

      <ScrollView
        style={styles.tableScroll}
        contentContainerStyle={styles.tableScrollContent}
        showsVerticalScrollIndicator>
        <View style={[styles.table, { borderColor }]}>
          <View style={[styles.headerRow, { backgroundColor: headerBackground, borderColor }]}>
            {COLUMNS.map((column) => (
              <View key={column.key} style={[styles.headerCell, { flex: column.flex }]}>
                <IconSymbol name={column.icon} size={16} color={iconColor} />
                <ThemedText style={styles.headerLabel} numberOfLines={1}>
                  {column.label}
                </ThemedText>
              </View>
            ))}
          </View>

          {entries.length === 0 ? (
            <View style={styles.emptyRow}>
              <ThemedText style={styles.emptyText}>
                No points yet. Finish a challenge to appear on the board!
              </ThemedText>
            </View>
          ) : (
            entries.map((entry, index) => (
              <View
                key={entry.id}
                style={[
                  styles.dataRow,
                  { borderColor },
                  index % 2 === 1 && { backgroundColor: rowAltBackground },
                ]}>
                <View style={[styles.cell, { flex: COLUMNS[0].flex }]}>
                  <IconSymbol
                    name="trophy.fill"
                    size={14}
                    color={index === 0 ? '#F59E0B' : iconColor}
                  />
                  <ThemedText style={styles.cellText}>{index + 1}</ThemedText>
                </View>
                <View style={[styles.cell, { flex: COLUMNS[1].flex }]}>
                  <ThemedText style={styles.cellText} numberOfLines={1}>
                    {entry.team}
                  </ThemedText>
                </View>
                <View style={[styles.cell, { flex: COLUMNS[2].flex }]}>
                  <ThemedText style={styles.cellText} numberOfLines={1}>
                    {entry.name}
                  </ThemedText>
                </View>
                <View style={[styles.cell, { flex: COLUMNS[3].flex }]}>
                  <IconSymbol name="star.fill" size={14} color="#F59E0B" />
                  <ThemedText style={styles.pointsText}>{entry.points}</ThemedText>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {currentUserStats ? (
        <View style={styles.userBar}>
          <ThemedText style={styles.userBarLabel}>Your stats</ThemedText>
          <View style={styles.userBarRow}>
            <View style={[styles.userBarCell, { flex: COLUMNS[0].flex }]}>
              <IconSymbol name="trophy.fill" size={16} color="#0a7ea4" />
              <ThemedText style={styles.userBarValue}>{currentUserStats.rank}</ThemedText>
            </View>
            <View style={[styles.userBarCell, { flex: COLUMNS[1].flex }]}>
              <ThemedText style={styles.userBarCaption}>Team</ThemedText>
              <ThemedText style={styles.userBarValue} numberOfLines={1}>
                {currentUserStats.team}
              </ThemedText>
            </View>
            <View style={[styles.userBarCell, { flex: COLUMNS[2].flex }]}>
              <ThemedText style={styles.userBarCaption}>Name</ThemedText>
              <ThemedText style={styles.userBarValue} numberOfLines={1}>
                {currentUserStats.name}
              </ThemedText>
            </View>
            <View style={[styles.userBarCell, { flex: COLUMNS[3].flex }]}>
              <IconSymbol name="star.fill" size={16} color="#F59E0B" />
              <ThemedText style={styles.userBarPoints}>{currentUserStats.points}</ThemedText>
            </View>
          </View>
        </View>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 8,
  },
  header: {
    marginBottom: 8,
    marginTop: 0,
  },
  subtitle: {
    marginBottom: 12,
    lineHeight: 22,
  },
  tableScroll: {
    flex: 1,
  },
  tableScrollContent: {
    flexGrow: 1,
    paddingBottom: 8,
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  headerCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 8,
    minWidth: 0,
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '700',
    flexShrink: 1,
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 8,
    minWidth: 0,
  },
  cellText: {
    fontSize: 13,
    flexShrink: 1,
  },
  pointsText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyRow: {
    padding: 24,
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 22,
  },
  userBar: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#0a7ea4',
    borderWidth: 2,
    borderColor: '#085f7a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  userBarLabel: {
    color: '#E0F2FE',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  userBarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userBarCell: {
    minWidth: 0,
    paddingHorizontal: 4,
  },
  userBarCaption: {
    color: '#BAE6FD',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  userBarValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  userBarPoints: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});
