import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/theme/colors";
import { useContactStore } from "@/store/contact-store";
import { Contact } from "@/types/contact";
import { filterAndSortContacts, getAllTags, paginate } from "@/utils/contact-filters";
import { ContactsToolbarModal } from "@/components/ContactsToolbarModal";
import type { RootStackParamList } from "@/navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Contacts">;

export default function ContactsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const {
    contacts,
    isLoading,
    error,
    query,
    statusFilter,
    tagFilter,
    sortField,
    sortDirection,
    page,
    visibleColumns,
    selectionMode,
    selectedIds,
    fetchContacts,
    setQuery,
    setPage,
    enterSelectionMode,
    exitSelectionMode,
    toggleSelect,
    selectAll,
    bulkDeleteContacts,
    exportContacts,
  } = useContactStore();

  const [refreshing, setRefreshing] = useState(false);
  const [toolbarVisible, setToolbarVisible] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchContacts();
    setRefreshing(false);
  };

  const availableTags = useMemo(() => getAllTags(contacts), [contacts]);

  const filteredSorted = useMemo(
    () =>
      filterAndSortContacts(contacts, {
        query,
        statusFilter,
        tagFilter,
        sortField,
        sortDirection,
      }),
    [contacts, query, statusFilter, tagFilter, sortField, sortDirection]
  );

  const { items: pageItems, totalPages } = useMemo(
    () => paginate(filteredSorted, page),
    [filteredSorted, page]
  );

  const activeFilterCount =
    (statusFilter !== "All" ? 1 : 0) + (tagFilter ? 1 : 0);

  const allOnPageSelected =
    pageItems.length > 0 && pageItems.every((c) => selectedIds.includes(c.id));

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    Alert.alert(
      "Delete contacts",
      `Delete ${selectedIds.length} selected contact${selectedIds.length === 1 ? "" : "s"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => bulkDeleteContacts(selectedIds),
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Contact }) => {
    const isSelected = selectedIds.includes(item.id);

    return (
      <Pressable
        style={styles.row}
        onPress={() =>
          selectionMode
            ? toggleSelect(item.id)
            : navigation.navigate("ContactDetails", { id: item.id })
        }
        onLongPress={() => {
          if (!selectionMode) enterSelectionMode();
          toggleSelect(item.id);
        }}
      >
        {selectionMode && (
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Text style={styles.checkboxMark}>✓</Text>}
          </View>
        )}

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.firstName.charAt(0)}
            {item.lastName.charAt(0)}
          </Text>
        </View>

        <View style={styles.rowBody}>
          <Text style={styles.rowName}>
            {item.firstName} {item.lastName}
          </Text>

          <View style={styles.rowMetaWrap}>
            {visibleColumns.company && (
              <Text style={styles.rowMeta} numberOfLines={1}>
                {item.company}
              </Text>
            )}
            {visibleColumns.email && (
              <Text style={styles.rowMeta} numberOfLines={1}>
                {item.email}
              </Text>
            )}
            {visibleColumns.phone && (
              <Text style={styles.rowMeta} numberOfLines={1}>
                {item.phone}
              </Text>
            )}
          </View>

          {visibleColumns.tags && item.tags.length > 0 && (
            <View style={styles.tagRow}>
              {item.tags.map((tag) => (
                <View key={tag} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {visibleColumns.status && (
          <View
            style={[
              styles.statusBadge,
              item.status === "Active" ? styles.statusActive : styles.statusInactive,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.status === "Active" ? styles.statusTextActive : styles.statusTextInactive,
              ]}
            >
              {item.status}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {selectionMode ? (
        <View style={styles.selectionBar}>
          <Pressable onPress={exitSelectionMode} hitSlop={8}>
            <Text style={styles.selectionCancel}>Cancel</Text>
          </Pressable>
          <Text style={styles.selectionCount}>{selectedIds.length} selected</Text>
          <Pressable
            onPress={() =>
              allOnPageSelected ? selectAll([]) : selectAll(pageItems.map((c) => c.id))
            }
            hitSlop={8}
          >
            <Text style={styles.selectionAction}>
              {allOnPageSelected ? "Deselect all" : "Select all"}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.header}>
          <Text style={styles.title}>Contacts</Text>
          <View style={styles.headerActions}>
            <Pressable style={styles.iconButton} onPress={enterSelectionMode}>
              <Text style={styles.iconButtonText}>Select</Text>
            </Pressable>
            <Pressable
              style={styles.addButton}
              onPress={() => navigation.navigate("ContactForm", { mode: "create" })}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </Pressable>
          </View>
        </View>
      )}

      {!selectionMode && (
        <View style={styles.toolbarRow}>
          <TextInput
            style={styles.search}
            value={query}
            onChangeText={setQuery}
            placeholder="Search contacts..."
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="none"
          />
          <Pressable style={styles.filterButton} onPress={() => setToolbarVisible(true)}>
            <Text style={styles.filterButtonText}>
              Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </Text>
          </Pressable>
        </View>
      )}

      {isLoading && contacts.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.centeredText}>Loading contacts…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.centeredText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={fetchContacts}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </Pressable>
        </View>
      ) : filteredSorted.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>
            {query || activeFilterCount > 0
              ? "No contacts match your filters."
              : "No contacts yet. Tap + Add to create one."}
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={pageItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          />

          <View style={[styles.paginationBar, { paddingBottom: Math.max(12, insets.bottom) }]}>
            <Pressable
              style={[styles.pageButton, page <= 1 && styles.pageButtonDisabled]}
              onPress={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              <Text style={styles.pageButtonText}>Prev</Text>
            </Pressable>
            <Text style={styles.pageLabel}>
              Page {Math.min(page, totalPages)} of {totalPages}
            </Text>
            <Pressable
              style={[styles.pageButton, page >= totalPages && styles.pageButtonDisabled]}
              onPress={() => setPage(page + 1)}
              disabled={page >= totalPages}
            >
              <Text style={styles.pageButtonText}>Next</Text>
            </Pressable>
          </View>
        </>
      )}

      {selectionMode && selectedIds.length > 0 && (
        <View style={[styles.bulkBar, { paddingBottom: Math.max(12, insets.bottom) }]}>
          <Pressable style={styles.bulkButton} onPress={() => exportContacts(selectedIds)}>
            <Text style={styles.bulkButtonText}>Export</Text>
          </Pressable>
          <Pressable
            style={[styles.bulkButton, styles.bulkDeleteButton]}
            onPress={handleBulkDelete}
          >
            <Text style={styles.bulkDeleteButtonText}>Delete</Text>
          </Pressable>
        </View>
      )}

      <ContactsToolbarModal
        visible={toolbarVisible}
        onClose={() => setToolbarVisible(false)}
        availableTags={availableTags}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream, paddingTop: 8 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: { fontSize: 24, fontWeight: "700", color: colors.foreground },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  iconButtonText: { color: colors.foreground, fontWeight: "600", fontSize: 13 },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  addButtonText: { color: colors.primaryForeground, fontWeight: "700", fontSize: 13 },
  toolbarRow: {
    flexDirection: "row",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  search: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
    fontSize: 14,
    color: colors.foreground,
  },
  filterButton: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonText: { fontSize: 13, fontWeight: "600", color: colors.foreground },
  selectionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  selectionCancel: { fontSize: 14, color: colors.mutedForeground, fontWeight: "600" },
  selectionCount: { fontSize: 15, fontWeight: "700", color: colors.foreground },
  selectionAction: { fontSize: 14, color: colors.primary, fontWeight: "700" },
  listContent: { paddingHorizontal: 20, paddingBottom: 12 },
  separator: { height: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxMark: { color: colors.white, fontSize: 13, fontWeight: "700" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.white, fontWeight: "700", fontSize: 13 },
  rowBody: { flex: 1, gap: 2 },
  rowName: { fontSize: 15, fontWeight: "600", color: colors.foreground },
  rowMetaWrap: { gap: 1 },
  rowMeta: { fontSize: 12, color: colors.mutedForeground },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  tagChip: {
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagChipText: { fontSize: 10, fontWeight: "600", color: colors.foreground },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusActive: { backgroundColor: "#E7F5EC" },
  statusInactive: { backgroundColor: "#F1F1F1" },
  statusText: { fontSize: 11, fontWeight: "700" },
  statusTextActive: { color: "#1E8E4B" },
  statusTextInactive: { color: colors.mutedForeground },
  paginationBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pageButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  pageButtonDisabled: { opacity: 0.4 },
  pageButtonText: { fontSize: 13, fontWeight: "600", color: colors.foreground },
  pageLabel: { fontSize: 13, color: colors.mutedForeground },
  bulkBar: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  bulkButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  bulkButtonText: { fontSize: 14, fontWeight: "700", color: colors.foreground },
  bulkDeleteButton: { borderColor: colors.destructive },
  bulkDeleteButtonText: { fontSize: 14, fontWeight: "700", color: colors.destructive },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
    paddingHorizontal: 32,
    gap: 8,
  },
  centeredText: { color: colors.mutedForeground, fontSize: 13, textAlign: "center" },
  errorTitle: { fontSize: 15, fontWeight: "700", color: colors.destructive },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  retryButtonText: { color: colors.primaryForeground, fontWeight: "700", fontSize: 13 },
  emptyText: { color: colors.mutedForeground, fontSize: 14, textAlign: "center" },
});