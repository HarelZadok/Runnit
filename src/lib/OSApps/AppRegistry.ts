import OSApp from '@/lib/features/OSApp/OSApp';

export interface AppRegister {
	id: number,
	app: OSApp,
}

class AppRegistry {
	static cId = 0;
	apps: AppRegister[];

	constructor() {
		this.apps = [];
	}

	registerApp = (app: OSApp) => {
		this.apps.push({
			id: AppRegistry.cId++,
			app: app,
		});
	};

	getClass = (id: number): OSApp | undefined => {
		return this.apps.find(registry => registry.id === id)?.app;
	};
}

const appRegistry = new AppRegistry();
export default appRegistry;

