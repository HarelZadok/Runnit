import OSApp, { OSAppProps } from "@/lib/features/OSApp/OSApp";
import React from "react";
import { mapStack } from "@/lib/runtimeCompiler";

export class AppError extends OSApp {
  error?: string;
  constructor(props: OSAppProps) {
    super(props);

    this.setAppFile({
      icon: "/icons/file.png",
      name: "App Error!",
    });

    this.error = props.devMessage;
  }

  body(): React.JSX.Element {
    return (
      <div className="bg-black w-full h-full flex justify-center items-center">
        <pre className="text-white text-xl">
          {this.error ? mapStack(this.error) : "Error rendering this window!"}
        </pre>
      </div>
    );
  }
}
