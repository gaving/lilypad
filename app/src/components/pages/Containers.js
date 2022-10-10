import {
  Classes,
  Collapse as C,
  InputGroup,
  NonIdealState,
  Position,
  Tag,
  Toaster,
} from "@blueprintjs/core";
import _ from "lodash";
import { Component } from "react";
import { Box, Flex } from "rebass";
import styled from "styled-components";

import Container from "../Container";

const Title = styled.h2`
  margin: 0;
`;

const Collapse = styled(C)`
  max-width: 1750px;
  width: 100%;
  margin: auto;
`;

class Containers extends Component {
  constructor() {
    super();
    this.state = {
      containers: [],
      createContainerIsOpen: false,
    };
  }

  async componentDidMount() {
    this.updateAllContainers();
    this.update = setInterval(() => this.updateAllContainers(), 5 * 1000);
  }

  componentWillUnmount() {
    clearInterval(this.update);
  }

  setCreateContainerIsOpen = (open) => {
    this.setState({ createContainerIsOpen: open });
  };

  showToast = (message, intent) => {
    const AppToaster = Toaster.create({
      className: "recipe-toaster",
      position: Position.TOP,
    });

    AppToaster.show({ message, intent });
  };

  updateAllContainers = async () => {
    const containers = await fetch("/api/containers");
    this.setState({
      containers: await containers.json(),
    });
  };

  updateContainer = async (container) => {
    let newContainer;
    try {
      newContainer = await fetch(`/api/containers/${container.Id}`);
      newContainer = await newContainer.json();
    } catch (error) {
      console.error(error);
    }

    newContainer = await newContainer[0];

    let containers = this.state.containers;
    const containerIndex = _.findIndex(containers, { Id: container.Id });

    if (newContainer === undefined) {
      _.remove(containers, (n) => n === containers[containerIndex]);
    } else {
      containers[containerIndex] = newContainer;
    }

    this.setState({ containers });
  };

  deleteStoppedContainers = async () => {
    let response, status, intent;

    try {
      response = await fetch("/api/containers/prune", {
        method: "POST",
      });
    } catch (error) {
      console.error(error);
    }

    switch (await response.status) {
      case 200: {
        // eslint-disable-next-line no-case-declarations
        const body = await response.json();

        status = body.ContainersDeleted
          ? `${body.ContainersDeleted.length} containers deleted`
          : "No containers were deleted";
        intent = "success";
        break;
      }
      case 500: {
        status = "Server error";
        intent = "danger";
        break;
      }
      default: {
        status = response.status;
      }
    }

    this.showToast(status, intent);
    this.updateAllContainers();
  };

  render() {
    let { containers } = this.state;
    containers = containers.filter((i) =>
      // eslint-disable-next-line no-prototype-builtins
      i.Labels.hasOwnProperty(process.env.REACT_APP_CONTAINER_TAG)
    );

    if (containers.length === 0) {
      console.log(
        "No containers found, is REACT_APP_CONTAINER_TAG set properly?",
        process.env
      );
    }

    const action = (
      <InputGroup
        className={Classes.ROUND}
        leftIcon="search"
        placeholder="Search..."
      />
    );

    const description = (
      <>
        {/* eslint-disable-next-line react/no-unescaped-entities */}
        Your search didn't match any apps.
        <br />
        Try searching for something else.
      </>
    );

    return (
      <Collapse isOpen={true}>
        <Box p={2} style={{ height: "80vh" }}>
          {containers.length === 0 && (
            <NonIdealState
              action={action}
              description={description}
              icon="heatmap"
              title="No apps found"
            />
          )}
          {containers.length > 0 && (
            <Flex align="center" justify="space-between" p={15}>
              <Flex align="center">
                <Title>Available</Title>
                <Box ml={1}>
                  <Tag large minimal round>
                    {containers.length}
                  </Tag>
                </Box>
              </Flex>
            </Flex>
          )}
          {containers.length > 0 && (
            <>
              {containers.map((container, i) => (
                <Container
                  container={container}
                  key={`container-${i}`}
                  showToast={this.showToast}
                  updateContainer={this.updateContainer}
                />
              ))}
            </>
          )}
        </Box>
      </Collapse>
    );
  }
}

export default Containers;
