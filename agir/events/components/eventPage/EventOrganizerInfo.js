import React from "react"
import StyledCard from "@agir/events/eventPage/StyledCard";

const VISIBILITY_ADMIN = "A"
const VISIBILITY_ORGANIZER = "O"
const VISIBILITY_PUBLIC = "P"

export default function EventOrganizerInfo({ visibility }) {
    return visibility === VISIBILITY_ORGANIZER && <StyledCard>
        <p><i className="fa fa-warning"/> L'événement est visible que par les organisateur·ices, en attente de vérification par le pôle des Groupes d'Action.</p>
    </StyledCard>
}