// import Editor, { Monaco } from "@monaco-editor/react";
// import { editor } from "monaco-editor";
import { useEffect, useState, useCallback } from "react";
import { OSFileSystem } from "../files/OSFileSystem";
import { File } from "../files/FilesItem";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-tsx";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/esm-resolver";

interface EditorComponentProps {
  args: string[];
}

export default function EditorComponent(props: EditorComponentProps) {
  // const editorRef = useRef<editor.IStandaloneCodeEditor>(null);

  // const handleEditorDidMount = async (
  //   editor: editor.IStandaloneCodeEditor,
  //   monaco: Monaco
  // ) => {
  //   editorRef.current = editor;

  //   // Configure TypeScript for React TSX
  //   monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  //     target: monaco.languages.typescript.ScriptTarget.Latest,
  //     allowNonTsExtensions: true,
  //     moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  //     module: monaco.languages.typescript.ModuleKind.CommonJS,
  //     esModuleInterop: true,
  //     allowSyntheticDefaultImports: true,
  //     strict: true,
  //     skipLibCheck: false,
  //     skipDefaultLibCheck: false,
  //     noEmit: true,

  //     // React/JSX Configuration
  //     jsx: monaco.languages.typescript.JsxEmit.React,
  //     reactNamespace: "React",
  //     jsxImportSource: "react",
  //     allowJs: true,
  //     checkJs: true,
  //   });

  //   // Add React type definitions
  //   monaco.languages.typescript.typescriptDefaults.addExtraLib(
  //     `declare module "react" {
  //       import * as React from 'react';
  //       export = React;
  //       export as namespace React;

  //       export interface Component<P = {}, S = {}, SS = any> {}
  //       export interface ComponentState {}
  //       export interface ComponentClass<P = {}, S = ComponentState> {}
  //       export interface FunctionComponent<P = {}> {
  //         (props: P, context?: any): ReactElement<any, any> | null;
  //       }
  //       export type FC<P = {}> = FunctionComponent<P>;

  //       export function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  //       export function useEffect(effect: EffectCallback, deps?: DependencyList): void;
  //       export function useRef<T>(initialValue: T): MutableRefObject<T>;
  //       export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: DependencyList): T;
  //       export function useMemo<T>(factory: () => T, deps: DependencyList | undefined): T;

  //       export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {}
  //       export interface ReactNode {}
  //       export type JSXElementConstructor<P> = ((props: P) => ReactElement<any, any> | null) | (new (props: P) => Component<any, any>);
  //       export type SetStateAction<S> = S | ((prevState: S) => S);
  //       export type Dispatch<A> = (value: A) => void;
  //       export type EffectCallback = () => (void | (() => void | undefined));
  //       export type DependencyList = ReadonlyArray<any>;
  //       export interface MutableRefObject<T> { current: T; }
  //     }`,
  //     "file:///node_modules/@types/react/index.d.ts"
  //   );

  //   // Enable TypeScript/JSX validation
  //   monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
  //     noSemanticValidation: false,
  //     noSyntaxValidation: false,
  //     noSuggestionDiagnostics: false,
  //   });
  // };

  const getFileFromArgs = useCallback(() => {
    const fileArgIndex = props.args.indexOf("--file");
    if (fileArgIndex >= 0) {
      const filePath = props.args[fileArgIndex + 1];
      return OSFileSystem.getFile(filePath) ?? new File("temp", "/", ".txt");
    }
    return new File("temp", "/", ".txt");
  }, [props.args]);

  const [value, setValue] = useState("");

  useEffect(() => {
    const file = getFileFromArgs();
    if (file) OSFileSystem.updateFileValue({ ...file, value: value });
  }, [getFileFromArgs, value]);

  // return (
  //   <div className='w-full h-full'>
  //     <Editor
  //       width='100%'
  //       height='100%'
  //       defaultLanguage='typescript'
  //       value={file?.value ?? ""}
  //       onChange={(e) => setFile((prev) => ({ ...prev, value: e ?? "" }))}
  //       onMount={handleEditorDidMount}
  //     />
  //   </div>
  // );

  return (
    <AceEditor
      width='100%'
      height='100%'
      mode='tsx'
      theme='monokai'
      name='editor'
      onChange={setValue}
      fontSize={14}
      lineHeight={19}
      showPrintMargin={true}
      showGutter={true}
      highlightActiveLine={true}
      value={value}
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
        enableMobileMenu: true,
        showLineNumbers: true,
        tabSize: 2,
      }}
    />
  );
}
