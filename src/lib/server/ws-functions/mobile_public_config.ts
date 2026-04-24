import { PUBLIC_SITE_URL } from '$env/static/public';

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

type AjaxResult = Omit<AjaxSuccess, 'index'> | Omit<AjaxFailure, 'index'>;

function stripTrailingSlash(value: string) {
	return value.replace(/\/$/, '');
}

function resolveSiteUrl(origin: string) {
	if (origin && origin !== 'null') {
		return stripTrailingSlash(origin);
	}

	return stripTrailingSlash(PUBLIC_SITE_URL);
}

function getPublicConfig(siteUrl: string) {
	return {
		wwwroot: siteUrl,
		httpswwwroot: siteUrl,
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

function dispatchPublic(methodname: string, siteUrl: string): AjaxResult {
	if (methodname === 'tool_mobile_get_public_config') {
		return { data: getPublicConfig(siteUrl), error: false };
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

export async function buildAjaxBatchResponse(request: Request, origin: string) {
	const payload = await request.json().catch(() => null);
	const calls = normalizeCalls(payload);
	const siteUrl = resolveSiteUrl(origin);

	return calls.map((call) => {
		const result = dispatchPublic(call.methodname, siteUrl);
		return {
			index: call.index,
			...result
		};
	});
}

export function buildAjaxInfoResponse(info: string | null, origin: string) {
	const siteUrl = resolveSiteUrl(origin);

	if (info === 'tool_mobile_get_public_config') {
		return [
			{
				index: 0,
				data: getPublicConfig(siteUrl),
				error: false
			}
		];
	}

	return [
		{
			index: 0,
			error: true,
			exception: {
				message: 'Not found',
				errorcode: 'invalidparameter'
			}
		}
	];
}
