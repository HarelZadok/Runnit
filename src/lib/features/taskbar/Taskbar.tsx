// Taskbar.tsx: Displays pinned and open application icons; handles launching and focus indicators
'use client';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import Image from 'next/image';
import { closeApp, launchApp, toggleAppLauncher } from '@/lib/features/windowManager/windowManagerSlice';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { OSAppFileProps } from '@/lib/features/OSApp/OSAppFile';
import { pinTaskbarApp, unpinTaskbarApp } from '@/lib/features/taskbar/taskbarSlice';

export default function Taskbar() {
	const taskbarHeight = useAppSelector(state => state.settings.taskbarHeight);
	const pinnedApps = useAppSelector(state => state.taskbar.pinnedTaskbarApps);
	const openedApps = useAppSelector(state => state.taskbar.openedTaskbarApps).filter(app => !pinnedApps.some(cApp => cApp.id === app.id));
	const openedAppsInstances = useAppSelector(state => state.windowManager.openApps);
	const [focusedAppId, setFocusedAppId] = useState<number | undefined>(undefined);
	const [menuId, setMenuId] = useState<number>(-1);
	const hideRate = useAppSelector(state => state.taskbar.hideRate);
	const forceShow = useAppSelector(state => state.taskbar.forceShow);

	const dispatch = useAppDispatch();

	// Determine currently focused app from window manager instances
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
		className="absolute w-full px-10 pb-8 flex items-center justify-center transition-all duration-300"
		style={{
			height: taskbarHeight,
			bottom: hideRate > 0 && !forceShow ? -taskbarHeight : 0,
		}}
	>
		<div
			onMouseDown={e => e.stopPropagation()}
			className="
			relative
			w-max
			h-full
			rounded-2xl
			items-center
			justify-center
			flex
			flex-row
			px-1
			z-20000
			before:rounded-2xl
			before:bg-[#ffffff90]
			before:absolute
			before:backdrop-blur-3xl
			before:backdrop-brightness-60
			before:w-full
			before:h-full
			before:-z-1
			"
		>
			<div className="group cursor-pointer"
					 onClick={() => {
						 dispatch(toggleAppLauncher());
					 }}>
				<div
					className={`
						transition-transform 
						duration-100 
						group-hover:-translate-y-1.5 
						relative 
						flex 
						flex-col 
						items-center
					`}
				>
					<Image
						draggable={false}
						className="cursor-pointer"
						src="/icons/app-launcher.png"
						alt=""
						width={taskbarHeight - 35}
						height={taskbarHeight - 35}
					/>
				</div>
			</div>
			{
				// Render pinned apps with focus highlight and click to launch or restore
				pinnedApps.map(app => <PinnedTaskbarIcon key={app.id} app={app} focusedAppId={focusedAppId} menuId={menuId}
																								 setMenuId={setMenuId} />)
			}
			{
				// Render opened apps with indicator bar showing focus
				openedApps.map(app => <TaskbarIcon key={app.id} app={app} focusedAppId={focusedAppId} menuId={menuId}
																					 setMenuId={setMenuId} />)
			}
		</div>
	</div>;
}

const FocusBar = ({ isFocused }: { isFocused: boolean }) => {
	return <div
		className="absolute w-2/5 h-1 top-[1px] rounded-full transition-colors border-[1] duration-400"
		style={{
			backgroundColor: isFocused ? '#222222FF' : '#FFFFFFFF',
			borderColor: isFocused ? '#FFFFFFFF' : '#222222FF',
		}}
	/>;
};

const TaskbarIcon = (props: {
	app: OSAppFileProps,
	focusedAppId?: number,
	menuId: number,
	setMenuId: React.Dispatch<React.SetStateAction<number>>
}) => {
	const dispatch = useAppDispatch();
	const taskbarHeight = useAppSelector(state => state.settings.taskbarHeight);
	const divRef = useRef<HTMLDivElement>(null);
	const isAppLauncherPresent = useAppSelector(state => state.windowManager.isAppLauncherPresent);

	const onMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		if (e.button === 2) {
			if (props.menuId !== props.app.id)
				props.setMenuId(props.app.id);
			else
				props.setMenuId(-1);
		}
	}, [props]);

	const rect = divRef.current?.getBoundingClientRect();
	const parentRect = divRef.current?.offsetParent?.getBoundingClientRect();

	return <div>
		{
			props.menuId === props.app.id && <div
				className="absolute bg-[#ffffffbb] backdrop-blur-3xl backdrop-brightness-60 text-black w-[120px] rounded-lg flex flex-col items-center overflow-hidden"
				style={{
					bottom: taskbarHeight - 25,
					left: rect && parentRect && rect?.left - parentRect?.left + rect?.width / 2 - 60,
				}}
			>
				<p className="font-bold text-sm border-b w-full text-center p-1">{props.app.name}</p>
				<div
					onClick={() => {
						props.setMenuId(-1);
						dispatch(pinTaskbarApp(props.app));
					}}
					className="w-full h-7 flex justify-center items-center hover:backdrop-brightness-20 hover:bg-[#999999]">
					<p className="text-sm">Pin App</p>
				</div>
				<div
					onClick={() => {
						props.setMenuId(-1);
						dispatch(closeApp(props.app.id));
					}}
					className="w-full h-7 flex justify-center items-center hover:backdrop-brightness-20 hover:bg-[#999999]">
					<p className="text-sm">Close App</p>
				</div>
			</div>
		}
		<div className="group cursor-pointer"
				 ref={divRef}
				 onContextMenu={onMenu}
				 onClick={() => {
					 if (isAppLauncherPresent)
						 dispatch(toggleAppLauncher());
					 dispatch(launchApp(props.app.id));
				 }}
		>
			<div
				className="transition-transform duration-100 group-hover:-translate-y-1.5 relative flex-col flex items-center justify-center"
				style={{
					width: taskbarHeight - 35,
					height: taskbarHeight - 35,
				}}
			>
				<Image
					draggable={false}
					src={props.app.icon}
					alt=""
					width={taskbarHeight - 45}
					height={taskbarHeight - 45}
				/>
				<FocusBar isFocused={props.focusedAppId === props.app.id} />
			</div>
		</div>
	</div>;
};

