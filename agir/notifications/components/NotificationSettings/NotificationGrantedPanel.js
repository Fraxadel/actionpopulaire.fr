import React, {useState} from "react";
import {useMobileApp, useNotificationGrant} from "../../../front/components/app/hooks";
import NotificationRationaleModal from "../../../events/components/agendaPage/NotificationRationaleModal";
import ActionCard from "../../../front/components/genericComponents/ActionCard";

export default function NotificationGrantedPanel() {
    const {isMobileApp} = useMobileApp();
    const {hasUpdate, notificationIsGranted} = useNotificationGrant()
    const [openModal, setOpenModal] = useState(false);

    return <>
        {isMobileApp && hasUpdate && <NotificationRationaleModal
            onClose={() => setOpenModal(false)}
            shouldOpen={openModal}/>
        }
        {isMobileApp && hasUpdate && !notificationIsGranted &&
            <>
                <ActionCard
                    text="Vos notifications mobiles sont désactivées. Activez-les pour ne rien rater."
                    iconName="bell"
                    confirmLabel="Activer"
                    onConfirm={() => setOpenModal(true)}
                >
                </ActionCard>

            </>
        }
    </>
}