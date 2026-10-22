// Single import surface for every table. drizzle-kit reads the individual schema files
// (see drizzle.config.ts); application code imports the tables from here or from a feature.
export * from './better-auth-schema';
export * from './audit-schema';
export * from '../../features/courses/schema';
export * from '../../features/lessons/schema';
export * from '../../features/quizzes/schema';
export * from '../../features/exercises/schema';
