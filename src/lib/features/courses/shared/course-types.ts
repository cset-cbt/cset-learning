export const COURSE_STATUSES = ['draft', 'published'] as const;
export type CourseStatus = (typeof COURSE_STATUSES)[number];

export const ITEM_TYPES = ['lesson', 'quiz', 'exercise'] as const;
export type ItemType = (typeof ITEM_TYPES)[number];
