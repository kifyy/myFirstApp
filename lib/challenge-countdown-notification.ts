import { Platform } from 'react-native';

import { CHALLENGE_COUNTDOWN_NOTIFICATION_ID } from '@/constants/challenge-timer';
import { formatCountdown } from '@/lib/format-countdown';
import { canUseDeviceNotifications } from '@/lib/notification-environment';

async function loadNotificationsModule() {
  return import('expo-notifications');
}

async function ensureChallengeChannel() {
  if (Platform.OS !== 'android' || !canUseDeviceNotifications()) {
    return;
  }

  const Notifications = await loadNotificationsModule();
  await Notifications.setNotificationChannelAsync('challenge-timer', {
    name: 'Challenge Timer',
    importance: Notifications.AndroidImportance.LOW,
    showBadge: false,
  });
}

export async function showChallengeCountdownNotification(
  activityTitle: string,
  remainingMs: number
): Promise<void> {
  if (!canUseDeviceNotifications()) {
    return;
  }

  try {
    const Notifications = await loadNotificationsModule();
    await ensureChallengeChannel();

    await Notifications.scheduleNotificationAsync({
      identifier: CHALLENGE_COUNTDOWN_NOTIFICATION_ID,
      content: {
        title: 'STEMM Lab Challenge',
        body: `${activityTitle} · ${formatCountdown(remainingMs)} remaining`,
        sticky: true,
        autoDismiss: false,
        ...(Platform.OS === 'android' ? { channelId: 'challenge-timer' } : {}),
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Failed to show challenge countdown notification:', error);
  }
}

export async function updateChallengeCountdownNotification(
  activityTitle: string,
  remainingMs: number
): Promise<void> {
  await showChallengeCountdownNotification(activityTitle, remainingMs);
}

export async function dismissChallengeCountdownNotification(): Promise<void> {
  if (!canUseDeviceNotifications()) {
    return;
  }

  try {
    const Notifications = await loadNotificationsModule();
    await Notifications.dismissNotificationAsync(CHALLENGE_COUNTDOWN_NOTIFICATION_ID);
  } catch (error) {
    console.error('Failed to dismiss challenge countdown notification:', error);
  }
}
