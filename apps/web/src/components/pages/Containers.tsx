import {
  Alert,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  Elevation,
  Intent,
  Tag,
} from "@blueprintjs/core";
import { Component } from "react";
import styled from "styled-components";

import Container from "../Container";

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

interface ContainersProps {
  editMode?: boolean;
}

interface ContainersState {
  containers: ContainerData[];
  isVisible: boolean;
  selectedContainers: Set<string>;
  isBulkActionLoading: boolean;
  showRemoveConfirm: boolean;
}

const Page = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  min-height: 100vh;
  background: inherit;
  padding-bottom: 100px;

  @media (max-width: 768px) {
    padding: 16px 12px;
    padding-bottom: 100px;
  }
`;

const _Header = styled.div`
  margin-bottom: 32px;

  h1 {
    font-size: 28px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: var(--text-color, #182026);
  }

  p {
    color: var(--text-muted, #5c7080);
    margin: 0;
    font-size: 14px;
  }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 8px;
    margin-bottom: 20px;

    > * {
      flex: 1 1 calc(50% - 8px);
      min-width: calc(50% - 8px);
    }
  }
`;

const StatCard = styled(Card)`
  flex: 1;
  min-width: 140px;
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: var(--card-bg, #ffffff) !important;

  .bp5-dark & {
    background-color: #252a31 !important;
  }

  @media (max-width: 768px) {
    min-width: unset;
    padding: 12px;
    gap: 8px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;

    @media (max-width: 768px) {
      width: 32px;
      height: 32px;
      font-size: 14px;
    }
  }

  .stat-info {
    flex: 1;

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      line-height: 1;
      margin-bottom: 4px;
      color: var(--text-color, #182026);

      @media (max-width: 768px) {
        font-size: 18px;
      }
    }

    .stat-label {
      font-size: 12px;
      color: var(--text-muted, #5c7080);
      text-transform: uppercase;
      letter-spacing: 0.5px;

      @media (max-width: 768px) {
        font-size: 10px;
      }
    }
  }
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  h2 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    text-transform: capitalize;
    color: var(--text-color, #182026);
  }
`;

const SelectAllLink = styled.button`
  font-size: 12px;
  color: var(--text-muted, #5c7080);
  background: none;
  border: none;
  cursor: pointer;
  margin-left: auto;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    color: #ff6b8a;
    background: rgba(255, 107, 138, 0.1);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 24px;
  background: transparent;

  .icon {
    font-size: 80px;
    margin-bottom: 24px;
    opacity: 0.7;
    filter: drop-shadow(0 4px 8px rgba(255, 107, 138, 0.3));
  }

  h3 {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 16px 0;
    color: var(--text-color, #182026);
    letter-spacing: -0.5px;
  }

  p {
    color: var(--text-muted, #5c7080);
    margin: 0 0 12px 0;
    line-height: 1.6;
    font-size: 15px;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }

  code {
    background: var(--code-bg, rgba(0, 0, 0, 0.05));
    padding: 8px 12px;
    border-radius: 6px;
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 13px;
    color: #ff6b8a;
    border: 1px solid rgba(255, 107, 138, 0.2);

    .bp5-dark & {
      color: #ff85a1;
      border-color: rgba(255, 133, 161, 0.3);
    }
  }

  .hint {
    margin-top: 24px;
    font-size: 13px;
    color: var(--text-muted, #5c7080);
    opacity: 0.8;
  }
`;

const BulkActionBar = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%)
    translateY(${props => props.$isVisible ? "0" : "100%"});
  max-width: 600px;
  width: calc(100% - 32px);
  background: var(--card-bg, #ffffff);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.12);
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  z-index: 100;
  transition: transform 0.3s ease;

  .bp5-dark & {
    background: #252a31;
    border-color: rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 768px) {
    width: 100%;
    border-radius: 0;
    left: 0;
    transform: translateY(${props => props.$isVisible ? "0" : "100%"});
    padding: 12px 16px;
  }
`;

const BulkActionInfo = styled.div`
  font-size: 14px;
  color: var(--text-color, #182026);
  font-weight: 500;
  white-space: nowrap;
`;

const BulkActionButtons = styled(ButtonGroup)`
  flex-shrink: 0;
`;

const ClearButton = styled.button`
  font-size: 13px;
  color: var(--text-muted, #5c7080);
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    color: #ff6b8a;
    background: rgba(255, 107, 138, 0.1);
  }
`;

class Containers extends Component<ContainersProps, ContainersState> {
  private update: ReturnType<typeof setInterval> | null = null;

  state: ContainersState = {
    containers: [],
    isVisible: true,
    selectedContainers: new Set(),
    isBulkActionLoading: false,
    showRemoveConfirm: false,
  };

  componentDidMount() {
    this.updateAllContainers();

    this.update = setInterval(() => this.updateAllContainers(), 5000);

    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  componentWillUnmount() {
    if (this.update) {
      clearInterval(this.update);
    }
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange,
    );
  }

  componentDidUpdate(prevProps: ContainersProps) {
    if (!this.props.editMode && prevProps.editMode) {
      this.clearSelection();
    }
  }

  handleVisibilityChange = () => {
    const isVisible = document.visibilityState === "visible";
    this.setState({ isVisible });

    if (isVisible) {
      this.updateAllContainers();
      if (!this.update) {
        this.update = setInterval(() => this.updateAllContainers(), 5000);
      }
    } else {
      if (this.update) {
        clearInterval(this.update);
        this.update = null;
      }
    }
  };

  showToast = (message: string, intent: Intent) => {
    console.log(
      `[${intent === "success" ? "✓" : intent === "warning" ? "⚠" : "✗"}] ${message}`,
    );
  };

  updateAllContainers = async () => {
    if (document.visibilityState === "hidden") {
      return;
    }

    try {
      const response = await fetch("/api/containers");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const containers = await response.json();

      const validContainers = Array.isArray(containers) ? containers : [];

      this.setState((prev) => {
        const selected = new Set(prev.selectedContainers);
        validContainers.forEach((c: ContainerData) => {
          if (!selected.has(c.Id)) {
            selected.delete(c.Id);
          }
        });
        return {
          containers: validContainers,
          selectedContainers: selected,
        };
      });
    } catch (error) {
      console.error("Failed to fetch containers:", error);
      this.setState({ containers: [] });
    }
  };

  updateContainer = async (container: ContainerData) => {
    try {
      const response = await fetch(`/api/containers/${container.Id}`);
      const [newContainer] = (await response.json()) as ContainerData[];

      if (!newContainer) {
        this.setState((prev) => ({
          containers: prev.containers.filter((c) => c.Id !== container.Id),
          selectedContainers: (() => {
            const selected = new Set(prev.selectedContainers);
            selected.delete(container.Id);
            return selected;
          })(),
        }));
      } else {
        this.setState((prev) => ({
          containers: prev.containers.map((c) =>
            c.Id === container.Id ? newContainer : c,
          ),
        }));
      }
    } catch (error) {
      console.error("Failed to update container:", error);
    }
  };

  toggleSelection = (containerId: string) => {
    this.setState((prev) => {
      const selected = new Set(prev.selectedContainers);
      if (selected.has(containerId)) {
        selected.delete(containerId);
      } else {
        selected.add(containerId);
      }
      return { selectedContainers: selected };
    });
  };

  selectAllInSection = (containers: ContainerData[]) => {
    this.setState((prev) => {
      const selected = new Set(prev.selectedContainers);
      for (const c of containers) {
        selected.add(c.Id);
      }
      return { selectedContainers: selected };
    });
  };

  clearSelection = () => {
    this.setState({ selectedContainers: new Set() });
  };

  handleBulkAction = async (action: "start" | "stop") => {
    const { selectedContainers } = this.state;
    if (selectedContainers.size === 0) return;

    this.setState({ isBulkActionLoading: true });

    const selectedIds = Array.from(selectedContainers);
    const promises = selectedIds.map((id) =>
      fetch(`/api/containers/${action === "start" ? "" : "stop"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          containerId: id,
        }),
      }),
    );

    try {
      await Promise.all(promises);
      const actionWord = action === "start" ? "Started" : "Stopped";
      this.showToast(
        `${actionWord} ${selectedContainers.size} containers`,
        Intent.SUCCESS,
      );
      this.updateAllContainers();
      this.clearSelection();
    } catch (error) {
      this.showToast(
        `Failed to ${action} some containers`,
        Intent.DANGER,
      );
    } finally {
      this.setState({ isBulkActionLoading: false });
    }
  };

  handleBulkRemove = async () => {
    const { selectedContainers, containers } = this.state;
    if (selectedContainers.size === 0) return;

    this.setState({ isBulkActionLoading: true, showRemoveConfirm: false });

    const selectedIds = Array.from(selectedContainers);

    // First, stop any running containers
    const runningContainers = containers.filter(
      (c) => selectedContainers.has(c.Id) && c.State === "running"
    );

    if (runningContainers.length > 0) {
      try {
        await Promise.all(
          runningContainers.map((c) =>
            fetch("/api/containers/stop", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ containerId: c.Id }),
            })
          )
        );
        // Wait a moment for containers to stop
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("Failed to stop some containers:", error);
      }
    }

    // Now remove all containers (with force=true to handle running containers)
    const promises = selectedIds.map((id) =>
      fetch(`/api/containers/${id}?force=true`, {
        method: "DELETE",
      })
    );

    try {
      await Promise.all(promises);
      this.showToast(
        `Removed ${selectedContainers.size} containers`,
        Intent.SUCCESS
      );
      this.updateAllContainers();
      this.clearSelection();
    } catch (error) {
      this.showToast("Failed to remove some containers", Intent.DANGER);
    } finally {
      this.setState({ isBulkActionLoading: false });
    }
  };

  getSelectedContainersData = () => {
    return this.state.containers.filter((c) =>
      this.state.selectedContainers.has(c.Id),
    );
  };

  getStats = () => {
    const { containers } = this.state;
    const safeContainers = Array.isArray(containers) ? containers : [];
    return {
      total: safeContainers.length,
      running: safeContainers.filter((c) => c.State === "running").length,
      stopped: safeContainers.filter((c) => c.State === "exited").length,
      pinned: safeContainers.filter((c) => c.State === "pinned").length,
    };
  };

  getStatusColor = (state: string) => {
    switch (state) {
      case "running":
        return "#0f9960";
      case "exited":
        return "#db3737";
      case "paused":
        return "#d9822b";
      case "pinned":
        return "#2965cc";
      default:
        return "#5c7080";
    }
  };

  getStatusBg = (state: string) => {
    switch (state) {
      case "running":
        return "rgba(15, 153, 96, 0.1)";
      case "exited":
        return "rgba(219, 55, 55, 0.1)";
      case "paused":
        return "rgba(217, 130, 43, 0.1)";
      case "pinned":
        return "rgba(41, 101, 204, 0.1)";
      default:
        return "rgba(92, 112, 128, 0.1)";
    }
  };

  render() {
    const { containers, selectedContainers, isBulkActionLoading } = this.state;
    const { editMode } = this.props;
    const stats = this.getStats();
    const hasSelection = selectedContainers.size > 0;

    const safeContainers = Array.isArray(containers) ? containers : [];

    const filteredContainers = safeContainers.filter((c) =>
      Object.hasOwn(c.Labels || {}, import.meta.env.VITE_CONTAINER_TAG),
    );

    const sections = ["pinned", "running", "paused", "exited"].filter((state) =>
      filteredContainers.some((c) => c.State === state),
    );

    const selectedContainersData = this.getSelectedContainersData();
    const selectedCount = selectedContainers.size;

    return (
      <Page>
        {filteredContainers.length > 0 && (
          <StatsRow>
            <StatCard elevation={Elevation.ONE}>
              <div
                className="stat-icon"
                style={{
                  background: this.getStatusBg("running"),
                  color: this.getStatusColor("running"),
                }}
              >
                ▶
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.running}</div>
                <div className="stat-label">Running</div>
              </div>
            </StatCard>

            <StatCard elevation={Elevation.ONE}>
              <div
                className="stat-icon"
                style={{
                  background: this.getStatusBg("exited"),
                  color: this.getStatusColor("exited"),
                }}
              >
                ■
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.stopped}</div>
                <div className="stat-label">Stopped</div>
              </div>
            </StatCard>

            <StatCard elevation={Elevation.ONE}>
              <div
                className="stat-icon"
                style={{
                  background: this.getStatusBg("pinned"),
                  color: this.getStatusColor("pinned"),
                }}
              >
                📌
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.pinned}</div>
                <div className="stat-label">Pinned</div>
              </div>
            </StatCard>

            <StatCard elevation={Elevation.ONE}>
              <div
                className="stat-icon"
                style={{
                  background: "rgba(255, 107, 138, 0.15)",
                  color: "#ff6b8a",
                }}
              >
                🌸
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total</div>
              </div>
            </StatCard>
          </StatsRow>
        )}

        {filteredContainers.length === 0 ? (
          <EmptyState>
            <div className="icon">🌸</div>
            <h3>No containers found</h3>
            <p>
              Deploy Docker containers with the label
              <br />
              <code>org.domain.review.name</code> to see them here.
            </p>
            <p className="hint">
              Make sure Docker is running and containers are properly labeled.
            </p>
          </EmptyState>
        ) : (
          sections.map((state) => {
            const sectionContainers = filteredContainers.filter(
              (c) => c.State === state,
            );
            return (
              <Section key={state}>
                <SectionTitle>
                  <h2>{state}</h2>
                  <Tag
                    minimal
                    intent={
                      state === "running"
                        ? Intent.SUCCESS
                        : state === "pinned"
                          ? Intent.PRIMARY
                          : state === "paused"
                            ? Intent.WARNING
                            : Intent.DANGER
                    }
                  >
                    {sectionContainers.length}
                  </Tag>
                  {editMode && (
                    <SelectAllLink
                      onClick={() => this.selectAllInSection(sectionContainers)}
                    >
                      Select all
                    </SelectAllLink>
                  )}
                </SectionTitle>

                {sectionContainers.map((container) => (
                  <Container
                    key={container.Id}
                    container={container}
                    showToast={this.showToast}
                    updateContainer={this.updateContainer}
                    editMode={editMode}
                    isSelected={selectedContainers.has(container.Id)}
                    onToggleSelect={() => this.toggleSelection(container.Id)}
                  />
                ))}
              </Section>
            );
          })
        )}

        {editMode && (
          <BulkActionBar $isVisible={hasSelection}>
            <BulkActionInfo>
              {selectedCount} {selectedCount === 1 ? "container" : "containers"} selected
            </BulkActionInfo>
            <BulkActionButtons>
              <Button
                small
                icon="play"
                intent={Intent.SUCCESS}
                loading={isBulkActionLoading}
                onClick={() => this.handleBulkAction("start")}
                disabled={selectedContainersData.every(
                  (c) => c.State === "running",
                )}
              >
                Start
              </Button>
              <Button
                small
                icon="stop"
                intent={Intent.WARNING}
                loading={isBulkActionLoading}
                onClick={() => this.handleBulkAction("stop")}
                disabled={selectedContainersData.every(
                  (c) => c.State === "exited",
                )}
              >
                Stop
              </Button>
              <Button
                small
                icon="trash"
                intent={Intent.DANGER}
                loading={isBulkActionLoading}
                onClick={() =>
                  this.setState({ showRemoveConfirm: true })
                }
              >
                Remove
              </Button>
            </BulkActionButtons>
            <ClearButton onClick={this.clearSelection}>Clear</ClearButton>
          </BulkActionBar>
        )}

        <Alert
          isOpen={this.state.showRemoveConfirm}
          onCancel={() => this.setState({ showRemoveConfirm: false })}
          onConfirm={this.handleBulkRemove}
          intent={Intent.DANGER}
          confirmButtonText={`Remove ${selectedCount} ${selectedCount === 1 ? "container" : "containers"}`}
          cancelButtonText="Cancel"
        >
          <p>
            Are you sure you want to remove {selectedCount}{" "}
            {selectedCount === 1 ? "container" : "containers"}? This action
            cannot be undone.
          </p>
          {selectedCount <= 5 && (
            <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
              {selectedContainersData.slice(0, 5).map((c) => (
                <li key={c.Id}>
                  {c.Labels[import.meta.env.VITE_CONTAINER_DESC] ||
                    c.Names[0]?.replace(/^\//, "") ||
                    "Unnamed"}
                </li>
              ))}
            </ul>
          )}
        </Alert>
      </Page>
    );
  }
}

export default Containers;
