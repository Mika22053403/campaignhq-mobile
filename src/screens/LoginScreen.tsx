import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { CampaignHQLogo } from "@/components/CampaignHQLogo";
import { colors } from "@/theme/colors";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth-store";
import { loginSchema } from "@/schemas/login.schema";
import type { RootStackParamList } from "@/navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("admin@campaignhq.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setFormError(null);

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as "email" | "password";
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    try {
      setIsSubmitting(true);
      const response = await authService.login(result.data);
      login(response.token, response.user);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <CampaignHQLogo markOnly height={64} />
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your CampaignHQ workspace</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="you@company.com"
              placeholderTextColor={colors.mutedForeground}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                placeholder="••••••••"
                placeholderTextColor={colors.mutedForeground}
              />
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                style={styles.togglePassword}
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              >
                <Text style={styles.toggleText}>{showPassword ? "Hide" : "Show"}</Text>
              </Pressable>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <Pressable style={styles.forgotRow}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          {formError && <Text style={styles.formError}>{formError}</Text>}

          <Pressable
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleLogin}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={styles.submitButtonText}>Login</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to CampaignHQ? </Text>
          <Pressable onPress={() => navigation.navigate("Signup")}>
            <Text style={styles.footerLink}>Start Free</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
    paddingBottom: 120,
  },
  header: { alignItems: "center", marginBottom: 32 },
  title: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: "700",
    color: colors.foreground,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: "center",
  },
  form: { gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: "600", color: colors.foreground },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    backgroundColor: colors.white,
    color: colors.foreground,
  },
  passwordRow: { position: "relative", justifyContent: "center" },
  passwordInput: { paddingRight: 60 },
  togglePassword: { position: "absolute", right: 14 },
  toggleText: { fontSize: 13, fontWeight: "600", color: colors.mutedForeground },
  errorText: { fontSize: 12, color: colors.destructive },
  formError: {
    fontSize: 13,
    color: colors.destructive,
    textAlign: "center",
  },
  forgotRow: { alignItems: "flex-end" },
  forgotText: { fontSize: 13, fontWeight: "600", color: colors.mutedForeground },
  submitButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: colors.primaryForeground, fontSize: 16, fontWeight: "700" },
  footer: {
    marginTop: 28,
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: { fontSize: 13, color: colors.mutedForeground },
  footerLink: { fontSize: 13, fontWeight: "700", color: colors.foreground },
});