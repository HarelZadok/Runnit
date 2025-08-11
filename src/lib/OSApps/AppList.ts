// AppList.ts: Instantiate and register all available OS-style applications

import OSApp from "@/lib/features/OSApp/OSApp";
import Trash from "@/lib/OSApps/apps/trash/Trash";
import Files from "@/lib/OSApps/apps/files/Files";
import Portfolio from "@/lib/OSApps/apps/portfolio/Portfolio";
import appRegistry from "@/lib/OSApps/AppRegistry";
import CodeEditor from "@/lib/OSApps/apps/code_editor/CodeEditor";

const apps: OSApp[] = [
  new Trash(),
  new Files(),
  new CodeEditor(),
  new Portfolio(),
];

apps.map((app) => appRegistry.registerApp(app));
