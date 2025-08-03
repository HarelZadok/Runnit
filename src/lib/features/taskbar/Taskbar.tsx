'use client';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import Image from 'next/image';
import { launchApp, unminimizeApp } from '@/lib/features/windowManager/windowManagerSlice';
import { useEffect, useState } from 'react';

export default function Taskbar() {
	const taskbarHeight = useAppSelector(state => state.settings.taskbarHeight);
	const pinnedApps = useAppSelector(state => state.taskbar.pinnedApps);
	const openedApps = useAppSelector(state => state.taskbar.openedApps);
	const openedAppsInstances = useAppSelector(state => state.windowManager.openApps);
	const [focusedAppId, setFocusedAppId] = useState<number | undefined>(undefined);

	const dispatch = useAppDispatch();

	useEffect(() => {
		setFocusedAppId(undefined);
		for (const app of openedAppsInstances) {
			if (app.isFocused) {
				setFocusedAppId(app.pid);
				break;
			}
		}
	}, [openedAppsInstances]);

	return <div
		className="absolute bottom-0 w-full z-40 px-10 pb-8 flex items-center justify-center"
		style={{ height: taskbarHeight }}
	>
		<div
			className="bg-[#ffffff60] w-max h-full rounded-2xl items-center justify-center flex flex-row px-1">
			<Image className="cursor-pointer" src="/icons/app-launcher.png" alt="" width={taskbarHeight - 35}
						 height={taskbarHeight - 35} />
			{
				pinnedApps.map(app =>
					<div key={app.id} className="rounded-full transition-all duration-500"
							 style={{ backgroundColor: focusedAppId === app.id ? '#ffffff20' : undefined }}>
						<Image
							src={app.icon}
							alt=""
							width={taskbarHeight - 35}
							height={taskbarHeight - 35}
							onClick={() => {
								dispatch(launchApp(app.id));
							}}
						/>,
					</div>,
				)
			}
			{
				openedApps.map(app =>
					<div key={app.id}
							 className="relative flex flex-col items-center bottom-0 hover:bottom-0.5 transition-all duration-100">
						<Image
							className="cursor-pointer"
							src={app.icon}
							alt=""
							width={taskbarHeight - 35}
							height={taskbarHeight - 35}
							onClick={() => {
								dispatch(launchApp(app.id));
							}}
						/>
						<div
							className="absolute w-2/5 h-1 top-0.5 rounded-full transition-colors duration-400"
							style={{ backgroundColor: focusedAppId === app.id ? '#000000A0' : '#FFFFFFA0' }}>
						</div>
					</div>,
				)
			}
		</div>
	</div>;
}