import { randomUUID } from 'node:crypto';
import 'dotenv/config';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { DEV_ACCOUNTS } from '../dev-accounts';
import { roles, schema, userProfiles, userRoles, users } from './schema';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
if (!process.env.BETTER_AUTH_SECRET) throw new Error('BETTER_AUTH_SECRET is not set');

const client = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(client, { schema });
const auth = betterAuth({
	appName: 'CSET Learning',
	baseURL: process.env.BETTER_AUTH_URL,
	secret: process.env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg', schema, usePlural: true, camelCase: true }),
	emailAndPassword: { enabled: true },
	session: {
		expiresIn: 60 * 60 * 24 * 30,
		updateAge: 60 * 60 * 24
	}
});

const seedRoles = [
	{ name: 'admin', description: 'Administrator' },
	{ name: 'teacher', description: 'Teacher' },
	{ name: 'student', description: 'Student' }
];

try {
	const roleIds = new Map<string, string>();

	for (const role of seedRoles) {
		const [existing] = await db
			.select({ id: roles.id })
			.from(roles)
			.where(eq(roles.name, role.name))
			.limit(1);

		if (existing) {
			roleIds.set(role.name, existing.id);
			continue;
		}

		const id = randomUUID();
		await db.insert(roles).values({
			id,
			name: role.name,
			description: role.description
		});

		roleIds.set(role.name, id);
	}

	console.log('Seeded roles');

	for (const account of DEV_ACCOUNTS) {
		let [user] = await db.select().from(users).where(eq(users.email, account.email)).limit(1);

		if (!user) {
			await auth.api.signUpEmail({
				body: {
					name: account.name,
					email: account.email,
					password: account.password
				}
			});

			const [createdUser] = await db
				.select()
				.from(users)
				.where(eq(users.email, account.email))
				.limit(1);
			if (!createdUser) throw new Error(`Failed to create user: ${account.email}`);
			user = createdUser;
		}

		const [profile] = await db
			.select({ id: userProfiles.id })
			.from(userProfiles)
			.where(eq(userProfiles.userId, user.id))
			.limit(1);

		if (profile) {
			await db
				.update(userProfiles)
				.set({
					firstName: account.firstName,
					lastName: account.lastName,
					language: 'en',
					timezone: 'UTC',
					updatedAt: new Date()
				})
				.where(eq(userProfiles.id, profile.id));
		} else {
			await db.insert(userProfiles).values({
				id: randomUUID(),
				userId: user.id,
				firstName: account.firstName,
				lastName: account.lastName,
				language: 'en',
				timezone: 'UTC'
			});
		}

		const roleId = roleIds.get(account.role);
		if (!roleId) throw new Error(`Role not found: ${account.role}`);

		const [existingRole] = await db
			.select({ id: userRoles.id })
			.from(userRoles)
			.where(and(eq(userRoles.userId, user.id), eq(userRoles.roleId, roleId)))
			.limit(1);

		if (!existingRole) {
			await db.insert(userRoles).values({
				id: randomUUID(),
				userId: user.id,
				roleId
			});
		}
	}

	console.log('Seeded dev accounts');
} finally {
	await client.end();
}
