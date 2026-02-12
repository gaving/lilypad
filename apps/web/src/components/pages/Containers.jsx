import {
  Card,
  Elevation,
  Intent,
  NonIdealState,
  OverlayToaster,
  Position,
  Tag,
} from "@blueprintjs/core";
import _ from "lodash";
import { Component, Fragment } from "react";
import styled from "styled-components";

import Container from "../Container.jsx";

const Page = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  min-height: 100vh;
  background: inherit;
  
  @media (max-width: 768px) {
    padding: 16px 12px;
  }
`;

const Header = styled.div`
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

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 24px;
  
  .icon {
    font-size: 80px;
    margin-bottom: 24px;
    opacity: 0.5;
  }
  
  h3 {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 12px 0;
    color: var(--text-color, #182026);
  }
  
  p {
    color: var(--text-muted, #5c7080);
    margin: 0 0 8px 0;
    line-height: 1.6;
  }
  
  code {
    background: var(--code-bg, rgba(0, 0, 0, 0.05));
    padding: 8px 12px;
    border-radius: 4px;
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 13px;
    color: var(--text-color, #182026);
  }
`;

class Containers extends Component {
  state = {
    containers: [],
    isVisible: true,
  };

  async componentDidMount() {
    // Initial load
    this.updateAllContainers();
    
    // Set up polling
    this.update = setInterval(() => this.updateAllContainers(), 5000);
    
    // Set up visibility change listener
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  componentWillUnmount() {
    clearInterval(this.update);
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
  }

  handleVisibilityChange = () => {
    const isVisible = document.visibilityState === "visible";
    this.setState({ isVisible });
    
    if (isVisible) {
      // Refresh immediately when tab becomes visible
      this.updateAllContainers();
      // Resume polling
      if (!this.update) {
        this.update = setInterval(() => this.updateAllContainers(), 5000);
      }
    } else {
      // Pause polling when tab is hidden
      if (this.update) {
        clearInterval(this.update);
        this.update = null;
      }
    }
  };

  showToast = (message, intent) => {
    const AppToaster = OverlayToaster.create({
      position: Position.BOTTOM,
    });
    AppToaster.show({ message, intent });
  };

  updateAllContainers = async () => {
    // Skip update if tab is not visible (extra safety check)
    if (document.visibilityState === "hidden") {
      return;
    }
    
    try {
      const response = await fetch("/api/containers");
      const containers = await response.json();
      this.setState({ containers });
    } catch (error) {
      console.error("Failed to fetch containers:", error);
    }
  };

  updateContainer = async (container) => {
    try {
      const response = await fetch(`/api/containers/${container.Id}`);
      const [newContainer] = await response.json();
      
      if (!newContainer) {
        this.setState(prev => ({
          containers: prev.containers.filter(c => c.Id !== container.Id)
        }));
      } else {
        this.setState(prev => ({
          containers: prev.containers.map(c => 
            c.Id === container.Id ? newContainer : c
          )
        }));
      }
    } catch (error) {
      console.error("Failed to update container:", error);
    }
  };

  getStats = () => {
    const { containers } = this.state;
    return {
      total: containers.length,
      running: containers.filter(c => c.State === "running").length,
      stopped: containers.filter(c => c.State === "exited").length,
      pinned: containers.filter(c => c.State === "pinned").length,
    };
  };

  getStatusColor = (state) => {
    switch (state) {
      case "running": return "#0f9960";
      case "exited": return "#db3737";
      case "paused": return "#d9822b";
      case "pinned": return "#2965cc";
      default: return "#5c7080";
    }
  };

  getStatusBg = (state) => {
    switch (state) {
      case "running": return "rgba(15, 153, 96, 0.1)";
      case "exited": return "rgba(219, 55, 55, 0.1)";
      case "paused": return "rgba(217, 130, 43, 0.1)";
      case "pinned": return "rgba(41, 101, 204, 0.1)";
      default: return "rgba(92, 112, 128, 0.1)";
    }
  };

  render() {
    const { containers } = this.state;
    const stats = this.getStats();
    
    const filteredContainers = containers.filter(c => 
      c.Labels?.hasOwnProperty(import.meta.env.VITE_CONTAINER_TAG)
    );

    const sections = ["pinned", "running", "paused", "exited"].filter(state =>
      filteredContainers.some(c => c.State === state)
    );

    return (
      <Page>
        {filteredContainers.length > 0 && (
          <StatsRow>
            <StatCard elevation={Elevation.ONE}>
              <div 
                className="stat-icon" 
                style={{ background: this.getStatusBg("running"), color: this.getStatusColor("running") }}
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
                style={{ background: this.getStatusBg("exited"), color: this.getStatusColor("exited") }}
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
                style={{ background: this.getStatusBg("pinned"), color: this.getStatusColor("pinned") }}
              >
                📌
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.pinned}</div>
                <div className="stat-label">Pinned</div>
              </div>
            </StatCard>
            
            <StatCard elevation={Elevation.ONE}>
              <div className="stat-icon" style={{ background: "rgba(255, 107, 138, 0.15)", color: "#ff6b8a" }}>
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
          <Card elevation={Elevation.TWO}>
            <EmptyState>
              <div className="icon">🌸</div>
              <h3>No containers found</h3>
              <p>
                Deploy Docker containers with the label<br />
                <code>org.domain.review.name</code> to see them here.
              </p>
            </EmptyState>
          </Card>
        ) : (
          sections.map(state => (
            <Section key={state}>
              <SectionTitle>
                <h2>{state}</h2>
                <Tag 
                  minimal 
                  intent={
                    state === "running" ? Intent.SUCCESS :
                    state === "pinned" ? Intent.PRIMARY :
                    state === "paused" ? Intent.WARNING :
                    Intent.DANGER
                  }
                >
                  {filteredContainers.filter(c => c.State === state).length}
                </Tag>
              </SectionTitle>
              
              {filteredContainers
                .filter(c => c.State === state)
                .map(container => (
                  <Container
                    key={container.Id}
                    container={container}
                    showToast={this.showToast}
                    updateContainer={this.updateContainer}
                    editMode={this.props.editMode}
                  />
                ))}
            </Section>
          ))
        )}
      </Page>
    );
  }
}

export default Containers;
