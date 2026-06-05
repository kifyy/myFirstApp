import { Alert, Platform } from 'react-native';

import { configureChallengeNotifications } from '@/lib/challenge-notifications';
import { canUseDeviceNotifications } from '@/lib/notification-environment';

const LEADERBOARD_CHANNEL_ID = 'leaderboard';

async function loadNotificationsModule() {
  return import('expo-notifications');
}

function notifyLeaderboardPointInApp(totalPoints: number): void {
  const pointsLabel = totalPoints === 1 ? 'point' : 'points';
  Alert.alert(
    'STEMM Lab',
    `+1 leaderboard point! You now have ${totalPoints} ${pointsLabel}.`
  );
}

async function ensureLeaderboardChannel(): Promise<void> {
  if (Platform.OS !== 'android' || !canUseDeviceNotifications()) {
    return;
  }

  const Notifications = await loadNotificationsModule();
  await Notifications.setNotificationChannelAsync(LEADERBOARD_CHANNEL_ID, {
    name: 'Leaderboard',
    importance: Notifications.AndroidImportance.HIGH,
  });
}

export async function notifyLeaderboardPointGained(totalPoints: number): Promise<void> {
  const pointsLabel = totalPoints === 1 ? 'point' : 'points';
  const body = `+1 point! You now have ${totalPoints} ${pointsLabel} on the leaderboard.`;

  if (!canUseDeviceNotifications()) {
    notifyLeaderboardPointInApp(totalPoints);
    return;
  }

  try {
    const Notifications = await loadNotificationsModule();
    configureChallengeNotifications();
    await ensureLeaderboardChannel();

    const existing = await Notifications.getPermissionsAsync();
    if (!existing.granted) {
      const requested = await Notifications.requestPermissionsAsync();
      if (!requested.granted) {
        notifyLeaderboardPointInApp(totalPoints);
        return;
      }
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'STEMM Lab',
        body,
        ...(Platform.OS === 'android' ? { channelId: LEADERBOARD_CHANNEL_ID } : {}),
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Failed to show leaderboard point notification:', error);
    notifyLeaderboardPointInApp(totalPoints);
  }
}
