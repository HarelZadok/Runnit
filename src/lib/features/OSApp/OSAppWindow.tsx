'use client';

import { OSApp } from '@/lib/features/OSApp/OSApp';
import { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { addOpenApp, removeOpenApp } from '@/lib/features/taskbar/taskbarSlice';
import {
	closeApp, focusApp,
	maximizeApp,
	minimizeApp,
	unmaximizeApp,
	unminimizeApp,
} from '@/lib/features/windowManager/windowManagerSlice';

export interface AppWindowProps {
	width?: number;
	height?: number;
	x?: number;
	y?: number;
}

export interface OSAppWindowProps {
	props?: AppWindowProps;
	app: OSApp;
}

export default function OSAppWindow({ props, app }: OSAppWindowProps) {
	const dispatch = useAppDispatch();

	const taskbarHeight = useAppSelector(state => state.settings.taskbarHeight);
	const maximized = useAppSelector(state => state.windowManager.openApps).find(cApp => cApp.pid === app.appFile.id)!.isMaximized;
	const minimized = useAppSelector(state => state.windowManager.openApps).find(cApp => cApp.pid === app.appFile.id)!.isMinimized;
	const zIndex = useAppSelector(state => state.windowManager.openApps).find(cApp => cApp.pid === app.appFile.id)!.zIndex;

	const [width, setWidth] = useState(props?.width ?? app.defaultWidth);
	const [height, setHeight] = useState(props?.height ?? app.defaultHeight);

	const [isGrabbing, setIsGrabbing] = useState(false);
	const [position, setPosition] = useState({
		x: props?.x ?? window.innerWidth / 2 - width / 2,
		y: props?.y ?? window.innerHeight / 2 - height / 2,
	});
	const prevMouseRef = useRef({ x: 0, y: 0 });

	useEffect(() => {
		dispatch(addOpenApp(app.appFile));

		return () => {
			dispatch(removeOpenApp(app.appFile));
		};
	}, [app.appFile, dispatch]);

	useEffect(() => {
		app.setOnGrab(e => {
			setIsGrabbing(true);
			prevMouseRef.current = { x: e.clientX, y: e.clientY };
		});
		app.setOnGrabbing(e => {
			const deltaX = e.clientX - prevMouseRef.current.x;
			const deltaY = e.clientY - prevMouseRef.current.y;

			setPosition(prev => ({
				x: prev.x + deltaX,
				y: prev.y + deltaY,
			}));
			prevMouseRef.current = { x: e.clientX, y: e.clientY };
		});
		app.setOnRelease(e => {
			setIsGrabbing(false);
		});
		app.setOnMaximize(() => {
			if (!maximized)
				dispatch(maximizeApp(app.appFile.id));
			else
				dispatch(unmaximizeApp(app.appFile.id));
		});
		app.setOnMinimize(() => {
			if (!minimized)
				dispatch(minimizeApp(app.appFile.id));
			else
				dispatch(unminimizeApp(app.appFile.id));
		});
		app.setOnClose(() => {
			dispatch(closeApp(app.appFile.id));
		});
	}, [app, dispatch, maximized, minimized]);

	return <div
		className="absolute flex flex-col rounded-lg overflow-hidden border-[1px] transition-all duration-300"
		onMouseDown={e => {
			e.stopPropagation();
		}}
		onMouseDownCapture={e => {
			dispatch(focusApp(app.appFile.id));
		}}
		style={{
			left: minimized ? window.innerWidth / 2 : maximized ? 0 : position.x,
			top: minimized ? window.innerHeight - taskbarHeight : maximized ? 0 : position.y,
			width: minimized ? 0 : maximized ? window.innerWidth : width,
			height: minimized ? 0 : maximized ? window.innerHeight : height,
			borderColor: minimized ? 'transparent' : 'black',
			zIndex: zIndex,
			transitionProperty: isGrabbing ? 'none' : 'all',
		}}
	>
		{app.header()}
		{app.render()}
	</div>;
}