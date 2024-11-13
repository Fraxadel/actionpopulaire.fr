import React, {useState} from "react"
import Button from "@agir/front/genericComponents/Button";
import RadioField from "@agir/front/formComponents/RadioField";
import TextField from "@agir/front/formComponents/TextField";
import BackButton from "@agir/front/genericComponents/ObjectManagement/BackButton";
import styled from "styled-components";
import Spacer from "@agir/front/genericComponents/Spacer";
import { animated, useTransition } from "@react-spring/web";
import {createRemoveMembershipRequest} from "@agir/groups/utils/api";
import {useCreate} from "@agir/front/app/apiHook";
import {SecondaryPanel, slideInTransition} from "@agir/groups/groupPage/GroupSettings/MembershipPanel";
import GroupMemberRemoveRequestValidation
    from "@agir/groups/groupPage/GroupSettings/GroupMemberFile/GroupMemberRemoveRequestValidation";

const ButtonActions = styled.div`
    display: flex;
    gap: 10px;
`

export default function GroupMemberRemoveRequest({member, group, onBack}) {
    const [details, setDetails] = useState("")
    const [reason, setReason] = useState()
    const [displayDone, setDisplayDone] = useState(false);
    const { create: createRequest, isLoading, error } = useCreate(createRemoveMembershipRequest, () => {
        setDisplayDone(true)
    });

    const disableSubmit = details.length < 100 || reason === undefined

    const doneTransition = useTransition(displayDone, slideInTransition)

    async function submitRequest() {
        await createRequest(group.id, member.personId, details, reason)
    }

    return <>
        <BackButton onClick={onBack}/>
        <h3>Retirer <u>{member?.firstName} {member?.displayName}</u> des membres ?</h3>
        <p>Cette personne ne fera plus partie du groupe. Pour quelle raison souhaitez-vous la retirer ?</p>
        <fieldset>
            <RadioField
                id="field"
                label="Raison (obligatoire)"
                value={reason}
                onChange={setReason}
                options={[
                    {
                        label: 'Cette personne ne milite plus à la France Insoumise',
                        value: 'milite_plus_lfi'
                    },
                    {
                        label: "Cette personne n'a jamais participé au groupe d'action",
                        value: 'jamais_participee'
                    },
                    {
                        label: "Cette personne a changé de groupe",
                        value: "change_groupe"
                    },
                    {
                        label: "La personne a demandé sa suppression du groupe",
                        value: "demande_suppression"
                    }
                ]}
            />
            <Spacer size="1.5rem"/>
            <TextField
                placeholder="Expliquez nous brièvement le contexte de cette demande."
                id="field"
                label="Details (au moins 100 caractères)"
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
            error && <p>{ error }</p>
        }
        <ButtonActions>
            <Button onClick={onBack}>Annuler</Button>
            <Button loading={isLoading} onClick={submitRequest} disabled={disableSubmit} color="primary" icon="send">Envoyer la demande</Button>
        </ButtonActions>
        {
            doneTransition(
                (style, item) => item && <SecondaryPanel style={style}>
                    <GroupMemberRemoveRequestValidation onBack={onBack} />
                </SecondaryPanel>
            )
        }
    </>
}