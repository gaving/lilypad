import { Component, createContext, type ReactNode } from "react";

interface Config {
  containerTag: string;
  containerDesc: string;
  containerIcon: string;
  launchUrl: string;
}

interface ConfigContextType {
  config: Config | null;
  loading: boolean;
  error: string | null;
}

const defaultConfig: Config = {
  containerTag: "org.domain.review.name",
  containerDesc: "org.domain.review.desc",
  containerIcon: "org.domain.review.icon",
  launchUrl: "org.domain.review.url",
};

export const ConfigContext = createContext<ConfigContextType>({
  config: defaultConfig,
  loading: true,
  error: null,
});

interface ConfigProviderProps {
  children: ReactNode;
}

interface ConfigProviderState {
  config: Config | null;
  loading: boolean;
  error: string | null;
}

class ConfigProvider extends Component<
  ConfigProviderProps,
  ConfigProviderState
> {
  state: ConfigProviderState = {
    config: null,
    loading: true,
    error: null,
  };

  async componentDidMount() {
    try {
      const response = await fetch("/api/config");
      if (!response.ok) {
        throw new Error("Failed to load configuration");
      }
      const config: Config = await response.json();
      this.setState({ config, loading: false });
    } catch (error) {
      console.error("Failed to load config:", error);
      // Fall back to defaults on error
      this.setState({
        config: defaultConfig,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  render() {
    const { children } = this.props;
    const { config, loading, error } = this.state;

    return (
      <ConfigContext.Provider
        value={{ config: config || defaultConfig, loading, error }}
      >
        {children}
      </ConfigContext.Provider>
    );
  }
}

export default ConfigProvider;
