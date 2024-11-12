
import React, { useState } from "react"
import Button from "@agir/front/genericComponents/Button";
import RadioField from "@agir/front/formComponents/RadioField";
import TextField from "@agir/front/formComponents/TextField";


export default function GroupMemberRemoveRequest({ person: member }) {

    const [details, setDetails] = useState("")
    const [raison, setRaison] = useState()

    const disableSubmit = details.length < 100 && raison === undefined

    return <>
        <h3>Retirer { member?.name } des membres ?</h3>
        <p>Cette personne ne fera plus partie du groupe. Pour quelle raison souhaitez-vous la retirer ?</p>
        <RadioField
            id="field"
            label="Raison (obligatoire)"
            onChange={setRaison}
            options={[
                {
                    label: 'Cette personne ne milite plus à la France Insoumise',
                    value: 'milite_plus_fi'
                },
                {
                    label: "Cette personne n'a jamais participé au groupe d'action",
                    value: 'jamais_participe'
                },
                {
                    label: "Cette personne a changé de groupe",
                    value: "changer_groupe"
                },
                {
                    label: "La personne a demandé sa suppression du groupe",
                    value: "demande_suppression"
                }
            ]}
        />
        <TextField
            error=""
            id="field"
            label="Details (au moins 100 caractères)"
            onChange={() => {}}
            textArea
            value=""
        />>
        <p>Cette décision nécessaite une validation du pôle des groupes d'Action.</p>
        <Button>Annuler</Button>
        <Button disabled={disableSubmit} icon="send">Envoyer la demande</Button>
    </>
}