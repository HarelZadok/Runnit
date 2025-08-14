// AppList.ts: Instantiate and register all available OS-style applications

import appRegistry from "@/lib/OSApps/AppRegistry";
import OSApp from "@/lib/features/OSApp/OSApp";
import Trash from "@/lib/OSApps/apps/trash/Trash";
import Files from "@/lib/OSApps/apps/files/Files";
import Portfolio from "@/lib/OSApps/apps/portfolio/Portfolio";
import CodeEditor from "@/lib/OSApps/apps/code_editor/CodeEditor";

export const apps: OSApp[] = [
  new Trash(),
  new Files(),
  new CodeEditor(),
  new Portfolio(),
];

apps.map((app) => appRegistry.registerApp(app));
