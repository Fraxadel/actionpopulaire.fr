import React from "react";
import styled from "styled-components";
import {useDonationContext} from "@agir/donations/DonationContext";
import CONFIG from "@agir/donations/common/config";

const DonationMention = styled.p`
    color: ${(props) => props.theme.text500};

    @media (max-width: ${(props) => props.theme.collapse}px) {
        padding: 0 1rem 0 1rem;
    }
`

export default function DonationLegalMention() {
    const { to } = useDonationContext()
    const config =  CONFIG[to] ?? CONFIG.default;

    return <DonationMention>{ config.legalParagraph }</DonationMention>
}