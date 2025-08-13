import OSApp from "@/lib/features/OSApp/OSApp";
import Editor from "@monaco-editor/react";
import { editor } from "monaco-editor";
import React, { createRef } from "react";
import { FaPlay } from "react-icons/fa";

export default class CodeEditor extends OSApp {
  private editorRef = createRef<editor.IStandaloneCodeEditor>();

  constructor(props?: never) {
    super(props);

    this.setAppFile({
      name: "CodeEditor",
      icon: "/icons/code-editor.png",
    });

    this.addHeaderTrailingItem(<this.StartButton />);
  }

  body() {
    return (
      <div className="w-full h-full">
        <Editor
          width="100%"
          height="100%"
          defaultLanguage="typescript"
          onMount={this.handleEditorDidMount}
        />
      </div>
    );
  }

  private StartButton = () => {
    return (
      <div className="flex flex-row justify-center items-center h-full">
        <div
          className="flex justify-center items-center hover:bg-[#00C000] text-[#00C000] hover:text-white cursor-pointer p-1.5 rounded-md"
          onClick={() => {}}
        >
          <FaPlay />
        </div>
        <div className="bg-gray-500 h-[70%] w-[1px] mx-2" />
      </div>
    );
  };

  private handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    this.editorRef.current = editor;
  };
}
