import { Contact, ContactInput } from "@/types/contact";

/**
 * Mirrors the mock API behaviour used by the CampaignHQ web app
 * (mocks/data/contacts.ts + mocks/handlers/contact.ts). Swap the bodies
 * of these functions for real axios/fetch calls once a backend exists -
 * the payload/response shapes already match `types/contact.ts` on the
 * web app.
 */
let contacts: Contact[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "9876543210",
    company: "Google",
    tags: ["Customer", "VIP"],
    status: "Active",
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@example.com",
    phone: "9876543211",
    company: "Microsoft",
    tags: ["Lead"],
    status: "Inactive",
  },
  {
    id: "3",
    firstName: "Alex",
    lastName: "Johnson",
    email: "alex@example.com",
    phone: "9876543212",
    company: "Amazon",
    tags: ["Enterprise", "Customer"],
    status: "Active",
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const generateId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const contactService = {
  async getContacts(): Promise<Contact[]> {
    await delay(400);
    return [...contacts];
  },

  async getContact(id: string): Promise<Contact | undefined> {
    await delay(200);
    return contacts.find((contact) => contact.id === id);
  },

  async createContact(data: ContactInput): Promise<Contact> {
    await delay(400);
    const newContact: Contact = { id: generateId(), ...data };
    contacts.push(newContact);
    return newContact;
  },

  async updateContact(contact: Contact): Promise<Contact> {
    await delay(400);
    const index = contacts.findIndex((c) => c.id === contact.id);
    if (index === -1) {
      throw new Error("Contact not found");
    }
    contacts[index] = { ...contacts[index], ...contact };
    return contacts[index];
  },

  async deleteContact(id: string): Promise<void> {
    await delay(300);
    const index = contacts.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error("Contact not found");
    }
    contacts.splice(index, 1);
  },
};
