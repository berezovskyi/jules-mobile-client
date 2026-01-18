import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface DebugLog {
  timestamp: string;
  message: string;
  level: 'info' | 'warn' | 'error';
}

const logs: DebugLog[] = [];
let setLogsCallback: ((logs: DebugLog[]) => void) | null = null;

export function debugLog(message: string, level: 'info' | 'warn' | 'error' = 'info') {
  const log = {
    timestamp: new Date().toISOString().split('T')[1].slice(0, 12),
    message,
    level,
  };
  logs.push(log);
  console.log(`[DEBUG ${level.toUpperCase()}]`, message);
  // Use setTimeout to avoid setState during render
  if (setLogsCallback) {
    setTimeout(() => {
      if (setLogsCallback) {
        setLogsCallback([...logs]);
      }
    }, 0);
  }
}

export function DebugOverlay() {
  const [visible, setVisible] = useState(true);
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);

  useEffect(() => {
    setLogsCallback = setDebugLogs;
    setDebugLogs([...logs]);

    // Auto-hide after 30 seconds if no errors
    const timer = setTimeout(() => {
      if (!logs.some(l => l.level === 'error')) {
        setVisible(false);
      }
    }, 30000);

    return () => {
      clearTimeout(timer);
      setLogsCallback = null;
    };
  }, []);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.header}>
        <Text style={styles.title}>Debug Log</Text>
        <Text style={styles.close} onPress={() => setVisible(false)}>✕</Text>
      </View>
      <ScrollView style={styles.content}>
        {debugLogs.map((log, i) => (
          <Text key={i} style={[styles.log, styles[log.level]]}>
            {log.timestamp} [{log.level.toUpperCase()}] {log.message}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    maxHeight: 400,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#00ff00',
    zIndex: 9999,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#00ff00',
  },
  title: {
    color: '#00ff00',
    fontSize: 14,
    fontWeight: 'bold',
  },
  close: {
    color: '#00ff00',
    fontSize: 20,
    paddingHorizontal: 10,
  },
  content: {
    padding: 10,
    maxHeight: 350,
  },
  log: {
    fontFamily: 'monospace',
    fontSize: 10,
    marginBottom: 4,
  },
  info: {
    color: '#00ff00',
  },
  warn: {
    color: '#ffaa00',
  },
  error: {
    color: '#ff0000',
  },
});
