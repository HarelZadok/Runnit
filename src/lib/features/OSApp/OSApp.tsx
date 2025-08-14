"use client";

import React, { cloneElement, Component, ReactElement } from "react";
import { OSAppFileProps } from "@/lib/features/OSApp/OSAppFile";
import { RiCloseLargeLine } from "react-icons/ri";
import { FiMaximize } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import Image from "next/image";

// OSApp.tsx: Base class for all OS-style applications, handling window control hooks and metadata
export interface OSAppInterface {
  appFile: OSAppFileProps;
  header: () => ReactElement;
  body: () => ReactElement;
  defaultWidth: number;
  defaultHeight: number;
}

export interface OSAppProps {
  args?: string[];
}

type Sides = "north" | "south" | "east" | "west";

export default abstract class OSApp
  extends Component
  implements OSAppInterface
{
  public static appCount = 0;
  // Default properties
  public readonly defaultWidth: number;
  public readonly defaultHeight: number;
  public minimumWidth: number;
  public minimumHeight: number;
  // appFile stores basic info (id, name, icon) passed to desktop and taskbar
  public appFile: OSAppFileProps;
  public args: string[];
  private readonly headerHeight: number;
  // Variables
  private isResizing = false;
  private northResize = false;
  private southResize = false;
  private eastResize = false;
  private westResize = false;
  // Internal drag state and lifecycle callbacks
  private onGrab:
    | ((event: React.DragEvent<HTMLDivElement>) => void)
    | undefined;
  private onGrabbing: ((event: MouseEvent) => void) | undefined;
  private onRelease: ((event: MouseEvent) => void) | undefined;
  private isDragging: boolean = false;
  private isMaximized = false;
  private onMaximize: (() => void) | undefined;
  private isMinimized = false;
  private onMinimize: (() => void) | undefined;
  private onResizeStart:
    | ((event: React.MouseEvent, sides: Sides[]) => void)
    | undefined;
  private onResizing: ((event: MouseEvent, sides: Sides[]) => void) | undefined;
  private onResizeEnd:
    | ((event: MouseEvent, sides: Sides[]) => void)
    | undefined;
  private onClose: (() => void) | undefined;
  private headerTrailingItems: ReactElement[];

  protected constructor(props?: OSAppProps) {
    super(props ?? {});

    // Initialize app metadata and default window size
    this.appFile = {
      id: OSApp.appCount++,
      name: "",
      icon: "",
    };

    this.args = props?.args ?? [];

    this.headerTrailingItems = [];
    this.defaultWidth = 1100;
    this.defaultHeight = 700;
    this.minimumWidth = 450;
    this.minimumHeight = 250;
    this.headerHeight = 40;
  }

  setOnGrabStart = (
    callback: (event: React.DragEvent<HTMLDivElement>) => void,
  ) => {
    this.onGrab = callback;
  };

  setOnGrabbing = (callback: (event: MouseEvent) => void) => {
    this.onGrabbing = callback;
  };

  setOnGrabEnd = (callback: (event: MouseEvent) => void) => {
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

  setOnResizeStart = (
    callback: (event: React.MouseEvent, sides: Sides[]) => void,
  ) => {
    this.onResizeStart = callback;
  };

  setOnResizing = (callback: (event: MouseEvent, sides: Sides[]) => void) => {
    this.onResizing = callback;
  };

  setOnResizeEnd = (callback: (event: MouseEvent, sides: Sides[]) => void) => {
    this.onResizeEnd = callback;
  };

  setMaximize = (maximize: boolean) => {
    if (this.onMaximize && this.isMaximized !== maximize) {
      this.onMaximize();
      this.isMaximized = maximize;
    }
  };

  setMinimize = (minimize: boolean) => {
    if (this.onMinimize && this.isMinimized !== minimize) {
      this.onMinimize();
      this.isMinimized = minimize;
    }
  };

  header(): ReactElement {
    return (
      <div
        className="flex flex-row justify-between items-center bg-[#252525B4] text-white"
        style={{ height: this.headerHeight }}
      >
        <div
          draggable
          // onContextMenu={onContextMenu}
          onDragStart={this.mOnGrabStart}
          onDoubleClick={() => {
            this.setMaximize(!this.isMaximized);
          }}
          className="w-full h-full flex flex-row items-center px-2 gap-2"
        >
          <Image src={this.appFile.icon} alt="" width={20} height={20} />
          <small>{this.appFile.name}</small>
        </div>
        <div className="h-full flex flex-row">
          {this.headerTrailingItems.map((item, i) =>
            cloneElement(item, { key: i }),
          )}
          <div
            className="hover:bg-gray-300 text-gray-300 hover:text-black h-full w-8 flex justify-center items-center cursor-pointer"
            onClick={() => {
              this.setMinimize(!this.isMinimized);
            }}
          >
            <IoIosArrowDown />
          </div>
          <div
            className="hover:bg-yellow-500 text-yellow-500 hover:text-black h-full w-8 flex justify-center items-center cursor-pointer"
            onClick={() => {
              this.setMaximize(!this.isMaximized);
            }}
          >
            <FiMaximize />
          </div>
          <div
            className="hover:bg-red-500 text-red-500 hover:text-black h-full w-8 flex justify-center items-center cursor-pointer"
            onClick={() => {
              if (this.onClose) this.onClose();
            }}
          >
            <RiCloseLargeLine />
          </div>
        </div>
      </div>
    );
  }

  body(): ReactElement {
    return (
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="bg-white flex flex-col justify-center items-center w-full h-full"
      >
        <p className="text-black">
          Override {this.constructor.name}.body() to update the app.
        </p>
      </div>
    );
  }

  render() {
    return (
      <div
        className="w-full h-full"
        style={{ width: "100%", height: `calc(100% - ${this.headerHeight}px)` }}
      >
        <div
          id="north"
          draggable
          onMouseDownCapture={this.mOnResizeStart}
          onMouseOverCapture={() => {
            if (this.isResizing) return;

            this.northResize = true;
            this.mResizeUpdateCursor();
          }}
          onMouseOutCapture={() => {
            if (!this.isResizing) {
              this.northResize = false;
              this.mResizeUpdateCursor();
            }
          }}
          style={{
            position: "absolute",
            backgroundColor: "transparent",
            top: 0,
            left: 5,
            width: "calc(100% - 10px)",
            height: 5,
            zIndex: 1,
          }}
        />
        <div
          id="north-east"
          draggable
          onMouseDownCapture={this.mOnResizeStart}
          onMouseOverCapture={() => {
            if (this.isResizing) return;

            this.northResize = true;
            this.eastResize = true;
            this.mResizeUpdateCursor();
          }}
          onMouseOutCapture={() => {
            if (!this.isResizing) {
              this.northResize = false;
              this.eastResize = false;
              this.mResizeUpdateCursor();
            }
          }}
          style={{
            position: "absolute",
            backgroundColor: "transparent",
            top: 0,
            right: 0,
            width: 5,
            height: 5,
            zIndex: 1,
          }}
        />
        <div
          id="north-west"
          draggable
          onMouseDownCapture={this.mOnResizeStart}
          onMouseOverCapture={() => {
            if (this.isResizing) return;

            this.northResize = true;
            this.westResize = true;
            this.mResizeUpdateCursor();
          }}
          onMouseOutCapture={() => {
            if (!this.isResizing) {
              this.northResize = false;
              this.westResize = false;
              this.mResizeUpdateCursor();
            }
          }}
          style={{
            position: "absolute",
            backgroundColor: "transparent",
            top: 0,
            left: 0,
            width: 5,
            height: 5,
            zIndex: 1,
          }}
        />
        <div
          id="south"
          draggable
          onMouseDownCapture={this.mOnResizeStart}
          onMouseOverCapture={() => {
            if (this.isResizing) return;

            this.southResize = true;
            this.mResizeUpdateCursor();
          }}
          onMouseOutCapture={() => {
            if (!this.isResizing) {
              this.southResize = false;
              this.mResizeUpdateCursor();
            }
          }}
          style={{
            position: "absolute",
            backgroundColor: "transparent",
            bottom: 0,
            left: 5,
            width: "calc(100% - 10px)",
            height: 5,
            zIndex: 1,
          }}
        />
        <div
          id="south-east"
          draggable
          onMouseDownCapture={this.mOnResizeStart}
          onMouseOverCapture={() => {
            if (this.isResizing) return;

            this.southResize = true;
            this.eastResize = true;
            this.mResizeUpdateCursor();
          }}
          onMouseOutCapture={() => {
            if (!this.isResizing) {
              this.southResize = false;
              this.eastResize = false;
              this.mResizeUpdateCursor();
            }
          }}
          style={{
            position: "absolute",
            backgroundColor: "transparent",
            bottom: 0,
            right: 0,
            width: 5,
            height: 5,
            zIndex: 1,
          }}
        />
        <div
          id="south-west"
          draggable
          onMouseDownCapture={this.mOnResizeStart}
          onMouseOverCapture={() => {
            if (this.isResizing) return;

            this.southResize = true;
            this.westResize = true;
            this.mResizeUpdateCursor();
          }}
          onMouseOutCapture={() => {
            if (!this.isResizing) {
              this.southResize = false;
              this.westResize = false;
              this.mResizeUpdateCursor();
            }
          }}
          style={{
            position: "absolute",
            backgroundColor: "transparent",
            bottom: 0,
            left: 0,
            width: 5,
            height: 5,
            zIndex: 1,
          }}
        />
        <div
          id="east"
          draggable
          onMouseDownCapture={this.mOnResizeStart}
          onMouseOverCapture={() => {
            if (this.isResizing) return;

            this.eastResize = true;
            this.mResizeUpdateCursor();
          }}
          onMouseOutCapture={() => {
            if (!this.isResizing) {
              this.eastResize = false;
              this.mResizeUpdateCursor();
            }
          }}
          style={{
            position: "absolute",
            backgroundColor: "transparent",
            top: 5,
            right: 0,
            width: 5,
            height: "calc(100% - 10px)",
            zIndex: 1,
          }}
        />
        <div
          id="west"
          draggable
          onMouseDownCapture={this.mOnResizeStart}
          onMouseOverCapture={() => {
            if (this.isResizing) return;

            this.westResize = true;
            this.mResizeUpdateCursor();
          }}
          onMouseOutCapture={() => {
            if (!this.isResizing) {
              this.westResize = false;
              this.mResizeUpdateCursor();
            }
          }}
          style={{
            position: "absolute",
            backgroundColor: "transparent",
            top: 5,
            left: 0,
            width: 5,
            height: "calc(100% - 10px)",
            zIndex: 1,
          }}
        />
        {this.header()}
        <div className="h-full w-full overflow-hidden">{this.body()}</div>
      </div>
    );
  }

  getAppProps(): OSAppInterface {
    return {
      appFile: this.appFile,
      header: this.header,
      body: this.body,
      defaultWidth: this.defaultWidth,
      defaultHeight: this.defaultHeight,
    };
  }

  protected setAppFile = ({
    name = undefined,
    icon = undefined,
  }: {
    name?: string;
    icon?: string;
  }) => {
    this.appFile = {
      id: this.appFile.id,
      name: name ?? this.appFile.name,
      icon: icon ?? this.appFile.icon,
    };
  };

  protected addHeaderTrailingItem = (headerItem: ReactElement) => {
    this.headerTrailingItems.push(headerItem);
  };

  protected mOnGrabStart = (event: React.DragEvent<HTMLDivElement>) => {
    // Begin drag, invoke external handler if provided
    event.preventDefault();
    event.stopPropagation();

    document.onmousemove = this.mOnGrabbing;
    document.onmouseup = this.mOnGrabEnd;

    this.isDragging = true;
    if (this.onGrab) this.onGrab(event);
  };

  protected mOnGrabbing = (event: MouseEvent) => {
    // Continue drag movement
    if (!this.isDragging) return;

    event.stopPropagation();

    if (this.onGrabbing) this.onGrabbing(event);
  };

  protected mOnGrabEnd = (event: MouseEvent) => {
    // End drag, invoke release handler
    if (!this.isDragging) return;

    document.onmousemove = null;
    document.onmouseup = null;

    event.stopPropagation();

    if (this.onRelease) this.onRelease(event);
    this.isDragging = false;
  };

  protected mOnResizeStart = (event: React.MouseEvent) => {
    if (this.isResizing) return;

    event.stopPropagation();
    event.preventDefault();

    this.isResizing = true;
    document.body.onmousemove = this.mOnResizing;
    document.body.onmouseup = this.mOnResizeEnd;

    if (this.onResizeStart) {
      const sides: Sides[] = [];
      if (this.northResize) sides.push("north");
      if (this.southResize) sides.push("south");
      if (this.eastResize) sides.push("east");
      if (this.westResize) sides.push("west");
      this.onResizeStart(event, sides);
    }
  };

  protected mOnResizing = (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    if (this.onResizing) {
      const sides: Sides[] = [];
      if (this.northResize) sides.push("north");
      if (this.southResize) sides.push("south");
      if (this.eastResize) sides.push("east");
      if (this.westResize) sides.push("west");
      this.onResizing(event, sides);
    }
  };

  protected mOnResizeEnd = (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    this.isResizing = false;
    document.body.onmousemove = null;
    document.body.onmouseup = null;

    if (this.onResizeEnd) {
      const sides: Sides[] = [];
      if (this.northResize) sides.push("north");
      if (this.southResize) sides.push("south");
      if (this.eastResize) sides.push("east");
      if (this.westResize) sides.push("west");
      this.onResizeEnd(event, sides);
    }

    this.northResize = false;
    this.southResize = false;
    this.eastResize = false;
    this.westResize = false;
    this.mResizeUpdateCursor();
  };

  private mResizeUpdateCursor = () => {
    if (this.isDragging) return;

    if (this.northResize && this.eastResize)
      document.body.style.cursor = "ne-resize";
    else if (this.northResize && this.westResize)
      document.body.style.cursor = "nw-resize";
    else if (this.southResize && this.eastResize)
      document.body.style.cursor = "se-resize";
    else if (this.southResize && this.westResize)
      document.body.style.cursor = "sw-resize";
    else if (this.northResize) document.body.style.cursor = "n-resize";
    else if (this.southResize) document.body.style.cursor = "s-resize";
    else if (this.eastResize) document.body.style.cursor = "e-resize";
    else if (this.westResize) document.body.style.cursor = "w-resize";
    else document.body.style.cursor = "auto";
  };
}
