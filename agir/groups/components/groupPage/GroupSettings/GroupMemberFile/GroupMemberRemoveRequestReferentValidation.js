import React, {useState} from "react"
import Button from "@agir/front/genericComponents/Button";
import {RemoveOption} from "@agir/groups/groupPage/GroupSettings/GroupMemberFile/GroupMemberRemoveRequest";
import styled from "styled-components";
import {RawFeatherIcon} from "@agir/front/genericComponents/FeatherIcon";
import InfoBlock from "@agir/front/genericComponents/InfoBlock";
import Spacer from "@agir/front/genericComponents/Spacer";
import RequestValidationMessage from "@agir/groups/groupPage/GroupSettings/GroupMemberFile/ValidationMessage";
import {useMutate} from "@agir/front/app/apiHook";
import {usePatchMembershipRemoveRequest} from "@agir/groups/utils/api";
import {useSelector} from "@agir/front/globalContext/GlobalContext";
import {getUser} from "@agir/front/globalContext/reducers";
import {RemoveRequestStatus} from "@agir/groups/groupPage/GroupSettings/GroupMemberFile/RemoveRequest.domain";

const ButtonActions = styled.div`
    display: flex;
    gap: 5px;
    flex-direction: row;
    justify-content: center;
`

const Content = styled.div`
    textarea {
        min-width: 500px;
        min-height: 150px;
    }
`
const Details = styled.div`
    border-radius: 5px;
    border: 1px solid ${(props) => props.theme.text100};
    padding: 8px 8px 15px;
    text-align: left;
`

const Reason = styled.div`
    display: flex;
    vertical-align: center;
    gap: 5px;
`

export default function GroupMemberRemoveRequestReferentValidation({removeRequest, member, onBack}) {

    const [approved, setApproved] = useState(false);
    const {mutate: updateRequest, isLoading, error} = useMutate(usePatchMembershipRemoveRequest)
    const user = useSelector(getUser);

    function submit() {
        updateRequest({})
    }

    const currentUserHasCreatedRequest = user.id === removeRequest.creator;

    return <Content>
        {!currentUserHasCreatedRequest &&
            <InfoBlock>Votre co-animateur·rice a fait une demande pour retirer <strong>{member?.displayName}</strong> du
                groupe. Cette demande nécessite votre validation et celle du Pôle des groupes d'Action.</InfoBlock>}

        <h5>Raison évoquée :</h5>
        <Reason><RawFeatherIcon width="1rem" height="1rem"
                                name="arrow-right"/> {RemoveOption.find((option) => option.value === removeRequest?.reason)?.label}
        </Reason>

        <h5>Details :</h5>
        <Details>{removeRequest?.details}</Details>

        <Spacer size="1.5rem"/>

        {!currentUserHasCreatedRequest ? <>
            <p>Si vous refusez la demande, la personne restera dans le groupe.</p>
            <p>Si vous l'approuvez, la demande sera transmise au Pôle des groupes d'action.</p>
        </> :
            <InfoBlock>
            {removeRequest.status === RemoveRequestStatus.AWAIT_PEER_REVIEW && <p>La requête est en attente de validation par votre co-animateur•rice</p>}
            {removeRequest.status === RemoveRequestStatus.AWAIT_ADMIN_REVIEW &&
            <p>La requête est en attente de validation pour la pôle des groupes d'Action</p>}
            </InfoBlock>
        }
        {!currentUserHasCreatedRequest && <ButtonActions>
            <Button icon="x" color="danger">Refuser la demande</Button>
            <Button onClick={submit} icon="check" color="success">Approuver la demande</Button>
        </ButtonActions>}
        <RequestValidationMessage display={approved} onBack={onBack} title="Vous avez approuvé la demande">
            <p>Le Pôle des groupes d'action va traiter la demande, vous serez informé­·e une fois que celle-ci aura été
                effectuée.</p>
            <p>Merci encore pour votre vigilance. À bientôt !</p>
        </RequestValidationMessage>
    </Content>
}