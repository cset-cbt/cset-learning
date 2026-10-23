import type { UserRole } from '$lib/core/auth/session-user';

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string | null;
  banned: boolean;
  banReason: string | null;
  createdAt: string;
}

export interface AdminUserPage {
  users: AdminUserRow[];
  total: number;
}
