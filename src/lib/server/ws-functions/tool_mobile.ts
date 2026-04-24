import { PUBLIC_SITE_URL } from '$env/static/public';

function stripTrailingSlash(value: string) {
	return value.replace(/\/$/, '');
}

function siteUrl() {
	return stripTrailingSlash(PUBLIC_SITE_URL);
}

export function tool_mobile_get_public_config() {
	const wwwroot = siteUrl();

	return {
		wwwroot,
		httpswwwroot: wwwroot,
		sitename: 'CSET Learning',
		guestlogin: 0,
		rememberusername: 1,
		authloginviaemail: 1,
		registerauth: '',
		forgottenpasswordurl: '',
		authinstructions: '',
		authnoneenabled: 0,
		enablewebservices: 1,
		enablemobilewebservice: 1,
		maintenanceenabled: 0,
		maintenancemessage: '',
		typeoflogin: 1,
		showloginform: 1,
		tool_mobile_disabledfeatures: '',
		mobilecssurl: '',
		launchurl: `${wwwroot}/tool/mobile/launch.php`,
		supportavailability: 0,
		supportpage: '',
		warnings: []
	};
}

export function tool_mobile_get_config() {
	return {
		settings: [
			{ name: 'tool_mobile_disabledfeatures', value: '' },
			{ name: 'tool_mobile_minimumversion', value: '' }
		],
		warnings: []
	};
}
