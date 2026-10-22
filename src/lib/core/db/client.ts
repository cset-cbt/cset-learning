import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';
import * as fullSchema from './schema';

export type LearningSchema = typeof fullSchema;
export type LearningDb = DrizzleD1Database<LearningSchema>;

export function createDb(d1: D1Database): LearningDb {
  return drizzle(d1, { schema: fullSchema });
}
