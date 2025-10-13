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

// Load runtime apps.
const fetch = async () => {
  for (const mApp of OSFileSystem.getFolder("/.apps")?.items ?? []) {
    const file = mApp as File;
    if (file.extension !== ".osapp" || !file.value) continue;

    try {
      const NewApp = await makeClassFromTsx(file.value);
      const instance = new NewApp();
      apps.push(instance);
    } catch (err) {
      console.error(`Failed to load app: "${file.name}"`, err);
    }
  }
};

const id = setInterval(() => {
  if (OSFileSystem.isInit) {
    fetch().then(() => {
      apps.map((app) => appRegistry.registerApp(app));
    });
    clearInterval(id);
  }
}, 100);

export const addApp = (app: OSApp) => {
  appRegistry.registerApp(app);
  if (app.appFile.id < apps.length) updateApp(app);
  else apps.push(app);
  return app.appFile.id;
};

export const updateApp = (app: OSApp) => {
  const i = apps.findIndex((cApp) => cApp.appFile.id === app.appFile.id);
  if (i >= 0) {
    if (!appRegistry.updateApp(app)) return false;

    apps[i] = app;
    return true;
  }
  return false;
};

export const getIdFromAppClass = (appClass: typeof OSApp) => {
  return apps.findIndex((app) => app.constructor === appClass);
};

export const getAppFromId = (id: number) => {
  return apps.length > id ? apps[id] : null;
};
