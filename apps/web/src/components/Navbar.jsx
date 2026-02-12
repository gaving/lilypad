import {
  Alignment,
  Button,
  Icon,
  Intent,
  Navbar as Nav,
  NavbarGroup,
  NavbarHeading,
  Tag,
  Tooltip,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import PropTypes from "prop-types";
import styled from "styled-components";

const StyledNavbar = styled(Nav)`
  background-color: #ffffff !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
  
  .bp5-dark & {
    background-color: #252a31 !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
  }
  
  @media (max-width: 768px) {
    .bp5-navbar-group {
      height: 40px;
    }
    
    .bp5-navbar-heading {
      font-size: 16px;
    }
  }
`;

const Container = styled.div`
  max-width: 1750px;
  width: 100%;
  margin: auto;
  color: var(--text-color, #182026);
`;

const Flex = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.gap || 0}px;
`;

const Navbar = ({ darkTheme, toggleDarkTheme, editMode, toggleEditMode }) => {
  return (
    <StyledNavbar>
      <Container>
        <NavbarGroup>
          <NavbarHeading>
            <Icon
              icon={IconNames.UNRESOLVE}
              size={Icon.SIZE_LARGE}
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
              X
            </Tag>
          </NavbarHeading>
        </NavbarGroup>
        <NavbarGroup align={Alignment.RIGHT}>
          <Flex align="center" gap={8}>
            <Tooltip content={editMode ? "Disable edit mode" : "Enable edit mode"}>
              <Button 
                minimal 
                intent={editMode ? Intent.WARNING : Intent.NONE}
                onClick={() => toggleEditMode()}
              >
                <Icon icon={editMode ? "unlock" : "lock"} />
              </Button>
            </Tooltip>
            <Button minimal onClick={() => toggleDarkTheme()}>
              <Icon icon={darkTheme ? "flash" : "moon"} />
            </Button>
          </Flex>
        </NavbarGroup>
      </Container>
    </StyledNavbar>
  );
};

Navbar.propTypes = {
  darkTheme: PropTypes.bool.isRequired,
  toggleDarkTheme: PropTypes.func.isRequired,
  editMode: PropTypes.bool.isRequired,
  toggleEditMode: PropTypes.func.isRequired,
};

export default Navbar;
