'use client';

import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { OSAppFile } from '@/lib/features/OSApp/OSAppFile';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Taskbar from '@/lib/features/taskbar/Taskbar';
import { addApp, clearActiveApps, setActiveApps } from '@/lib/features/dekstop/desktopSlice';
import OSAppWindow from '@/lib/features/OSApp/OSAppWindow';
import appRegistry from '@/lib/OSApps/AppRegistry';
import '@/lib/OSApps/AppList';


export default function Desktop() {
	const TEST_APPS = false;

	let apps = useAppSelector(state => state.desktop.apps);
	if (TEST_APPS)
		apps = Array.from({ length: 50 }, (_, i) => ({
			id: i,
			name: 'App ' + i,
			icon: '/icons/bin.png',
		}));

	const openApps = useAppSelector(state => state.windowManager.openApps);
	const background = useAppSelector(state => state.settings.background);
	const taskbarHeight = useAppSelector(state => state.settings.taskbarHeight);
	const iconScale = useAppSelector(state => state.settings.iconScale);
	const [columnHeight, setColumnHeight] = useState<number>(-1);
	const [isSelecting, setIsSelecting] = useState<boolean>(false);
	const [selectionXStart, setSelectionXStart] = useState(-1);
	const [selectionYStart, setSelectionYStart] = useState(-1);
	const [selectionXEnd, setSelectionXEnd] = useState(-1);
	const [selectionYEnd, setSelectionYEnd] = useState(-1);
	const itemRefs = useRef<HTMLDivElement[]>([]);
	const dispatch = useAppDispatch();

	function getElementsInSelectionBox(
		startX: number,
		startY: number,
		endX: number,
		endY: number,
		elements: HTMLElement[],
	): HTMLElement[] {
		const left = Math.min(startX, endX);
		const right = Math.max(startX, endX);
		const top = Math.min(startY, endY);
		const bottom = Math.max(startY, endY);

		return elements.filter((el) => {
			const rect = el.getBoundingClientRect();

			return !(
				rect.right < left ||
				rect.left > right ||
				rect.bottom < top ||
				rect.top > bottom
			);
		});
	}

	const getAppsInSelectionBox = useCallback(() => {
		const overlapping = getElementsInSelectionBox(selectionXStart, selectionYStart, selectionXEnd, selectionYEnd, itemRefs.current);
		const overlappingIds = overlapping.map(el => Number(el.dataset.id));
		return apps.filter(app => overlappingIds.includes(app.id));
	}, [apps, selectionXEnd, selectionXStart, selectionYEnd, selectionYStart]);

	const onContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
		event.preventDefault();
	}, []);

	const onDragStart = useCallback((event: React.DragEvent<HTMLDivElement>) => {
		if (event.button === 0) {
			dispatch(clearActiveApps());
			setSelectionXStart(event.clientX);
			setSelectionYStart(event.clientY);
			setIsSelecting(true);
		}
	}, [dispatch]);

	const onMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
		if (isSelecting) {
			setSelectionXEnd(event.clientX);
			setSelectionYEnd(event.clientY);
		}
	}, [isSelecting]);

	const onDragEnd = useCallback((event: React.DragEvent<HTMLDivElement>) => {
		if (isSelecting && selectionXStart !== -1 && selectionXEnd !== -1 && selectionYStart !== -1 && selectionYEnd !== -1) {
			dispatch(setActiveApps(getAppsInSelectionBox()));
			setSelectionXStart(-1);
			setSelectionXEnd(-1);
			setSelectionYStart(-1);
			setSelectionYEnd(-1);
		}
		setIsSelecting(false);
	}, [dispatch, getAppsInSelectionBox, isSelecting, selectionXEnd, selectionXStart, selectionYEnd, selectionYStart]);

	const handleMouseEvent = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
		event.preventDefault();
		switch (event.button) {
			// Left Click
			case 0:
				if (isSelecting)
					onDragEnd(event as React.DragEvent<HTMLDivElement>);
				break;

			// Right Click
			case 2:
				break;
		}
	}, [isSelecting, onDragEnd]);

	useEffect(() => {
		const screenHeight = window.innerHeight;
		const desktopHeight = screenHeight - taskbarHeight;
		setColumnHeight(desktopHeight / (iconScale + 50) - 1);
	}, [iconScale, taskbarHeight]);

	useEffect(() => {
		console.log(appRegistry);
		for (const app of appRegistry.apps) {
			console.log(app);
			dispatch(addApp(app.app.getProps().appFile));
		}
	}, [dispatch]);

	const showApp = useCallback((id: number) => {
		const app = appRegistry.getClass(id);
		if (app) {
			return <OSAppWindow key={id + 0.1} app={app} />;
		}
	}, []);

	return <div
		className="relative flex flex-col w-screen h-screen bg-cover bg-center overflow-hidden select-none"
		style={{ backgroundImage: `url('${background}')` }}
		onMouseUp={handleMouseEvent}
		onContextMenu={onContextMenu}
		onMouseMove={onMouseMove}
		onMouseDown={onDragStart}
	>
		{isSelecting && selectionXStart >= 0 && selectionYStart >= 0 && selectionXEnd >= 0 && selectionYEnd >= 0 &&
			<div
				className="absolute bg-[#ffffff30] z-40 rounded-md border border-white"
				style={{
					top: Math.min(selectionYEnd, selectionYStart),
					left: Math.min(selectionXEnd, selectionXStart),
					bottom: Math.min(window.innerHeight - selectionYEnd, window.innerHeight - selectionYStart),
					right: Math.min(window.innerWidth - selectionXEnd, window.innerWidth - selectionXStart),
				}}
			>
			</div>
		}
		{columnHeight !== -1 &&
			<div
				className="gap-3 h-full px-1 grid z-10"
				style={{
					paddingBottom: taskbarHeight + 30,
					gridAutoFlow: 'column',
					gridTemplateRows: `repeat(${columnHeight.toFixed()}, minmax(0, 1fr))`,
					width: 0,
				}}
			>
				{apps.map((app, i) => (
					<OSAppFile key={app.id} name={app.name} icon={app.icon} id={app.id}
										 ref={el => {
											 if (el) itemRefs.current[i] = el;
										 }} />
				))}
			</div>
		}
		<Taskbar />
		{openApps.map(app => showApp(app.pid))}
	</div>;
}