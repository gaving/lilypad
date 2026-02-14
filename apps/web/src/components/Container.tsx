import {
  AnchorButton,
  Button,
  Card,
  Checkbox,
  Collapse,
  Elevation,
  Intent,
} from "@blueprintjs/core";
import { format, formatDistanceToNow } from "date-fns";
import { Component } from "react";

import Emoji from "react-emoji-render";
import styled from "styled-components";

import { ConfigContext } from "../context/ConfigContext";
import Logs from "./Logs";

interface ContainerLabels {
  [key: string]: string;
}

interface ContainerData {
  Id: string;
  Names: string[];
  Image: string;
  State: "running" | "exited" | "paused" | "pinned" | string;
  Status: string;
  Created: number;
  Labels: ContainerLabels;
}

interface ContainerStats {
  cpuPercent: number;
}

interface ContainerProps {
  container: ContainerData;
  showToast: (message: string, intent: Intent) => void;
  updateContainer: (container: ContainerData) => void;
  editMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

interface ContainerState {
  isOpen: boolean;
  startIsLoading: boolean;
  unpauseIsLoading: boolean;
  pauseIsLoading: boolean;
  stopIsLoading: boolean;
  removeIsLoading: boolean;
  pinIsLoading: boolean;
  stats: ContainerStats | null;
  expandedLabels: Set<string>;
}

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

const SelectionCheckbox = styled.div`
  margin-right: 4px;
  opacity: 1;

  .bp5-control.bp5-checkbox {
    margin-bottom: 0;

    .bp5-control-indicator {
      border-color: rgba(255, 107, 138, 0.5);

      &:checked {
        background-color: #ff6b8a;
        border-color: #ff6b8a;
      }
    }
  }
`;

const IconContainer = styled.div<{ $state?: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
  background: ${(props) =>
    props.$state === "running"
      ? "rgba(15, 153, 96, 0.2)"
      : props.$state === "exited"
        ? "rgba(219, 55, 55, 0.2)"
        : props.$state === "paused"
          ? "rgba(217, 130, 43, 0.2)"
          : props.$state === "pinned"
            ? "rgba(255, 107, 138, 0.2)"
            : "rgba(41, 101, 204, 0.2)"};
  color: ${(props) =>
    props.$state === "running"
      ? "#0f9960"
      : props.$state === "exited"
        ? "#db3737"
        : props.$state === "paused"
          ? "#d9822b"
          : props.$state === "pinned"
            ? "#ff6b8a"
            : "#2965cc"};
  
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

const LoadIndicator = styled.div<{ $load?: number }>`
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
    background: ${(props) => (props.$load && props.$load > 80 ? "#db3737" : props.$load && props.$load > 50 ? "#d9822b" : "#0f9960")};
    transition: width 0.3s ease;
  }
  
  .load-text {
    font-size: 11px;
    font-weight: 600;
    color: ${(props) => (props.$load && props.$load > 80 ? "#db3737" : props.$load && props.$load > 50 ? "#d9822b" : "#0f9960")};
  }
`;

const StatusDot = styled.span<{ $state?: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) =>
    props.$state === "running"
      ? "#0f9960"
      : props.$state === "exited"
        ? "#db3737"
        : props.$state === "paused"
          ? "#d9822b"
          : "#2965cc"};
  display: inline-block;
  margin-right: 6px;
`;

const _Actions = styled.div`
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
  .detail-label {
    display: block;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted, #5c7080);
    margin-bottom: 4px;
  }

