import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { createMovementTracker } from '@/lib/accelerometer-movement';
import { startContinuousHaptics, stopContinuousHaptics } from '@/lib/continuous-haptics';
import { formatOneDecimal } from '@/lib/measurement-input';

type VibrateModeControlProps = {
  isActive: boolean;
  movementCm: string;
  onStart: () => void;
  onStop: (movementCm: number) => void;
  onReset: () => void;
};

export function VibrateModeControl({
  isActive,
  movementCm,
  onStart,
  onStop,
  onReset,
}: VibrateModeControlProps) {
  const { colors } = useAppTheme();
  const trackerRef = useRef(createMovementTracker());
  const onStopRef = useRef(onStop);
  const [liveMovementCm, setLiveMovementCm] = useState<number | null>(null);
  const liveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  onStopRef.current = onStop;

  const stopLiveUpdates = () => {
    if (liveIntervalRef.current) {
      clearInterval(liveIntervalRef.current);
      liveIntervalRef.current = null;
    }
  };

  const stopSession = useCallback(() => {
    stopContinuousHaptics();
    stopLiveUpdates();
    const movement = trackerRef.current.stop();
    setLiveMovementCm(null);
    return movement;
  }, []);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let cancelled = false;

    void (async () => {
      startContinuousHaptics();
      const started = await trackerRef.current.start();
      if (cancelled) {
        stopSession();
        return;
      }
      if (!started) {
        stopContinuousHaptics();
        Alert.alert(
          'Accelerometer unavailable',
          'Allow motion sensor access and use a physical device to measure movement.'
        );
        onStopRef.current(0);
        return;
      }

      liveIntervalRef.current = setInterval(() => {
        setLiveMovementCm(trackerRef.current.getLiveMovementCm());
      }, 100);
    })();

    return () => {
      cancelled = true;
      stopSession();
    };
  }, [isActive, stopSession]);

  const handlePress = () => {
    if (isActive) {
      const movement = stopSession();
      onStop(movement);
      return;
    }
    onStart();
  };

  const handleReset = () => {
    if (isActive) {
      stopSession();
    }
    trackerRef.current.reset();
    setLiveMovementCm(null);
    onReset();
  };

  const displayMovement =
    isActive && liveMovementCm !== null
      ? formatOneDecimal(liveMovementCm)
      : movementCm.trim().length > 0
        ? movementCm
        : '—';

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>Activate vibrate mode</ThemedText>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: isActive ? colors.danger : colors.tint,
            opacity: pressed ? 0.7 : 1,
          },
        ]}>
        <Text style={[styles.buttonText, { color: colors.onTint }]}>{isActive ? 'Stop' : 'Start'}</Text>
      </Pressable>
      {isActive ? (
        <ThemedText style={[styles.hint, { color: colors.muted }]}>
          Vibration active — place phone on structure
        </ThemedText>
      ) : null}

      <ThemedText style={[styles.label, styles.movementLabel]}>
        Measure movement (in cm) for this design
      </ThemedText>
      <View style={[styles.displayBox, { borderColor: colors.borderStrong, backgroundColor: colors.card }]}>
        <ThemedText style={styles.displayText}>
          {displayMovement === '—' ? displayMovement : `${displayMovement} cm`}
        </ThemedText>
        {isActive ? (
          <ThemedText style={[styles.hint, { color: colors.muted }]}>Tracking with accelerometer…</ThemedText>
        ) : movementCm.trim().length > 0 ? (
          <ThemedText style={[styles.hint, { color: colors.muted }]}>Recorded during vibration</ThemedText>
        ) : (
          <ThemedText style={[styles.hint, { color: colors.muted }]}>
            Start vibration to measure movement
          </ThemedText>
        )}
      </View>
      <Pressable
        onPress={handleReset}
        style={({ pressed }) => [
          styles.resetButton,
          {
            backgroundColor: colors.surface,
            borderColor: colors.borderStrong,
            opacity: pressed ? 0.7 : 1,
          },
        ]}>
        <Text style={[styles.resetButtonText, { color: colors.text }]}>Reset</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 8, fontWeight: '600' },
  movementLabel: { marginTop: 12 },
  button: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { fontSize: 16, fontWeight: '600' },
  hint: { fontSize: 13, marginTop: 8 },
  displayBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  displayText: { fontSize: 24, fontWeight: '700' },
  resetButton: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  resetButtonText: { fontSize: 16, fontWeight: '600' },
});
