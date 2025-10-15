import OSApp, { OSAppProps } from "@/lib/features/OSApp/OSApp";
import React from "react";
import EditorComponent from "./EditorComponent";
import { OSFileSystem } from "../files/OSFileSystem";
import { File } from "../files/FilesItem";
import { editor } from "monaco-editor";

export default class CodeEditor extends OSApp {
  state: {
    editorRef: editor.IStandaloneCodeEditor | null;
  } = {
    editorRef: null,
  };

  constructor(props?: OSAppProps) {
    super(props);

    this.setAppFile({
      name: "CodeEditor",
      icon: "/icons/code-editor.png",
    });

    if (props && props.args) {
      const file = getFileFromArgs(props.args);
      this.setFileTitle(file.name + file.extension);
    }
  }

  body = () => (
    <EditorComponent
      args={this.args}
      addHeaderTrailingItem={this.addHeaderTrailingItem}
      removeHeaderTrailingItem={this.removeHeaderTrailingItem}
      setEditor={this.setEditor}
      setFileTitle={this.setFileTitle}
      appFileId={this.appFile.id}
    />
  );

  setFileTitle = (title: string) => {
    this.headerTitle = "CodeEditor - " + title;
  };

  setEditor = (editorRef: editor.IStandaloneCodeEditor) => {
    this.state.editorRef = editorRef;
  };

  protected mOnMaximize() {
    super.mOnMaximize();

    const editorRef = this.state.editorRef;
    if (editorRef && !this.isMaximized) {
      setTimeout(() => editorRef.layout({} as editor.IDimension), 300);
    }
  }

  protected mOnResizing(event: MouseEvent) {
    super.mOnResizing(event);

    const editorRef = this.state.editorRef;
    if (editorRef) editorRef.layout({} as editor.IDimension);
  }
}

const getFileFromArgs = (args: string[]) => {
  const fileArgIndex = args.indexOf("--file");
  if (fileArgIndex >= 0) {
    const filePath = args[fileArgIndex + 1];
    return OSFileSystem.getFile(filePath) ?? new File("temp", "/", ".txt");
  }
  return new File("temp", "/", ".txt");
};
