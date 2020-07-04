import React from "react";

import {
  Navbar as Nav,
  NavbarGroup,
  Alignment,
  NavbarHeading,
  Button
} from "@blueprintjs/core";
import { Flex } from "reflexbox";
import styled from "styled-components";

const Container = styled.div`
  max-width: 1750px;
  width: 100%;
  margin: auto;
`;

const Navbar = ({ darkTheme, toggleDarkTheme }) => {
  return (
    <Nav>
      <Container>
        <NavbarGroup>
          <NavbarHeading>Lilypad</NavbarHeading>
        </NavbarGroup>
        <NavbarGroup align={Alignment.RIGHT}>
          <Flex align="center">
            <Button minimal onClick={() => toggleDarkTheme()}>
              <b>shift + d</b>
            </Button>
          </Flex>
        </NavbarGroup>
      </Container>
    </Nav>
  );
};

export default Navbar;
