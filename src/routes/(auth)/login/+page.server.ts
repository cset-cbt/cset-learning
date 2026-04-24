import { MODE } from '$env/static/private';
import { DEV_ACCOUNTS, isDevMode } from '$lib/server/dev-accounts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	return {
		devAccounts: isDevMode(MODE)
			? DEV_ACCOUNTS.map(({ role, email, password }) => ({ role, email, password }))
			: []
	};
};
