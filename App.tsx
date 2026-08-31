import React, { useCallback, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { RootNavigator } from "@/navigation/RootNavigator";
import { Toast } from "@/components/Toast";
import { useAuthStore } from "@/store/auth-store";

// Keep the native splash screen visible while we restore persisted auth state
// from AsyncStorage, instead of letting it auto-hide before we know whether
// the user is logged in.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* no-op: safe to ignore if this is called more than once */
});

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Zustand's persist middleware rehydrates asynchronously; this resolves
    // once auth-store has finished reading from AsyncStorage.
    const unsub = useAuthStore.persist.onFinishHydration(() => setIsReady(true));
    if (useAuthStore.persist.hasHydrated()) {
      setIsReady(true);
    }
    return unsub;
  }, []);

  const handleLayout = useCallback(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={handleLayout}>
      <StatusBar style="dark" />
      <RootNavigator />
      <Toast />
    </SafeAreaProvider>
  );
}