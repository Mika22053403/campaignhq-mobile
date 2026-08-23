import { create } from "zustand";
import { Share } from "react-native";

import { Contact, ContactInput } from "@/types/contact";
import { contactService } from "@/services/contact.service";
import { useToastStore } from "@/store/toast-store";

export type StatusFilter = "All" | "Active" | "Inactive";
export type SortField = "name" | "company" | "status";
export type SortDirection = "asc" | "desc";

export interface VisibleColumns {
  email: boolean;
  phone: boolean;
  company: boolean;
  tags: boolean;
  status: boolean;
}

const DEFAULT_COLUMNS: VisibleColumns = {
  email: true,
  phone: false,
  company: true,
  tags: true,
  status: true,
};

export const PAGE_SIZE = 5;

interface ContactStore {
  contacts: Contact[];
  isLoading: boolean;
  error: string | null;

  // filters
  query: string;
  statusFilter: StatusFilter;
  tagFilter: string | null;

  // sort
  sortField: SortField;
  sortDirection: SortDirection;

  // pagination
  page: number;

  // column visibility
  visibleColumns: VisibleColumns;

  // selection
  selectionMode: boolean;
  selectedIds: string[];

  // actions
  fetchContacts: () => Promise<void>;
  addContact: (data: ContactInput) => Promise<Contact>;
  editContact: (contact: Contact) => Promise<Contact>;
  removeContact: (id: string) => Promise<void>;
  bulkDeleteContacts: (ids: string[]) => Promise<void>;
  exportContacts: (ids: string[]) => Promise<void>;

  setQuery: (query: string) => void;
  setStatusFilter: (status: StatusFilter) => void;
  setTagFilter: (tag: string | null) => void;
  setSort: (field: SortField, direction: SortDirection) => void;
  setPage: (page: number) => void;
  toggleColumn: (column: keyof VisibleColumns) => void;
  resetFilters: () => void;

  enterSelectionMode: () => void;
  exitSelectionMode: () => void;
  toggleSelect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
}

export const useContactStore = create<ContactStore>((set, get) => ({
  contacts: [],
  isLoading: false,
  error: null,

  query: "",
  statusFilter: "All",
  tagFilter: null,

  sortField: "name",
  sortDirection: "asc",

  page: 1,

  visibleColumns: DEFAULT_COLUMNS,

  selectionMode: false,
  selectedIds: [],

  fetchContacts: async () => {
    set({ isLoading: true, error: null });
    try {
      const contacts = await contactService.getContacts();
      set({ contacts, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Unable to load contacts",
      });
    }
  },

  addContact: async (data) => {
    try {
      const created = await contactService.createContact(data);
      set({ contacts: [...get().contacts, created] });
      useToastStore.getState().show("Contact created successfully!", "success");
      return created;
    } catch (err) {
      useToastStore.getState().show("Unable to create contact. Please try again.", "error");
      throw err;
    }
  },

  editContact: async (contact) => {
    try {
      const updated = await contactService.updateContact(contact);
      set({
        contacts: get().contacts.map((c) => (c.id === updated.id ? updated : c)),
      });
      useToastStore.getState().show("Contact updated successfully!", "success");
      return updated;
    } catch (err) {
      useToastStore.getState().show("Unable to update contact.", "error");
      throw err;
    }
  },

  removeContact: async (id) => {
    const previous = get().contacts;
    set({ contacts: previous.filter((c) => c.id !== id) });
    try {
      await contactService.deleteContact(id);
      useToastStore.getState().show("Contact deleted successfully!", "success");
    } catch (err) {
      set({ contacts: previous });
      useToastStore.getState().show("Unable to delete contact.", "error");
      throw err;
    }
  },

  bulkDeleteContacts: async (ids) => {
    const previous = get().contacts;
    set({
      contacts: previous.filter((c) => !ids.includes(c.id)),
      selectedIds: [],
      selectionMode: false,
    });
    try {
      await Promise.all(ids.map((id) => contactService.deleteContact(id)));
      useToastStore
        .getState()
        .show(`${ids.length} contact${ids.length === 1 ? "" : "s"} deleted.`, "success");
    } catch (err) {
      set({ contacts: previous });
      useToastStore.getState().show("Unable to delete selected contacts.", "error");
      throw err;
    }
  },

  exportContacts: async (ids) => {
    const selected = get().contacts.filter((c) => ids.includes(c.id));
    if (selected.length === 0) return;

    const header = "First Name,Last Name,Email,Phone,Company,Status,Tags";
    const rows = selected.map((c) =>
      [c.firstName, c.lastName, c.email, c.phone, c.company, c.status, c.tags.join(" | ")]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header, ...rows].join("\n");

    try {
      await Share.share({
        title: "contacts.csv",
        message: csv,
      });
      useToastStore
        .getState()
        .show(`Exported ${selected.length} contact${selected.length === 1 ? "" : "s"}.`, "success");
    } catch {
      useToastStore.getState().show("Unable to export contacts.", "error");
    }
  },

  setQuery: (query) => set({ query, page: 1 }),
  setStatusFilter: (statusFilter) => set({ statusFilter, page: 1 }),
  setTagFilter: (tagFilter) => set({ tagFilter, page: 1 }),
  setSort: (sortField, sortDirection) => set({ sortField, sortDirection }),
  setPage: (page) => set({ page }),
  toggleColumn: (column) =>
    set((state) => ({
      visibleColumns: { ...state.visibleColumns, [column]: !state.visibleColumns[column] },
    })),
  resetFilters: () => set({ query: "", statusFilter: "All", tagFilter: null, page: 1 }),

  enterSelectionMode: () => set({ selectionMode: true, selectedIds: [] }),
  exitSelectionMode: () => set({ selectionMode: false, selectedIds: [] }),
  toggleSelect: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((sid) => sid !== id)
        : [...state.selectedIds, id],
    })),
  selectAll: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),
}));
