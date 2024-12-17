import React, {useEffect, useMemo, useState} from "react"
import CheckboxField from "@agir/front/formComponents/CheckboxField";
import SelectField from "@agir/front/formComponents/SelectField";
import {useGroupDonation} from "@agir/donations/common/hooks";
import {useLocation} from "react-router-dom";
import {Row} from "@agir/front/genericComponents/grid";
import {useDonationContext} from "@agir/donations/DonationContext";
import {FormContainer} from "@agir/donations/Common.style";
import PageFadeIn from "@agir/front/genericComponents/PageFadeIn";
import Skeleton from "@agir/front/genericComponents/Skeleton";

export default function DonationGroup() {

    const { search } = useLocation();
    const urlParams = new URLSearchParams(search);
    const {currentGroup, hasSelectedGroup, update} = useDonationContext()
    const [selectedGroup, setSelectedGroup] = useState(false)

    const groupId = urlParams.get("group")
    const { group, groups } = useGroupDonation(
        groupId,
        true,
    );

    const [open, setOpen] = useState(!!groupId)

    const groupChoices = useMemo(
        () =>
            Array.isArray(groups)
                ? groups.map((g) => ({ ...g, value: g.id, label: g.name }))
                : [],
        [groups],
    );

    function setupSelectedGroup(fromGroup) {
        const newGroup = groupChoices.find((g) => g.id === fromGroup.id)
        if (newGroup) {
            update({currentGroup: newGroup, hasSelectedGroup: true})
            setSelectedGroup(newGroup)
        } else {
            update({hasSelectedGroup: false})
        }
    }

    useEffect(() => {
        if (group && !currentGroup) {
            setupSelectedGroup(group)
        }
    }, [group]);

    useEffect(() => {
        if (currentGroup && hasSelectedGroup && !open) {
            setOpen(true)
            setupSelectedGroup(currentGroup)
        }
    }, [currentGroup, hasSelectedGroup, open]);

    const ready =  ((groupId !== null && currentGroup !== null) || groupId === null)

    return <FormContainer>
        <Row gutter={0} justify="space-between" gap={10}>
            <h3>Donner à un groupe en particulier</h3>
            <CheckboxField
                id="group"
                name="group"
                value={open}
                onChange={() => {
                    update({ hasSelectedGroup: !open})
                    setOpen((old) => !old);
                }}
                toggle
                variant="lfi"
            />
        </Row>
        <PageFadeIn ready={ready} wait={<Skeleton boxes={1}/>}>
        {open && <div>
            <p>Séléctionner un groupe certifié</p>
            <SelectField
                label=""
                helpText=""
                name="group"
                placeholder="Selectionnez un groupe d'action certifié"
                value={selectedGroup}
                options={groupChoices}
                onChange={(_group) => {
                    setSelectedGroup(_group);
                    update({currentGroup: _group});
                }}
                small
            />
        </div>
        }
        </PageFadeIn>
    </FormContainer>
}