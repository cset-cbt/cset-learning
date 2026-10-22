import type { UserRole } from '../auth/session-user';

export interface PolicyUser {
  id: string;
  role: UserRole;
}

export interface PolicyCourse {
  status: 'draft' | 'published';
  ownerId: string;
}

export function isStaff(role: UserRole): boolean {
  return role === 'instructor' || role === 'admin';
}

// Admins manage every course; instructors only their own.
export function canManageCourse(user: PolicyUser, course: { ownerId: string }): boolean {
  return user.role === 'admin' || (user.role === 'instructor' && course.ownerId === user.id);
}

// Published courses are visible to everyone signed in; drafts only to those who can manage them.
export function canViewCourse(user: PolicyUser, course: PolicyCourse): boolean {
  return course.status === 'published' || canManageCourse(user, course);
}

// Lesson, quiz and exercise content needs enrollment in a PUBLISHED course. Owners and admins
// always have access, and a draft is never reachable through enrollment alone.
export function canAccessItems(user: PolicyUser, course: PolicyCourse, enrolled: boolean): boolean {
  return canManageCourse(user, course) || (course.status === 'published' && enrolled);
}
