export function getSetting(keyword: string) {
  if (!canAccessStorage()) return null;

  const jsonData = localStorage.getItem("!." + keyword);
  if (jsonData) return JSON.parse(jsonData);
  return null;
}

export function setSetting(keyword: string, setting: unknown) {
  if (!canAccessStorage()) return;
  localStorage.setItem("!." + keyword, JSON.stringify(setting));
}

export function clearSettings() {
  if (!canAccessStorage()) return;
  localStorage.clear();
}

export function canAccessStorage() {
  return typeof window !== "undefined";
}

export const isMobile = (userAgent: string): boolean => {
  return /android.+mobile|ip(hone|[oa]d)/i.test(userAgent);
};