  .detail-value {
    display: block;
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 13px;
    color: var(--text-color, #182026);
    word-break: break-all;
  }

  @media (max-width: 768px) {
    .detail-label {
      font-size: 10px;
    }

    .detail-value {
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

const LabelsSection = styled.div`
  margin: 16px 0;
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  .bp5-dark & {
    background: rgba(255, 255, 255, 0.03);
  }
  @media (max-width: 768px) {
    margin: 12px 0;
    padding: 12px;
  }
`;

const LabelsSubheading = styled.h4`
  margin: 0 0 12px 0;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted, #5c7080);
  font-weight: 600;
  &.lilypad {
    color: #ff6b8a;
  }
`;

const LilypadLabelBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(255, 107, 138, 0.12);
  border: 1px solid rgba(255, 107, 138, 0.3);
  border-radius: 16px;
  font-size: 12px;
  margin: 0 8px 8px 0;
  .label-key {
    font-weight: 600;
    color: #ff6b8a;
  }
  .label-value {
    color: var(--text-color, #182026);
  }
  .bp5-dark & {
    background: rgba(255, 133, 161, 0.15);
    border-color: rgba(255, 133, 161, 0.4);
    .label-value {
      color: #e1e8ed;
    }
  }
`;

const DockerLabelsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DockerLabelRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  .label-key {
    font-family: 'SF Mono', Monaco, monospace;
    color: var(--text-muted, #5c7080);
    min-width: 120px;
    flex-shrink: 0;
  }
  .label-value {
    font-family: 'SF Mono', Monaco, monospace;
    color: var(--text-color, #182026);
    word-break: break-all;
    flex: 1;
  }
  .bp5-dark & .label-value {
    color: #e1e8ed;
  }
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  color: #ff6b8a;
  cursor: pointer;
  font-size: 11px;
  padding: 0;
  margin-left: 4px;
  text-decoration: underline;
  &:hover {
    color: #ff85a1;
  }
`;

class Container extends Component<ContainerProps, ContainerState> {
  static contextType = ConfigContext;
  declare context: React.ContextType<typeof ConfigContext>;

  private statsInterval: ReturnType<typeof setInterval> | null = null;

  state: ContainerState = {
    isOpen: false,
    startIsLoading: false,
    unpauseIsLoading: false,
    pauseIsLoading: false,
    stopIsLoading: false,
    removeIsLoading: false,
    pinIsLoading: false,
    stats: null,
    expandedLabels: new Set(),
  };

  componentDidMount() {
    const openContainers = JSON.parse(
      localStorage.getItem("openContainers") || "null",
    );
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

  setOpen = (open?: boolean) => {
    const { container } = this.props;
    const newState = open !== undefined ? open : !this.state.isOpen;

    this.setState({ isOpen: newState });

    let openContainers =
      JSON.parse(localStorage.getItem("openContainers") || "null") || [];
    if (newState) {
      if (!openContainers.includes(container.Id)) {
        openContainers.push(container.Id);
      }
    } else {
      openContainers = openContainers.filter(
        (id: string) => id !== container.Id,
      );
    }
    localStorage.setItem("openContainers", JSON.stringify(openContainers));
  };

  toggleLabelExpanded = (labelKey: string) => {
    this.setState((prevState) => {
      const expandedLabels = new Set(prevState.expandedLabels);
      if (expandedLabels.has(labelKey)) {
        expandedLabels.delete(labelKey);
      } else {
        expandedLabels.add(labelKey);
      }
      return { expandedLabels };
    });
  };

  handleAction = async (
    action: string,
    endpoint: string,
    method: string = "POST",
    body: object | null = null,
  ) => {
    const { container, showToast, updateContainer } = this.props;
    const loadingKey = `${action}IsLoading` as keyof ContainerState;

    this.setState({ [loadingKey]: true } as Pick<
      ContainerState,
      keyof ContainerState
    >);

    try {
      const options: RequestInit = { method };
      if (body) {
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify(body);
      }

      const response = await fetch(endpoint, options);

      let status: string, intent: Intent;
      switch (response.status) {
        case 200:
        case 204:
          status =
            action === "pin"
              ? "Container pinned"
              : action === "unpin"
                ? "Container unpinned"
                : `App ${action}ed`;
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
    } catch (_error) {
      showToast("Network error", Intent.DANGER);
    }

    this.setState({ [loadingKey]: false } as Pick<
      ContainerState,
      keyof ContainerState
    >);
  };

  getActionButtons = () => {
    const { container } = this.props;
    const { startIsLoading, stopIsLoading, removeIsLoading, pinIsLoading } =
      this.state;

    const actions = [];

    // Pin/Unpin button (shown for all states)
    actions.push(
      <Button
        key="pin"
        icon={container.State === "pinned" ? "unpin" : "pin"}
        intent={Intent.SUCCESS}
        loading={pinIsLoading}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          this.handleAction("pin", "/api/containers/pin", "POST", {
            containerName: container.Names[0],
          });
        }}
      >
        {container.State === "pinned" ? "Unpin" : "Pin"}
      </Button>,
    );

    if (container.State === "exited") {
      actions.push(
        <Button
          key="start"
          icon="play"
          intent={Intent.SUCCESS}
          loading={startIsLoading}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            this.handleAction("start", `/api/containers/${container.Id}`);
          }}
        >
          Start
        </Button>,
      );
      actions.push(
        <Button
          key="remove"
          icon="trash"
          intent={Intent.DANGER}
          loading={removeIsLoading}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            this.handleAction(
              "remove",
              `/api/containers/${container.Id}`,
              "DELETE",
            );
          }}
        >
          Remove
        </Button>,
      );
    } else {
      if (container.State === "running") {
        actions.push(
          <Button
            key="pause"
            icon="pause"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              this.handleAction(
                "pause",
                `/api/containers/${container.Id}/pause`,
              );
            }}
          >
            Pause
          </Button>,
        );
      } else if (container.State === "paused") {
        actions.push(
          <Button
            key="unpause"
            icon="play"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              this.handleAction(
                "unpause",
                `/api/containers/${container.Id}/unpause`,
              );
            }}
          >
            Resume
          </Button>,
        );
      }

      actions.push(
        <Button
          key="stop"
          icon="stop"
          intent={Intent.WARNING}
          loading={stopIsLoading}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            this.handleAction("stop", `/api/containers/stop`, "POST", {
              containerId: container.Id,
            });
          }}
        >
          Stop
        </Button>,
      );
    }

    return actions;
  };

  renderLabels = () => {
    const { container } = this.props;
    const { expandedLabels } = this.state;

    if (!container.Labels || Object.keys(container.Labels).length === 0) {
      return null;
    }

    // Extract domain prefix from containerTag (e.g., "org.domain.review.name" -> "org.domain.review")
    const domainPrefix = this.context?.containerTag
      ?.split(".")
      .slice(0, -1)
      .join(".");

    const lilypadLabels = Object.entries(container.Labels).filter(([key]) =>
      key.startsWith(domainPrefix),
    );
    const dockerLabels = Object.entries(container.Labels).filter(
      ([key]) => !key.startsWith(domainPrefix),
    );

    const renderExpandableValue = (key: string, value: string) => {
      const isExpanded = expandedLabels.has(key);
      const shouldTruncate = value.length > 60;

      if (!shouldTruncate) {
        return <span className="label-value">{value}</span>;
      }

      return (
        <span className="label-value">
          {isExpanded ? value : `${value.slice(0, 60)}...`}
          <ExpandButton
            onClick={() => this.toggleLabelExpanded(key)}
            data-testid="expand-label-button"
          >
            {isExpanded ? "less" : "more"}
          </ExpandButton>
        </span>
      );
    };

    return (
      <LabelsSection data-testid="labels-section">
        {lilypadLabels.length > 0 && (
          <>
            <LabelsSubheading className="lilypad">
              Lilypad Labels
            </LabelsSubheading>
            <div style={{ marginBottom: "16px" }}>
              {lilypadLabels.map(([key, value]) => (
                <LilypadLabelBadge key={key} data-testid="lilypad-label-badge">
                  <span className="label-key">
                    {key.replace(`${domainPrefix}.`, "")}:
                  </span>
                  <span className="label-value">{value}</span>
                </LilypadLabelBadge>
              ))}
              {(!lilypadLabels || lilypadLabels.length === 0) && (
                <span
                  style={{
                    color: "var(--text-muted, #5c7080)",
                    fontSize: "12px",
                  }}
                >
                  No Lilypad labels found
                </span>
              )}
            </div>
          </>
        )}

        {dockerLabels.length > 0 && (
          <>
            <LabelsSubheading>Docker Labels</LabelsSubheading>
            <DockerLabelsList>
              {dockerLabels.map(([key, value]) => (
                <DockerLabelRow key={key} data-testid="docker-label-row">
                  <span className="label-key">{key}</span>
                  {renderExpandableValue(key, value)}
                </DockerLabelRow>
              ))}
            </DockerLabelsList>
          </>
        )}
      </LabelsSection>
    );
  };

  render() {
    const { container, editMode, isSelected, onToggleSelect } = this.props;
    const { isOpen } = this.state;

    const { containerTag, containerDesc, containerIcon, launchUrl } = this.context || {};
    let rawIcon =
      containerIcon && container.Labels[containerIcon]
        ? container.Labels[containerIcon]
        : "package";
    // Trim whitespace from icon
    rawIcon = rawIcon.trim();
    // Wrap icon in colons for emoji shortcode if not already wrapped
    let icon = rawIcon.startsWith(":") ? rawIcon : `:${rawIcon}:`;
    
    // Validate emoji shortcode - fallback to package if invalid
    // Common valid emojis used in Lilypad: rocket, globe, database, etc.
    const validEmojis = [
      "package", "rocket", "globe", "database", "coffee", "phone", "sparkles", 
      "wink", "unlock", "star", "heart", "fire", "bug", "gear", "zap", 
      "mag", "link", "lock", "key", "bell", "book", "calendar", "camera",
      "clipboard", "clock", "cloud", "code", "compass", "credit_card", "crown",
      "cup", "diamond", "email", "flag", "folder", "gift", "hammer", "home",
      "hourglass", "inbox", "label", "laptop", "light_bulb", "mag_right",
      "mailbox", "memo", "microphone", "moneybag", "mortar_board", "musical_note",
      "newspaper", "paintbrush", "paperclip", "pencil", "pill", "pin", "pushpin",
      "radio", "ruler", "satellite", "scissors", "scroll", "shield", "shopping_cart",
      "signal", "speaker", "sound", "loud_sound", "loudspeaker", "stopwatch", "sunny",
      "telephone", "telescope", "television", "ticket", "tools", "traffic_light",
      "train", "tram", "trolleybus", "truck", "tv", "umbrella", "vhs", "video_camera",
      "warning", "wastebasket", "watch", "wheelchair", "wrench", "yen", "zipper_mouth"
    ];
    const iconName = icon.replace(/:/g, "");
    if (!validEmojis.includes(iconName)) {
      icon = ":package:";
    }
    const name =
      containerDesc && container.Labels[containerDesc]
        ? container.Labels[containerDesc]
        : (container.Names[0]?.replace(/^\//, "") ?? "Unnamed");
    const tag =
      containerTag && container.Labels[containerTag]
        ? container.Labels[containerTag]
        : "unknown";
    const url =
      launchUrl && container.Labels[launchUrl]
        ? container.Labels[launchUrl]
        : "#";

    return (
      <ContainerCard elevation={Elevation.TWO} data-testid="container-card">
        <Header
          onClick={editMode ? () => this.setOpen() : undefined}
          style={{ cursor: editMode ? "pointer" : "default" }}
        >
          <LeftSection>
            {editMode && onToggleSelect && (
              <SelectionCheckbox
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onToggleSelect();
                }}
              >
                <Checkbox
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    onToggleSelect();
                  }}
                  data-testid="container-checkbox"
                />
              </SelectionCheckbox>
            )}
            <IconContainer $state={container.State}>
              <Emoji text={icon} />
            </IconContainer>

            <Info>
              <AppName>{name}</AppName>
              <MetaRow>
                <span>
                  <StatusDot
                    $state={container.State}
                    data-testid="status-dot"
                  />
                  {container.State}
                </span>
                <span className="hide-mobile">•</span>
                <span className="container-tag hide-mobile">{tag}</span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(container.Created * 1000), {
                    addSuffix: true,
                  })}
                </span>
                {this.state.stats && (
                  <>
                    <span className="hide-mobile">•</span>
                    <LoadIndicator $load={this.state.stats.cpuPercent}>
                      <div className="load-bar">
                        <div
                          className="load-fill"
                          style={{
                            width: `${Math.min(this.state.stats.cpuPercent, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="load-text">
                        {this.state.stats.cpuPercent}%
                      </span>
                    </LoadIndicator>
                  </>
                )}
              </MetaRow>
            </Info>
          </LeftSection>

          <DesktopActions
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <AnchorButton
              minimal
              icon="share"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in browser"
            />

            {editMode && (
              <Button
                minimal
                icon={isOpen ? "chevron-up" : "chevron-down"}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  this.setOpen();
                }}
                data-testid="expand-container"
              />
            )}
          </DesktopActions>

          {editMode && (
            <Button
              minimal
              icon={isOpen ? "chevron-up" : "chevron-down"}
              className="mobile-only"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                this.setOpen();
              }}
            />
          )}
        </Header>

        <Collapse isOpen={editMode && isOpen}>
          <ExpandedContent>
            {editMode && <QuickActions>{this.getActionButtons()}</QuickActions>}

            <DetailsGrid>
              <DetailItem>
                <div className="detail-label">Container ID</div>
                <div className="detail-value">{container.Id}</div>
              </DetailItem>
              <DetailItem>
                <div className="detail-label">Image</div>
                <div className="detail-value">{container.Image}</div>
              </DetailItem>
              <DetailItem className="hide-mobile">
                <div className="detail-label">Created</div>
                <div className="detail-value">
                  {format(
                    new Date(container.Created * 1000),
                    "MMM do yyyy, h:mm:ss a",
                  )}
                </div>
              </DetailItem>
              <DetailItem>
                <div className="detail-label">Status</div>
                <div className="detail-value">{container.Status}</div>
              </DetailItem>
            </DetailsGrid>

            {this.renderLabels()}

            <LogsSection>
              <Logs container={container} />
            </LogsSection>
          </ExpandedContent>
        </Collapse>
      </ContainerCard>
    );
  }
}

export default Container;
