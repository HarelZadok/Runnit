import Editor, { Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { OSFileSystem } from "../files/OSFileSystem";
import { File } from "../files/FilesItem";
import { useAppDispatch, useIsAppShowing } from "@/lib/hooks";
import OSApp from "@/lib/features/OSApp/OSApp";
import { addApp, updateApp } from "@/lib/OSApps/AppList";
import {
  launchApp,
  launchAppSilent,
  updateWindowRender,
} from "@/lib/features/windowManager/windowManagerSlice";
import { makeClassFromTsx } from "@/lib/runtimeCompiler";
import { FaPlay } from "react-icons/fa";

interface EditorComponentProps {
  args: string[];
  addHeaderTrailingItem: (headerItem: ReactElement) => void;
  removeHeaderTrailingItem: (headerItem: ReactElement) => void;
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
  const [instance, setInstance] = useState<OSApp | null>(null);

  useEffect(() => {
    if (file) OSFileSystem.updateFileValue(file, value);
  }, [file, value]);

  const dispatch = useAppDispatch();
  const isAppShowing = useIsAppShowing(instance);

  useEffect(() => {
    if (instance !== null) {
      instance.isDev = true;
      const id = addApp(instance);
      if (isAppShowing) {
        dispatch(launchAppSilent({ id }));
        dispatch(updateWindowRender(id));
      } else dispatch(launchApp({ id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance, dispatch]);

  const { addHeaderTrailingItem, removeHeaderTrailingItem, args } = props;
  useEffect(() => {
    const button = (
      <StartButton instance={instance} setInstance={setInstance} args={args} />
    );
    if (file.extension === ".osapp") addHeaderTrailingItem(button);

    return () => removeHeaderTrailingItem(button);
  }, [
    addHeaderTrailingItem,
    args,
    file.extension,
    instance,
    removeHeaderTrailingItem,
  ]);

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
declare module "runnit/OSApp" {
  // shape should mirror your class’s public surface
  export interface OSAppFileProps { id?: number; name: string; icon: string }
  export interface OSAppProps { args?: string[] }

  export default class OSApp extends import("react").Component<OSAppProps> {
    static appCount: number;
    readonly defaultWidth: number;
    readonly defaultHeight: number;
    minimumWidth: number;
    minimumHeight: number;
    appFile: OSAppFileProps;
    args: string[];
    isMaximized: boolean;
    isMinimized: boolean;
    width: number;
    height: number;

    constructor(props?: OSAppProps);
    header(): import("react").ReactElement;
    body(): import("react").ReactElement;

    setMaximize(maximize: boolean): void;
    setMinimize(minimize: boolean): void;

    getAppProps(): {
      appFile: OSAppFileProps;
      header: () => import("react").ReactElement;
      body: () => import("react").ReactElement;
      defaultWidth: number;
      defaultHeight: number;
    };

    protected setAppFile(input: { name?: string; icon?: string }): void;
    protected addHeaderTrailingItem(item: import("react").ReactElement): void;
    protected removeHeaderTrailingItem(item: import("react").ReactElement): void;
    protected setHeaderTrailingItems(items: import("react").ReactElement[]): void;
    protected mOnGrabStart(event: import("react").DragEvent<HTMLDivElement>): void;
    protected mOnGrabbing(event: MouseEvent): void;
    protected mOnGrabEnd(event: MouseEvent): void;
    protected mOnResizeStart(event: import("react").MouseEvent): void;
    protected mOnResizing(event: MouseEvent): void;
    protected mOnResizeEnd(event: MouseEvent): void;
  }
}
`,
      "file:///node_modules/@types/runnit/index.d.ts",
    );

    // (optional) path hint
    const ts = monaco.languages.typescript;
    ts.typescriptDefaults.setCompilerOptions({
      ...ts.typescriptDefaults.getCompilerOptions(),
      baseUrl: "file:///",
      paths: {
        ...(ts.typescriptDefaults.getCompilerOptions().paths || {}),
        "runnit/OSApp": ["node_modules/@types/runnit/index.d.ts"],
      },
    });
  };

  const handleMount = (editor: editor.IStandaloneCodeEditor) => {
    editor.getModel()!.updateOptions({
      tabSize: 2,
    });
    editorRef.current = editor;
  };

  return (
    <div
      className="w-full h-full flex flex-col"
      onKeyDown={async (e) => {
        if (e.ctrlKey && e.key === "s") {
          e.preventDefault();
          if (isAppShowing) {
            const NewApp = await makeClassFromTsx(getFileFromArgs().value);
            const newInstance = new NewApp() as OSApp;
            const newAppFile = {
              ...newInstance.appFile,
              id: instance!.appFile.id,
            };
            newInstance.setAppFile(newAppFile);
            if (updateApp(newInstance)) setInstance(newInstance);
          }
        }
      }}
    >
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
        options={{ autoIndent: "full", automaticLayout: true }}
      />
    </div>
  );
}

const StartButton = ({
  args,
  instance,
  setInstance,
}: {
  args: string[];
  instance: OSApp | null;
  setInstance: (app: OSApp | null) => void;
}) => {
  const getFileFromArgs = (args: string[]) => {
    const fileArgIndex = args.indexOf("--file");
    if (fileArgIndex >= 0) {
      const filePath = args[fileArgIndex + 1];
      return OSFileSystem.getFile(filePath) ?? new File("temp", "/", ".txt");
    }
    return new File("temp", "/", ".txt");
  };

  return (
    <div className="flex flex-row justify-center items-center h-full">
      <button
        className="flex justify-center items-center hover:bg-[#00C000] text-[#00C000] hover:text-white cursor-pointer p-1.5 rounded-md"
        onClick={async () => {
          if (instance === null) {
            const NewApp = await makeClassFromTsx(getFileFromArgs(args).value);
            setInstance(new NewApp());
          } else {
            const NewApp = await makeClassFromTsx(getFileFromArgs(args).value);
            const newInstance = new NewApp() as OSApp;
            const newAppFile = {
              ...newInstance.appFile,
              id: instance!.appFile.id,
            };
            newInstance.setAppFile(newAppFile);
            if (updateApp(newInstance)) setInstance(newInstance);
          }
        }}
      >
        <FaPlay />
      </button>
      <div className="bg-gray-500 h-[70%] w-[1px] mx-2" />
    </div>
  );
};
