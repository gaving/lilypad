import React, { Component } from "react";

import styled from "styled-components";
import {
  Collapse,
  Card as C,
  AnchorButton,
  ButtonGroup,
  Position,
  Tooltip,
  Intent,
  Tag,
  Icon,
} from "@blueprintjs/core";
import { Flex, Box } from "rebass";
import _ from "lodash";
import moment from "moment";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Emoji from "react-emoji-render";
import Logs from "./Logs";

const {
  REACT_APP_LAUNCH_PORT = 80,
  REACT_APP_CONTAINER_TAG,
  REACT_APP_CONTAINER_DESC,
  REACT_APP_CONTAINER_ICON,
} = process.env;

const containsOnlyEmojis = (text) => {
  /* eslint-disable no-control-regex */
  const onlyEmojis = text.replace(new RegExp("[\u0000-\u1eeff]", "g"), "");
  /* eslint-disable no-control-regex */
  const visibleChars = text.replace(new RegExp("[\n\rs]+|( )+", "g"), "");
  return onlyEmojis.length === visibleChars.length;
};

const Card = styled(C)`
  padding-top: 5;
  padding-bottom: 5;
`;

const Name = styled.h3`
  margin: 0;
`;

const P = styled.p`
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
`;

class Container extends Component {
  state = {
    isOpen: false,
    startIsLoading: false,
    unpauseIsLoading: false,
    pauseIsLoading: false,
    restartIsLoading: false,
    stopIsLoading: false,
    removeIsLoading: false,
    containerIdHovered: false,
    imageIdHovered: false,
  };

  componentDidMount() {
    const openContainers = JSON.parse(localStorage.getItem("openContainers"));

    if (openContainers && openContainers.includes(this.props.container.Id)) {
      this.setOpen(true);
    }
  }

  saveToStorage = (id) => {
    let openContainers = JSON.parse(localStorage.getItem("openContainers"));

    // If there are no containers in storage
    if (!openContainers) {
      openContainers = [id];
      localStorage.setItem("openContainers", JSON.stringify(openContainers));
    }

    // If there are containers in storage and they don't include the current container
    if (openContainers && !openContainers.includes(id)) {
      openContainers.push(id);
      localStorage.setItem("openContainers", JSON.stringify(openContainers));
    }
  };

  removeFromStorage = (id) => {
    let openContainers = JSON.parse(localStorage.getItem("openContainers"));

    if (openContainers && openContainers.includes(id)) {
      openContainers = _.remove(
        openContainers,
        (container) => id !== container
      );
      localStorage.setItem("openContainers", JSON.stringify(openContainers));
    }
  };

  setOpen = (open) => {
    this.setState((prevState) => {
      // If the developer specifies a parameter, he wants to specifically set if the component is open
      if (open !== undefined) {
        // If the developer wants the container open, set the container ID in storage, else remove it
        if (open) this.saveToStorage(this.props.container.Id);
        else this.removeFromStorage(this.props.container.Id);

        return {
          isOpen: open,
        };
      }

      // If the developer does NOT specify a parameter, he wants to toggle the componet
      // If the previous state was open, remove the container from storage
      if (prevState.isOpen) this.removeFromStorage(this.props.container.Id);
      // If the previous state was not open, save the container to storage
      else this.saveToStorage(this.props.container.Id);

      return {
        isOpen: !prevState.isOpen,
      };
    });
  };

  stopContainer = async (e, container) => {
    this.setState({ stopIsLoading: true });
    e.stopPropagation();
    let response, status, intent;

    try {
      response = await fetch("/api/containers/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ containerId: container.Id }),
      });
    } catch (error) {
      console.error(error);
    }

    switch (response.status) {
      case 204:
        status = "Container stopped";
        intent = "success";
        break;
      case 304:
        status = "Container already stopped";
        intent = "warning";
        break;
      case 404:
        status = "No such container";
        intent = "danger";
        break;
      case 500:
        status = "Server error";
        intent = "danger";
        break;
      default:
        status = response.status;
    }

