import React, { Component } from "react";

import { Route, Redirect } from "react-router-dom";
import styled from "styled-components";
import { Card } from "@blueprintjs/core";

import Navbar from "./components/Navbar";
import Containers from "./components/pages/Containers";

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

class App extends Component {
  state = {
    dark: false,
  };

  setDarkInStorage = () => localStorage.setItem("dark", this.state.dark);

  toggleDarkTheme = (dark) => {
    if (dark === undefined)
      this.setState({ dark: !this.state.dark }, () => this.setDarkInStorage());
    else this.setState({ dark }, () => this.setDarkInStorage());
  };

  componentDidMount() {
    const dark = localStorage.getItem("dark");

    if (dark === "true") this.toggleDarkTheme(true);
  }

  render() {
    return (
      <Main className={this.state.dark && "bp3-dark"}>
        <Navbar
          darkTheme={this.state.dark}
          toggleDarkTheme={this.toggleDarkTheme}
        />
        <Container column="true">
          <Route exact path="/" render={() => <Redirect to="/containers" />} />
          <Containers />
        </Container>
      </Main>
    );
  }
}

export default App;
