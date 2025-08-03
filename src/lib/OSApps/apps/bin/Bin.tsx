import { OSApp } from '@/lib/features/OSApp/OSApp';
import React from 'react';
import appRegistry from '@/lib/OSApps/AppRegistry';

export default class Bin extends OSApp {
	constructor() {
		super(0, 'Recycle Bin', '/icons/bin.png');
		appRegistry.registerApp(this);
	}

	render(): React.ReactElement {
		return <div className="text-black w-full h-full bg-white flex justify-center items-center">
			<p>RECYCLE BIN!</p>
		</div>;
	}
}