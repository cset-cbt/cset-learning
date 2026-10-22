import { describe, expect, it } from 'vitest';
import {
  canAccessItems,
  canManageCourse,
  canViewCourse
} from '../src/lib/core/policy/access-control';

const student = { id: 'student-1', role: 'student' as const };
const owner = { id: 'teacher-1', role: 'instructor' as const };
const otherTeacher = { id: 'teacher-2', role: 'instructor' as const };
const admin = { id: 'admin-1', role: 'admin' as const };

const draft = { status: 'draft' as const, ownerId: owner.id };
const published = { status: 'published' as const, ownerId: owner.id };

describe('course access policy', () => {
  it('lets only admins and the owning instructor manage a course', () => {
    expect(canManageCourse(admin, draft)).toBe(true);
    expect(canManageCourse(owner, draft)).toBe(true);
    expect(canManageCourse(otherTeacher, draft)).toBe(false);
    expect(canManageCourse(student, draft)).toBe(false);
  });

  it('shows drafts to the owner and admins only, published courses to everyone', () => {
    expect(canViewCourse(owner, draft)).toBe(true);
    expect(canViewCourse(admin, draft)).toBe(true);
    expect(canViewCourse(student, draft)).toBe(false);
    expect(canViewCourse(otherTeacher, draft)).toBe(false);
    expect(canViewCourse(student, published)).toBe(true);
  });

  it('requires enrollment for students and never opens a draft through enrollment', () => {
    expect(canAccessItems(student, published, false)).toBe(false);
    expect(canAccessItems(student, published, true)).toBe(true);
    expect(canAccessItems(student, draft, true)).toBe(false);
    expect(canAccessItems(otherTeacher, published, false)).toBe(false);
    expect(canAccessItems(otherTeacher, published, true)).toBe(true);
  });

  it('gives owners and admins access to items without enrollment, drafts included', () => {
    expect(canAccessItems(owner, draft, false)).toBe(true);
    expect(canAccessItems(admin, draft, false)).toBe(true);
    expect(canAccessItems(admin, published, false)).toBe(true);
  });
});
