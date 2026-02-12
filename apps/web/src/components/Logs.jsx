import PropTypes from "prop-types";
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

const Log = styled.code`
  color: #e1e8ed;
  font-size: 16px;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;

  ${(props) => props.color && `color: ${props.color}`};
`;

const Container = styled.div`
  display: flex;
  padding-bottom: 8px;
  width: 100%;
`;

class Logs extends Component {
  state = {
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
          {this.state.logs.map((log, i) => {
            if (this.state.logs.length <= 1)
              return <Log key={`log-${i}`}>No logs for this container</Log>;
            return <Log key={`log-${i}`}>{log}</Log>;
          })}
        </Shell>
      </Container>
    );
  }
}

Logs.propTypes = {
  container: PropTypes.object.isRequired,
};

export default Logs;
