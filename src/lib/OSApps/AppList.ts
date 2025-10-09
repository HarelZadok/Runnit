// AppList.ts: Instantiate and register all available OS-style applications

import appRegistry from "@/lib/OSApps/AppRegistry";
import OSApp from "@/lib/features/OSApp/OSApp";
import Trash from "@/lib/OSApps/apps/trash/Trash";
import Files from "@/lib/OSApps/apps/files/Files";
import Portfolio from "@/lib/OSApps/apps/portfolio/Portfolio";
import CodeEditor from "@/lib/OSApps/apps/code_editor/CodeEditor";
import Settings from "./apps/settings/Settings";
import { OSFileSystem } from "@/lib/OSApps/apps/files/OSFileSystem";
import { File } from "@/lib/OSApps/apps/files/FilesItem";
import React from "react";
import { makeClassFromTsx } from "@/lib/functions";

export const apps: OSApp[] = [
  new Trash(),
  new Settings(),
  new Files(),
  new CodeEditor(),
  new Portfolio(),
];

for (const mApp of OSFileSystem.getFolder("/.apps")?.items ?? []) {
  const file = mApp as File;
  if (!file.value) continue;

  try {
    const NewApp = makeClassFromTsx(file.value, { OSApp, React });
    const instance = new NewApp();
    apps.push(instance);
  } catch (err) {
    console.error(`Failed to load app: "${file.name}"`, err);
  }
}

apps.map((app) => appRegistry.registerApp(app));

export const getIdFromAppClass = (appClass: typeof OSApp) => {
  return apps.findIndex((app) => app.constructor === appClass);
};
