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
  padding-bottom: 8px;
  width: 100%;
`;

interface ContainerType {
  Id: string;
}

interface LogsProps {
  container: ContainerType;
}

interface LogsState {
  logs: string[];
}

class Logs extends Component<LogsProps, LogsState> {
  state: LogsState = {
    logs: [],
  };

  async componentDidMount() {
    this.updateLogs();
  }

  updateLogs = async () => {
    const logs = await fetch(`/api/containers/${this.props.container.Id}/logs`);
    this.setState({ logs: await logs.json() });
  };

  render() {
    return (
      <Container>
        <Shell>
          <Log color="limegreen">Last 200 lines</Log>
          {this.state.logs.map((log) => {
            if (this.state.logs.length <= 1)
              return <Log key="no-logs">No logs for this container</Log>;
            return <Log key={log}>{log}</Log>;
          })}
        </Shell>
      </Container>
    );
  }
}

export default Logs;
