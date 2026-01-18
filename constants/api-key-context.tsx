import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { debugLog } from '@/components/debug-overlay';

const API_KEY_STORAGE_KEY = 'jules_api_key';

interface ApiKeyContextType {
  apiKey: string;
  setApiKey: (key: string) => Promise<void>;
  isLoaded: boolean;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

interface ApiKeyProviderProps {
  children: ReactNode;
}

export function ApiKeyProvider({ children }: ApiKeyProviderProps) {
  const [apiKey, setApiKeyState] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load API key on mount
  useEffect(() => {
    const loadApiKey = async () => {
      debugLog('ApiKeyProvider: Loading API key');
      let timeoutId;
      try {
        // Add timeout to prevent hanging on splash screen
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Timeout')), 2000);
        });
        const savedKey = await Promise.race([
          SecureStore.getItemAsync(API_KEY_STORAGE_KEY),
          timeoutPromise
        ]) as string | null;

        if (savedKey) {
          setApiKeyState(savedKey);
          debugLog('ApiKeyProvider: API key loaded');
        } else {
          debugLog('ApiKeyProvider: No saved API key');
        }
      } catch (e) {
        debugLog('ApiKeyProvider: Failed to load API key - ' + (e as Error).message, 'warn');
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
      setIsLoaded(true);
      debugLog('ApiKeyProvider: Load complete');
    };
    void loadApiKey();
  }, []);

  // Save and update API key
  const setApiKey = useCallback(async (key: string) => {
    setApiKeyState(key);
    try {
      await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, key);
    } catch {
      // Ignore
    }
  }, []);

  // Wait for API key to load
  // (Non-blocking: we render immediately to prevent splash screen hang)

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey, isLoaded }}>
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey() {
  const context = useContext(ApiKeyContext);
  if (!context) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
}
