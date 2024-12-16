import React, { useCallback, useRef } from "react";
import styled, {useTheme} from "styled-components";
import useSWRImmutable from "swr/immutable";

import CONFIG from "@agir/donations/common/config";

import {
  StyledBody,
  StyledIllustration,
  StyledLogo,
  StyledMain,
  StyledPage,
  Theme,
} from "@agir/donations/common/StyledComponents";
import PageFadeIn from "@agir/front/genericComponents/PageFadeIn";
import Skeleton from "@agir/front/genericComponents/Skeleton";
import Spacer from "@agir/front/genericComponents/Spacer";
import DonationContextProvider from "@agir/donations/DonationContext";
import DonationAmount from "@agir/donations/form/DonationAmount";
import DonationGroup from "@agir/donations/form/DonationGroup";
import DonationChoices from "@agir/donations/form/DonationChoices";
import DonationPayment from "@agir/donations/form/DonationPayment";
import DonationPersonInformation from "@agir/donations/form/DonationPersonInformation";
import DonationPresentation from "@agir/front/genericComponents/donation/DonationPresentation";
import DonationValidation from "@agir/donations/form/DonationValidation";
import {DonationContent, DonationShow} from "@agir/donations/Common.style";
import {useIsDesktop} from "@agir/front/genericComponents/grid";
import DonationLegalMention from "@agir/donations/form/DonationLegaMention";

const DonTitle = styled.h1`
  font-weight: bold;
  margin-bottom: 0.5rem;
  margin-top: 0.5rem;

  @media (max-width: ${(props) => props.theme.collapse}px) {
    font-size: 5.2vw;
    margin-bottom: 1.2rem;
    margin-top: 0;
  }
`
export const DonationColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`


const DonationLandingPage = () => {
  const { data: session, isLoading } = useSWRImmutable("/api/session/");

  const isDesktop = useIsDesktop()
  const config = CONFIG.default;
  const theme = useTheme()

  return (
    <Theme type={config.type}>
      <PageFadeIn ready={!isLoading} wait={<Skeleton />}>
        <StyledPage>
          <StyledBody>
            <StyledMain style={{ paddingBottom: "4rem" }}>
              <StyledLogo
                alt={`Logo ${config.beneficiary}`}
                route={config.externalLinkRoute}
                rel="noopener noreferrer"
                target="_blank"
              />
              <Spacer size="1rem" />

              <DonationContextProvider>
                <DonationContent>
                  <DonationColumn>
                    {isDesktop && <DonTitle>FAIRE UN DON</DonTitle>}
                    <DonationAmount />
                    <DonationGroup />
                    <DonationChoices />
                    <DonationPersonInformation />
                    <DonationPayment />
                    <DonationLegalMention />
                    <DonationValidation />
                  </DonationColumn>
                  <DonationShow>
                    <DonationPresentation />
                    <span>
                      {!isDesktop && <DonTitle>FAIRE UN DON</DonTitle>}
                      <p>Chaque don nous aide à l’organisation d’événements, à l’achat   de matériel, au fonctionnement de nos sites.</p>
                      <p>Nous avons besoin du soutien financier de chacun·e d’entre vous.</p>
                    </span>
                </DonationShow>
                </DonationContent>
              </DonationContextProvider>
            </StyledMain>
          </StyledBody>
        </StyledPage>
      </PageFadeIn>
    </Theme>
  );
};

export default DonationLandingPage;
