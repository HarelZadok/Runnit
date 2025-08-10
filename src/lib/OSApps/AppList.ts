// AppList.ts: Instantiate and register all available OS-style applications

import OSApp from "@/lib/features/OSApp/OSApp";
import Bin from "@/lib/OSApps/apps/bin/Bin";
import Files from "@/lib/OSApps/apps/files/Files";
import Portfolio from "@/lib/OSApps/apps/portfolio/Portfolio";
import appRegistry from "@/lib/OSApps/AppRegistry";
import CodeEditor from "@/lib/OSApps/apps/CodeEditor/CodeEditor";

const apps: OSApp[] = [
  new Bin(),
  new Files(),
  new CodeEditor(),
  new Portfolio(),
];

apps.map((app) => appRegistry.registerApp(app));
