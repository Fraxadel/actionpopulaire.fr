import React, {useState} from "react"
import Button from "@agir/front/genericComponents/Button";
import RadioField from "@agir/front/formComponents/RadioField";
import TextField from "@agir/front/formComponents/TextField";
import BackButton from "@agir/front/genericComponents/ObjectManagement/BackButton";
import styled from "styled-components";
import Spacer from "@agir/front/genericComponents/Spacer";
import {createRemoveMembershipRequest} from "@agir/groups/utils/api";
import {useMutate} from "@agir/front/app/apiHook";
import GroupMemberRemoveRequestReferentValidation
    from "@agir/groups/groupPage/GroupSettings/GroupMembershipRemoveRequest/GroupMemberRemoveRequestReferentValidation";
import RequestValidationMessage from "@agir/groups/groupPage/GroupSettings/GroupMemberFile/ValidationMessage";

const ButtonActions = styled.div`
    display: flex;
    gap: 10px;
`

export const RemoveOption = [
    {
        label: 'Cette personne ne milite plus à la France Insoumise.',
        value: 'milite_plus_lfi'
    },
    {
        label: "Cette personne n'a jamais participé au groupe d'action.",
        value: 'jamais_participee'
    },
    {
        label: "Cette personne a changé de groupe.",
        value: "change_groupe"
    },
    {
        label: "Cette personne a demandé sa suppression du groupe.",
        value: "demande_suppression"
    }
]

export default function GroupMemberRemoveRequest({member, group, onBack, removeRequest}) {
    const [details, setDetails] = useState(removeRequest?.details ?? "")
    const [reason, setReason] = useState(removeRequest?.reason)
    const [displayDone, setDisplayDone] = useState(false);
    const {mutate: createRequest, isLoading, error} = useMutate(createRemoveMembershipRequest, () => {
        setDisplayDone(true)
    });

    const disableSubmit = details.length < 10 || reason === undefined

    async function submitRequest() {
        await createRequest(group.id, member.personId, details, reason)
    }

    return <>
        <BackButton onClick={onBack}/>
        <h3>Retirer <u>{member?.firstName} {member?.displayName}</u> des membres ?</h3>
        {removeRequest && <GroupMemberRemoveRequestReferentValidation member={member} removeRequest={removeRequest}/>}
        {!removeRequest && <>
            <p>Cette personne ne fera plus partie du groupe. Pour quelle raison souhaitez-vous la retirer ?</p>
            <fieldset>
                <RadioField
                    id="field"
                    label="Raison (obligatoire)"
                    value={reason}
                    onChange={setReason}
                    options={RemoveOption}
                />
                <Spacer size="1.5rem"/>
                <TextField
                    placeholder="Expliquez nous brièvement le contexte de cette demande."
                    id="field"
                    label="Details (obligatoire)"
                    onChange={(e) => setDetails(e.target.value)}
                    value={details}
                    rows={3}
                    maxLength={1000}
                    textArea
                />
            </fieldset>
            <Spacer size="1.5rem"/>
            <p>Cette décision nécessite une validation du pôle des groupes d'Action.</p>
            {
                error && <p>{error}</p>
            }
            <ButtonActions>
                <Button onClick={onBack}>Annuler</Button>
                <Button loading={isLoading}
                        onClick={submitRequest}
                        disabled={disableSubmit}
                        color="primary"
                        icon="send">Envoyer la demande</Button>
            </ButtonActions>
            {
                <RequestValidationMessage display={displayDone} onBack={onBack} title="Votre demande a bien été enregistrée">
                    <p>Votre co-animateur·rice a été notifié·e de la demande et devra la valider. Le pôle des
                        groupes d’action examinera ensuite la demande, vous serez informé·e une fois qu’une
                        décision aura été prise.</p>
                    <p>Merci encore pour votre vigilence. À bientôt !</p>
                </RequestValidationMessage>
            }
        </>}
    </>
}