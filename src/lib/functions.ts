export function getSetting(keyword: string) {
	if (typeof window === 'undefined') return null;

	const jsonData = localStorage.getItem('!.' + keyword);
	if (jsonData)
		return JSON.parse(jsonData);
	return null;
}

export function setSetting(keyword: string, setting: unknown) {
	if (typeof window === 'undefined') return;
	localStorage.setItem('!.' + keyword, JSON.stringify(setting));
}