const PinnedTaskbarIcon = (props: {
	app: OSAppFileProps,
	focusedAppId?: number,
	menuId: number,
	setMenuId: React.Dispatch<React.SetStateAction<number>>
}) => {
	const dispatch = useAppDispatch();
	const taskbarHeight = useAppSelector(state => state.settings.taskbarHeight);
	const divRef = useRef<HTMLDivElement>(null);
	const openApps = useAppSelector(state => state.windowManager.openApps);
	const isAppLauncherPresent = useAppSelector(state => state.windowManager.isAppLauncherPresent);

	const onMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		if (e.button === 2) {
			if (props.menuId !== props.app.id)
				props.setMenuId(props.app.id);
			else
				props.setMenuId(-1);
		}
	}, [props]);

	const rect = divRef.current?.getBoundingClientRect();
	const parentRect = divRef.current?.offsetParent?.getBoundingClientRect();

	return <div>
		{
			props.menuId === props.app.id && <div
				className="absolute bg-[#ffffffbb] backdrop-blur-3xl backdrop-brightness-60 text-black w-[120px] rounded-lg flex flex-col items-center overflow-hidden"
				style={{
					bottom: taskbarHeight - 25,
					left: rect && parentRect && rect?.left - parentRect?.left + rect?.width / 2 - 60,
				}}
			>
				<p className="font-bold text-sm border-b w-full text-center p-1">{props.app.name}</p>
				<div
					onClick={() => {
						props.setMenuId(-1);
						dispatch(unpinTaskbarApp(props.app));
					}}
					className="w-full h-7 flex justify-center items-center hover:backdrop-brightness-20 hover:bg-[#999999]">
					<p className="text-sm">Unpin App</p>
				</div>
				{openApps.some(cApp => cApp.pid === props.app.id) &&
					<div
						onClick={() => {
							props.setMenuId(-1);
							dispatch(closeApp(props.app.id));
						}}
						className="w-full h-7 flex justify-center items-center hover:backdrop-brightness-20 hover:bg-[#999999]">
						<p className="text-sm">Close App</p>
					</div>
				}
			</div>
		}
		<div className="group cursor-pointer"
				 ref={divRef}
				 onContextMenu={onMenu}
		>
			<div
				className="transition-transform duration-100 group-hover:-translate-y-1.5 relative flex-col flex items-center justify-center"
				style={{
					width: taskbarHeight - 35,
					height: taskbarHeight - 35,
				}}
			>
				<Image
					draggable={false}
					className="cursor-pointer"
					src={props.app.icon}
					alt=""
					width={taskbarHeight - 45}
					height={taskbarHeight - 45}
					onClick={() => {
						if (isAppLauncherPresent)
							dispatch(toggleAppLauncher());
						dispatch(launchApp(props.app.id));
					}}
				/>
				{openApps.some(cApp => cApp.pid === props.app.id) &&
					<FocusBar isFocused={props.focusedAppId === props.app.id} />
				}
			</div>
		</div>
	</div>;
};