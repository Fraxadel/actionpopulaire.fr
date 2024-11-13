import Button from "@agir/front/genericComponents/Button";
import React from "react";
import styled from "styled-components";

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

export default function GroupMemberRemoveRequestValidation({ onBack }) {
    return <ValidationContent>
        <AlertValidation><span className="fa-regular fa-check fa-xl"/>Votre demande a bien été enregistrée</AlertValidation>
        <p>Après examen du pôle des groupes d'action, vous serez informé·e une fois qu'une décision aura été prise.</p>
        <p>Merci encore pour votre vigilence</p>
        <Button onClick={onBack} color="primary">Terminer</Button>
        </ValidationContent>
}