import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { useEffect, useRef } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { I18nProvider } from '@/constants/i18n-context';
import { ApiKeyProvider } from '@/constants/api-key-context';
import { DebugOverlay, debugLog } from '@/components/debug-overlay';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
// Wrap in try-catch to prevent crash on Android 16 devices.
debugLog('App initialization started');
try {
  SplashScreen.preventAutoHideAsync().catch((e) => {
    debugLog('preventAutoHideAsync failed: ' + e.message, 'warn');
  });
  debugLog('preventAutoHideAsync called successfully');
} catch (e) {
  debugLog('preventAutoHideAsync threw sync error: ' + (e as Error).message, 'error');
}

// Fallback: force hide splash screen after 3 seconds no matter what
const fallbackTimeout = setTimeout(() => {
  debugLog('Fallback timer triggered - forcing splash hide', 'warn');
  SplashScreen.hideAsync().catch(() => {});
}, 3000);

function LayoutContent() {
  debugLog('LayoutContent rendering');
  const colorScheme = useColorScheme();
  const hasHiddenSplash = useRef(false);

  useEffect(() => {
    debugLog('LayoutContent mounted - attempting to hide splash');
    // Hide splash screen once the navigation hierarchy is mounted
    if (!hasHiddenSplash.current) {
      hasHiddenSplash.current = true;
      clearTimeout(fallbackTimeout);
      SplashScreen.hideAsync().catch((e) => {
        debugLog('hideAsync failed: ' + e.message, 'error');
      }).then(() => {
        debugLog('Splash screen hidden successfully');
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
      <DebugOverlay />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  debugLog('RootLayout rendering');
  return (
    <ApiKeyProvider>
      <I18nProvider>
        <LayoutContent />
      </I18nProvider>
    </ApiKeyProvider>
  );
}

