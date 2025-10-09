import Editor, { Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { useCallback, useEffect, useRef, useState } from "react";
import { OSFileSystem } from "../files/OSFileSystem";
import { File } from "../files/FilesItem";

interface EditorComponentProps {
  args: string[];
}

export default function EditorComponent(props: EditorComponentProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const getFileFromArgs = useCallback(() => {
    const i = props.args.indexOf("--file");
    if (i >= 0) {
      const filePath = props.args[i + 1];
      const f = OSFileSystem.getFile(filePath);
      return f ?? new File("temp", "/", ".txt");
    }
    return new File("temp", "/", ".txt");
  }, [props.args]);

  const [file, setFile] = useState(getFileFromArgs());
  const [value, setValue] = useState(file.value);

  useEffect(() => {
    if (file) OSFileSystem.updateFileValue(file, value);
  }, [file, value]);

  // Configure TS *before* Editor creates the model.
  const handleBeforeMount = async (monaco: Monaco) => {
    monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      allowJs: true,
      allowNonTsExtensions: true,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      jsxImportSource: "react",
      baseUrl: "file:///",
      typeRoots: ["file:///node_modules/@types"],
      checkJs: false,
    });

    // Disable JS diagnostics so they don't flag TS syntax
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
      noSuggestionDiagnostics: true,
    });
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      checkJs: false,
    });

    // (Optional) load React d.ts here if you haven't already
    const add = async (url: string, vpath: string) => {
      const txt = await (await fetch(url)).text();
      monaco.languages.typescript.typescriptDefaults.addExtraLib(txt, vpath);
    };
    await add(
      "https://unpkg.com/@types/react@19.1.0/index.d.ts",
      "file:///node_modules/@types/react/index.d.ts",
    );
    await add(
      "https://unpkg.com/@types/react@19.1.0/jsx-runtime.d.ts",
      "file:///node_modules/@types/react/jsx-runtime.d.ts",
    );
    await add(
      "https://unpkg.com/@types/react@19.1.0/jsx-dev-runtime.d.ts",
      "file:///node_modules/@types/react/jsx-dev-runtime.d.ts",
    );
    await add(
      "https://unpkg.com/@types/react@19.1.0/global.d.ts",
      "file:///node_modules/@types/react/global.d.ts",
    );
    await add(
      "https://unpkg.com/@types/prop-types@15.7.15/index.d.ts",
      "file:///node_modules/@types/prop-types/index.d.ts",
    );
    await add(
      "https://unpkg.com/csstype@3.1.3/index.d.ts",
      "file:///node_modules/csstype/index.d.ts",
    );
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      `
declare namespace Runnit {
  interface OSAppFileProps {
    id?: number;
    name: string;
    icon: string;
  }

  interface OSAppProps {
    args?: string[];
  }

  // Mirror the surface you actually use in code (can be a subset)
  class OSApp extends import("react").Component<OSAppProps> {
    constructor(props?: OSAppProps);

    // public fields
    static appCount: number;
    readonly defaultWidth: number;
    readonly defaultHeight: number;
    minimumWidth: number;
    minimumHeight: number;
    appFile: OSAppFileProps;
    args: string[];
    isMaximized: boolean;
    isMinimized: boolean;
    headerTitle: string;

    // public/overridable methods
    header(): import("react").JSX.Element;
    body(): import("react").JSX.Element;
    render(): import("react").JSX.Element;

    getAppProps(): {
      appFile: OSAppFileProps;
      header: () => import("react").ReactElement;
      body: () => import("react").ReactElement;
      defaultWidth: number;
      defaultHeight: number;
    };

    // protected APIs you call from subclasses
    protected setAppFile(args: { name?: string; icon?: string }): void;
    protected addHeaderTrailingItem(item: import("react").ReactElement): void;
  }
}

declare const OSApp: typeof Runnit.OSApp;
declare type OSAppProps = Runnit.OSAppProps;
declare type OSAppFileProps = Runnit.OSAppFileProps;
`,
      "file:///node_modules/@types/runnit/globals.d.ts",
    );
  };

  const handleMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    // No createModel() here! The Editor already created it with the path we pass.
    console.log("Language:", editor.getModel()?.getLanguageId()); // should be "typescript"
  };

  return (
    <div className="w-full h-full">
      <Editor
        width="100%"
        height="100%"
        value={value}
        onChange={(v) => setValue(v ?? "")}
        theme="vs-dark"
        language="typescript"
        /** This is the important bit: give the model a .tsx URI */
        path="file:///virtual/dynamic-app.tsx"
        beforeMount={handleBeforeMount}
        onMount={handleMount}
        options={{ automaticLayout: true }}
      />
    </div>
  );
}
