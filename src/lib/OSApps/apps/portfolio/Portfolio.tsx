import OSApp, { OSAppProps } from "@/lib/features/OSApp/OSApp";
import { JSX } from "react";
import { ThreeDot } from "react-loading-indicators";

interface PortfolioState {
  isLoading: boolean;
}

export default class Portfolio extends OSApp {
  state: PortfolioState = {
    isLoading: true,
  };

  constructor(props?: OSAppProps) {
    super(props);

    this.setAppFile({
      name: "Portfolio",
      icon: "/icons/runnit-transparent.png",
    });
  }

  body(): JSX.Element {
    return (
      <div className="w-full h-full">
        {this.state.isLoading && (
          <div className="w-full h-full bg-black flex justify-center items-center">
            <ThreeDot variant="bounce" color="#121c35" size="medium" />
          </div>
        )}
        <iframe
          onLoad={() => this.setState({ isLoading: false })}
          width="100%"
          height="100%"
          src="https://harelzadok.com/"
        />
      </div>
    );
  }
}
