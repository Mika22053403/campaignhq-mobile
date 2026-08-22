import React from "react";
import { Pressable, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "@/screens/LoginScreen";
import SignupScreen from "@/screens/SignupScreen";
import ContactsScreen from "@/screens/ContactsScreen";
import ContactDetailsScreen from "@/screens/ContactDetailsScreen";
import ContactFormScreen from "@/screens/ContactFormScreen";
import { CampaignHQLogo } from "@/components/CampaignHQLogo";
import { colors } from "@/theme/colors";
import { useAuthStore } from "@/store/auth-store";

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Contacts: undefined;
  ContactDetails: { id: string };
  ContactForm: { mode: "create" } | { mode: "edit"; id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.cream },
          headerShadowVisible: false,
          headerTintColor: colors.foreground,
          headerTitleStyle: { color: colors.foreground },
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen
              name="Contacts"
              component={ContactsScreen}
              options={{
                headerTitle: () => <CampaignHQLogo height={22} />,
                headerRight: () => (
                  <Pressable onPress={logout} hitSlop={8}>
                    <Text style={{ color: colors.mutedForeground, fontWeight: "600" }}>
                      Log out
                    </Text>
                  </Pressable>
                ),
              }}
            />
            <Stack.Screen
              name="ContactDetails"
              component={ContactDetailsScreen}
              options={{ title: "Contact" }}
            />
            <Stack.Screen
              name="ContactForm"
              component={ContactFormScreen}
              options={{ title: "New contact" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
