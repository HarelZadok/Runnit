import React, { ReactElement } from 'react';
import { OSAppFileProps } from '@/lib/features/OSApp/OSAppFile';
import { RiCloseLargeLine } from 'react-icons/ri';
import { FiMaximize } from 'react-icons/fi';
import { IoIosArrowDown } from 'react-icons/io';
import Image from 'next/image';

export interface OSAppProps {
	appFile: OSAppFileProps;
	header: () => ReactElement;
	render: () => ReactElement;
	defaultWidth: number;
	defaultHeight: number;
}

export abstract class OSApp implements OSAppProps {
	public appFile: OSAppFileProps;
	public defaultWidth: number;
	public defaultHeight: number;
	private onGrab: ((event: React.DragEvent<HTMLDivElement>) => void) | undefined;
	private onGrabbing: ((event: React.DragEvent<HTMLDivElement>) => void) | undefined;
	private onRelease: ((event: React.DragEvent<HTMLDivElement>) => void) | undefined;
	private isDragging: boolean = false;
	private isMaximized = false;
	private onMaximize: (() => void) | undefined;
	private isMinimized = false;
	private onMinimize: (() => void) | undefined;
	private onClose: (() => void) | undefined;


	protected constructor(id: number, name: string, icon: string) {
		this.appFile = {
			id: id,
			name: name,
			icon: icon,
		};

		this.defaultWidth = 1100;
		this.defaultHeight = 700;
	}

	setOnGrab = (callback: (event: React.DragEvent<HTMLDivElement>) => void) => {
		this.onGrab = callback;
	};

	setOnGrabbing = (callback: (event: React.DragEvent<HTMLDivElement>) => void) => {
		this.onGrabbing = callback;
	};

	setOnRelease = (callback: (event: React.DragEvent<HTMLDivElement>) => void) => {
		this.onRelease = callback;
	};

	setOnMaximize = (callback: () => void) => {
		this.onMaximize = callback;
	};

	setOnMinimize = (callback: () => void) => {
		this.onMinimize = callback;
	};

	setOnClose = (callback: () => void) => {
		this.onClose = callback;
	};

	header(): ReactElement {
		return <div className="flex flex-row justify-between items-center h-10 bg-[#000000AA] backdrop-blur-3xl text-white">
			<div
				// onContextMenu={onContextMenu}
				onMouseUp={this.onDragEnd}
				onMouseMove={this.onDragging}
				onMouseDown={this.onDragStart}
				className="w-full h-full flex flex-row items-center px-2 gap-2"
			>
				<Image src={this.appFile.icon} alt="" width={20} height={20} />
				<small>{this.appFile.name}</small>
			</div>
			<div className="h-full flex flex-row cursor-pointer">
				<div className="hover:bg-gray-300 text-gray-300 hover:text-black h-full w-8 flex justify-center items-center"
						 onClick={() => {
							 this.isMinimized = !this.isMinimized;
							 if (this.onMinimize) this.onMinimize();
						 }}>
					<IoIosArrowDown />
				</div>
				<div
					className="hover:bg-yellow-500 text-yellow-500 hover:text-black h-full w-8 flex justify-center items-center"
					onClick={() => {
						this.isMaximized = !this.isMaximized;
						if (this.onMaximize) this.onMaximize();
					}}>
					<FiMaximize />
				</div>
				<div className="hover:bg-red-500 text-red-500 hover:text-black h-full w-8 flex justify-center items-center"
						 onClick={() => {
							 if (this.onClose)
								 this.onClose();
						 }}>
					<RiCloseLargeLine />
				</div>
			</div>
		</div>;
	};

	render(): ReactElement {
		return <div onMouseDown={e => e.stopPropagation()}
								className="bg-white h-full w-full flex justify-center items-center">
			<p className="text-black">Override {this.constructor.name}.render() to update the app.</p>
		</div>;
	};

	getProps(): OSAppProps {
		return {
			appFile: this.appFile,
			header: this.header,
			render: this.render,
			defaultWidth: this.defaultWidth,
			defaultHeight: this.defaultHeight,
		};
	}

	protected onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
		event.stopPropagation();
		this.isDragging = true;
		if (this.onGrab)
			this.onGrab(event);
	};

	protected onDragging = (event: React.DragEvent<HTMLDivElement>) => {
		if (!this.isDragging) return;

		event.stopPropagation();
		if (this.onGrabbing)
			this.onGrabbing(event);
	};

	protected onDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
		if (!this.isDragging) return;

		event.stopPropagation();
		if (this.onRelease)
			this.onRelease(event);
		this.isDragging = false;
	};
}