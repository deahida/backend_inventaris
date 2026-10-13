import type { User } from '@/types';

export const mockUsers: User[] = [
  { id: 1, name: "Ahmad Fauzi", email: "admin@procom.test", phone: "081234567890", role: "admin", position: "Administrator" },
  { id: 2, name: "Siti Nurhaliza", email: "cashier@procom.test", phone: "081234567891", role: "cashier", position: "Kasir" },
  { id: 3, name: "Budi Santoso", email: "owner@procom.test", phone: "081234567892", role: "owner", position: "Pemilik" }
];

export const findUserByEmail = (email: string): User | undefined => {
  return mockUsers.find(user => user.email === email);
};
