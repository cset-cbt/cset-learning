import { PUBLIC_SITE_URL } from '$env/static/public';
import { json, type RequestHandler } from '@sveltejs/kit';

type AjaxCall = {
	index: number;
	methodname: string;
	args?: Record<string, unknown>;
};

type AjaxSuccess = {
	index: number;
	data: Record<string, unknown>;
	error: false;
};

type AjaxFailure = {
	index: number;
	error: true;
	exception: {
		message: string;
		errorcode: string;
	};
};

function publicConfig() {
	return {
		wwwroot: PUBLIC_SITE_URL,
		httpswwwroot: PUBLIC_SITE_URL,
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
		mobilecssurl: '',
		tool_mobile_disabledfeatures: '',
		launchurl: '',
		supportavailability: 0,
		supportpage: '',
		warnings: []
	};
}

function dispatchPublic(methodname: string): Omit<AjaxSuccess | AjaxFailure, 'index'> {
	if (methodname === 'tool_mobile_get_public_config') {
		return { data: publicConfig(), error: false };
	}

	return {
		error: true,
		exception: {
			message: `Unknown method: ${methodname}`,
			errorcode: 'invalidparameter'
		}
	};
}

function normalizeCalls(payload: unknown): AjaxCall[] {
	if (!Array.isArray(payload)) {
		return [];
	}

	return payload
		.filter((item): item is AjaxCall => {
			if (!item || typeof item !== 'object') {
				return false;
			}

			const maybeCall = item as Partial<AjaxCall>;
			return typeof maybeCall.index === 'number' && typeof maybeCall.methodname === 'string';
		})
		.map((call) => ({
			index: call.index,
			methodname: call.methodname,
			args: call.args ?? {}
		}));
}

export const POST: RequestHandler = async ({ request }) => {
	const payload = await request.json().catch(() => null);
	const calls = normalizeCalls(payload);

	const responses = calls.map((call) => {
		const result = dispatchPublic(call.methodname);
		return {
			index: call.index,
			...result
		};
	});

	return json(responses);
};

export const GET: RequestHandler = async ({ url }) => {
	const info = url.searchParams.get('info');

	if (info === 'tool_mobile_get_public_config') {
		return json([
			{
				index: 0,
				data: publicConfig(),
				error: false
			}
		]);
	}

	return json([
		{
			index: 0,
			error: true,
			exception: {
				message: 'Not found',
				errorcode: 'invalidparameter'
			}
		}
	]);
};
