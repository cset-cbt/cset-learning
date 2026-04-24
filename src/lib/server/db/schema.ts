import { relations } from 'drizzle-orm';
import { boolean, pgTable, serial, text, timestamp, unique } from 'drizzle-orm/pg-core';

const timestamps = {
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
};

export const users = pgTable('users', {
	id: text('id').primaryKey(),
	moodleUserId: serial('moodle_user_id').notNull().unique(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull().default(false),
	image: text('image'),
	...timestamps
});

export const sessions = pgTable('sessions', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' })
});

export const accounts = pgTable('accounts', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const verifications = pgTable('verifications', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const userProfiles = pgTable('user_profiles', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.unique()
		.references(() => users.id, { onDelete: 'cascade' }),
	firstName: text('first_name'),
	lastName: text('last_name'),
	phone: text('phone'),
	bio: text('bio'),
	timezone: text('timezone').notNull().default('UTC'),
	language: text('language').notNull().default('en'),
	avatarUrl: text('avatar_url'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const roles = pgTable('roles', {
	id: text('id').primaryKey(),
	name: text('name').notNull().unique(),
	description: text('description'),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

export const userRoles = pgTable(
	'user_roles',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		roleId: text('role_id')
			.notNull()
			.references(() => roles.id, { onDelete: 'cascade' }),
		assignedAt: timestamp('assigned_at').notNull().defaultNow()
	},
	(table) => [unique('user_roles_user_id_role_id_unique').on(table.userId, table.roleId)]
);

export const wsTokens = pgTable('ws_tokens', {
	id: text('id').primaryKey(),
	token: text('token').notNull().unique(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	expiresAt: timestamp('expires_at').notNull(),
	lastUsedAt: timestamp('last_used_at')
});

export const usersRelations = relations(users, ({ many, one }) => ({
	sessions: many(sessions),
	accounts: many(accounts),
	profile: one(userProfiles, {
		fields: [users.id],
		references: [userProfiles.userId]
	}),
	userRoles: many(userRoles),
	wsTokens: many(wsTokens)
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	})
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	})
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
	user: one(users, {
		fields: [userProfiles.userId],
		references: [users.id]
	})
}));

export const rolesRelations = relations(roles, ({ many }) => ({
	userRoles: many(userRoles)
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
	user: one(users, {
		fields: [userRoles.userId],
		references: [users.id]
	}),
	role: one(roles, {
		fields: [userRoles.roleId],
		references: [roles.id]
	})
}));

export const wsTokensRelations = relations(wsTokens, ({ one }) => ({
	user: one(users, {
		fields: [wsTokens.userId],
		references: [users.id]
	})
}));

export const schema = {
	users,
	sessions,
	accounts,
	verifications,
	userProfiles,
	roles,
	userRoles,
	wsTokens,
	usersRelations,
	sessionsRelations,
	accountsRelations,
	userProfilesRelations,
	rolesRelations,
	userRolesRelations,
	wsTokensRelations
};
