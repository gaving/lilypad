import { Component, createContext, type ReactNode } from "react";

interface Config {
  namespace: string;
}

interface ConfigContextType {
  config: Config | null;
  loading: boolean;
  error: string | null;
  // Helper getters for label keys
  containerTag: string;
  containerDesc: string;
  containerIcon: string;
  launchUrl: string;
}

const defaultNamespace = "org.domain.review";

const defaultConfig: Config = {
  namespace: defaultNamespace,
};

export const ConfigContext = createContext<ConfigContextType>({
  config: defaultConfig,
  loading: true,
  error: null,
  containerTag: `${defaultNamespace}.name`,
  containerDesc: `${defaultNamespace}.desc`,
  containerIcon: `${defaultNamespace}.icon`,
  launchUrl: `${defaultNamespace}.url`,
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

  getLabelKeys = (namespace: string) => {
    return {
      containerTag: `${namespace}.name`,
      containerDesc: `${namespace}.desc`,
      containerIcon: `${namespace}.icon`,
      launchUrl: `${namespace}.url`,
    };
  };

  render() {
    const { children } = this.props;
    const { config, loading, error } = this.state;
    const effectiveConfig = config || defaultConfig;
    const labelKeys = this.getLabelKeys(effectiveConfig.namespace);

    return (
      <ConfigContext.Provider
        value={{
          config: effectiveConfig,
          loading,
          error,
          ...labelKeys,
        }}
      >
        {children}
      </ConfigContext.Provider>
    );
  }
}

export default ConfigProvider;
