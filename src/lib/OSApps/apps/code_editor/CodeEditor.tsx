import OSApp, { OSAppProps } from "@/lib/features/OSApp/OSApp";
import React from "react";
import { FaPlay } from "react-icons/fa";
import EditorComponent from "./EditorComponent";

export default class CodeEditor extends OSApp {
  constructor(props?: OSAppProps) {
    super(props);

    this.setAppFile({
      name: "CodeEditor",
      icon: "/icons/code-editor.png",
    });

    this.addHeaderTrailingItem(<this.StartButton />);
  }

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
