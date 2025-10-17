import Editor, { Monaco } from "@monaco-editor/react";
import { editor, IPosition, IRange, Uri } from "monaco-editor";
import React, {
  ReactElement,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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
import FileExplorer from "@/lib/OSApps/apps/code_editor/FileExplorer";
import StartButton from "@/lib/OSApps/apps/code_editor/StartButton";
import TabBar from "@/lib/OSApps/apps/code_editor/TabBar";
import StatsBar from "@/lib/OSApps/apps/code_editor/StatsBar";
import { EmptyApp } from "@/lib/OSApps/apps/empty_app/EmptyApp";

interface EditorComponentProps {
  args: string[];
  addHeaderTrailingItem: (headerItem: ReactElement) => void;
  removeHeaderTrailingItem: (headerItem: ReactElement) => void;
  setEditor: (editorRef: editor.IStandaloneCodeEditor) => void;
  appFileId: number;
  setFileTitle: (title: string) => void;
}

export default function EditorComponent(props: EditorComponentProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const [file, setFile] = useState<File | null>(getFileFromArgs(props.args));
  const [openTabs, setOpenTabs] = useState<File[]>([]);
  const [value, setValue] = useState(file?.value ?? "");
  const [instance, setInstance] = useState<OSApp | null>(null);

  const dispatch = useAppDispatch();
  const isAppShowing = useIsAppShowing(instance);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [folder, setFolder] = useState(() => {
    const file = getFileFromArgs(props.args);
    if (!file) return OSFileSystem.getFolder("/");
    return OSFileSystem.getFolder(
      file.path.substring(0, file.path.lastIndexOf("/")),
    );
  });

  useEffect(() => {
    if (file) {
      setOpenTabs((prev) =>
        file && !prev.some((t) => t.id === file.id) ? [...prev, file] : prev,
      );
    }
    setValue(file?.value ?? "");
  }, [file]);

  useEffect(() => {
    if (file) OSFileSystem.updateFileValue(file, value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (instance !== null) {
      instance.isDev = true;
      const id = addApp(instance);
      if (isAppShowing) {
        dispatch(
          launchAppSilent({
            id,
            args: instance.args,
            isDev: instance.isDev,
            devMessage: instance.devMessage,
            isMinimized: instance.isMinimized,
          }),
        );
        dispatch(updateWindowRender(id));
      } else dispatch(launchApp({ id, args: instance.args }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance, instance?.devMessage, dispatch]);

  const updateInstance = useCallback(
    async (launch: boolean) => {
      if (file && (launch || isAppShowing)) {
        try {
          const NewApp = await makeClassFromTsx(file.path, file.value);
          if (instance === null) {
            setInstance(new NewApp());
          } else {
            const newInstance = new NewApp() as OSApp;
            const newAppFile = {
              ...newInstance.appFile,
              id: instance!.appFile.id,
            };
            newInstance.setAppFile(newAppFile);
            if (updateApp(newInstance)) setInstance(newInstance);
          }
        } catch (e) {
          if (instance && isAppShowing) {
            const er = e as Error;
            const newInstance = new EmptyApp();
            newInstance.isDev = true;
            newInstance.devMessage = er.stack ?? er.name + ": " + er.message;
            const newAppFile = {
              ...newInstance.appFile,
              id: instance!.appFile.id,
            };
            newInstance.setAppFile(newAppFile);
            if (updateApp(newInstance)) {
              setInstance(newInstance);
            }
          }
        }
      }
    },
    [file, instance, isAppShowing],
  );

  const { addHeaderTrailingItem, removeHeaderTrailingItem, setFileTitle } =
    props;
  useEffect(() => {
    setFileTitle(file ? `${file.name}${file.extension}` : "Unnamed");
    const button = <StartButton updateInstance={updateInstance} />;
    if (file?.extension === ".osapp") addHeaderTrailingItem(button);
    dispatch(updateWindowRender(props.appFileId));
    return () => removeHeaderTrailingItem(button);
  }, [
    addHeaderTrailingItem,
    value,
    file?.extension,
    instance,
    removeHeaderTrailingItem,
    setFileTitle,
    file,
    dispatch,
    props.appFileId,
    updateInstance,
  ]);

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
    editor.layout();
    props.setEditor(editor);
    editorRef.current = editor;
  };

  return (
    <div
      className="w-full h-full flex flex-row"
      onKeyDown={async (e) => {
        if (e.ctrlKey && e.key === "s") {
          e.preventDefault();
          if (file?.extension === ".osapp") await updateInstance(false);
        }
      }}
    >
      {folder && (
        <FileExplorer setFile={setFile} folder={folder} activeFile={file} />
      )}
      <div className="w-full h-full flex flex-col">
        <TabBar
          activeFile={file}
          setActiveFile={setFile}
          openTabs={openTabs}
          setOpenTabs={setOpenTabs}
        />
        <div className="w-full h-0 shrink-0 flex-1">
          {file ? (
            <Editor
              value={value}
              onChange={(v) => setValue(v ?? "")}
              theme="vs-dark"
              language="typescript"
              path={
                file.path.endsWith(".osapp")
                  ? file.path.replace(
                      file.name + file?.extension,
                      file.name + ".tsx",
                    )
                  : file.path
              }
              className="shrink-0"
              beforeMount={(monaco) => handleBeforeMount(monaco, setFile)}
              onMount={handleMount}
              options={{ autoIndent: "full", automaticLayout: true }}
            />
          ) : (
            <div className="w-full h-full flex justify-center items-center text-3xl bg-gray-950/90 backdrop-blur-2xl">
              Start by opening a file.
            </div>
          )}
        </div>
        <StatsBar file={file} />
      </div>
    </div>
  );
}

const getFileFromArgs = (args: string[]) => {
  const i = args.indexOf("--file");
  if (i >= 0) {
    const filePath = args[i + 1];
    const f = OSFileSystem.getFile(filePath);
    return f ?? null;
  }
  return null;
};

// Configure TS *before* Editor creates the model.
const handleBeforeMount = async (
  monaco: Monaco,
  setFile: React.Dispatch<SetStateAction<File | null>>,
) => {
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

  addRunnitLibrary(monaco);

  // (optional) path hint
  const ts = monaco.languages.typescript;
  ts.typescriptDefaults.setCompilerOptions({
    ...ts.typescriptDefaults.getCompilerOptions(),
    baseUrl: "file:///",
    paths: {
      ...(ts.typescriptDefaults.getCompilerOptions().paths || {}),
      "Runnit/OSApp": ["node_modules/@types/runnit/index.d.ts"],
      react: ["file:///node_modules/@types/react/index.d.ts"],
    },
  });

  monaco.editor.registerEditorOpener({
    openCodeEditor(
      source: editor.ICodeEditor,
      resource: Uri,
      selection?: IRange | IPosition,
    ): boolean | Promise<boolean> {
      let model = monaco.editor.getModel(resource);
      const file = OSFileSystem.getFile(resource.path);
      if (!model) {
        const text = file?.value ?? "";
        const lang = file?.extension;
        model = monaco.editor.createModel(text, lang, resource);
      }

      if (file) {
        setFile(file);
        source.setModel(model);
        if (selection) {
          source.setSelection(selection as IRange);
          source.revealRangeInCenter(selection as IRange);
        }
        return true;
      }
      return false;
    },
  });
};

function addRunnitLibrary(monaco: Monaco) {
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    `
declare module "Runnit/OSApp" {
  export interface OSAppFileProps { id?: number; name: string; icon: string }
  export interface OSAppProps { args?: string[] }

  export default class OSApp extends React.Component<OSAppProps> {
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
    header(): React.ReactElement;
    body(): React.ReactElement;

    setMaximize(maximize: boolean): void;
    setMinimize(minimize: boolean): void;

    getAppProps(): {
      appFile: OSAppFileProps;
      header: () => React.ReactElement;
      body: () => React.ReactElement;
      defaultWidth: number;
      defaultHeight: number;
    };

    protected setAppFile(input: { name?: string; icon?: string }): void;
    protected addHeaderTrailingItem(item: React.ReactElement): void;
    protected removeHeaderTrailingItem(item: React.ReactElement): void;
    protected setHeaderTrailingItems(items: React.ReactElement[]): void;
    protected mOnGrabStart(event: React.DragEvent<HTMLDivElement>): void;
    protected mOnGrabbing(event: MouseEvent): void;
    protected mOnGrabEnd(event: MouseEvent): void;
    protected mOnResizeStart(event: React.MouseEvent): void;
    protected mOnResizing(event: MouseEvent): void;
    protected mOnResizeEnd(event: MouseEvent): void;
  }
}
`,
    "file:///node_modules/@types/runnit/osapp/index.d.ts",
  );
}
