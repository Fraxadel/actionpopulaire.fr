import React from "react"
import styled from "styled-components";
import {AlertWarning} from "@agir/donations/Common.style";
import Link from "@agir/front/app/Link";

const Title = styled.h4`
    color: ${(props) => props.theme.LFIprimary500};
    font-weight: bold;
    text-align: center;
    
    font-size: 1.6em;
    margin-bottom: 1rem;
`

export default function DonationSubscriptionRenewWarning({ subscription }) {

    const endDate = new Date(subscription.endDate)
    const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {dateStyle: "long"})
    const renewDate = dateTimeFormatter.format(endDate);

    return <>
        <Title>ATTENTION</Title>
        <AlertWarning>Votre contribution volontaire pour cette année arrive à son terme le <strong>{ renewDate }</strong></AlertWarning>
        <p>En validant le formulaire ci-dessous vous pouvez la renouveler et mettre à jour certaines informations (le montant, la répartition, vos coordonnées, etc.). Si vous souhaitez renouveler votre contribution à l'identique, vous pouvez aller sur la page <Link route="personalPayments">« Dons et paiements »</Link> de votre espace personnel.</p>
    </>

}