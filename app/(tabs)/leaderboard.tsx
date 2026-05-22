import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { type LeaderboardEntry } from '@/constants/leaderboard';
import { useUserProfile } from '@/contexts/user-profile-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getLeaderboardEntryId, loadLeaderboard, sortLeaderboardEntries } from '@/lib/leaderboard-storage';

const COLUMNS = [
  { key: 'rank', label: 'Rank', icon: 'trophy.fill' as const, flex: 0.75 },
  { key: 'team', label: 'Team', icon: 'person.3.fill' as const, flex: 1.15 },
  { key: 'name', label: 'Name', icon: 'person.fill' as const, flex: 1.15 },
  { key: 'points', label: 'Points', icon: 'star.fill' as const, flex: 0.85 },
];

export default function LeaderboardScreen() {
  const { profile } = useUserProfile();
  const { colors } = useAppTheme();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  const themed = useMemo(
    () =>
      StyleSheet.create({
        headerRow: { backgroundColor: colors.surface },
        userBar: {
          backgroundColor: colors.userBarBg,
          borderColor: colors.userBarBorder,
        },
        userBarLabel: { color: colors.userBarLabel },
        userBarCaption: { color: colors.userBarCaption },
        userBarValue: { color: colors.onTint },
        userBarPoints: { color: colors.onTint },
      }),
    [colors]
  );

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
        <View style={[styles.table, { borderColor: colors.border }]}>
          <View style={[styles.headerRow, themed.headerRow, { borderColor: colors.border }]}>
            {COLUMNS.map((column) => (
              <View key={column.key} style={[styles.headerCell, { flex: column.flex }]}>
                <IconSymbol name={column.icon} size={16} color={colors.icon} />
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
                  { borderColor: colors.border },
                  index % 2 === 1 && { backgroundColor: colors.surfaceAlt },
                ]}>
                <View style={[styles.cell, { flex: COLUMNS[0].flex }]}>
                  <IconSymbol
                    name="trophy.fill"
                    size={14}
                    color={index === 0 ? colors.gold : colors.icon}
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
                  <IconSymbol name="star.fill" size={14} color={colors.gold} />
                  <ThemedText style={styles.pointsText}>{entry.points}</ThemedText>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {currentUserStats ? (
        <View style={[styles.userBar, themed.userBar]}>
          <Text style={[styles.userBarLabel, themed.userBarLabel]}>Your stats</Text>
          <View style={styles.userBarRow}>
            <View style={[styles.userBarCell, { flex: COLUMNS[0].flex }]}>
              <IconSymbol name="trophy.fill" size={16} color={colors.onTint} />
              <Text style={[styles.userBarValue, themed.userBarValue]}>{currentUserStats.rank}</Text>
            </View>
            <View style={[styles.userBarCell, { flex: COLUMNS[1].flex }]}>
              <Text style={[styles.userBarCaption, themed.userBarCaption]}>Team</Text>
              <Text style={[styles.userBarValue, themed.userBarValue]} numberOfLines={1}>
                {currentUserStats.team}
              </Text>
            </View>
            <View style={[styles.userBarCell, { flex: COLUMNS[2].flex }]}>
              <Text style={[styles.userBarCaption, themed.userBarCaption]}>Name</Text>
              <Text style={[styles.userBarValue, themed.userBarValue]} numberOfLines={1}>
                {currentUserStats.name}
              </Text>
            </View>
            <View style={[styles.userBarCell, { flex: COLUMNS[3].flex }]}>
              <IconSymbol name="star.fill" size={16} color={colors.gold} />
              <Text style={[styles.userBarPoints, themed.userBarPoints]}>{currentUserStats.points}</Text>
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
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  userBarLabel: {
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
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  userBarValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  userBarPoints: {
    fontSize: 18,
    fontWeight: '800',
  },
});
