import OSApp, { OSAppProps } from "@/lib/features/OSApp/OSApp";
import React from "react";
import EditorComponent from "./EditorComponent";
import { OSFileSystem } from "../files/OSFileSystem";
import { File } from "../files/FilesItem";

export default class CodeEditor extends OSApp {
  state: { resizeCallback: ((event: MouseEvent) => void) | null } = {
    resizeCallback: null,
  };

  constructor(props?: OSAppProps) {
    super(props);

    this.setAppFile({
      name: "CodeEditor",
      icon: "/icons/code-editor.png",
    });

    if (props && props.args) {
      const file = getFileFromArgs(props.args);
      this.headerTitle += " - " + file.name + file.extension;
    }
  }

  body = () => (
    <EditorComponent
      args={this.args}
      addHeaderTrailingItem={this.addHeaderTrailingItem}
      removeHeaderTrailingItem={this.removeHeaderTrailingItem}
    />
  );
}

const getFileFromArgs = (args: string[]) => {
  const fileArgIndex = args.indexOf("--file");
  if (fileArgIndex >= 0) {
    const filePath = args[fileArgIndex + 1];
    return OSFileSystem.getFile(filePath) ?? new File("temp", "/", ".txt");
  }
  return new File("temp", "/", ".txt");
};
