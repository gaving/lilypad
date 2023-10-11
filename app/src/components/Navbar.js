import {
  Alignment,
  Button,
  Icon,
  Intent,
  Navbar as Nav,
  NavbarGroup,
  NavbarHeading,
  Tag,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import PropTypes from "prop-types";
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
              v5
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

Navbar.propTypes = {
  darkTheme: PropTypes.bool.isRequired,
  toggleDarkTheme: PropTypes.func.isRequired,
};

export default Navbar;
