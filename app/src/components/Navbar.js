import React from "react";

import {
  Navbar as Nav,
  NavbarGroup,
  Alignment,
  NavbarHeading,
  Button,
} from "@blueprintjs/core";
import { Icon, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
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
          <NavbarHeading>
            <Icon
              icon={IconNames.FLAME}
              iconSize={Icon.SIZE_LARGE}
              intent={Intent.DANGER}
              style={{ paddingRight: "0.5em" }}
            />
            Lilypad
          </NavbarHeading>
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
