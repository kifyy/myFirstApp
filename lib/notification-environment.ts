import Constants from 'expo-constants';

/** True when running inside the Expo Go client (not a dev/production build). */
export function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

/**
 * Device notifications via expo-notifications are unsupported in Expo Go on Android (SDK 53+).
 * Use a development build for real push/local notifications.
 */
export function canUseDeviceNotifications(): boolean {
  return !isExpoGo();
}
