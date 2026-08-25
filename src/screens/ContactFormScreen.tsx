import React, { useEffect, useMemo, useState } from "react";
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

import { colors } from "@/theme/colors";
import { useContactStore } from "@/store/contact-store";
import { contactSchema } from "@/schemas/contact.schema";
import { getAllTags } from "@/utils/contact-filters";
import type { RootStackParamList } from "@/navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "ContactForm">;

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  status: "Active" | "Inactive";
}

const emptyValues: FormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  status: "Active",
};

export default function ContactFormScreen({ route, navigation }: Props) {
  const params = route.params;
  const isEdit = params.mode === "edit";
  const id = params.mode === "edit" ? params.id : undefined;

  const contacts = useContactStore((state) => state.contacts);
  const existing = useContactStore((state) =>
    isEdit ? state.contacts.find((c) => c.id === id) : undefined
  );
  const addContact = useContactStore((state) => state.addContact);
  const editContact = useContactStore((state) => state.editContact);

  const [values, setValues] = useState<FormValues>(existing ?? emptyValues);
  const [tags, setTags] = useState<string[]>(existing?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingTags = useMemo(
    () => getAllTags(contacts).filter((tag) => !tags.includes(tag)),
    [contacts, tags]
  );

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag || tags.includes(tag)) {
      setTagInput("");
      return;
    }
    setTags((prev) => [...prev, tag]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  useEffect(() => {
    navigation.setOptions({ title: isEdit ? "Edit contact" : "New contact" });
  }, [navigation, isEdit]);

  const validation = useMemo(() => contactSchema.safeParse(values), [values]);
  const isValid = validation.success;

  const setField = (field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const result = contactSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormValues, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormValues;
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    try {
      setIsSubmitting(true);
      if (isEdit && existing) {
        await editContact({ ...existing, ...result.data, tags });
      } else {
        await addContact({ ...result.data, tags });
      }
      navigation.goBack();
    } catch {
      // Store already surfaces a toast on failure; stay on the form so the user can retry.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Field
          label="First name"
          value={values.firstName}
          onChangeText={(v) => setField("firstName", v)}
          error={errors.firstName}
          autoComplete="given-name"
        />
        <Field
          label="Last name"
          value={values.lastName}
          onChangeText={(v) => setField("lastName", v)}
          error={errors.lastName}
          autoComplete="family-name"
        />
        <Field
          label="Email"
          value={values.email}
          onChangeText={(v) => setField("email", v)}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <Field
          label="Phone"
          value={values.phone}
          onChangeText={(v) => setField("phone", v)}
          error={errors.phone}
          keyboardType="phone-pad"
        />
        <Field
          label="Company"
          value={values.company}
          onChangeText={(v) => setField("company", v)}
          error={errors.company}
          autoComplete="organization"
        />

        <View style={styles.field}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusToggle}>
            {(["Active", "Inactive"] as const).map((status) => (
              <Pressable
                key={status}
                style={[
                  styles.statusOption,
                  values.status === status && styles.statusOptionSelected,
                ]}
                onPress={() => setField("status", status)}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    values.status === status && styles.statusOptionTextSelected,
                  ]}
                >
                  {status}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Tags</Text>

          {tags.length > 0 && (
            <View style={styles.tagChipRow}>
              {tags.map((tag) => (
                <Pressable key={tag} style={styles.tagChip} onPress={() => removeTag(tag)}>
                  <Text style={styles.tagChipText}>{tag}</Text>
                  <Text style={styles.tagChipRemove}>×</Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.tagInputRow}>
            <TextInput
              style={[styles.input, styles.tagInput]}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Add a tag..."
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={() => addTag(tagInput)}
            />
            <Pressable
              style={[styles.tagAddButton, !tagInput.trim() && styles.tagAddButtonDisabled]}
              onPress={() => addTag(tagInput)}
              disabled={!tagInput.trim()}
            >
              <Text style={styles.tagAddButtonText}>Add</Text>
            </Pressable>
          </View>

          {existingTags.length > 0 && (
            <View style={styles.tagSuggestionRow}>
              {existingTags.map((tag) => (
                <Pressable key={tag} style={styles.tagSuggestion} onPress={() => addTag(tag)}>
                  <Text style={styles.tagSuggestionText}>+ {tag}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <Pressable
          style={[styles.submitButton, (!isValid || isSubmitting) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEdit ? "Save changes" : "Add contact"}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "words" | "sentences";
  autoComplete?: "given-name" | "family-name" | "email" | "organization";
}

function Field({ label, value, onChangeText, error, ...rest }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.mutedForeground}
        {...rest}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 20, gap: 16, paddingBottom: 48 },
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
  errorText: { fontSize: 12, color: colors.destructive },
  statusToggle: { flexDirection: "row", gap: 10 },
  statusOption: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  statusOptionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  statusOptionText: { fontSize: 14, fontWeight: "600", color: colors.foreground },
  statusOptionTextSelected: { color: colors.primaryForeground },
  tagChipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
  },
  tagChipText: { fontSize: 12, fontWeight: "600", color: colors.foreground },
  tagChipRemove: { fontSize: 15, fontWeight: "700", color: colors.mutedForeground },
  tagInputRow: { flexDirection: "row", gap: 8 },
  tagInput: { flex: 1 },
  tagAddButton: {
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  tagAddButtonDisabled: { opacity: 0.4 },
  tagAddButtonText: { color: colors.primaryForeground, fontWeight: "700", fontSize: 13 },
  tagSuggestionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  tagSuggestion: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagSuggestionText: { fontSize: 12, fontWeight: "600", color: colors.mutedForeground },
  submitButton: {
    marginTop: 8,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: colors.primaryForeground, fontSize: 16, fontWeight: "700" },
});
