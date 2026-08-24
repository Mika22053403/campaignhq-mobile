import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import {
  SortDirection,
  SortField,
  StatusFilter,
  VisibleColumns,
  useContactStore,
} from "@/store/contact-store";

interface Props {
  visible: boolean;
  onClose: () => void;
  availableTags: string[];
}

const STATUS_OPTIONS: StatusFilter[] = ["All", "Active", "Inactive"];
const SORT_FIELDS: { field: SortField; label: string }[] = [
  { field: "name", label: "Name" },
  { field: "company", label: "Company" },
  { field: "status", label: "Status" },
];
const COLUMN_LABELS: { key: keyof VisibleColumns; label: string }[] = [
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "company", label: "Company" },
  { key: "status", label: "Status" },
  { key: "tags", label: "Tags" },
];

export function ContactsToolbarModal({ visible, onClose, availableTags }: Props) {
  const {
    statusFilter,
    tagFilter,
    sortField,
    sortDirection,
    visibleColumns,
    setStatusFilter,
    setTagFilter,
    setSort,
    toggleColumn,
    resetFilters,
  } = useContactStore();

  const toggleSortDirection = () =>
    setSort(sortField, sortDirection === "asc" ? "desc" : ("asc" as SortDirection));

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.sheetTitle}>Filter & sort</Text>

          <Text style={styles.sectionLabel}>Status</Text>
          <View style={styles.chipRow}>
            {STATUS_OPTIONS.map((status) => (
              <Pressable
                key={status}
                style={[styles.chip, statusFilter === status && styles.chipSelected]}
                onPress={() => setStatusFilter(status)}
              >
                <Text
                  style={[styles.chipText, statusFilter === status && styles.chipTextSelected]}
                >
                  {status}
                </Text>
              </Pressable>
            ))}
          </View>

          {availableTags.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Tag</Text>
              <View style={styles.chipRow}>
                <Pressable
                  style={[styles.chip, tagFilter === null && styles.chipSelected]}
                  onPress={() => setTagFilter(null)}
                >
                  <Text style={[styles.chipText, tagFilter === null && styles.chipTextSelected]}>
                    All
                  </Text>
                </Pressable>
                {availableTags.map((tag) => (
                  <Pressable
                    key={tag}
                    style={[styles.chip, tagFilter === tag && styles.chipSelected]}
                    onPress={() => setTagFilter(tagFilter === tag ? null : tag)}
                  >
                    <Text style={[styles.chipText, tagFilter === tag && styles.chipTextSelected]}>
                      {tag}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          <Text style={styles.sectionLabel}>Sort by</Text>
          <View style={styles.chipRow}>
            {SORT_FIELDS.map(({ field, label }) => (
              <Pressable
                key={field}
                style={[styles.chip, sortField === field && styles.chipSelected]}
                onPress={() => setSort(field, sortDirection)}
              >
                <Text style={[styles.chipText, sortField === field && styles.chipTextSelected]}>
                  {label}
                </Text>
              </Pressable>
            ))}
            <Pressable style={styles.directionChip} onPress={toggleSortDirection}>
              <Text style={styles.chipText}>{sortDirection === "asc" ? "↑ Asc" : "↓ Desc"}</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>Visible columns</Text>
          <View style={styles.columnList}>
            {COLUMN_LABELS.map(({ key, label }) => (
              <View key={key} style={styles.columnRow}>
                <Text style={styles.columnLabel}>{label}</Text>
                <Switch
                  value={visibleColumns[key]}
                  onValueChange={() => toggleColumn(key)}
                  trackColor={{ true: colors.primary }}
                />
              </View>
            ))}
          </View>

          <View style={styles.footerRow}>
            <Pressable style={styles.resetButton} onPress={resetFilters}>
              <Text style={styles.resetButtonText}>Reset filters</Text>
            </Pressable>
            <Pressable style={styles.doneButton} onPress={onClose}>
              <Text style={styles.doneButtonText}>Done</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  sheet: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  sheetContent: { padding: 20, paddingBottom: 32, gap: 4 },
  sheetTitle: { fontSize: 18, fontWeight: "700", color: colors.foreground, marginBottom: 8 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.mutedForeground,
    marginTop: 16,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.foreground },
  chipTextSelected: { color: colors.primaryForeground },
  directionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  columnList: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  columnRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  columnLabel: { fontSize: 14, color: colors.foreground },
  footerRow: { flexDirection: "row", gap: 10, marginTop: 24 },
  resetButton: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  resetButtonText: { fontSize: 14, fontWeight: "700", color: colors.foreground },
  doneButton: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  doneButtonText: { fontSize: 14, fontWeight: "700", color: colors.primaryForeground },
});
