import { Card } from "@blueprintjs/core";
import { Component } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import styled from "styled-components";

import Navbar from "./components/Navbar";
import Containers from "./components/pages/Containers";
import SplashScreen from "./components/SplashScreen";

const Main = styled.div`
  display: inline-flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  max-height: 100vh;
  overflow-y: hidden;
`;

const Container = styled(Card)`
  height: 100%;
  padding: 0;
  overflow-y: auto;
  border-radius: 0px;
`;

interface AppState {
  dark: boolean;
  editMode: boolean;
}

class App extends Component<Record<string, never>, AppState> {
  state: AppState = {
    dark: false,
    editMode: false,
  };

  setDarkInStorage = () =>
    localStorage.setItem("dark", String(this.state.dark));

  toggleDarkTheme = (dark?: boolean) => {
    if (dark === undefined)
      this.setState({ dark: !this.state.dark }, () => this.setDarkInStorage());
    else this.setState({ dark }, () => this.setDarkInStorage());
  };

  toggleEditMode = () => {
    this.setState({ editMode: !this.state.editMode });
  };

  componentDidMount() {
    const dark = localStorage.getItem("dark");

    if (dark === "true") this.toggleDarkTheme(true);
  }

  render() {
    return (
      <Main
        className={this.state.dark ? "bp5-dark" : ""}
        style={{ background: this.state.dark ? "#1a1d21" : "#f6f8fa" }}
      >
        <SplashScreen dark={this.state.dark} />
        <Navbar
          darkTheme={this.state.dark}
          toggleDarkTheme={this.toggleDarkTheme}
          editMode={this.state.editMode}
          toggleEditMode={this.toggleEditMode}
        />
        <Container
          style={{ background: this.state.dark ? "#1a1d21" : "#f6f8fa" }}
        >
          <Routes>
            <Route element={<Navigate to="/containers" />} path="/" />
            <Route
              element={<Containers editMode={this.state.editMode} />}
              path="/containers"
            />
          </Routes>
        </Container>
      </Main>
    );
  }
}

export default App;
