import { Alert, Platform } from 'react-native';

import { canUseDeviceNotifications } from '@/lib/notification-environment';

const CHALLENGE_STARTED_MESSAGE = 'Challenge has started! Time to experiment!';

let handlerConfigured = false;

async function loadNotificationsModule() {
  return import('expo-notifications');
}

function notifyChallengeStartedInApp(): void {
  Alert.alert('STEMM Lab', CHALLENGE_STARTED_MESSAGE);
}

export function configureChallengeNotifications() {
  if (!canUseDeviceNotifications()) {
    return;
  }

  if (handlerConfigured) {
    return;
  }

  void (async () => {
    try {
      const Notifications = await loadNotificationsModule();
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
      handlerConfigured = true;
    } catch (error) {
      console.error('Failed to configure challenge notifications:', error);
    }
  })();
}

async function ensureNotificationPermissions(): Promise<boolean> {
  const Notifications = await loadNotificationsModule();
  configureChallengeNotifications();

  try {
    const existing = await Notifications.getPermissionsAsync();
    if (existing.granted) {
      return true;
    }

    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch (error) {
    console.error('Failed to request notification permissions:', error);
    return false;
  }
}

async function notifyChallengeStartedWithDevice(activityTitle: string): Promise<void> {
  const Notifications = await loadNotificationsModule();
  configureChallengeNotifications();

  const granted = await ensureNotificationPermissions();
  if (!granted) {
    notifyChallengeStartedInApp();
    return;
  }

  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('challenge-timer', {
        name: 'Challenge Timer',
        importance: Notifications.AndroidImportance.HIGH,
      });
    } catch (error) {
      console.error('Failed to set notification channel:', error);
      notifyChallengeStartedInApp();
      return;
    }
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'STEMM Lab',
        body: CHALLENGE_STARTED_MESSAGE,
        data: { activityTitle },
        ...(Platform.OS === 'android' ? { channelId: 'challenge-timer' } : {}),
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Failed to schedule challenge notification:', error);
    notifyChallengeStartedInApp();
  }
}

export async function notifyChallengeStarted(activityTitle: string): Promise<void> {
  if (!canUseDeviceNotifications()) {
    notifyChallengeStartedInApp();
    return;
  }

  await notifyChallengeStartedWithDevice(activityTitle);
}
