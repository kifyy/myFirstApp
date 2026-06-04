import { Audio } from 'expo-av';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { formatDisplayDb, meteringToDisplayDb } from '@/lib/decibel-metering';

type DecibelRecorderProps = {
  value: number | null;
  onChange: (value: number | null) => void;
};

export function DecibelRecorder({ value, onChange }: DecibelRecorderProps) {
  const { colors } = useAppTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [liveDb, setLiveDb] = useState<number | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const peakMeteringRef = useRef(-160);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const themed = useMemo(
    () =>
      StyleSheet.create({
        displayBox: {
          borderColor: colors.borderStrong,
          backgroundColor: colors.card,
        },
        recordButton: { backgroundColor: colors.tint },
        stopButton: { backgroundColor: colors.danger },
        resetButton: { backgroundColor: colors.surface, borderColor: colors.borderStrong },
        buttonText: { color: colors.onTint },
        resetButtonText: { color: colors.text },
        hint: { color: colors.muted },
      }),
    [colors]
  );

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const cleanupRecording = async () => {
    stopPolling();
    const recording = recordingRef.current;
    recordingRef.current = null;
    if (!recording) {
      return;
    }
    try {
      const status = await recording.getStatusAsync();
      if (status.isRecording) {
        await recording.stopAndUnloadAsync();
      } else {
        await recording.stopAndUnloadAsync();
      }
    } catch {
      // Recording may already be unloaded.
    }
  };

  useEffect(() => {
    return () => {
      stopPolling();
      const recording = recordingRef.current;
      recordingRef.current = null;
      if (recording) {
        void recording.stopAndUnloadAsync().catch(() => undefined);
      }
    };
  }, []);

  const startPolling = (recording: Audio.Recording) => {
    stopPolling();
    pollIntervalRef.current = setInterval(() => {
      void (async () => {
        try {
          const status = await recording.getStatusAsync();
          if (!status.isRecording || typeof status.metering !== 'number') {
            return;
          }
          if (status.metering > peakMeteringRef.current) {
            peakMeteringRef.current = status.metering;
          }
          setLiveDb(meteringToDisplayDb(status.metering));
        } catch {
          // Ignore polling errors while recording stops.
        }
      })();
    }, 100);
  };

  const handleRecordStop = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Microphone metering unavailable',
        'Sound level recording works on iOS and Android devices.'
      );
      return;
    }

    if (isRecording) {
      await cleanupRecording();
      const peakDb = meteringToDisplayDb(peakMeteringRef.current);
      onChange(peakDb);
      setIsRecording(false);
      setLiveDb(peakDb);
      return;
    }

    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Microphone permission required', 'Allow microphone access to measure sound levels.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      peakMeteringRef.current = -160;
      setLiveDb(null);

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
      startPolling(recording);
    } catch (error) {
      console.error('Error starting decibel recording:', error);
      Alert.alert('Recording failed', 'Could not start the microphone. Try again.');
      await cleanupRecording();
      setIsRecording(false);
    }
  };

  const handleReset = async () => {
    await cleanupRecording();
    peakMeteringRef.current = -160;
    setIsRecording(false);
    setLiveDb(null);
    onChange(null);
  };

  const displayDb = isRecording ? liveDb : value;

  return (
    <View style={styles.container}>
      <View style={[styles.displayBox, themed.displayBox]}>
        <ThemedText style={styles.displayText}>{formatDisplayDb(displayDb)}</ThemedText>
        {isRecording ? (
          <ThemedText style={[styles.hint, themed.hint]}>Capturing loudest level…</ThemedText>
        ) : value !== null ? (
          <ThemedText style={[styles.hint, themed.hint]}>Loudest level recorded</ThemedText>
        ) : (
          <ThemedText style={[styles.hint, themed.hint]}>Tap Record to measure noise</ThemedText>
        )}
      </View>
      <View style={styles.buttonRow}>
        <Pressable
          onPress={() => {
            void handleRecordStop();
          }}
          style={({ pressed }) => [
            styles.actionButton,
            isRecording ? themed.stopButton : themed.recordButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}>
          <Text style={[styles.actionButtonText, themed.buttonText]}>
            {isRecording ? 'Stop' : 'Record'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            void handleReset();
          }}
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
  displayText: { fontSize: 28, fontWeight: '700' },
  hint: { fontSize: 13, marginTop: 4 },
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
