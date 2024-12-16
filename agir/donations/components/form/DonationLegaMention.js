import React from "react";
import styled from "styled-components";

const DonationMention = styled.p`
    color: ${(props) => props.theme.text500};
`

export default function DonationLegalMention() {
    return <DonationMention>Les dons seront versés à L'Association de financement de La France insoumise (AFLFI). Premier alinéa de l’article 11-4 de la loi 88-227 du 11 mars 1988 modifiée : une personne physique peut verser un don à un parti ou groupement politique si elle est de nationalité française ou si elle réside en France.</DonationMention>
}