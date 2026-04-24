export const DEV_ACCOUNTS = [
	{
		role: 'admin',
		name: 'Avery Admin',
		email: 'admin@cset.local',
		password: 'Admin1234!',
		firstName: 'Avery',
		lastName: 'Admin'
	},
	{
		role: 'teacher',
		name: 'Taylor Teacher',
		email: 'teacher@cset.local',
		password: 'Teacher1234!',
		firstName: 'Taylor',
		lastName: 'Teacher'
	},
	{
		role: 'student',
		name: 'Sam Student',
		email: 'student@cset.local',
		password: 'Student1234!',
		firstName: 'Sam',
		lastName: 'Student'
	}
] as const;

export function isDevMode(mode: string | undefined) {
	return mode === 'dev' || mode === 'development';
}
