export const USER_ROLES = ['student', 'instructor', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string | null;
  createdAt?: string | null;
}

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && (USER_ROLES as readonly string[]).includes(value);
}

// An unknown or missing role degrades to the least privileged one.
export function toSessionUser(user: {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  image?: string | null;
  createdAt?: Date | string | null;
}): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: isUserRole(user.role) ? user.role : 'student',
    image: user.image ?? null,
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null
  };
}
