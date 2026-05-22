import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';
import { ACTIVITIES } from '@/constants/activities';
import { useChallengeTimer } from '@/contexts/challenge-timer-context';
import { formatCountdown } from '@/lib/format-countdown';

export default function ChallengesScreen() {
  const router = useRouter();
  const { timer, isRunning, remainingMs, startChallenge, leaveChallenge } = useChallengeTimer();

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
        <View style={styles.timerBanner}>
          <ThemedText style={styles.timerLabel}>Challenge in progress</ThemedText>
          <ThemedText style={styles.timerValue}>{formatCountdown(remainingMs)}</ThemedText>
          <ThemedText style={styles.timerActivity}>{timer.activityTitle}</ThemedText>
          <Pressable
            onPress={handleLeaveChallenge}
            style={({ pressed }) => [styles.leaveButton, { opacity: pressed ? 0.85 : 1 }]}>
            <ThemedText style={styles.leaveButtonText}>Leave Challenge</ThemedText>
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
              style={[styles.card, isActive && styles.cardActive, isDisabled && styles.cardDisabled]}>
              <Image source={activity.image} style={[styles.image, isDisabled && styles.imageDisabled]} />
              <View style={styles.cardBody}>
                <ThemedText type="subtitle" style={isDisabled ? styles.textDisabled : undefined}>
                  {activity.title}
                </ThemedText>
                <ThemedText style={[styles.description, isDisabled && styles.textDisabled]}>
                  {activity.description}
                </ThemedText>
                {isActive && isRunning ? (
                  <ThemedText style={styles.runningLabel}>
                    Running · {formatCountdown(remainingMs)}
                  </ThemedText>
                ) : null}
                {isActive && isRunning ? (
                  <Pressable
                    onPress={handleLeaveChallenge}
                    style={({ pressed }) => [styles.leaveButtonInline, { opacity: pressed ? 0.85 : 1 }]}>
                    <ThemedText style={styles.leaveButtonText}>Leave Challenge</ThemedText>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => handleStartPress(activity.key, activity.title, activity.route)}
                    disabled={isDisabled}
                    style={({ pressed }) => [
                      styles.startButton,
                      isDisabled && styles.startButtonDisabled,
                      { opacity: pressed && !isDisabled ? 0.85 : 1 },
                    ]}>
                    <ThemedText style={[styles.startButtonText, isDisabled && styles.startButtonTextDisabled]}>
                      Start
                    </ThemedText>
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
    backgroundColor: '#FFF7ED',
    borderColor: '#F97316',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 4,
  },
  timerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C2410C',
  },
  timerValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#EA580C',
  },
  timerActivity: {
    fontSize: 14,
    color: '#9A3412',
  },
  leaveButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#DC2626',
  },
  leaveButtonInline: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#DC2626',
  },
  leaveButtonText: {
    color: '#fff',
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
    borderColor: '#e6e6e6',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardActive: {
    borderColor: '#F97316',
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
  textDisabled: {
    color: '#9CA3AF',
  },
  runningLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EA580C',
  },
  startButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#0a7ea4',
  },
  startButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  startButtonTextDisabled: {
    color: '#F3F4F6',
  },
});
