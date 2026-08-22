import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { RootNavigator } from "@/navigation/RootNavigator";
import { Toast } from "@/components/Toast";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <RootNavigator />
      <Toast />
    </SafeAreaProvider>
  );
}
