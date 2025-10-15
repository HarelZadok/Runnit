"use client";

import React, {
  cloneElement,
  Component,
  DragEvent as ReactDragEvent,
  JSX,
  MouseEvent as ReactMouseEvent,
  ReactElement,
} from "react";
import { OSAppFileProps } from "@/lib/features/OSApp/OSAppFile";
import { RiCloseLargeLine } from "react-icons/ri";
import { FiMaximize, FiMinimize } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import Image from "next/image";
import appRegistry from "@/lib/OSApps/AppRegistry";
import { mapStack } from "@/lib/runtimeCompiler";

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
  isDev?: boolean;
  devMessage?: string;
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
  public isMaximized = false;
  public isMinimized = false;
  public width = -1;
  public height = -1;
  public isDev = false;
  public devMessage = "";
  protected headerTitle: string;
  private readonly headerHeight: number;
  // Variables
  private isResizing = false;
  private northResize = false;
  private southResize = false;
  private eastResize = false;
  private westResize = false;
  // Internal drag state and lifecycle callbacks
  private onGrab: ((event: ReactDragEvent<HTMLDivElement>) => void) | undefined;
  private onGrabbing: ((event: MouseEvent) => void) | undefined;
  private onRelease: ((event: MouseEvent) => void) | undefined;
  private isDragging: boolean = false;
  private onMaximize: (() => void) | undefined;
  private onMinimize: (() => void) | undefined;
  private onResizeStart:
    | ((event: ReactMouseEvent, sides: Sides[]) => void)
    | undefined;
  private onResizing: ((event: MouseEvent, sides: Sides[]) => void) | undefined;
  private onResizeEnd:
    | ((event: MouseEvent, sides: Sides[]) => void)
    | undefined;
  private onClose: (() => void) | undefined;
  private headerTrailingItems: ReactElement[];

  protected constructor(props?: OSAppProps) {
    super(props ?? {});

    this.headerTitle = "";
    this.isDev = props?.isDev ?? false;
    this.devMessage = props?.devMessage ?? "";

    let id = appRegistry.apps.findIndex(
      (app) => app.app.constructor === this.constructor,
    );

    if (id < 0) id = OSApp.appCount++;

    // Initialize app metadata and default window size
    this.appFile = {
      id: id,
      name: "",
      icon: "",
    };

    this.args = props?.args ?? [];

    this.headerTrailingItems = [];
    if (typeof window !== "undefined") {
      this.defaultWidth = window.innerWidth * 0.7;
      this.defaultHeight = window.innerHeight * 0.8;
    } else {
      this.defaultWidth = 1100;
      this.defaultHeight = 700;
    }
    this.minimumWidth = 450;
    this.minimumHeight = 250;
    this.headerHeight = 40;
  }

  setOnGrabStart = (
    callback: (event: ReactDragEvent<HTMLDivElement>) => void,
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
    callback: (event: ReactMouseEvent, sides: Sides[]) => void,
  ) => {
    this.onResizeStart = callback;
  };

  setOnResizing = (callback: (event: MouseEvent, sides: Sides[]) => void) => {
    this.onResizing = callback;
  };

  setOnResizeEnd = (callback: (event: MouseEvent, sides: Sides[]) => void) => {
    this.onResizeEnd = callback;
  };

  public setMaximize = (maximize: boolean) => {
    if (this.isMaximized !== maximize) {
      this.isMaximized = maximize;
      this.mOnMaximize();
    }
  };

  setMinimize = (minimize: boolean) => {
    if (this.onMinimize && this.isMinimized !== minimize) {
      this.onMinimize();
      this.isMinimized = minimize;
    }
  };

  header(): JSX.Element {
    return (
      <div
        className="flex flex-row justify-between items-center bg-[#25252594] text-white backdrop-blur-2xl"
        style={{ height: this.headerHeight }}
      >
        <div
          draggable
          onDragStart={this.mOnGrabStart.bind(this)}
          onDoubleClick={() => {
            this.setMaximize(!this.isMaximized);
          }}
          className="w-full h-full flex flex-row items-center px-2 gap-2"
        >
          <Image src={this.appFile.icon} alt="" width={20} height={20} />
          <small>{this.headerTitle}</small>
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
            {this.isMaximized ? <FiMinimize /> : <FiMaximize />}
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

  body(): JSX.Element {
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
          onMouseDownCapture={this.mOnResizeStart.bind(this)}
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
          onMouseDownCapture={this.mOnResizeStart.bind(this)}
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
          onMouseDownCapture={this.mOnResizeStart.bind(this)}
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
          onMouseDownCapture={this.mOnResizeStart.bind(this)}
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
          onMouseDownCapture={this.mOnResizeStart.bind(this)}
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
          onMouseDownCapture={this.mOnResizeStart.bind(this)}
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
          onMouseDownCapture={this.mOnResizeStart.bind(this)}
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
          onMouseDownCapture={this.mOnResizeStart.bind(this)}
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
        {!(this.isDev && this.devMessage.length > 0) ? (
          <div className="h-full w-full overflow-hidden">
            {(() => {
              try {
                return this.body();
              } catch (e) {
                const error = e as Error;
                return (
                  <div className="bg-black h-full w-full text-white flex flex-col justify-center items-center gap-4">
                    <p className="text-3xl justify-self-start">
                      Error rendering window!
                    </p>
                    <p className="text-lg">{error.stack}</p>
                  </div>
                );
              }
            })()}
          </div>
        ) : (
          <div className="bg-black w-full h-full flex justify-center items-center overflow-y-scroll scrollbar scrollbar-corner-transparent scrollbar-track-transparent scrollbar-thumb-white scr">
            <pre className="text-white whitespace-pre-wrap">
              {mapStack(this.devMessage)}
            </pre>
          </div>
        )}
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

  public setAppFile = ({
    name = undefined,
    icon = undefined,
    id = undefined,
  }: {
    name?: string;
    icon?: string;
    id?: number;
  }) => {
    this.appFile = {
      id: id ?? this.appFile.id,
      name: name ?? this.appFile.name,
      icon: icon ?? this.appFile.icon,
    };

    this.headerTitle = this.appFile.name;
  };

  protected mOnMaximize() {
    if (this.onMaximize) this.onMaximize();
  }

  protected addHeaderTrailingItem = (headerItem: ReactElement) => {
    this.headerTrailingItems.push(headerItem);
  };

  protected removeHeaderTrailingItem = (headerItem: ReactElement) => {
    this.headerTrailingItems = this.headerTrailingItems.filter(
      (item) => item !== headerItem,
    );
  };

  protected setHeaderTrailingItems = (items: ReactElement[]) => {
    this.headerTrailingItems = items;
  };

  protected mOnGrabStart(event: ReactDragEvent<HTMLDivElement>) {
    // Begin drag, invoke external handler if provided
    event.preventDefault();
    event.stopPropagation();

    document.onmousemove = this.mOnGrabbing.bind(this);
    document.onmouseup = this.mOnGrabEnd.bind(this);

    this.isDragging = true;
    if (this.onGrab) this.onGrab(event);
  }

  protected mOnGrabbing(event: MouseEvent) {
    // Continue drag movement
    if (!this.isDragging) return;

    event.stopPropagation();

    if (this.onGrabbing) this.onGrabbing(event);
  }

  protected mOnGrabEnd(event: MouseEvent) {
    // End drag, invoke release handler
    if (!this.isDragging) return;

    document.onmousemove = null;
    document.onmouseup = null;

    event.stopPropagation();

    if (this.onRelease) this.onRelease(event);
    this.isDragging = false;
  }

  protected mOnResizeStart(event: ReactMouseEvent) {
    if (this.isResizing) return;

    event.stopPropagation();
    event.preventDefault();

    this.isResizing = true;
    document.body.onmousemove = this.mOnResizing.bind(this);
    document.body.onmouseup = this.mOnResizeEnd.bind(this);

    if (this.onResizeStart) {
      const sides: Sides[] = [];
      if (this.northResize) sides.push("north");
      if (this.southResize) sides.push("south");
      if (this.eastResize) sides.push("east");
      if (this.westResize) sides.push("west");
      this.onResizeStart(event, sides);
    }
  }

  protected mOnResizing(event: MouseEvent) {
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
  }

  protected mOnResizeEnd(event: MouseEvent) {
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
  }

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
