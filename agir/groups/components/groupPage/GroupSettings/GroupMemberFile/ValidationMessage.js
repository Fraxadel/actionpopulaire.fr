import styled from "styled-components";
import Button from "@agir/front/genericComponents/Button";
import React from "react";
import {useTransition} from "@react-spring/web";
import {SecondaryPanel, slideInTransition} from "@agir/groups/groupPage/GroupSettings/MembershipPanel";

const ValidationContent = styled.div`
    text-align: center;
    padding: 10px;
    
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 20px;
`

const AlertValidation = styled.div`
    background-color: ${(props) => props.theme.success100};
    padding: 12px;
    border-radius: 5px;
    font-weight: bold;
    font-size: 1.1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    
    span {
        color:  ${(props) => props.theme.success500};
        margin-right: 5px;
    }
`

export default function RequestValidationMessage({ display, onBack, title, message, children }) {

    const doneTransition = useTransition(display, slideInTransition)
    return doneTransition((style, item) => item && <SecondaryPanel style={style}><ValidationContent>
        <AlertValidation><span className="fa-regular fa-check fa-xl"/>{ title }</AlertValidation>
        { message ? message : children }
        <Button onClick={onBack} color="primary">Terminer</Button>
    </ValidationContent></SecondaryPanel>)
}