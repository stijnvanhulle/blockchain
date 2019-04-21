import styled, { keyframes } from "styled-components";

const moon = keyframes`
  100% {transform: rotate(360deg)}
`;

export const LoaderStyle = styled.div`
  display: flex;
  justify-content: center;
  & div{
    box-sizing: initial;
  }
  & .wrapper{
    position: relative;
      width: ${props => `${props.size + (props.size / 7) * 2}px`};
      height: ${props => `${props.size + (props.size / 7) * 2}px`};
      animation: ${moon} 2s 0s infinite linear;
      animation-fill-mode: forwards;
  }
  
  & .ball{
      width:  ${props => `${(props.size / 7)}px`};
      height: ${props => `${(props.size / 7)}px`};
      border-radius: 100%;
      background-color: ${props => props.color};
      opacity: 0.8;
      position: absolute;
      top: ${props => (props.size / 2 - (props.size / 7) / 2)}px};
      animation: ${moon} 2s 0s infinite linear;
      animation-fill-mode: forwards;
  }
  & .circle{
    width:  ${props => `${props.size}px`};
      height: ${props => `${props.size}px`};
      border-radius: 100%;
      border: ${props => `${(props.size / 7)}px solid ${props.color}`};
      opacity: 0.3;
  }
`;
