import React from "react";
import styled from "styled-components";
import Button from "@agir/front/genericComponents/Button";

const DonationExistingInfo = styled.div`
    padding: 1.5rem;
    text-align: center;
    background-color: ${(props) => props.theme.text50};
`

export default function DonationExisting() {

    return <>
        <DonationExistingInfo>
            <p>Vous avez déjà un don mensuel en cours !</p>
            <p>Vous pouvez le modifier sur la page <u>« Dons et paiments »</u> de votre espace personnel.</p>
        </DonationExistingInfo>
        <Button link route="personalPayments" color="lfiPrimary">MODIFIER MON DON MENSUEL</Button>
    </>


}