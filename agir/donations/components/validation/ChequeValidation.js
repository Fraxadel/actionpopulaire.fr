import React, {useMemo} from "react"
import CONFIG, {don} from "@agir/donations/common/config";
import {StyledBody, StyledLogo, StyledMain, StyledPage, Theme} from "@agir/donations/common/StyledComponents";
import PageFadeIn from "@agir/front/genericComponents/PageFadeIn";
import Spacer from "@agir/front/genericComponents/Spacer";
import {
    AlertInformation,
    AlertWarning,
    DonationContent,
    DonationShow,
    FormContainer
} from "@agir/donations/Common.style";
import ShareCard from "@agir/front/genericComponents/ShareCard";
import Letter from "@agir/front/genericComponents/donation/Letter";
import {ValidationTitle} from "@agir/donations/validation/CB.style";
import Button from "@agir/front/genericComponents/Button";
import {DonationColumn} from "@agir/donations/DonationLandingPage";
import {usePayment} from "@agir/donations/common/api";
import {useParams} from "react-router-dom";
import Skeleton from "@agir/front/genericComponents/Skeleton";
import ChequeTemplate from "@agir/front/genericComponents/donation/ChequeTemplate";
import Helmet from "react-helmet";

import { routeConfig } from "@agir/front/app/routes.config";
import styled from "styled-components";
import {ALLOCATION_DESCRIPTION_MAPPING, ALLOCATION_TITLE_MAPPING, DON_TYPE} from "@agir/donations/Donation.domain";

const AllocationAmount = styled.h3``
const AllocationTitle = styled.h4``
const AllocationDescription = styled.p``
const AllocationBox = styled.div`
    display: flex;
    flex-direction: row;
    padding-right: 2rem;
    
    ${AllocationAmount} {
        min-width: 100px;
        text-align: center;
        font-weight: bold;
        font-size: 1.2rem;
    }
    
`

function ChequeAllocation({allocation}) {
    return <AllocationBox>
        <AllocationAmount>{allocation.amount / 100} €</AllocationAmount>
        <div>
            <AllocationTitle>{ALLOCATION_TITLE_MAPPING[allocation.type]}</AllocationTitle>
            <AllocationDescription>{ALLOCATION_DESCRIPTION_MAPPING[allocation.type]}</AllocationDescription>
        </div>
    </AllocationBox>

}

export default function ChequeValidation() {
    const params = useParams();

    const { data: payment, isLoading } = usePayment(params.paymentId)

    const type = params?.type ?? payment?.type ?? CONFIG.default.type;
    const config = CONFIG[type] ?? CONFIG.default;
    const { beneficiary, externalLinkRoute, title} = config;

    const amount = payment?.price / 100 ?? 0;
    const allocations = useMemo(() => JSON.parse((payment?.meta?.allocations ?? "[]")), [payment])

    return <Theme type={config.type}>
        <Helmet>
            <title>{title}</title>
        </Helmet>
        <PageFadeIn wait={<Skeleton boxes={2}/>} ready={!isLoading}>
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
                            <DonationColumn>
                                <ValidationTitle>
                                    <span className="fa fa-solid fa-circle-check fa-4x" />
                                    <h2>Merci pour votre don !</h2>
                                </ValidationTitle>

                                <FormContainer>
                                    {payment?.type !== DON_TYPE.MONTHLY_DONATION_TYPE ? <h4>Je donne {amount} € par chèque.</h4> :
                                        <h4>Je donne { amount /12 } € par mois par chèque, soit {amount} € au total pour l'année.</h4>}
                                    <p>Pour valider la paiement, il ne vous reste maintenant qu'à remplir puis envoyer le chèque par courrier.</p>
                                    <AlertInformation>
                                        Ordre : {payment?.details?.order}<br />
                                        Montant : <strong>{ amount } €</strong><br />
                                        Numéro à inscrire au dos du chèque : <strong>{ params?.paymentId}</strong><br />
                                    </AlertInformation>
                                    <AlertWarning>
                                        <span className="fa fa-solid fa-circle-exclamation"/>
                                        N'oubliez pas d'indiquer le numéro au dos de votre chèque ! Seul celui-ci
                                        permettra de traiter votre chèque dans les meilleurs délais.
                                    </AlertWarning>

                                    <ChequeTemplate amount={amount} to={payment?.details?.order} />

                                    <p>L'adresse postale à laquelle envoyer le chèque :</p>
                                    <AlertInformation>
                                        <strong>
                                        {payment?.details?.address?.map((addr) => <span key={addr}>{addr}<br /></span>)}
                                        </strong>
                                    </AlertInformation>
                                </FormContainer>
                                {allocations && allocations.length > 0 && <FormContainer>
                                    <h3>Répartition</h3>
                                    <p>Vous avez choisi de répartir le montant ainsi :</p>
                                    {allocations.map((allocation) => <ChequeAllocation key={allocation.type}
                                                                                       allocation={allocation}/>)}
                                </FormContainer>
                                }
                                <FormContainer>
                                    <h3>À savoir</h3>
                                    <p>{ payment?.details?.information }</p>
                                </FormContainer>
                                <Button link route={externalLinkRoute} color="lfiPrimary">TERMINER</Button>
                            </DonationColumn>

                            <DonationShow>
                                <Letter />
                                <ShareCard title="Encouragez vos ami·es à faire un don" url={routeConfig.contributions.getLink()} />
                            </DonationShow>
                        </DonationContent>

                    </StyledMain>
                </StyledBody>
            </StyledPage>
        </PageFadeIn>
    </Theme>
}