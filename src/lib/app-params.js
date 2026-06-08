const isNode = typeof window === 'undefined';
const memoryParams = new Map();

const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
	if (isNode) {
		return defaultValue;
	}

	const storageKey = `base44_${toSnakeCase(paramName)}`;
	const urlParams = new URLSearchParams(window.location.search);
	const searchParam = urlParams.get(paramName);

	if (removeFromUrl && searchParam) {
		urlParams.delete(paramName);
		const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""}${window.location.hash}`;
		window.history.replaceState({}, document.title, newUrl);
	}

	if (searchParam) {
		memoryParams.set(storageKey, searchParam);
		return searchParam;
	}

	if (defaultValue !== undefined) {
		memoryParams.set(storageKey, defaultValue);
		return defaultValue;
	}

	return memoryParams.get(storageKey) || null;
}

const getAppParams = () => ({
	appId: getAppParamValue("app_id", { defaultValue: import.meta.env.VITE_BASE44_APP_ID }),
	token: getAppParamValue("access_token"),
	fromUrl: getAppParamValue("from_url", { defaultValue: window.location.href }),
	functionsVersion: getAppParamValue("functions_version", { defaultValue: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION }),
	appBaseUrl: getAppParamValue("app_base_url", { defaultValue: import.meta.env.VITE_BASE44_APP_BASE_URL }),
});

export const appParams = {
	...getAppParams()
};