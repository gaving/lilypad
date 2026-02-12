import {
  AnchorButton,
  Button,
  ButtonGroup,
  Card,
  Collapse,
  Elevation,
  Icon,
  Intent,
  Popover,
  Position,
  Tag,
  Tooltip,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import _ from "lodash";
import moment from "moment";
import PropTypes from "prop-types";
import { Component } from "react";

import Emoji from "react-emoji-render";
import styled from "styled-components";

import Logs from "./Logs.jsx";

const {
  VITE_LAUNCH_URL,
  VITE_CONTAINER_TAG,
  VITE_CONTAINER_DESC,
  VITE_CONTAINER_ICON,
} = import.meta.env;

const ContainerCard = styled(Card)`
  margin-bottom: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 1px solid transparent;
  background-color: var(--card-bg, #ffffff) !important;
  
  @media (max-width: 768px) {
    margin-bottom: 8px;
    border-radius: 8px;
  }
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: rgba(0, 0, 0, 0.08);
  }
  
  .bp5-dark & {
    background-color: #252a31 !important;
    border-color: rgba(255, 255, 255, 0.1);
    
    &:hover {
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 8px;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
  
  @media (max-width: 768px) {
    gap: 12px;
    width: 100%;
  }
`;

const IconContainer = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
  background: ${props => props.$state === 'running' ? 'rgba(15, 153, 96, 0.2)' :
    props.$state === 'exited' ? 'rgba(219, 55, 55, 0.2)' :
    props.$state === 'paused' ? 'rgba(217, 130, 43, 0.2)' :
    props.$state === 'pinned' ? 'rgba(255, 107, 138, 0.2)' :
    'rgba(41, 101, 204, 0.2)'};
  color: ${props => props.$state === 'running' ? '#0f9960' :
    props.$state === 'exited' ? '#db3737' :
    props.$state === 'paused' ? '#d9822b' :
    props.$state === 'pinned' ? '#ff6b8a' :
    '#2965cc'};
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 20px;
    border-radius: 10px;
  }
`;

const Info = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const AppName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color, #182026);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: var(--text-muted, #5c7080);
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 8px;
    font-size: 12px;
  }
  
  .container-tag {
    background: rgba(255, 107, 138, 0.12);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
    color: #ff6b8a;
    
    .bp5-dark & {
      background: rgba(255, 133, 161, 0.25);
      color: #ff85a1;
    }
  }
`;

const LoadIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  
  @media (max-width: 768px) {
    display: none;
  }
  
  .load-bar {
    width: 60px;
    height: 4px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
    overflow: hidden;
    
    .bp5-dark & {
      background: rgba(255, 255, 255, 0.1);
    }
  }
  
  .load-fill {
    height: 100%;
    background: ${props => props.$load > 80 ? '#db3737' : props.$load > 50 ? '#d9822b' : '#0f9960'};
    transition: width 0.3s ease;
  }
  
  .load-text {
    font-size: 11px;
    font-weight: 600;
    color: ${props => props.$load > 80 ? '#db3737' : props.$load > 50 ? '#d9822b' : '#0f9960'};
  }
`;

const StatusDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$state === 'running' ? '#0f9960' :
    props.$state === 'exited' ? '#db3737' :
    props.$state === 'paused' ? '#d9822b' :
    '#2965cc'};
  display: inline-block;
  margin-right: 6px;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0.6;
  transition: opacity 0.2s;
  
  @media (max-width: 768px) {
    opacity: 1;
    width: 100%;
    justify-content: flex-end;
    margin-top: 4px;
    padding-top: 8px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    
    .bp5-dark & {
      border-top-color: rgba(255, 255, 255, 0.1);
    }
  }
  
  ${ContainerCard}:hover & {
    opacity: 1;
  }
`;

const DesktopActions = styled.div`
  display: flex;
  gap: 8px;
  
  @media (max-width: 768px) {
    gap: 4px;
  }
`;

const ExpandedContent = styled.div`
  padding: 0 20px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  
  .bp5-dark & {
    border-top-color: rgba(255, 255, 255, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 0 16px 16px;
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: 8px;
  padding: 16px 0;
  margin-bottom: 16px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    padding: 12px 0;
    margin-bottom: 12px;
  }
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 12px;
  }
`;

const DetailItem = styled.div`
  label {
    display: block;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted, #5c7080);
    margin-bottom: 4px;
  }
  
  value {
    display: block;
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 13px;
    color: var(--text-color, #182026);
    word-break: break-all;
  }
  
  @media (max-width: 768px) {
    label {
      font-size: 10px;
    }
    
    value {
      font-size: 12px;
    }
  }
`;

