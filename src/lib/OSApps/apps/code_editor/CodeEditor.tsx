import OSApp, { OSAppProps } from "@/lib/features/OSApp/OSApp";
import React from "react";
import { FaPlay } from "react-icons/fa";
import EditorComponent from "./EditorComponent";
import { OSFileSystem } from "../files/OSFileSystem";
import { File } from "../files/FilesItem";

export default class CodeEditor extends OSApp {
  constructor(props?: OSAppProps) {
    super(props);

    this.setAppFile({
      name: "CodeEditor",
      icon: "/icons/code-editor.png",
    });

    if (props && props.args) {
      const file = this.getFileFromArgs();
      this.headerTitle += " - " + file.name + file.extension;
    }

    this.addHeaderTrailingItem(<this.StartButton />);
  }

  private getFileFromArgs = () => {
    const fileArgIndex = this.args.indexOf("--file");
    if (fileArgIndex >= 0) {
      const filePath = this.args[fileArgIndex + 1];
      return OSFileSystem.getFile(filePath) ?? new File("temp", "/", ".txt");
    }
    return new File("temp", "/", ".txt");
  };

  body = () => <EditorComponent args={this.args} />;
  
  private StartButton = () => {
    return (
      <div className='flex flex-row justify-center items-center h-full'>
        <div
          className='flex justify-center items-center hover:bg-[#00C000] text-[#00C000] hover:text-white cursor-pointer p-1.5 rounded-md'
          onClick={() => {}}
        >
          <FaPlay />
        </div>
        <div className='bg-gray-500 h-[70%] w-[1px] mx-2' />
      </div>
    );
  };
}
