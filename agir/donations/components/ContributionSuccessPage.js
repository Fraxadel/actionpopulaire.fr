import React from "react"
import PageFadeIn from "@agir/front/genericComponents/PageFadeIn";
import {Link, StyledBody, StyledLogo, StyledMain, StyledPage, Theme} from "@agir/donations/common/StyledComponents";
import {AlertInformation, DonationContent, DonationShow} from "@agir/donations/Common.style";
import Cochon from "@agir/front/genericComponents/donation/Cochon";
import Button from "@agir/front/genericComponents/Button";
import CONFIG from "@agir/donations/common/config";
import styled from "styled-components";
import Spacer from "@agir/front/genericComponents/Spacer";
import ShareCard from "@agir/front/genericComponents/ShareCard";
import {ValidationTitle} from "@agir/donations/validation/CB.style";
import {useParams} from "react-router-dom";
import Helmet from "react-helmet";

const CBContent= styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
    
  padding: 0 2.5rem 0 2.5rem;
`

export default function DonationSuccessPage() {
    const params = useParams();
    const type =
        params?.type && CONFIG[type] ? params?.type : CONFIG.default.type;
    const config = CONFIG[type];
    const { beneficiary, externalLinkRoute, title, thankYouNote } = config;

    return <Theme type={config.type}>
        <Helmet>
            <title>{title}</title>
        </Helmet>
        <PageFadeIn ready>
            <StyledPage>
                <StyledBody>
                    <StyledMain style={{ paddingBottom: "4rem" }}>
                        <StyledLogo
                            alt={`Logo ${beneficiary}`}
                            route={externalLinkRoute}
                            rel="noopener noreferrer"
                            target="_blank"
                        />
                        <Spacer size="1rem" />
                        <DonationContent>
                            <CBContent>
                                <ValidationTitle>
                                    <span className="fa fa-solid fa-circle-check fa-4x" />
                                    <h2>Merci pour votre don !</h2>
                                </ValidationTitle>
                                <p><strong>Vous allez recevoir un e-mail de confirmation dès que votre paiement aura été
                                    validé.</strong></p>
                                <p>Vous pouvez à tout moment consulter vos dons et paiements depuis <Link
                                    route="personalPayments">
                                    l'onglet « Dons et paiements »</Link> de votre espace personnel sur <Link
                                    href="/agir/donations/static">actionpopulaire.fr</Link>.
                                </p>
                                <AlertInformation>
                                    <p>En contribuant mensuellement à la France insoumise, vous vous engagez à ce que ce
                                        montant soit versée automatiquement tous les mois et jusqu'à la fin de
                                        l'année.</p>
                                    <p>Dans l’éventualité où vous souhaitiez interrompre votre don mensuel, vous pourrez
                                        le faire à tout moment en vous rendant dans l'onglet « Dons et paiements » de
                                        votre espace personnel sur actionpopulaire.fr.</p>
                                    <p><strong>Grâce à votre engagement dans la durée, vous permettrez à notre mouvement
                                        de mieux planifier et organiser ses activités au niveau local et/ou national
                                        tout au long de l’année.</strong></p>
                                </AlertInformation>
                                <Button color="lfiPrimary">TERMINER</Button>

                                <ShareCard title="Encouragez vos ami·es à faire un don" url="/dons" />
                            </CBContent>

                            <DonationShow>
                                <Cochon />
                            </DonationShow>
                        </DonationContent>

                    </StyledMain>
                </StyledBody>
            </StyledPage>
        </PageFadeIn>
    </Theme>
}
