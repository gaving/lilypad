import React from "react";

import {
  Navbar as Nav,
  NavbarGroup,
  Alignment,
  NavbarHeading,
  Button,
  Tag,
} from "@blueprintjs/core";
import { Icon, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Flex } from "rebass";
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
              icon={IconNames.UNRESOLVE}
              iconSize={Icon.SIZE_LARGE}
              intent={Intent.SUCCESS}
              style={{ paddingRight: "0.5em" }}
            />
            Lilypad
            <Tag
              intent={Intent.SUCCESS}
              minimal
              round
              style={{ marginLeft: "0.5em" }}
            >
              v3
            </Tag>
          </NavbarHeading>
        </NavbarGroup>
        <NavbarGroup align={Alignment.RIGHT}>
          <Flex align="center">
            <Button minimal onClick={() => toggleDarkTheme()}>
              <Icon icon={darkTheme ? "flash" : "moon"} />
            </Button>
          </Flex>
        </NavbarGroup>
      </Container>
    </Nav>
  );
};

export default Navbar;
