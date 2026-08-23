export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  tags: string[];
  status: "Active" | "Inactive";
}

export type ContactInput = Omit<Contact, "id">;
