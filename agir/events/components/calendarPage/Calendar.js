import React, {Suspense, useState} from "react"
import useSWR from "swr";
import {getCalendarEndpointBySlug, getCalendarEventsEndpoint} from "@agir/events/calendarPage/api";
import NotFoundWrapper from "@agir/front/notFoundPage/NotFoundWrapper";
import PageFadeIn from "@agir/front/genericComponents/PageFadeIn";
import Skeleton from "@agir/front/genericComponents/Skeleton";
import styled from "styled-components";
import Button from "@agir/front/genericComponents/Button";;
import { EventList } from '@agir/events/agendaPage/EventSuggestions'
import { LayoutTitle } from "@agir/front/app/Layout/StyledComponents";
import ModalConfirmation from "@agir/front/genericComponents/ModalConfirmation";
import ShareLink from "@agir/front/genericComponents/ShareLink";

const HeaderContainer = styled.div`
    display: flex;
    justify-content: space-between;
    
    margin-bottom: 25px;
   
`

const StyledContainer = styled.div`
    padding-bottom: 64px;

    @media (max-width: ${(props) => props.theme.collapse}px) {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
    }
`;

const StyledTitle = styled.div`
    color: ${(props) => props.theme.primary500};
    text-align: center;
    font-weight: bold;
    font-size: 1.2em;
    
    span {
        margin-bottom: 25px;
    }
`
const StyledModalContent = styled.div`
    text-align: center;
    padding: 10px;
`



export default function Calendar({agendaSlug}) {
    const {data: agenda, error, isLoading} = useSWR(
        getCalendarEndpointBySlug(agendaSlug)
    );

    const {
        data: events,
        error: errorEvents,
        isLoading: isLoadingEvents
    } = useSWR(getCalendarEventsEndpoint(agendaSlug));

    const [showModal, setShowModal] = useState(false);

    const isReady = !(isLoading && isLoadingEvents)

    return <PageFadeIn ready={isReady} wait={<Skeleton boxes={2}/>}>
        <ModalConfirmation
            title={<StyledTitle>Ajouter à mon calendrier</StyledTitle>}
            dismissLabel="Fermer" shouldShow={showModal}
            onClose={() => setShowModal(false)}
        >
            <StyledModalContent>
            <p>Ouvrez votre application de calendrier (Google Calendar, Outlook, etc.), puis sélectionnez l’option « Ajouter », « S’abonner » ou « Importer un calendrier ».
                Ensuite, copiez, collez ce lien :</p>
            <ShareLink color="secondary" label="Copier" url={`${window.location}/icalendar.ics`} />
            </StyledModalContent>
        </ModalConfirmation>
        <StyledContainer>
            <NotFoundWrapper data={agenda} error={error} title={agendaSlug}>
                <>
                    <HeaderContainer>
                        <LayoutTitle>Agenda {agenda?.name}</LayoutTitle>
                        <div>
                        <Button color="secondary" small onClick={() => setShowModal(true)}>Ajouter à mon calendrier</Button>
                        </div>
                    </HeaderContainer>
                    <p>{agenda?.description}</p>
                    <EventList events={events ?? []}/>
                </>
            </NotFoundWrapper>
        </StyledContainer>
    </PageFadeIn>
}