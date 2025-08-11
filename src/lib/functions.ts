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

export function canAccessStorage() {
  return typeof window !== "undefined";
}
