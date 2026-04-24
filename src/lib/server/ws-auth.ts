import { randomBytes, randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { users, wsTokens } from '$lib/server/db/schema';

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export async function generateWsToken(userId: string) {
	const now = new Date();
	const token = randomBytes(32).toString('hex');

	await db.insert(wsTokens).values({
		id: randomUUID(),
		token,
		userId,
		createdAt: now,
		expiresAt: new Date(now.getTime() + TOKEN_TTL_MS)
	});

	return token;
}

export async function validateWsToken(token: string) {
	const [record] = await db.select().from(wsTokens).where(eq(wsTokens.token, token)).limit(1);

	if (!record) return null;

	const now = new Date();
	if (record.expiresAt <= now) {
		await db.delete(wsTokens).where(eq(wsTokens.id, record.id));
		return null;
	}

	await db.update(wsTokens).set({ lastUsedAt: now }).where(eq(wsTokens.id, record.id));

	const [user] = await db.select().from(users).where(eq(users.id, record.userId)).limit(1);
	return user ?? null;
}
