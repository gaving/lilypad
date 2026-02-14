import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";

const fadeOut = keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    visibility: hidden;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const SplashContainer = styled.div<{ $dark?: boolean; $hide?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${(props) => (props.$dark ? "#1a1d21" : "#f6f8fa")};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: opacity 0.5s ease-out;
  animation: ${(props) => (props.$hide ? fadeOut : "none")} 0.5s ease-out forwards;
`;

const Logo = styled.div`
  font-size: 80px;
  animation: ${float} 2s ease-in-out infinite;
  margin-bottom: 20px;
`;

const Title = styled.h1<{ $dark?: boolean }>`
  font-size: 32px;
  font-weight: 600;
  color: ${(props) => (props.$dark ? "#f5f8fa" : "#182026")};
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p<{ $dark?: boolean }>`
  font-size: 14px;
  color: ${(props) => (props.$dark ? "#a7b6c2" : "#5c7080")};
  margin: 0;
`;

const LoadingBar = styled.div<{ $dark?: boolean }>`
  width: 200px;
  height: 3px;
  background: ${(props) => (props.$dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")};
  border-radius: 3px;
  margin-top: 30px;
  overflow: hidden;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 40%;
    background: ${(props) => (props.$dark ? "#ff85a1" : "#ff6b8a")};
    border-radius: 3px;
    animation: ${pulse} 1.5s ease-in-out infinite;
  }
`;

interface SplashScreenProps {
  dark?: boolean;
}

const SplashScreen = ({ dark }: SplashScreenProps) => {
  const [hide, setHide] = useState(false);
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Show splash screen for 2 seconds
    const timer = setTimeout(() => {
      setHide(true);
    }, 2000);

    // Remove from DOM after animation completes
    const cleanup = setTimeout(() => {
      setShow(false);
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(cleanup);
    };
  }, []);

  if (!show) return null;

  return (
    <SplashContainer $dark={dark} $hide={hide}>
      <Logo>🌸</Logo>
      <Title $dark={dark}>Lilypad X</Title>
      <Subtitle $dark={dark}>Container management in full bloom</Subtitle>
      <LoadingBar $dark={dark} />
    </SplashContainer>
  );
};

export default SplashScreen;
