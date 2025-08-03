'use client';

import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import Image from 'next/image';
import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import { addActiveApp, clearActiveApps, removeActiveApp } from '@/lib/features/dekstop/desktopSlice';
import { launchApp } from '@/lib/features/windowManager/windowManagerSlice';

export interface OSAppFileProps {
	id: number;
	name: string;
	icon: string;
}

export const OSAppFile = forwardRef<HTMLDivElement, OSAppFileProps>((props, ref) => {
	const iconScale = useAppSelector(state => state.settings.iconScale);
	const dispatch = useAppDispatch();
	const activeApps = useAppSelector(state => state.desktop.activeApps);
	const [appSelect, setAppSelect] = useState(false);

	const onClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
		event.stopPropagation();
		if (event.ctrlKey) {
			if (!appSelect)
				dispatch(addActiveApp(props));
			else
				dispatch(removeActiveApp(props));
		} else if (appSelect) {
			// dispatch(renameApp([props.id, 'Haha']));
		} else {
			dispatch(clearActiveApps());
			dispatch(addActiveApp(props));
		}
	}, [appSelect, dispatch, props]);

	const runApp = useCallback(() => {
		dispatch(launchApp(props.id));
	}, [dispatch, props]);

	const onDragStart = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
		event.stopPropagation();
		event.preventDefault();
	}, []);

	useEffect(() => {
		setAppSelect(activeApps.some(app => app.id === props.id));
	}, [activeApps, props.id]);

	return <div
		className="flex flex-col justify-center items-center break-inside-avoid select-none hover:bg-[#ffffff30] rounded-md"
		onClick={onClick}
		onDoubleClick={runApp}
		onMouseDown={onDragStart}
		ref={ref}
		data-id={props.id}
		title={props.name}
		style={{
			height: iconScale + 50,
			width: iconScale + 10,
			backgroundColor: appSelect ? '#ffffff30' : undefined,
			border: appSelect ? '1px solid' : undefined,
		}}
	>
		<Image width={iconScale} height={iconScale} src={props.icon} alt="" />
		<p
			className="text-center break-words line-clamp-2">{props.name}</p>
	</div>;
});

OSAppFile.displayName = 'OSAppFile';