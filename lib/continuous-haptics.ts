import * as Haptics from 'expo-haptics';
import { Platform, Vibration } from 'react-native';

const HAPTIC_INTERVAL_MS = 350;
/** Android: vibrate/pause ms. iOS uses fixed ~400ms pulses when repeating. */
const VIBRATION_PATTERN = [0, 500, 200];

let hapticIntervalId: ReturnType<typeof setInterval> | null = null;

export function startContinuousHaptics(): void {
  stopContinuousHaptics();

  if (Platform.OS !== 'web') {
    Vibration.vibrate(VIBRATION_PATTERN, true);
  }

  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  hapticIntervalId = setInterval(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, HAPTIC_INTERVAL_MS);
}

export function stopContinuousHaptics(): void {
  if (Platform.OS !== 'web') {
    Vibration.cancel();
  }
  if (hapticIntervalId !== null) {
    clearInterval(hapticIntervalId);
    hapticIntervalId = null;
  }
}

export function isVibrationSupported(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}
