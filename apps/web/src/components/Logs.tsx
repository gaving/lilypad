import { Button } from "@blueprintjs/core";
import { Component } from "react";
import styled from "styled-components";

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-between;
  border-radius: 3px;
  background-color: #182026;
  max-height: 500px;
  overflow-y: auto;
  padding: 10px;
  width: 100%;
`;

const Log = styled.code<{ color?: string }>`
  color: ${(props) => props.color || "#e1e8ed"};
  font-size: 16px;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 8px;
  width: 100%;
`;

const LogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

interface ContainerType {
  Id: string;
}

interface LogsProps {
  container: ContainerType;
}

interface LogsState {
  logs: string[];
  isLoading: boolean;
}

class Logs extends Component<LogsProps, LogsState> {
  state: LogsState = {
    logs: [],
    isLoading: false,
  };

  async componentDidMount() {
    this.updateLogs();
  }

  updateLogs = async () => {
    this.setState({ isLoading: true });
    try {
      const logs = await fetch(`/api/containers/${this.props.container.Id}/logs`);
      this.setState({ logs: await logs.json(), isLoading: false });
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      this.setState({ isLoading: false });
    }
  };

  render() {
    const { logs, isLoading } = this.state;

    return (
      <Container>
        <Shell>
          <LogHeader>
            <Log color="limegreen">Last 200 lines</Log>
            <Button
              icon="refresh"
              minimal
              small
              loading={isLoading}
              onClick={this.updateLogs}
              title="Refresh logs"
            />
          </LogHeader>
          {logs.map((log) => {
            if (logs.length <= 1)
              return <Log key="no-logs">No logs for this container</Log>;
            return <Log key={log}>{log}</Log>;
          })}
        </Shell>
      </Container>
    );
  }
}

export default Logs;
