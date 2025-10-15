import * as esbuild from "esbuild-wasm";
import OSApp from "@/lib/features/OSApp/OSApp";
import React from "react";
import * as JSXRT from "react/jsx-runtime";

let esbuildReady: Promise<void> | null = null;
function ensureEsbuild() {
  if (!esbuildReady) {
    esbuildReady = esbuild.initialize({
      wasmURL: "https://unpkg.com/esbuild-wasm@0.25.10/esbuild.wasm",
    });
  }
  return esbuildReady;
}

// ─────────────────────────────────────────────
// Custom runtime resolver
// ─────────────────────────────────────────────
function runtimeResolver(): esbuild.Plugin {
  return {
    name: "runtime-resolver",
    setup(build) {
      // OSApp virtual module
      build.onResolve({ filter: /^runnit\/OSApp$/ }, () => ({
        path: "runnit/OSApp",
        namespace: "virtual",
      }));
      build.onLoad({ filter: /^runnit\/OSApp$/, namespace: "virtual" }, () => ({
        contents: `
          export default globalThis.__dyn.OSApp;
          export const OSApp = globalThis.__dyn.OSApp;
        `,
        loader: "ts",
      }));

      // React host virtual module
      build.onResolve({ filter: /^react$/ }, () => ({
        path: "virtual:react-host",
        namespace: "virtual",
      }));
      build.onLoad(
        { filter: /^virtual:react-host$/, namespace: "virtual" },
        () => ({
          contents: `
          (globalThis as any).__dyn_ref = window.top?.__dyn ?? globalThis.__dyn;
          const React = (globalThis.__dyn || globalThis.__dyn_ref)?.React;
          if (!React) throw new Error("Host React not found (globalThis.__dyn.React)");
          export default React;
          export const {
            useState,
            useEffect,
            useMemo,
            useCallback,
            useRef,
            useReducer,
            useContext,
            createElement,
            Fragment
          } = React;
        `,
          loader: "ts",
        }),
      );

      // JSX runtime host module
      build.onResolve({ filter: /^react\/jsx-runtime$/ }, () => ({
        path: "virtual:jsxrt-host",
        namespace: "virtual",
      }));
      build.onLoad(
        { filter: /^virtual:jsxrt-host$/, namespace: "virtual" },
        () => ({
          contents: `
          const JSXRT = globalThis.__dyn?.JSXRT;
          if (!JSXRT) throw new Error("Host JSX runtime not found (globalThis.__dyn.JSXRT)");
          export const { jsx, jsxs, Fragment } = JSXRT;
        `,
          loader: "ts",
        }),
      );

      // Fallback http loader for other URLs
      build.onResolve({ filter: /^https?:\/\// }, (args) => ({
        path: args.path,
        namespace: "http",
      }));
      build.onLoad({ filter: /.*/, namespace: "http" }, async (args) => {
        const res = await fetch(args.path);
        const text = await res.text();
        return {
          contents: text,
          loader: args.path.endsWith(".tsx")
            ? "tsx"
            : args.path.endsWith(".ts")
              ? "ts"
              : args.path.endsWith(".jsx")
                ? "jsx"
                : "js",
        };
      });
    },
  };
}

// ─────────────────────────────────────────────
// Compile and bundle dynamically to ESM
// ─────────────────────────────────────────────
async function compileDynamicTsxToEsm(filepath: string, tsxSource: string) {
  await ensureEsbuild();
  const result = await esbuild.build({
    stdin: {
      contents: tsxSource,
      sourcefile: filepath,
      loader: "tsx",
      resolveDir: "/",
    },
    bundle: true,
    format: "esm",
    platform: "browser",
    target: ["es2020"],
    jsx: "automatic",
    jsxImportSource: "react",
    plugins: [runtimeResolver()],
    write: false,
    sourcemap: "inline",
    minify: false,
  });
  const code = result.outputFiles[0].text;
  const m = code.match(
    /sourceMappingURL=data:application\/json;base64,([A-Za-z0-9+/=]+)/,
  );
  const map = m ? JSON.parse(atob(m[1])) : null;
  return { code, map };
}

// ─────────────────────────────────────────────
// Import blob module
// ─────────────────────────────────────────────
export async function importBlobModule(
  js: string,
  ctx: Record<string, object>,
) {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  (globalThis as any).__dyn = ctx;

  const blobUrl = URL.createObjectURL(
    new Blob([js], { type: "text/javascript" }),
  );
  try {
    return await import(/* webpackIgnore: true */ blobUrl as string);
  } catch {
    return await (
      Function("u", "return import(u)") as (u: string) => Promise<object>
    )(blobUrl);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

const sourceMapRegistry = new Map<string, any>();

export async function makeClassFromTsx(filepath: string, source: string) {
  const { code, map } = await compileDynamicTsxToEsm(filepath, source);
  if (map) sourceMapRegistry.set(filepath, map);
  const named = `${code}\n//# sourceURL=${filepath}`;
  const mod = await importBlobModule(named, { OSApp, React, JSXRT });
  return mod.default ?? mod.ExampleApp ?? mod;
}

// util
import { TraceMap, originalPositionFor } from "@jridgewell/trace-mapping";

export function mapStack(stack: string) {
  // matches: "at fn (/<path>:line:col)" and "at /<path>:line:col"
  const re = /(at\s+[^(]*\()?(\/[^):\n]+):(\d+):(\d+)\)?/g;
  return stack.replace(re, (m, pre = "", src, line, col) => {
    const raw = sourceMapRegistry.get(src);
    if (!raw) return m;
    const tm = new TraceMap(raw);
    const pos = originalPositionFor(tm, { line: +line, column: +col });
    if (!pos.source || !pos.line) return m;
    return `${pre}${pos.source}:${pos.line}:${pos.column ?? 0}`;
  });
}
