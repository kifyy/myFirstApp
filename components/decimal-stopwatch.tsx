import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { formatOneDecimal, parseOneDecimal } from '@/lib/measurement-input';

type DecimalStopwatchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function DecimalStopwatch({ value, onChange }: DecimalStopwatchProps) {
  const { colors } = useAppTheme();
  const [isRunning, setIsRunning] = useState(false);
  const [liveMs, setLiveMs] = useState(0);
  const startAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) {
      return;
    }
    const intervalId = setInterval(() => {
      if (startAtRef.current !== null) {
        setLiveMs(Date.now() - startAtRef.current);
      }
    }, 100);
    return () => clearInterval(intervalId);
  }, [isRunning]);

  const displaySeconds = useMemo(() => {
    if (isRunning) {
      return formatOneDecimal(liveMs / 1000);
    }
    const parsed = parseOneDecimal(value);
    return parsed !== null ? formatOneDecimal(parsed) : '0.0';
  }, [isRunning, liveMs, value]);

  const themed = useMemo(
    () =>
      StyleSheet.create({
        displayBox: {
          borderColor: colors.borderStrong,
          backgroundColor: colors.card,
        },
        startButton: { backgroundColor: colors.tint },
        stopButton: { backgroundColor: colors.danger },
        resetButton: { backgroundColor: colors.surface, borderColor: colors.borderStrong },
        buttonText: { color: colors.onTint },
        resetButtonText: { color: colors.text },
      }),
    [colors]
  );

  const handleStartStop = () => {
    if (isRunning) {
      const elapsedMs = Date.now() - (startAtRef.current ?? Date.now());
      onChange(formatOneDecimal(elapsedMs / 1000));
      setIsRunning(false);
      startAtRef.current = null;
      setLiveMs(elapsedMs);
      return;
    }
    startAtRef.current = Date.now();
    setLiveMs(0);
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    startAtRef.current = null;
    setLiveMs(0);
    onChange('');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.displayBox, themed.displayBox]}>
        <ThemedText style={styles.displayText}>{displaySeconds} s</ThemedText>
      </View>
      <View style={styles.buttonRow}>
        <Pressable
          onPress={handleStartStop}
          style={({ pressed }) => [
            styles.actionButton,
            isRunning ? themed.stopButton : themed.startButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}>
          <Text style={[styles.actionButtonText, themed.buttonText]}>{isRunning ? 'Stop' : 'Start'}</Text>
        </Pressable>
        <Pressable
          onPress={handleReset}
          style={({ pressed }) => [
            styles.actionButton,
            themed.resetButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}>
          <Text style={[styles.actionButtonText, themed.resetButtonText]}>Reset</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  displayBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  displayText: { fontSize: 24, fontWeight: '700' },
  buttonRow: { flexDirection: 'row', gap: 10 },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actionButtonText: { fontSize: 16, fontWeight: '600' },
});
