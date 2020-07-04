import React, { Component } from "react";

import styled from "styled-components";
import { Collapse as C, Position, Tag, Toaster } from "@blueprintjs/core";
import { Route } from "react-router-dom";
import { Flex, Box } from "reflexbox";
import _ from "lodash";

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
    this.update = setInterval(() => this.updateAllContainers(), 30 * 1000);
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
      position: Position.BOTTOM,
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
      case 200:
        const body = await response.json();

        if (body.ContainersDeleted) {
          status = `${body.ContainersDeleted.length} containers deleted`;
        } else {
          status = "No containers were deleted";
        }
        intent = "success";
        break;
      case 500:
        status = "Server error";
        intent = "danger";
        break;
      default:
        status = response.status;
    }

    this.showToast(status, intent);
    this.updateAllContainers();
  };

  render() {
    let { containers } = this.state;
    containers = containers.filter((i) =>
      i.Labels.hasOwnProperty(process.env.REACT_APP_CONTAINER_TAG)
    )

    return (
      <Route
        path="/containers"
        render={({ match }) => (
          <Collapse isOpen={match}>
            <Box p={2}>
              <Flex justify="space-between" align="center">
                <Flex align="center">
                  <Title>Available</Title>
                  <Box ml={1}>
                    <Tag large minimal round>
                      {containers.length}
                    </Tag>
                  </Box>
                </Flex>
              </Flex>
              {containers && (
                <>
                  {containers.map((container, i) => (
                    <Container
                      container={container}
                      match={match}
                      key={`container-${i}`}
                      updateContainer={this.updateContainer}
                      showToast={this.showToast}
                    />
                  ))}
                </>
              )}
            </Box>
          </Collapse>
        )}
      />
    );
  }
}

export default Containers;
