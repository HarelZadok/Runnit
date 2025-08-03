import { OSApp } from '@/lib/features/OSApp/OSApp';
import appRegistry from '@/lib/OSApps/AppRegistry';

export default class Explorer extends OSApp {
	constructor() {
		super(1, 'File Explorer', '/icons/explorer.png');
		appRegistry.registerApp(this);
	}
}