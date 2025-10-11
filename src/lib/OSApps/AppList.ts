// AppList.ts: Instantiate and register all available OS-style applications
"use client";

import appRegistry from "@/lib/OSApps/AppRegistry";
import OSApp from "@/lib/features/OSApp/OSApp";
import Trash from "@/lib/OSApps/apps/trash/Trash";
import Files from "@/lib/OSApps/apps/files/Files";
import Portfolio from "@/lib/OSApps/apps/portfolio/Portfolio";
import CodeEditor from "@/lib/OSApps/apps/code_editor/CodeEditor";
import Settings from "./apps/settings/Settings";
import { OSFileSystem } from "@/lib/OSApps/apps/files/OSFileSystem";
import { File } from "@/lib/OSApps/apps/files/FilesItem";
import { makeClassFromTsx } from "@/lib/runtimeCompiler";

export const apps: OSApp[] = [
  new Trash(),
  new Settings(),
  new Files(),
  new CodeEditor(),
  new Portfolio(),
];

// Load TailwindCSS to the runtime apps.
function ensureDynamicTailwind() {
  const id = "dynamic-tailwind";
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = "/dynamic-tailwind.css";
  document.head.appendChild(link);
}

ensureDynamicTailwind();

// Load runtime apps.
for (const mApp of OSFileSystem.getFolder("/.apps")?.items ?? []) {
  const file = mApp as File;
  if (file.extension !== ".osapp" || !file.value) continue;

  try {
    const NewApp = await makeClassFromTsx(file.value);
    const instance = new NewApp();
    console.log(instance.appFile.id);
    apps.push(instance);
  } catch (err) {
    console.error(`Failed to load app: "${file.name}"`, err);
  }
}

apps.map((app) => appRegistry.registerApp(app));

export const getIdFromAppClass = (appClass: typeof OSApp) => {
  return apps.findIndex((app) => app.constructor === appClass);
};
