import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { useEffect, useRef } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { I18nProvider } from '@/constants/i18n-context';
import { ApiKeyProvider } from '@/constants/api-key-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
// Wrap in try-catch to prevent crash on Android 16 devices.
try {
  SplashScreen.preventAutoHideAsync().catch(() => {
    // Ignore errors - splash screen may already be hidden or not available
  });
} catch {
  // Ignore synchronous errors
}

// Fallback: force hide splash screen after 3 seconds no matter what
const fallbackTimeout = setTimeout(() => {
  SplashScreen.hideAsync().catch(() => {});
}, 3000);

function LayoutContent() {
  const colorScheme = useColorScheme();
  const hasHiddenSplash = useRef(false);

  useEffect(() => {
    // Hide splash screen once the navigation hierarchy is mounted
    if (!hasHiddenSplash.current) {
      hasHiddenSplash.current = true;
      clearTimeout(fallbackTimeout);
      SplashScreen.hideAsync().catch(() => {
        // Ignore errors - splash screen may already be hidden
      });
    }
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="create-session" options={{ presentation: 'modal', title: 'New Task' }} />
        <Stack.Screen name="session/[id]" options={{ title: 'Session' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ApiKeyProvider>
      <I18nProvider>
        <LayoutContent />
      </I18nProvider>
    </ApiKeyProvider>
  );
}

