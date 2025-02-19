import React from "react"
import StyledCard from "@agir/events/eventPage/StyledCard";

const VISIBILITY_ADMIN = "A"
const VISIBILITY_ORGANIZER = "O"
const VISIBILITY_PUBLIC = "P"

export default function EventOrganizerInfo({ visibility }) {
    return visibility === VISIBILITY_ORGANIZER && <StyledCard>
        <p><i className="fa fa-warning"/> L’événement est actuellement visible uniquement par l’organisateur·rice. Il sera publié après validation du Pôle des groupes d’action qui s’assurera que tous les GA de la commune sont bien informés de l’organisation de cette Assemblée municipale.</p>
    </StyledCard>
}