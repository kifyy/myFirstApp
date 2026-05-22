import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';
import { ACTIVITIES } from '@/constants/activities';
import { useChallengeTimer } from '@/contexts/challenge-timer-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { formatCountdown } from '@/lib/format-countdown';

export default function ChallengesScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { timer, isRunning, remainingMs, startChallenge, leaveChallenge } = useChallengeTimer();

  const themed = useMemo(
    () =>
      StyleSheet.create({
        timerBanner: {
          backgroundColor: colors.timerBannerBg,
          borderColor: colors.timerBannerBorder,
        },
        timerLabel: { color: colors.timerBannerLabel },
        timerValue: { color: colors.timerBannerAccent },
        timerActivity: { color: colors.timerBannerSubtext },
        card: { borderColor: colors.border },
        cardActive: { borderColor: colors.timerBannerBorder },
        runningLabel: { color: colors.timerBannerAccent },
        startButton: { backgroundColor: colors.tint },
        startButtonDisabled: { backgroundColor: colors.disabled },
        startButtonText: { color: colors.onTint },
        startButtonTextDisabled: { color: colors.surface },
        leaveButton: { backgroundColor: colors.danger },
        leaveButtonText: { color: colors.onTint },
        textDisabled: { color: colors.disabled },
      }),
    [colors]
  );

  const handleStartPress = (activityKey: string, activityTitle: string, route: string) => {
    if (isRunning) {
      return;
    }

    Alert.alert('Start Challenge', 'Are you ready to start the challenge?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        onPress: () => {
          void (async () => {
            await startChallenge(activityKey, activityTitle);
            router.push(route as '/activity-1' | '/activity-2' | '/activity-3');
          })();
        },
      },
    ]);
  };

  const handleLeaveChallenge = () => {
    Alert.alert('Leave Challenge', 'Stop the current challenge timer?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: () => {
          void leaveChallenge();
        },
      },
    ]);
  };

  return (
    <AppScreen style={styles.container}>
      <ThemedText type="title" style={styles.header}>
        Challenges
      </ThemedText>
      {isRunning && timer ? (
        <View style={[styles.timerBanner, themed.timerBanner]}>
          <Text style={[styles.timerLabel, themed.timerLabel]}>Challenge in progress</Text>
          <Text style={[styles.timerValue, themed.timerValue]}>{formatCountdown(remainingMs)}</Text>
          <Text style={[styles.timerActivity, themed.timerActivity]}>{timer.activityTitle}</Text>
          <Pressable
            onPress={handleLeaveChallenge}
            style={({ pressed }) => [styles.leaveButton, themed.leaveButton, { opacity: pressed ? 0.85 : 1 }]}>
            <Text style={[styles.leaveButtonText, themed.leaveButtonText]}>Leave Challenge</Text>
          </Pressable>
        </View>
      ) : null}
      <ScrollView contentContainerStyle={styles.list}>
        {ACTIVITIES.map((activity) => {
          const isActive = timer?.activityKey === activity.key;
          const isDisabled = isRunning && !isActive;

          return (
            <View
              key={activity.key}
              style={[
                styles.card,
                themed.card,
                isActive && themed.cardActive,
                isDisabled && styles.cardDisabled,
              ]}>
              <Image source={activity.image} style={[styles.image, isDisabled && styles.imageDisabled]} />
              <View style={styles.cardBody}>
                <ThemedText type="subtitle" style={isDisabled ? themed.textDisabled : undefined}>
                  {activity.title}
                </ThemedText>
                <ThemedText style={[styles.description, isDisabled && themed.textDisabled]}>
                  {activity.description}
                </ThemedText>
                {isActive && isRunning ? (
                  <Text style={[styles.runningLabel, themed.runningLabel]}>
                    Running · {formatCountdown(remainingMs)}
                  </Text>
                ) : null}
                {isActive && isRunning ? (
                  <Pressable
                    onPress={handleLeaveChallenge}
                    style={({ pressed }) => [
                      styles.leaveButtonInline,
                      themed.leaveButton,
                      { opacity: pressed ? 0.85 : 1 },
                    ]}>
                    <Text style={[styles.leaveButtonText, themed.leaveButtonText]}>Leave Challenge</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => handleStartPress(activity.key, activity.title, activity.route)}
                    disabled={isDisabled}
                    style={({ pressed }) => [
                      styles.startButton,
                      isDisabled ? themed.startButtonDisabled : themed.startButton,
                      { opacity: pressed && !isDisabled ? 0.85 : 1 },
                    ]}>
                    <Text
                      style={[
                        styles.startButtonText,
                        isDisabled ? themed.startButtonTextDisabled : themed.startButtonText,
                      ]}>
                      Start
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}
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
  timerBanner: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 4,
  },
  timerLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  timerValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  timerActivity: {
    fontSize: 14,
  },
  leaveButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  leaveButtonInline: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
  cardDisabled: {
    opacity: 0.55,
  },
  image: {
    width: 110,
    height: 110,
  },
  imageDisabled: {
    opacity: 0.7,
  },
  cardBody: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
    gap: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  runningLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  startButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
