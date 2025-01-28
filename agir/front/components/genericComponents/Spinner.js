import React from "react"
import styled, {keyframes} from "styled-components";

const SpinnerAnimation = keyframes`
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
`
const Loader = styled.i`
    font-size: 1.6em;
    animation-name: ${SpinnerAnimation};
    animation-duration: 2s;
    animation-timing-function: ease;
    animation-iteration-count: infinite;
`

export default function Spinner() {
    return <Loader className="fa fa-solid fa-loader"/>
}