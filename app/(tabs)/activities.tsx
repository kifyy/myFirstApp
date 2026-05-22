import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';
import { ACTIVITIES } from '@/constants/activities';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function ActivitiesScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});

  const themed = useMemo(
    () =>
      StyleSheet.create({
        card: { borderColor: colors.border },
        ratingSummary: { color: colors.muted },
        rectButton: { backgroundColor: colors.tint },
        rectButtonText: { color: colors.onTint },
      }),
    [colors]
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadRatings = async () => {
        try {
          const storedRatings = await Promise.all(
            ACTIVITIES.map(async (activity) => {
              const storedValue = await AsyncStorage.getItem(`${activity.key}-rating`);
              return [activity.key, storedValue ? parseInt(storedValue, 10) : 0] as const;
            })
          );

          if (isActive) {
            setRatings(Object.fromEntries(storedRatings));
          }
        } catch (error) {
          console.error('Error loading ratings:', error);
        }
      };

      loadRatings();

      return () => {
        isActive = false;
      };
    }, [])
  );

  return (
    <AppScreen style={styles.container}>
      <ThemedText type="title" style={styles.header}>
        Activities
      </ThemedText>
      <ScrollView contentContainerStyle={styles.list}>
        {ACTIVITIES.map((activity) => (
          <View key={activity.key} style={[styles.card, themed.card]}>
            <Image source={activity.image} style={styles.image} />
            <View style={styles.cardBody}>
              <ThemedText type="subtitle">{activity.title}</ThemedText>
              <ThemedText style={styles.description}>{activity.description}</ThemedText>
              {ratings[activity.key] > 0 && (
                <ThemedText style={[styles.ratingSummary, themed.ratingSummary]}>
                  ⭐ {ratings[activity.key]}/5
                </ThemedText>
              )}
              <Pressable
                onPress={() => router.push(activity.route)}
                style={({ pressed }) => [styles.rectButton, themed.rectButton, { opacity: pressed ? 0.85 : 1 }]}>
                <Text style={[styles.rectButtonText, themed.rectButtonText]}>Learn More</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  list: {
    gap: 12,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 110,
    height: 110,
  },
  cardBody: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
    gap: 8,
  },
  ratingSummary: {
    fontSize: 14,
    fontWeight: '600',
  },
  rectButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  rectButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
