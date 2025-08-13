import OSApp from "@/lib/features/OSApp/OSApp";

interface PortfolioState {
  isLoading: boolean;
}

export default class Portfolio extends OSApp {
  state: PortfolioState = {
    isLoading: true,
  };

  constructor(props: never) {
    super(props);

    this.setAppFile({
      name: "Portfolio",
      icon: "/icons/runnit-transparent.png",
    });
  }

  body() {
    return (
      <div className="w-full h-full">
        {this.state.isLoading && (
          <div className="w-full h-full bg-white flex justify-center items-center">
            <p className="text-black text-2xl">Loading...</p>
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
