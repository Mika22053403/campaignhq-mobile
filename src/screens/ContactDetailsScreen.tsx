import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { colors } from "@/theme/colors";
import { useContactStore } from "@/store/contact-store";
import type { RootStackParamList } from "@/navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "ContactDetails">;

export default function ContactDetailsScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const contact = useContactStore((state) => state.contacts.find((c) => c.id === id));
  const removeContact = useContactStore((state) => state.removeContact);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!contact) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Contact not found.</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      "Delete contact",
      `Remove ${contact.firstName} ${contact.lastName} from your contacts?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              await removeContact(contact.id);
              navigation.goBack();
            } catch {
              // Store already surfaces a toast on failure; stay on this screen.
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {contact.firstName.charAt(0)}
          {contact.lastName.charAt(0)}
        </Text>
      </View>

      <Text style={styles.name}>
        {contact.firstName} {contact.lastName}
      </Text>

      <View
        style={[
          styles.statusBadge,
          contact.status === "Active" ? styles.statusActive : styles.statusInactive,
        ]}
      >
        <Text
          style={[
            styles.statusText,
            contact.status === "Active" ? styles.statusTextActive : styles.statusTextInactive,
          ]}
        >
          {contact.status}
        </Text>
      </View>

      <View style={styles.card}>
        <DetailRow label="Email" value={contact.email} />
        <DetailRow label="Phone" value={contact.phone} />
        <DetailRow label="Company" value={contact.company} />
      </View>

      {contact.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {contact.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate("ContactForm", { mode: "edit", id: contact.id })}
        >
          <Text style={styles.editButtonText}>Edit contact</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator color={colors.destructive} />
          ) : (
            <Text style={styles.deleteButtonText}>Delete contact</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { alignItems: "center", padding: 24, paddingBottom: 48 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { color: colors.white, fontWeight: "700", fontSize: 22 },
  name: { fontSize: 20, fontWeight: "700", color: colors.foreground },
  statusBadge: { marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  statusActive: { backgroundColor: "#E7F5EC" },
  statusInactive: { backgroundColor: "#F1F1F1" },
  statusText: { fontSize: 12, fontWeight: "700" },
  statusTextActive: { color: "#1E8E4B" },
  statusTextInactive: { color: colors.mutedForeground },
  card: {
    width: "100%",
    marginTop: 24,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 14,
  },
  detailRow: { gap: 3 },
  detailLabel: { fontSize: 12, fontWeight: "600", color: colors.mutedForeground },
  detailValue: { fontSize: 15, color: colors.foreground },
  tagsRow: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  tag: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: { fontSize: 12, fontWeight: "600", color: colors.foreground },
  actions: { width: "100%", marginTop: 28, gap: 10 },
  actionButton: {
    height: 46,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: { backgroundColor: colors.primary },
  editButtonText: { color: colors.primaryForeground, fontWeight: "700", fontSize: 14 },
  deleteButton: { borderWidth: 1, borderColor: colors.destructive },
  deleteButtonText: { color: colors.destructive, fontWeight: "700", fontSize: 14 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.cream },
  emptyText: { color: colors.mutedForeground, fontSize: 14 },
});
