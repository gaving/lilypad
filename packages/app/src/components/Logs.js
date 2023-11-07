import PropTypes from "prop-types";
import { Component } from "react";
import { Flex } from "rebass";
import styled from "styled-components";

const Shell = styled(Flex)`
  border-radius: 3px;
  background-color: #182026;
  max-height: 500px;
  overflow-y: auto;
`;

const Log = styled.code`
  color: #e1e8ed;
  font-size: 16px;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;

  ${(props) => `color: ${props.color}`};
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
      <Flex pb={2} w={1}>
        <Shell
          flexDirection="column"
          flexGrow={1}
          justifyContent="space-between"
          p={10}
          w={1}
        >
          <Log color="limegreen">Last 200 lines</Log>
          {this.state.logs.map((log, i) => {
            if (this.state.logs.length <= 1)
              return <Log key={`log-${i}`}>No logs for this container</Log>;
            return <Log key={`log-${i}`}>{log}</Log>;
          })}
        </Shell>
      </Flex>
    );
  }
}

Logs.propTypes = {
  container: PropTypes.object.isRequired,
};

export default Logs;
