import OSApp from '@/lib/features/OSApp/OSApp';
import React from 'react';

export default class Bin extends OSApp {
	constructor() {
		super();

		this.appFile = {
			id: OSApp.appCount++,
			name: 'Recycle Bin',
			icon: '/icons/bin.png',
		};
	}

	body(): React.ReactElement {
		return <div className="text-black w-full h-full bg-white flex justify-center items-center">
			<p>Recycle Bin!</p>
		</div>;
	}
}