    this.props.showToast(status, intent);
    this.props.updateContainer(container);
    this.setState({ stopIsLoading: false });
  };

  removeContainer = async (e, container) => {
    this.setState({ removeIsLoading: true });
    e.stopPropagation();
    let response, status, intent;

    try {
      response = await fetch(`/api/containers/${container.Id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error(error);
    }

    switch (response.status) {
      case 204:
        status = "App removed";
        intent = "success";
        break;
      case 400:
        status = "Something went wrong, bad parameter";
        intent = "danger";
        break;
      case 404:
        status = "No such app";
        intent = "danger";
        break;
      case 409:
        status = "You cannot remove a running app";
        intent = "warning";
        break;
      case 500:
        status = "Server error";
        intent = "danger";
        break;
      default:
        status = response.status;
    }

    this.props.showToast(status, intent);
    this.setOpen(false);
    this.props.updateContainer(container);
    this.setState({ removeIsLoading: false });
  };

  startContainer = async (e, container) => {
    this.setState({ startIsLoading: true });
    e.stopPropagation();
    let response, status, intent;

    try {
      response = await fetch(`/api/containers/${container.Id}`, {
        method: "POST",
      });
    } catch (error) {
      console.error(error);
    }

    switch (response.status) {
      case 204:
        status = "App started";
        intent = "success";
        break;
      case 304:
        status = "App already started";
        intent = "warning";
        break;
      case 404:
        status = "No such app";
        intent = "danger";
        break;
      case 500:
        status = "Server error";
        intent = "danger";
        break;
      default:
        status = response.status;
    }

    this.props.showToast(status, intent);
    this.props.updateContainer(container);
    this.setState({ startIsLoading: false });
  };

  restartContainer = async (e, container) => {
    this.setState({ restartIsLoading: true });
    e.stopPropagation();
    let response, status, intent;

    try {
      response = await fetch(`/api/containers/${container.Id}/restart`, {
        method: "POST",
      });
    } catch (error) {
      console.error(error);
    }

    switch (response.status) {
      case 204:
        status = "App restarted";
        intent = "success";
        break;
      case 404:
        status = "No such app";
        intent = "danger";
        break;
      case 500:
        status = "Server error";
        intent = "danger";
        break;
      default:
        status = response.status;
    }

    this.props.showToast(status, intent);
    this.props.updateContainer(container);
    this.setState({ restartIsLoading: false });
  };

  renameContainer = async (container, updatedName) => {
    let response, status, intent;
    const originalName = container.Names[0];

    // If the use clicks away without changing anything
    if (originalName === updatedName) return;

    try {
      response = await fetch(
        `/api/containers/${container.Id}/rename?name=${updatedName}`,
        {
          method: "POST",
        }
      );
    } catch (error) {
      console.error(error);
    }

    switch (response.status) {
      case 204:
        status = `App renamed to '${updatedName}'`;
        intent = "success";
        break;
      case 400:
        status = `Error renaming to '${updatedName}'`;
        intent = "danger";
        break;
      case 404:
        status = "No such app";
        intent = "danger";
        break;
      case 409:
        status = `The name ${updatedName} is already in use`;
        intent = "danger";
        break;
      case 500:
        status = "Server error";
        intent = "danger";
        break;
      default:
        status = response.status;
    }

    this.props.showToast(status, intent);
    this.props.updateContainer(container);
  };

  pauseContainer = async (e, container) => {
    this.setState({ pauseIsLoading: true });
    e.stopPropagation();
    let response, status, intent;

    try {
      response = await fetch(`/api/containers/${container.Id}/pause`, {
        method: "POST",
      });
    } catch (error) {
      console.error(error);
    }

    switch (response.status) {
      case 204:
        status = `App paused`;
        intent = "success";
        break;
      case 404:
        status = "No such app";
        intent = "danger";
        break;
      case 500:
        status = "Server error";
        intent = "danger";
        break;
      default:
        status = response.status;
    }

    this.props.showToast(status, intent);
    this.props.updateContainer(container);
    this.setState({ pauseIsLoading: false });
  };

  unpauseContainer = async (e, container) => {
    this.setState({ unpauseIsLoading: true });
    e.stopPropagation();
    let response, status, intent;

    try {
      response = await fetch(`/api/containers/${container.Id}/unpause`, {
        method: "POST",
      });
    } catch (error) {
      console.error(error);
    }

    switch (response.status) {
      case 204:
        status = `App unpaused`;
        intent = "success";
        break;
      case 404:
        status = "No such app";
        intent = "danger";
        break;
      case 500:
        status = "Server error";
        intent = "danger";
        break;
      default:
        status = response.status;
    }

    this.props.showToast(status, intent);
    this.props.updateContainer(container);
    this.setState({ unpauseIsLoading: false });
  };

  copyToClipboard = () => {
    this.props.showToast("Copied to clipboard", "primary");
  };

  render() {
    const { container } = this.props;
    const containerNetworks = container.NetworkSettings.Networks;
    let networks = [];

    for (const network in containerNetworks) {
      networks.push({ name: network, data: containerNetworks[network] });
    }

    const icon = container.Labels[REACT_APP_CONTAINER_ICON] ?? "dizzy";

    return (
      <Box mt={1}>
        <Card interactive style={{ opacity: this.state.isOpen ? "1" : "0.8" }}>
          {container.Names.map(() => {
            const launchPrivatePort = container.Labels[REACT_APP_LAUNCH_PORT];

            let launchPublicPort = 0;
            if (container) {
              const launchPorts = container.Ports.filter(
                (c) => c.PrivatePort === parseInt(launchPrivatePort)
              ).pop();
              if (launchPorts) {
                launchPublicPort = launchPorts.PublicPort;
              }
            }

            return (
              <Flex
                py={1}
                justifyContent="space-between"
                key={container.Id}
                onClick={() => this.setOpen()}
              >
                <Flex py={1} alignContent="center">
                  <Box mr={10}>
                    <AnchorButton
                      minimal
                      loading={this.state.startIsLoading}
                      text={
                        <Emoji
                          text={containsOnlyEmojis(icon) ? icon : `:${icon}:`}
                        />
                      }
                      large
                      size={64}
                      intent={Intent.SUCCESS}
                    />
                    <Tag intent="primary" round>
                      {container.Labels[REACT_APP_CONTAINER_TAG]}
                    </Tag>
                  </Box>
                  <Box p={2}>
                    <Name>{container.Labels[REACT_APP_CONTAINER_DESC]}</Name>
                  </Box>
                  <Box p={2} className="bp3-text-disabled">
                    {container.Status}
                  </Box>
                </Flex>
                <Flex alignContent="center">
                  <ButtonGroup fill large>
                    {container.State === "exited" && (
                      <Tooltip content="Start app" position={Position.BOTTOM}>
                        <AnchorButton
                          minimal
                          loading={this.state.startIsLoading}
                          icon="play"
                          intent={Intent.SUCCESS}
                          onClick={(e) => this.startContainer(e, container)}
                        />
                      </Tooltip>
                    )}
                    {container.State === "paused" && (
                      <Tooltip content="Unpause app" position={Position.BOTTOM}>
                        <AnchorButton
                          minimal
                          loading={this.state.unpauseIsLoading}
                          icon="play"
                          intent={Intent.SUCCESS}
                          onClick={(e) => this.unpauseContainer(e, container)}
                        />
                      </Tooltip>
                    )}
                    {container.State === "running" && (
                      <Tooltip content="Pause app" position={Position.BOTTOM}>
                        <AnchorButton
                          minimal
                          loading={this.state.pauseIsLoading}
                          icon="pause"
                          intent={Intent.WARNING}
                          onClick={(e) => this.pauseContainer(e, container)}
                        />
                      </Tooltip>
                    )}
                    <Tooltip
                      content="Restart app"
                      position={Position.BOTTOM}
                      isDisabled
                    >
                      <AnchorButton
                        minimal
                        loading={this.state.restartIsLoading}
                        icon="refresh"
                        intent={Intent.WARNING}
                        onClick={(e) => this.restartContainer(e, container)}
                      />
                    </Tooltip>
                    {container.State !== "exited" && (
                      <Tooltip content="Stop app" position={Position.BOTTOM}>
                        <AnchorButton
                          minimal
                          loading={this.state.stopIsLoading}
                          icon="stop"
                          intent={Intent.WARNING}
                          onClick={(e) => this.stopContainer(e, container)}
                        />
                      </Tooltip>
                    )}
                    {container.State === "exited" && (
                      <Tooltip content="Remove app" position={Position.BOTTOM}>
                        <AnchorButton
                          minimal
                          loading={this.state.removeIsLoading}
                          icon="trash"
                          intent={Intent.DANGER}
                          onClick={(e) => this.removeContainer(e, container)}
                        />
                      </Tooltip>
                    )}
                    <Tooltip content="Open site" position={Position.BOTTOM}>
                      <AnchorButton
                        minimal
                        large
                        icon="share"
                        intent={Intent.PRIMARY}
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            `http://${window.location.hostname}:${
                              launchPublicPort ? launchPublicPort : 80
                            }`,
                            "_blank"
                          );
                        }}
                      />
                    </Tooltip>
                  </ButtonGroup>
                </Flex>
              </Flex>
            );
          })}
          <Collapse isOpen={this.state.isOpen}>
            <Flex pt={1}>
              <Flex w={1 / 8} flexDirection="column">
                <p>ID</p>
                <p>Name</p>
                <p>Created</p>
                <p>Command</p>
                <p>Image ID</p>
                <Box mt={2}>
                  <p>State</p>
                  <p>Status</p>
                </Box>
              </Flex>
              <Flex w={7 / 8} flexDirection="column">
                <Flex>
                  <CopyToClipboard
                    text={container.Id}
                    onCopy={this.copyToClipboard}
                  >
                    <P
                      onMouseOver={() =>
                        this.setState({ containerIdHovered: true })
                      }
                      onMouseLeave={() =>
                        this.setState({ containerIdHovered: false })
                      }
                    >
                      {container.Id}
                    </P>
                  </CopyToClipboard>
                  {this.state.containerIdHovered && (
                    <Box ml={1}>
                      <Icon icon="duplicate" />
                    </Box>
                  )}
                </Flex>
                <P>{container.Names[0]}</P>
                <P>
                  {moment
                    .unix(container.Created)
                    .format("h:mm:ss a on dddd, MMMM Do YYYY")}
                </P>
                <P>{container.Command}</P>
                <Flex>
                  <CopyToClipboard
                    text={container.ImageID}
                    onCopy={this.copyToClipboard}
                  >
                    <P
                      onMouseOver={() =>
                        this.setState({ imageIdHovered: true })
                      }
                      onMouseLeave={() =>
                        this.setState({ imageIdHovered: false })
                      }
                    >
                      {container.ImageID}
                    </P>
                  </CopyToClipboard>
                  {this.state.imageIdHovered && (
                    <Box ml={1}>
                      <Icon icon="duplicate" />
                    </Box>
                  )}
                </Flex>
                <Box mt={2}>
                  <P>{container.State}</P>
                  <P>{container.Status}</P>
                </Box>
              </Flex>
            </Flex>
            <Logs container={container} />
            {/* <Flex mt={2} column>
              <h3>Networks</h3>
              <Flex pb={1}>
                {networks.map((network, i) => {
                  return (
                    <React.Fragment key={`network-${i}`}>
                      <Flex w={1 / 8} column>
                        <p>{network.name}</p>
                      </Flex>
                      <Flex w={7 / 8}>
                        <Flex w={1 / 8} column>
                          <p>Network ID</p>
                          <p>MAC Address</p>
                          <p>Endpoint ID</p>
                          <p>Gateway</p>
                          <p>Global IPv6</p>
                          <p>IP Address</p>
                        </Flex>
                        <Flex w={7 / 8} column>
                          {exists(network.data.NetworkID)}
                          {exists(network.data.MacAddress)}
                          {exists(network.data.EndpointID)}
                          {exists(network.data.Gateway)}
                          {exists(network.data.GlobalIPv6Address)}
                          {exists(network.data.IPAddress)}
                        </Flex>
                      </Flex>
                    </React.Fragment>
                  );
                })}
              </Flex>
            </Flex> */}
          </Collapse>
        </Card>
      </Box>
    );
  }
}

export default Container;
