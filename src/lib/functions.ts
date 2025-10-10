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

import * as Babel from "@babel/standalone";

Babel.registerPreset("ts-react-classic", {
  presets: [
    Babel.availablePresets["typescript"],
    [Babel.availablePresets["react"], { runtime: "classic" }], // JSX -> React.createElement
  ],
});

function compileTsxWrapped(source: string): string {
  // 1) Wrap BEFORE compile so top-level `return` is legal
  const wrappedSource = `(function(){\n${source}\n})()`;

  let { code } = Babel.transform(wrappedSource, {
    presets: ["ts-react-classic"],
    filename: "/dynamic-app.tsx",
    sourceMaps: "inline",
    retainLines: true,
  });

  code = code?.replace("\n" + "})();", "\n" + "})())");

  // code is now a JS expression that evaluates to the IIFE result (your class)
  return code || "";
}

function evalWithContext(js: string, context: Record<string, object>) {
  const keys = Object.keys(context);
  const vals = Object.values(context);

  // 2) Return the IIFE result (your class) from the Function
  const wrappedForEval = `"use strict";\n//# sourceURL=dynamic-app.js\nreturn (${js});`;

  return new Function(...keys, wrappedForEval)(...vals);
}

export function makeClassFromTsx(source: string, ctx: Record<string, object>) {
  const js = compileTsxWrapped("return " + source);
  return evalWithContext(js, ctx);
}
