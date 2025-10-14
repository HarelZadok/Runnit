import Editor, { Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { OSFileSystem } from "../files/OSFileSystem";
import { File, Folder } from "../files/FilesItem";
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
import { IoIosArrowForward } from "react-icons/io";

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [folder, setFolder] = useState(
    OSFileSystem.getFolder(
      getFileFromArgs().path.substring(
        0,
        getFileFromArgs().path.lastIndexOf("/"),
      ),
    ),
  );
  const [value, setValue] = useState(file.value);
  const [instance, setInstance] = useState<OSApp | null>(null);

  useEffect(() => {
    setValue(file.value);
    editorRef.current?.setScrollPosition({ scrollLeft: 0, scrollTop: 0 });
  }, [file]);

  useEffect(() => {
    OSFileSystem.updateFileValue(file, value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

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

  const { addHeaderTrailingItem, removeHeaderTrailingItem } = props;
  useEffect(() => {
    const button = (
      <StartButton
        instance={instance}
        setInstance={setInstance}
        value={value}
      />
    );
    if (file.extension === ".osapp") addHeaderTrailingItem(button);

    return () => removeHeaderTrailingItem(button);
  }, [
    addHeaderTrailingItem,
    value,
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
      trimAutoWhitespace: true,
      indentSize: "tabSize",
      bracketColorizationOptions: {
        enabled: true,
        independentColorPoolPerBracketType: true,
      },
      insertSpaces: false,
    });
  };

  return (
    <div
      className="w-full h-full flex flex-row"
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
      <div className="w-55 h-full bg-black/70 backdrop-blur-3xl shrink-0 border-r border-gray-500/60">
        {folder && <FileExplorer setFile={setFile} folder={folder} />}
      </div>
      <div className="w-full h-full flex flex-col">
        <div className="h-10 w-full bg-black/90 backdrop-blur-3xl shrink-0"></div>
        <div className="bg-black w-full h-full">
          <Editor
            value={value}
            width="100%"
            height="100%"
            onChange={(v) => setValue(v ?? "")}
            theme="vs-dark"
            language="typescript"
            path="file:///virtual/dynamic-app.tsx"
            beforeMount={handleBeforeMount}
            onMount={handleMount}
            options={{ autoIndent: "full", automaticLayout: true }}
          />
        </div>
      </div>
    </div>
  );
}

const StartButton = ({
  value,
  instance,
  setInstance,
}: {
  value: string;
  instance: OSApp | null;
  setInstance: (app: OSApp | null) => void;
}) => {
  return (
    <div className="flex flex-row justify-center items-center h-full">
      <button
        className="flex justify-center items-center hover:bg-[#00C000] text-[#00C000] hover:text-white cursor-pointer p-1.5 rounded-md"
        onClick={async () => {
          if (instance === null) {
            const NewApp = await makeClassFromTsx(value);
            setInstance(new NewApp());
          } else {
            const NewApp = await makeClassFromTsx(value);
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

const FileExplorer = ({
  folder,
  setFile,
}: {
  folder: Folder;
  setFile: (file: File) => void;
}) => {
  folder.items = folder.items.sort((item1, item2) => {
    if ("items" in item1 && !("items" in item2)) {
      return -1;
    } else if (!("items" in item1) && "items" in item2) {
      return 1;
    } else {
      const len = Math.min(item1.name.length, item2.name.length);
      for (let i = 0; i < len; i++) {
        if (item1.name.charCodeAt(i) < item2.name.charCodeAt(i)) return -1;
        else if (item1.name.charCodeAt(i) > item2.name.charCodeAt(i)) return 1;
      }
      if (item1.name.length < item2.name.length) return -1;
      else if (item1.name.length > item2.name.length) return 1;
    }
    return 0;
  });

  return <FolderView setFile={setFile} folder={folder} />;
};

const FileView = ({
  file,
  setFile,
}: {
  file: File;
  setFile: (file: File) => void;
}) => {
  return (
    <p
      className="p-3 border-b border-gray-500/60 text-sm"
      onClick={() => setFile(file)}
    >
      {file.name + file.extension}
    </p>
  );
};

const FolderView = ({
  folder,
  setFile,
}: {
  folder: Folder;
  setFile: (file: File) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`flex flex-col ${!isOpen && "border-b"} border-gray-500/60`}
    >
      <div
        onClick={() => setIsOpen((p) => !p)}
        className="flex flex-row items-center p-2"
      >
        <IoIosArrowForward
          className={`${isOpen ? "rotate-90" : "rotate-0"} transition-all`}
        />
        <p className="text-sm p-1"> {folder.name}</p>
      </div>
      {isOpen && (
        <div className="pl-3">
          {folder.items.map((item) => {
            if ("extension" in item) {
              return (
                <FileView key={item.id} file={item as File} setFile={setFile} />
              );
            } else {
              return (
                <FolderView
                  key={item.id}
                  folder={item as Folder}
                  setFile={setFile}
                />
              );
            }
          })}
        </div>
      )}
    </div>
  );
};
