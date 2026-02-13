import {
  Alignment,
  Button,
  Icon,
  Intent,
  Navbar as Nav,
  NavbarGroup,
  NavbarHeading,
  Tooltip,
} from "@blueprintjs/core";

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

const Flex = styled.div<{ $gap?: number }>`
  display: flex;
  align-items: center;
  gap: ${(props) => props.$gap || 0}px;
`;

const LogoIcon = styled.span<{ $dark?: boolean }>`
  font-size: 24px;
  margin-right: 0.5em;
  filter: ${(props) => (props.$dark ? "brightness(1.2)" : "none")};
`;

const VersionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.5em;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #ff6b8a;
  background: rgba(255, 107, 138, 0.15);
  border: 1px solid rgba(255, 107, 138, 0.3);
  border-radius: 12px;
  text-transform: uppercase;
  
  .bp5-dark & {
    color: #ff85a1;
    background: rgba(255, 133, 161, 0.25);
    border-color: rgba(255, 133, 161, 0.4);
  }
`;

interface NavbarProps {
  darkTheme: boolean;
  toggleDarkTheme: () => void;
  editMode: boolean;
  toggleEditMode: () => void;
}

const Navbar = ({
  darkTheme,
  toggleDarkTheme,
  editMode,
  toggleEditMode,
}: NavbarProps) => {
  return (
    <StyledNavbar>
      <Container>
        <NavbarGroup>
          <NavbarHeading>
            <LogoIcon $dark={darkTheme}>🌸</LogoIcon>
            Lilypad
            <VersionBadge>X</VersionBadge>
          </NavbarHeading>
        </NavbarGroup>
        <NavbarGroup align={Alignment.RIGHT}>
          <Flex $gap={8}>
            <Tooltip
              content={editMode ? "Disable edit mode" : "Enable edit mode"}
            >
              <Button
                minimal
                intent={editMode ? Intent.WARNING : Intent.NONE}
                onClick={() => toggleEditMode()}
                data-testid="edit-mode-toggle"
              >
                <Icon icon={editMode ? "unlock" : "lock"} />
              </Button>
            </Tooltip>
            <Button minimal onClick={() => toggleDarkTheme()} data-testid="dark-mode-toggle">
              <Icon icon={darkTheme ? "flash" : "moon"} />
            </Button>
          </Flex>
        </NavbarGroup>
      </Container>
    </StyledNavbar>
  );
};

export default Navbar;
