import { Contact } from "@/types/contact";
import { PAGE_SIZE, SortDirection, SortField, StatusFilter } from "@/store/contact-store";

export function getAllTags(contacts: Contact[]): string[] {
  const tagSet = new Set<string>();
  contacts.forEach((c) => c.tags.forEach((tag) => tagSet.add(tag)));
  return Array.from(tagSet).sort();
}

export function filterAndSortContacts(
  contacts: Contact[],
  options: {
    query: string;
    statusFilter: StatusFilter;
    tagFilter: string | null;
    sortField: SortField;
    sortDirection: SortDirection;
  }
): Contact[] {
  const { query, statusFilter, tagFilter, sortField, sortDirection } = options;
  const q = query.trim().toLowerCase();

  let result = contacts.filter((c) => {
    if (statusFilter !== "All" && c.status !== statusFilter) return false;
    if (tagFilter && !c.tags.includes(tagFilter)) return false;
    if (q) {
      const haystack = `${c.firstName} ${c.lastName} ${c.email} ${c.company}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  result = [...result].sort((a, b) => {
    let compare = 0;
    if (sortField === "name") {
      compare = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    } else if (sortField === "company") {
      compare = a.company.localeCompare(b.company);
    } else {
      compare = a.status.localeCompare(b.status);
    }
    return sortDirection === "asc" ? compare : -compare;
  });

  return result;
}

export function paginate<T>(items: T[], page: number): { items: T[]; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  return { items: items.slice(start, start + PAGE_SIZE), totalPages };
}
