import styled, {css} from "styled-components";
import Button from "@agir/front/genericComponents/Button";
import React, {useEffect, useState} from "react";
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

const Alert = css`
    padding: 12px;
    border-radius: 5px;
    font-weight: bold;
    font-size: 1.1rem;
    display: flex;
    justify-content: center;
    align-items: center;

    span {
        margin-right: 5px;
    }
`

const AlertValidation = styled.div`
    background-color: ${(props) => props.theme.success100};
    span {
        color: ${(props) => props.theme.success500};
    }
    ${Alert};
`
const AlertDanger = styled.div`
    background-color: ${(props) => props.theme.error100};
    span {
        color: ${(props) => props.theme.error500};
    } 
    
    ${Alert}
`

export const ALERT_STYLE= {
    SUCCESS: 'success',
    DANGER: 'danger'
}

export default function RequestValidationMessage({ display, onBack, title, message, alertStyle = ALERT_STYLE.SUCCESS, children }) {
    const [currentDisplay, setCurrentDisplay] = useState(false)

    useEffect(() => {
        setCurrentDisplay(display)
    }, [display]);

    function goBack() {
        setCurrentDisplay(false)
        onBack?.()
    }

    const AlertComponent = alertStyle === ALERT_STYLE.SUCCESS ? AlertValidation : AlertDanger

    const doneTransition = useTransition(currentDisplay, slideInTransition)
    return doneTransition((style, item) => item && <SecondaryPanel style={style}><ValidationContent>
        <AlertComponent><span className={`fa-regular fa-xl ${alertStyle === ALERT_STYLE.SUCCESS ? 'fa-check' : 'fa-xmark'}`}/>{ title }</AlertComponent>
        { message ? message : children }
        <Button onClick={goBack} color="primary">Terminer</Button>
    </ValidationContent></SecondaryPanel>)
}