const LogsSection = styled.div`
  margin-top: 16px;
  
  @media (max-width: 768px) {
    margin-top: 12px;
  }
`;

class Container extends Component {
  state = {
    isOpen: false,
    startIsLoading: false,
    unpauseIsLoading: false,
    pauseIsLoading: false,
    stopIsLoading: false,
    removeIsLoading: false,
    pinIsLoading: false,
    stats: null,
  };

  componentDidMount() {
    const openContainers = JSON.parse(localStorage.getItem("openContainers"));
    if (openContainers?.includes(this.props.container.Id)) {
      this.setOpen(true);
    }
    this.fetchStats();
    // Refresh stats every 5 seconds
    this.statsInterval = setInterval(() => this.fetchStats(), 5000);
  }

  componentWillUnmount() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }
  }

  fetchStats = async () => {
    // Skip if tab is not visible
    if (document.visibilityState === "hidden") {
      return;
    }
    
    const { container } = this.props;
    if (container.State !== "running") {
      this.setState({ stats: null });
      return;
    }
    
    try {
      const response = await fetch(`/api/containers/${container.Id}/stats`);
      if (response.ok) {
        const stats = await response.json();
        this.setState({ stats });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  setOpen = (open) => {
    const { container } = this.props;
    const newState = open !== undefined ? open : !this.state.isOpen;
    
    this.setState({ isOpen: newState });
    
    const openContainers = JSON.parse(localStorage.getItem("openContainers")) || [];
    if (newState) {
      if (!openContainers.includes(container.Id)) {
        openContainers.push(container.Id);
      }
    } else {
      _.remove(openContainers, id => id === container.Id);
    }
    localStorage.setItem("openContainers", JSON.stringify(openContainers));
  };

  handleAction = async (action, endpoint, method = "POST", body = null) => {
    const { container, showToast, updateContainer } = this.props;
    const loadingKey = `${action}IsLoading`;
    
    this.setState({ [loadingKey]: true });
    
    try {
      const options = { method };
      if (body) {
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify(body);
      }
      
      const response = await fetch(endpoint, options);
      
      let status, intent;
      switch (response.status) {
        case 200:
        case 204:
          status = action === 'pin' ? 'Container pinned' : 
                   action === 'unpin' ? 'Container unpinned' :
                   `App ${action}ed`;
          intent = Intent.SUCCESS;
          break;
        case 304:
          status = `Already ${action}ed`;
          intent = Intent.WARNING;
          break;
        case 404:
          status = "Container not found";
          intent = Intent.DANGER;
          break;
        default:
          status = "Server error";
          intent = Intent.DANGER;
      }
      
      showToast(status, intent);
      updateContainer(container);
    } catch (error) {
      showToast("Network error", Intent.DANGER);
    }
    
    this.setState({ [loadingKey]: false });
  };

  getActionButtons = () => {
    const { container } = this.props;
    const { startIsLoading, stopIsLoading, removeIsLoading, pinIsLoading } = this.state;
    
    const actions = [];
    
    // Pin/Unpin button (shown for all states)
    actions.push(
      <Button
        key="pin"
        icon={container.State === "pinned" ? "unpin" : "pin"}
        intent={Intent.SUCCESS}
        loading={pinIsLoading}
        onClick={(e) => {
          e.stopPropagation();
          this.handleAction(
            "pin",
            "/api/containers/pin",
            "POST",
            { containerName: container.Names[0] }
          );
        }}
      >
        {container.State === "pinned" ? "Unpin" : "Pin"}
      </Button>
    );
    
    if (container.State === "exited") {
      actions.push(
        <Button
          key="start"
          icon="play"
          intent={Intent.SUCCESS}
          loading={startIsLoading}
          onClick={(e) => {
            e.stopPropagation();
            this.handleAction("start", `/api/containers/${container.Id}`);
          }}
        >
          Start
        </Button>
      );
      actions.push(
        <Button
          key="remove"
          icon="trash"
          intent={Intent.DANGER}
          loading={removeIsLoading}
          onClick={(e) => {
            e.stopPropagation();
            this.handleAction("remove", `/api/containers/${container.Id}`, "DELETE");
          }}
        >
          Remove
        </Button>
      );
    } else {
      if (container.State === "running") {
        actions.push(
          <Button
            key="pause"
            icon="pause"
            onClick={(e) => {
              e.stopPropagation();
              this.handleAction("pause", `/api/containers/${container.Id}/pause`);
            }}
          >
            Pause
          </Button>
        );
      } else if (container.State === "paused") {
        actions.push(
          <Button
            key="unpause"
            icon="play"
            onClick={(e) => {
              e.stopPropagation();
              this.handleAction("unpause", `/api/containers/${container.Id}/unpause`);
            }}
          >
            Resume
          </Button>
        );
      }
      
      actions.push(
        <Button
          key="stop"
          icon="stop"
          intent={Intent.WARNING}
          loading={stopIsLoading}
          onClick={(e) => {
            e.stopPropagation();
            this.handleAction("stop", `/api/containers/stop`, "POST", { containerId: container.Id });
          }}
        >
          Stop
        </Button>
      );
    }
    
    return actions;
  };

  render() {
    const { container, editMode } = this.props;
    const { isOpen } = this.state;
    
    const rawIcon = container.Labels[VITE_CONTAINER_ICON] ?? "package";
    // Wrap icon in colons for emoji shortcode if not already wrapped
    const icon = rawIcon.startsWith(':') ? rawIcon : `:${rawIcon}:`;
    const name = container.Labels[VITE_CONTAINER_DESC] ?? container.Names[0]?.replace(/^\//, '') ?? "Unnamed";
    const tag = container.Labels[VITE_CONTAINER_TAG] ?? "unknown";
    const url = container.Labels[VITE_LAUNCH_URL] ?? "#";
    
    return (
      <ContainerCard elevation={Elevation.TWO}>
        <Header onClick={editMode ? () => this.setOpen() : undefined} style={{ cursor: editMode ? 'pointer' : 'default' }}>
          <LeftSection>
            <IconContainer $state={container.State}>
              <Emoji text={icon} />
            </IconContainer>

            <Info>
              <AppName>{name}</AppName>
              <MetaRow>
                <span>
                  <StatusDot $state={container.State} />
                  {container.State}
                </span>
                <span className="hide-mobile">•</span>
                <span className="container-tag hide-mobile">{tag}</span>
                <span>•</span>
                <span>{moment.unix(container.Created).fromNow()}</span>
                {this.state.stats && (
                  <>
                    <span className="hide-mobile">•</span>
                    <LoadIndicator $load={this.state.stats.cpuPercent}>
                      <div className="load-bar">
                        <div 
                          className="load-fill" 
                          style={{ width: `${Math.min(this.state.stats.cpuPercent, 100)}%` }}
                        />
                      </div>
                      <span className="load-text">{this.state.stats.cpuPercent}%</span>
                    </LoadIndicator>
                  </>
                )}
              </MetaRow>
            </Info>
          </LeftSection>
          
          <DesktopActions onClick={(e) => e.stopPropagation()}>
            <Tooltip content="Open in browser">
              <AnchorButton
                minimal
                icon="share"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              />
            </Tooltip>
            
            {editMode && (
              <Button
                minimal
                icon={isOpen ? "chevron-up" : "chevron-down"}
                onClick={(e) => {
                  e.stopPropagation();
                  this.setOpen();
                }}
              />
            )}
          </DesktopActions>
          
          {editMode && (
            <Button
              minimal
              icon={isOpen ? "chevron-up" : "chevron-down"}
              className="mobile-only"
              onClick={(e) => {
                e.stopPropagation();
                this.setOpen();
              }}
            />
          )}
        </Header>
        
        <Collapse isOpen={editMode && isOpen}>
          <ExpandedContent>
            {editMode && (
              <QuickActions>
                {this.getActionButtons()}
              </QuickActions>
            )}
            
            <DetailsGrid>
              <DetailItem>
                <label>Container ID</label>
                <value>{container.Id}</value>
              </DetailItem>
              <DetailItem>
                <label>Image</label>
                <value>{container.Image}</value>
              </DetailItem>
              <DetailItem className="hide-mobile">
                <label>Created</label>
                <value>{moment.unix(container.Created).format("MMM Do YYYY, h:mm:ss a")}</value>
              </DetailItem>
              <DetailItem>
                <label>Status</label>
                <value>{container.Status}</value>
              </DetailItem>
            </DetailsGrid>
            
            <LogsSection>
              <Logs container={container} />
            </LogsSection>
          </ExpandedContent>
        </Collapse>
      </ContainerCard>
    );
  }
}

Container.propTypes = {
  container: PropTypes.object.isRequired,
  showToast: PropTypes.func.isRequired,
  updateContainer: PropTypes.func.isRequired,
  editMode: PropTypes.bool,
};

Container.defaultProps = {
  editMode: false,
};

export default Container;
