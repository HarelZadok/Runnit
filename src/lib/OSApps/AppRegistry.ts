import OSApp from "@/lib/features/OSApp/OSApp";

export interface AppRegister {
  id: number;
  app: OSApp;
}

class AppRegistry {
  apps: AppRegister[];

  constructor() {
    this.apps = [];
  }

  registerApp = (app: OSApp) => {
    this.apps.push({
      id: app.appFile.id,
      app: app,
    });
  };

  updateApp = (app: OSApp) => {
    const i = this.apps.findIndex(
      (cApp) => cApp.app.appFile.id === app.appFile.id,
    );
    if (i >= 0) {
      this.apps[i].app = app;
      return true;
    }
    return false;
  };

  getClass = (id: number): OSApp | undefined => {
    return this.apps.find((registry) => registry.id === id)?.app;
  };
}

const appRegistry = new AppRegistry();
export default appRegistry;
